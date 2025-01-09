import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="w-full max-w-md space-y-4">
      <Input
        type="password"
        placeholder="Enter your Google API Key"
        value={apiKey}
        onChange={(e) => onApiKeyChange(e.target.value)}
        className="w-full"
      />
      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder="Enter a word"
          value={centerWord}
          onChange={(e) => onCenterWordChange(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Generating..." : "Generate"}
        </Button>
      </form>
    </div>
  );
};

export default SunburstForm;