import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Key, Type, MousePointer, Download, Folder } from "lucide-react";
import { useState } from "react";

interface TutorialPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: JSX.Element;
}

const steps: TutorialStep[] = [
  {
    title: "API Key",
    description: "Start by entering your Google API key in the input field at the top.",
    icon: <Key className="w-12 h-12 text-primary mb-4" />,
  },
  {
    title: "Generate First Layer",
    description: "Enter a word and click Generate to create the first layer of your concept map.",
    icon: <Type className="w-12 h-12 text-primary mb-4" />,
  },
  {
    title: "Navigate & Expand",
    description: "Left click on segments to expand them. Right click and drag to move the diagram around.",
    icon: <MousePointer className="w-12 h-12 text-primary mb-4" />,
  },
  {
    title: "Data Structure",
    description: "Use the collapsible sidebar on the left to view and expand your concept map's structure.",
    icon: <Folder className="w-12 h-12 text-primary mb-4" />,
  },
  {
    title: "Download",
    description: "Click the download button to save your diagram as an SVG file.",
    icon: <Download className="w-12 h-12 text-primary mb-4" />,
  },
];

export const TutorialPopup = ({ open, onOpenChange }: TutorialPopupProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center p-4">
          {steps[currentStep].icon}
          <h2 className="text-xl font-semibold mb-2">{steps[currentStep].title}</h2>
          <p className="text-muted-foreground mb-6">{steps[currentStep].description}</p>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                "Get Started"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
