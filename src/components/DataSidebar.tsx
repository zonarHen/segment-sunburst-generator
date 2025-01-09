import { ChevronRight, Folder, File } from "lucide-react";
import { SunburstData } from "@/types/sunburst";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface TreeNodeProps {
  node: SunburstData;
  depth?: number;
}

const TreeNode = ({ node, depth = 0 }: TreeNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: `${depth * 12}px` }}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 p-2 w-full hover:bg-accent rounded-md">
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
        {hasChildren && (
          <CollapsibleContent>
            {node.children?.map((child, index) => (
              <TreeNode key={index} node={child} depth={depth + 1} />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  );
};

interface DataSidebarProps {
  data: SunburstData;
}

export const DataSidebar = ({ data }: DataSidebarProps) => {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-2 py-4">
        <h2 className="font-semibold">Data Structure</h2>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <TreeNode node={data} />
        </div>
      </SidebarContent>
    </Sidebar>
  );
};