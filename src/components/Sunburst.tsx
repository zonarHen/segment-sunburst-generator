import { useState, useRef, useEffect } from "react";
import * as d3 from "d3";
import { SunburstData } from "@/types/sunburst";
import { generateSunburstData } from "@/utils/geminiApi";
import SunburstForm from "./SunburstForm";
import { DataSidebar } from "./DataSidebar";
import { TutorialPopup } from "./TutorialPopup";

const Sunburst = () => {
  const [apiKey, setApiKey] = useState("");
  const [centerWord, setCenterWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SunburstData>({ name: "", children: [] });
  const svgRef = useRef<SVGSVGElement>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (centerWord) {
      setIsLoading(true);
      generateSunburstData(apiKey, centerWord)
        .then((result) => {
          setData(result);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [apiKey, centerWord]);

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "concept_map.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleGenerate = async (nodeName: string, parentContext: string) => {
    if (!apiKey) return;
    
    setIsLoading(true);
    try {
      const newData = await generateSunburstData(apiKey, nodeName, parentContext);
      setData(prevData => {
        // Find and update the node in the tree
        const updateNode = (node: SunburstData): SunburstData => {
          if (node.name === nodeName) {
            return {
              ...node,
              children: [...(node.children || []), ...newData.children]
            };
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(child => updateNode(child))
            };
          }
          return node;
        };
        
        return updateNode(prevData);
      });
    } catch (error) {
      console.error('Error generating data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (centerWord) {
      generateSunburstData(apiKey, centerWord);
    }
  };

  return (
    <div className="flex min-h-screen">
      <DataSidebar 
        data={data} 
        onGenerate={handleGenerate}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        onDownloadSvg={handleDownloadSvg}
        onShowTutorial={() => setShowTutorial(true)}
      />
      <div className="flex-1 p-8">
        <div className="max-w-md mx-auto mb-8">
          <SunburstForm
            apiKey={apiKey}
            centerWord={centerWord}
            onApiKeyChange={setApiKey}
            onCenterWordChange={setCenterWord}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
        <div className="flex justify-center">
          <svg ref={svgRef} />
        </div>
      </div>
      <TutorialPopup open={showTutorial} onOpenChange={setShowTutorial} />
    </div>
  );
};

export default Sunburst;