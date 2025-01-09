import { ChevronRight, Folder, File, Plus, Download, Key, ArrowRight } from "lucide-react";
import { SunburstData } from "@/types/sunburst";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TreeNodeProps {
  node: SunburstData;
  depth?: number;
  parentNode?: string;
  onGenerate?: (nodeName: string, parentContext: string) => void;
}

const TreeNode = ({ node, depth = 0, parentNode, onGenerate }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleGenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerate) {
      // Use the parentNode as context when generating children
      onGenerate(node.name, parentNode || "");
    }
  };

  return (
    <div style={{ marginLeft: `${depth * 12}px` }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2">
          <CollapsibleTrigger className="flex items-center gap-2 p-2 flex-1 hover:bg-accent rounded-md">
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                isOpen ? "transform rotate-90" : ""
              }`}
            />
            {hasChildren ? (
              <Folder className="h-4 w-4 text-blue-500" />
            ) : (
              <File className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-sm">{node.name}</span>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleGenerate}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Generate more segments</span>
          </Button>
        </div>
        {hasChildren && (
          <CollapsibleContent>
            {node.children?.map((child, index) => (
              <TreeNode
                key={index}
                node={child}
                depth={depth + 1}
                parentNode={node.name}
                onGenerate={onGenerate}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};

interface DataSidebarProps {
  data: SunburstData;
  onGenerate?: (nodeName: string, parentContext: string) => void;
  apiKey: string;
  onApiKeyChange: (value: string) => void;
  onDownload: () => void;
  centerWord: string;
  onCenterWordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const DataSidebar = ({ 
  data, 
  onGenerate, 
  apiKey, 
  onApiKeyChange,
  onDownload,
  centerWord,
  onCenterWordChange,
  onSubmit,
  isLoading
}: DataSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <h2 className="font-semibold text-xl">Dissect</h2>
        <form onSubmit={onSubmit} className="mt-4 space-y-2">
          <Input
            placeholder="Enter a word"
            value={centerWord}
            onChange={(e) => onCenterWordChange(e.target.value)}
          />
          <Button type="submit" disabled={isLoading} size="sm" className="w-full">
            {isLoading ? (
              <>
                <ArrowRight className="mr-2 h-4 w-4 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <ArrowRight className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </form>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <TreeNode node={data} onGenerate={onGenerate} />
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t px-4 py-4">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Enter your Google API Key"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              className="h-8"
            />
          </div>
          <Button 
            onClick={onDownload} 
            variant="outline" 
            size="sm"
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download SVG
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};