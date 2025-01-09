import { ChevronRight, Folder, File, Plus, Download, Key, HelpCircle } from "lucide-react";
import { SunburstData } from "@/types/sunburst";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  onDownloadSvg: () => void;
  onShowTutorial: () => void;
}

export const DataSidebar = ({ 
  data, 
  onGenerate, 
  apiKey, 
  onApiKeyChange,
  onDownloadSvg,
  onShowTutorial 
}: DataSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <h2 className="font-semibold mb-4">Data Structure</h2>
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="apiKey" className="text-sm text-muted-foreground">API Key</label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your Google API Key"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onDownloadSvg}
            >
              <Download className="w-4 h-4 mr-2" />
              Download SVG
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onShowTutorial}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Instructions
            </Button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <TreeNode node={data} onGenerate={onGenerate} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};