import { SunburstData } from "@/types/sunburst";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TreeNode } from "./TreeNode";

interface DataSidebarProps {
  data: SunburstData;
  onGenerate?: (nodeName: string, parentContext: string) => void;
}

export const DataSidebar = ({ data, onGenerate }: DataSidebarProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader className="border-b px-2 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Data Structure</h2>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2">
            <TreeNode node={data} onGenerate={onGenerate} />
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
};