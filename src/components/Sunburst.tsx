import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useToast } from "@/components/ui/use-toast";
import { generateSegmentsWithAI } from "../utils/geminiApi";
import { SunburstData } from "../types/sunburst";
import { DataSidebar } from "./DataSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { TutorialPopup } from "./TutorialPopup";

const Sunburst = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerWord, setCenterWord] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const { toast } = useToast();
  const [data, setData] = useState<SunburstData>({ name: "center" });
  const [isLoading, setIsLoading] = useState(false);
  const currentTransformRef = useRef<d3.ZoomTransform | null>(null);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem("gemini_api_key", value);
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = "concept-map.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Complete",
      description: "Your diagram has been downloaded as an SVG file.",
    });
  };

  const generateSegments = async (prompt: string, parentContext: string = "") => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google API key first",
        variant: "destructive",
      });
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const newData = await generateSegmentsWithAI(prompt, parentContext, apiKey);
      
      if (parentContext) {
        setData(prevData => {
          const updateDataStructure = (node: SunburstData): SunburstData => {
            if (node.name === prompt) {
              return { ...node, children: newData.children };
            }
            if (node.children) {
              return {
                ...node,
                children: node.children.map(child => updateDataStructure(child))
              };
            }
            return node;
          };
          return updateDataStructure(prevData);
        });
      } else {
        setData(newData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate segments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const getMaxDepth = (node: SunburstData): number => {
      if (!node.children) return 0;
      return 1 + Math.max(...node.children.map(child => getMaxDepth(child)));
    };
    
    const maxDepth = getMaxDepth(data);
    const radius = width / (3 + maxDepth);

    d3.select(svgRef.current).selectAll("*").remove();

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children?.length || 1 + 1));

    const partition = (data: SunburstData) => {
      const root = d3.hierarchy(data)
        .sum(d => d.value || 1)
        .sort((a, b) => (b.value || 0) - (a.value || 0));
      return d3.partition()
        .size([2 * Math.PI, root.height + 1])
        (root);
    };

    const root = partition(data);
    root.each((d: any) => d.current = d);

    const arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d: any) => d.y0 * radius)
      .outerRadius((d: any) => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "20px sans-serif");

    const g = svg.append("g");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .filter((event) => {
        return event.type === 'wheel' || (event.type === 'mousedown' && event.button === 2);
      })
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        currentTransformRef.current = event.transform;
      });

    svg.call(zoom);

    if (currentTransformRef.current) {
      svg.call(zoom.transform, currentTransformRef.current);
    }

    svg.on("wheel", (event) => {
      event.preventDefault();
      const transform = d3.zoomTransform(svg.node()!);
      const delta = event.deltaY;
      const newScale = Math.max(0.5, Math.min(3, transform.k - (delta * 0.002)));
      
      const pointer = d3.pointer(event);
      const [x, y] = pointer;
      
      svg.transition()
        .duration(250)
        .call(
          zoom.transform,
          d3.zoomIdentity
            .translate(transform.x, transform.y)
            .scale(newScale)
            .translate(
              (x - transform.x) * (1 - newScale / transform.k),
              (y - transform.y) * (1 - newScale / transform.k)
            )
        );
    });

    let isDragging = false;
    let dragStartTransform: d3.ZoomTransform | null = null;
    let startX = 0;
    let startY = 0;

    svg.on("contextmenu", (event) => {
      event.preventDefault();
    });

    svg.on("mousedown", (event) => {
      if (event.button === 2) {
        event.preventDefault();
        isDragging = true;
        dragStartTransform = d3.zoomTransform(svg.node()!);
        const [x, y] = d3.pointer(event);
        startX = x;
        startY = y;
      }
    });

    svg.on("mousemove", (event) => {
      if (isDragging && dragStartTransform) {
        event.preventDefault();
        const [currentX, currentY] = d3.pointer(event);
        const dx = currentX - startX;
        const dy = currentY - startY;

        svg.call(
          zoom.transform,
          dragStartTransform.translate(dx, dy)
        );
      }
    });

    svg.on("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        dragStartTransform = null;
      }
    });

    svg.on("mouseleave", () => {
      if (isDragging) {
        isDragging = false;
        dragStartTransform = null;
      }
    });

    const path = g.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d: any) => {
        let topAncestor = d;
        while (topAncestor.depth > 1) {
          topAncestor = topAncestor.parent;
        }
        return color(topAncestor.data.name);
      })
      .attr("fill-opacity", (d: any) => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
      .attr("d", (d: any) => arc(d.current));

    path.filter((d: any) => !d.children)
      .style("cursor", "pointer")
      .on("click", async (event: any, p: any) => {
        if (isLoading) return;
        const parentContext = p.parent.data.name;
        await generateSegments(p.data.name, parentContext);
      });

    const label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", (d: any) => +labelVisible(d.current))
      .attr("transform", (d: any) => labelTransform(d.current))
      .text((d: any) => d.data.name);

    function arcVisible(d: any) {
      return d.y1 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d: any) {
      return d.y1 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d: any) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  }, [data, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (centerWord) {
      generateSegments(centerWord);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <DataSidebar 
          data={data} 
          onGenerate={(nodeName, parentContext) => generateSegments(nodeName, parentContext)}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onDownload={handleDownload}
          centerWord={centerWord}
          onCenterWordChange={setCenterWord}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
        <div className="flex-1">
          <svg ref={svgRef} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        </div>
      </div>
      <TutorialPopup />
    </SidebarProvider>
  );
};

export default Sunburst;
