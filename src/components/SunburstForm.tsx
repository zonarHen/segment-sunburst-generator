import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SunburstFormProps {
  apiKey: string;
  centerWord: string;
  onApiKeyChange: (value: string) => void;
  onCenterWordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const SunburstForm = ({
  apiKey,
  centerWord,
  onApiKeyChange,
  onCenterWordChange,
  onSubmit,
  isLoading
}: SunburstFormProps) => {
  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-4">
      <div>
        <Input
          type="password"
          placeholder="Enter your Google API Key"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Enter a word"
          value={centerWord}
          onChange={(e) => onCenterWordChange(e.target.value)}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SunburstForm;