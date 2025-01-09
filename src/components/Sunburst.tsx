import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SunburstData {
  name: string;
  children?: SunburstData[];
  value?: number;
}

const Sunburst = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerWord, setCenterWord] = useState("");
  const [apiKey, setApiKey] = useState("");
  const { toast } = useToast();
  const [data, setData] = useState<SunburstData>({ name: "center" });

  const generateSegments = async (prompt: string) => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your Google API key first",
        variant: "destructive",
      });
      return;
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const systemPrompt = `Given the word or concept "${prompt}", generate a JSON structure for a sunburst diagram. The response should be in this format:
      {
        "name": "${prompt}",
        "children": [
          {
            "name": "related-concept-1",
            "value": 1
          },
          {
            "name": "related-concept-2",
            "children": [
              {"name": "sub-concept", "value": 1}
            ]
          }
        ]
      }
      Generate 5-8 related concepts that are semantically connected to the input.`;

      const result = await model.generateContent(systemPrompt);
      const text = result.response.text();
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const jsonStr = text.slice(jsonStart, jsonEnd);
      const newData = JSON.parse(jsonStr);
      setData(newData);
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

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, width])
      .style("font", "10px sans-serif");

    const arc = d3.arc()
      .startAngle((d: any) => d.x0)
      .endAngle((d: any) => d.x1)
      .padAngle((d: any) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d: any) => d.y0 * radius)
      .outerRadius((d: any) => Math.max(d.y0 * radius, d.y1 * radius - 1));

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

    path.filter((d: any) => d.children)
      .style("cursor", "pointer")
      .on("click", (event: any, p: any) => {
        generateSegments(p.data.name);
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
      <div className="w-full max-w-md space-y-4">
        <Input
          type="password"
          placeholder="Enter your Google API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full"
        />
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Enter a word"
            value={centerWord}
            onChange={(e) => setCenterWord(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Generate</Button>
        </form>
      </div>
      <div className="w-full max-w-3xl aspect-square">
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
    </div>
  );
};

export default Sunburst;