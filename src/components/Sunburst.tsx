import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useToast } from "@/components/ui/use-toast";
import { generateSegmentsWithAI } from "../utils/geminiApi";
import { SunburstData } from "../types/sunburst";
import SunburstForm from "./SunburstForm";

const Sunburst = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerWord, setCenterWord] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const [data, setData] = useState<SunburstData>({ name: "center" });

  const generateSegments = async (prompt: string, parentContext: string = "") => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google API key first",
        variant: "destructive",
      });
      return;
    }

    try {
      const newData = await generateSegmentsWithAI(prompt, parentContext, apiKey);

      if (parentContext) {
        // Update existing data structure when clicking on a segment
        const updateDataStructure = (node: SunburstData): SunburstData => {
          if (node.name === prompt) {
            return { ...node, ...newData };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(child => updateDataStructure(child))
            };
          }
          return node;
        };
        setData(prevData => updateDataStructure(prevData));
      } else {
        // Set new data for initial word
        setData(newData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate segments. Please check your API key and try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = 800;
    const height = width;
    const radius = width / 6;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children?.length || 1 + 1));

    const hierarchy = d3.hierarchy(data)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const root = d3.partition()
      .size([2 * Math.PI, hierarchy.height + 1])(hierarchy);

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
      .on("click", (event: any, p: any) => {
        const parentContext = p.parent.data.name;
        generateSegments(p.data.name, parentContext);
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
      return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
    }

    function labelVisible(d: any) {
      return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
    }

    function labelTransform(d: any) {
      const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      const y = (d.y0 + d.y1) / 2 * radius;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (centerWord) {
      generateSegments(centerWord);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <SunburstForm
        apiKey={apiKey}
        centerWord={centerWord}
        onApiKeyChange={setApiKey}
        onCenterWordChange={setCenterWord}
        onSubmit={handleSubmit}
      />
      <div className="w-full max-w-3xl aspect-square">
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
    </div>
  );
};

export default Sunburst;