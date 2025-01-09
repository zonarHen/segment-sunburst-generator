import Sunburst from "@/components/Sunburst";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Interactive Concept Explorer</h1>
        <p className="text-center mb-12 text-gray-600">Enter a word to explore related concepts in an interactive sunburst diagram</p>
        <Sunburst />
      </div>
    </div>
  );
};

export default Index;