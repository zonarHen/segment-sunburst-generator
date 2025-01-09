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
import { Download, Key, PanelLeft } from "lucide-react";
import { Input } from "./ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { SunburstData } from "@/types/sunburst";
import { Button } from "./ui/button";

interface DataSidebarProps {
  data: SunburstData;
  onGenerate?: (nodeName: string, parentContext: string) => void;
}

export const DataSidebar = ({ data, onGenerate }: DataSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      apiKey: localStorage.getItem("gemini_api_key") || "",
    },
  });

  const onSubmit = (values: { apiKey: string }) => {
    localStorage.setItem("gemini_api_key", values.apiKey);
  };

  const handleDownloadSVG = () => {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'element-breakdown.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <SidebarProvider defaultOpen={isOpen}>
      <Sidebar className="fixed left-0 top-0 h-screen group-data-[state=collapsed]:w-0">
        <SidebarHeader className="border-b px-2 py-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Element Breakdown Explorer</h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownloadSVG}
                className="ml-2"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="ml-2"
              >
                <PanelLeft className="h-4 w-4" />
              </Button>
            </div>
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
      </Sidebar>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={`fixed left-4 top-4 ${isOpen ? 'hidden' : ''}`}
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
    </SidebarProvider>
  );
};