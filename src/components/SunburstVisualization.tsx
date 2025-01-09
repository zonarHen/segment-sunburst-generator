import * as d3 from "d3";
import { Circle } from "lucide-react";
import { SunburstData } from "../types/sunburst";

interface SunburstVisualizationProps {
  data: SunburstData;
  svgRef: React.RefObject<SVGSVGElement>;
  mode: 'manual' | 'simple';
  isLoading: boolean;
  onSegmentClick: (nodeName: string, parentContext: string) => void;
}

export const SunburstVisualization = ({ 
  data, 
  svgRef, 
  mode, 
  isLoading,
  onSegmentClick 
}: SunburstVisualizationProps) => {
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
    .outerRadius((d: any) => {
      const baseRadius = Math.max(d.y0 * radius, d.y1 * radius - 1);
      return mode === 'simple' ? baseRadius : (d.data.name.split(' ').length > 1 ? baseRadius + 20 : baseRadius);
    });

  const svg = d3.select(svgRef.current)
    .attr("viewBox", [-width / 2, -height / 2, width, width])
    .style("font", mode === 'simple' ? "20px sans-serif" : "40px sans-serif");

  const g = svg.append("g");

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

  if (mode === 'simple') {
    path.style("cursor", "pointer")
      .on("click", (event: any, p: any) => {
        clicked(event, p, svg, g, path, label, root, arc);
      });
  } else {
    path.filter((d: any) => !d.children)
      .style("cursor", "pointer")
      .on("click", async (event: any, p: any) => {
        if (isLoading) return;
        const parentContext = p.parent.data.name;
        onSegmentClick(p.data.name, parentContext);
      });
  }

  const label = g.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", (d: any) => +labelVisible(d.current))
    .attr("transform", (d: any) => labelTransform(d.current, radius));

  if (mode === 'simple') {
    label.append("tspan")
      .attr("x", 0)
      .attr("y", 0)
      .html(() => {
        const circleIcon = new Circle({ size: 24 });
        return circleIcon.toSVG();
      });
  } else {
    label.text((d: any) => {
      const words = d.data.name.split(' ');
      if (words.length > 1) {
        return words[0] + '\n' + words.slice(1).join(' ');
      }
      return d.data.name;
    })
    .call(wrap, 30);
  }

  function wrap(text: any, width: number) {
    text.each(function(this: any) {
      const text = d3.select(this);
      const words = text.text().split('\n');
      
      if (words.length > 1) {
        text.text('');
        
        words.forEach((word: string, i: number) => {
          text.append("tspan")
            .attr("x", 0)
            .attr("dy", i === 0 ? "0em" : "1.2em")
            .text(word);
        });
      }
    });
  }

  return null;
};

function arcVisible(d: any) {
  return d.y1 >= 1 && d.x1 > d.x0;
}

function labelVisible(d: any) {
  return d.y1 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
}

function labelTransform(d: any, radius: number) {
  const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
  const y = (d.y0 + d.y1) / 2 * radius;
  return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
}

function clicked(event: any, p: any, svg: any, g: any, path: any, label: any, root: any, arc: any) {
  const parent = g.append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", () => {
      clicked(event, p.parent || root, svg, g, path, label, root, arc);
      parent.remove();
    });

  root.each((d: any) => d.target = {
    x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
    x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
    y0: Math.max(0, d.y0 - p.depth),
    y1: Math.max(0, d.y1 - p.depth)
  });

  const t = svg.transition().duration(750);

  path.transition(t)
    .tween("data", (d: any) => {
      const i = d3.interpolate(d.current, d.target);
      return (t: any) => d.current = i(t);
    })
    .filter(function(this: any, d: any) {
      return +this.getAttribute("fill-opacity") || arcVisible(d.target);
    })
    .attr("fill-opacity", (d: any) => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
    .attrTween("d", (d: any) => () => arc(d.current));

  label.filter(function(this: any, d: any) {
    return +this.getAttribute("fill-opacity") || labelVisible(d.target);
  }).transition(t)
    .attr("fill-opacity", (d: any) => +labelVisible(d.target))
    .attrTween("transform", (d: any) => () => labelTransform(d.current, radius));
}