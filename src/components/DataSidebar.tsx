import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarProvider,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { TreeNode } from "./TreeNode";
import { PanelLeft, Key } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { SunburstData } from "@/types/sunburst";

interface DataSidebarProps {
  data: SunburstData;
  onGenerate?: (nodeName: string, parentContext: string) => void;
}

export const DataSidebar = ({ data, onGenerate }: DataSidebarProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const form = useForm({
    defaultValues: {
      apiKey: localStorage.getItem("gemini_api_key") || "",
    },
  });

  const onSubmit = (values: { apiKey: string }) => {
    localStorage.setItem("gemini_api_key", values.apiKey);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={isHovered ? "group-data-[state=collapsed]:w-[var(--sidebar-width)]" : ""}
      >
        <SidebarHeader className="border-b px-2 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Element Breakdown Explorer</h2>
            <SidebarTrigger>
              <PanelLeft className="h-4 w-4" />
            </SidebarTrigger>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2">
            <TreeNode node={data} onGenerate={onGenerate} />
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-2">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Key
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your Gemini API key"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
};