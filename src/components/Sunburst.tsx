import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useToast } from "@/components/ui/use-toast";
import { generateSegmentsWithAI } from "../utils/geminiApi";
import { SunburstData } from "../types/sunburst";
import SunburstForm from "./SunburstForm";
import { DataSidebar } from "./DataSidebar";
import { SidebarProvider } from "./ui/sidebar";

const Sunburst = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerWord, setCenterWord] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const [data, setData] = useState<SunburstData>({ name: "center" });
  const [isLoading, setIsLoading] = useState(false);

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

    const width = 800;
    const height = width;
    const radius = width / 4; // Increased radius for better visibility

    d3.select(svgRef.current).selectAll("*").remove();

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children?.length || 1 + 1));

    const partition = (data: any) => {
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
      .style("font", "10px sans-serif");

    const path = svg.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("fill", (d: any) => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
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

    const label = svg.append("g")
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
      return d.y1 <= 5 && d.y0 >= 1 && d.x1 > d.x0; // Increased max depth from 3 to 5
    }

    function labelVisible(d: any) {
      return d.y1 <= 5 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
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
      <div className="flex min-h-screen w-full">
        <DataSidebar data={data} />
        <div className="flex-1 p-4">
          <div className="flex flex-col items-center gap-6">
            <SunburstForm
              apiKey={apiKey}
              centerWord={centerWord}
              onApiKeyChange={setApiKey}
              onCenterWordChange={setCenterWord}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <div className="w-full max-w-3xl aspect-square">
              <svg ref={svgRef} width="100%" height="100%" />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Sunburst;