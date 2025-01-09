import { ChevronRight, Folder, File, Plus } from "lucide-react";
import { SunburstData } from "@/types/sunburst";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface TreeNodeProps {
  node: SunburstData;
  depth?: number;
  parentNode?: string;
  onGenerate?: (nodeName: string, parentContext: string) => void;
}

export const TreeNode = ({ node, depth = 0, parentNode, onGenerate }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleGenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerate) {
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