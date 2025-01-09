import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { generateSegmentsWithAI } from "../utils/geminiApi";
import { SunburstData } from "../types/sunburst";
import { DataSidebar } from "./DataSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { TutorialPopup } from "./TutorialPopup";
import { SunburstVisualization } from "./SunburstVisualization";

const Sunburst = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerWord, setCenterWord] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const { toast } = useToast();
  const [data, setData] = useState<SunburstData>({ name: "center" });
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'manual' | 'simple'>('manual');

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
          mode={mode}
          onModeChange={setMode}
        />
        <div className="flex-1">
          <svg ref={svgRef} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
          {data && svgRef.current && (
            <SunburstVisualization
              data={data}
              svgRef={svgRef}
              mode={mode}
              isLoading={isLoading}
              onSegmentClick={generateSegments}
            />
          )}
        </div>
      </div>
      <TutorialPopup />
    </SidebarProvider>
  );
};

export default Sunburst;