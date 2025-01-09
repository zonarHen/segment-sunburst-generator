import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useToast } from "@/components/ui/use-toast";
import { generateSegmentsWithAI } from "../utils/geminiApi";
import { SunburstData } from "../types/sunburst";
import SunburstForm from "./SunburstForm";
import { DataSidebar } from "./DataSidebar";
import { SidebarProvider } from "./ui/sidebar";
import { TutorialPopup } from "./TutorialPopup";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

const Sunburst = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [centerWord, setCenterWord] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const { toast } = useToast();
  const [data, setData] = useState<SunburstData>({ name: "center" });
  const [isLoading, setIsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const currentTransformRef = useRef<d3.ZoomTransform | null>(null);

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    localStorage.setItem("gemini_api_key", value);
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
      console.error("Error generating segments:", error);
      toast({
        title: "Error",
        description: "Failed to generate segments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (centerWord.trim()) {
      await generateSegments(centerWord);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="flex-1 min-h-[500px] relative">
        <div className="sticky top-4">
          <div className="flex flex-col items-center gap-4 mb-8">
            <SunburstForm
              apiKey={apiKey}
              centerWord={centerWord}
              onApiKeyChange={handleApiKeyChange}
              onCenterWordChange={setCenterWord}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
          <svg
            ref={svgRef}
            className="w-full h-auto"
            style={{
              maxHeight: "calc(100vh - 200px)",
              minHeight: "500px"
            }}
          />
        </div>
      </div>
      <SidebarProvider>
        <DataSidebar data={data} onGenerateClick={generateSegments} />
      </SidebarProvider>
      <TutorialPopup />
    </div>
  );
};

export default Sunburst;