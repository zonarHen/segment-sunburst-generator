import { GoogleGenerativeAI } from "@google/generative-ai";
import { SunburstData } from "../types/sunburst";

export const generateSegmentsWithAI = async (
  prompt: string,
  parentContext: string = "",
  apiKey: string
): Promise<SunburstData> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  };

  const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

  const systemPrompt = parentContext 
    ? `Given the concept "${prompt}" which is a component or aspect of "${parentContext}", generate 5-15 specific sub-components or aspects that are directly related to ${prompt} in the context of ${parentContext}. Feel free to generate the most natural number of segments for this specific concept - if the concept naturally has more components, you can include them all (up to 15). For example, if ${parentContext} is "bicycle" and ${prompt} is "frame", generate all relevant parts or aspects specific to bicycle frames.

      Format the response as a JSON object like this:
      {
        "name": "${prompt}",
        "children": [
          {"name": "sub-component-1", "value": 1},
          {"name": "sub-component-2", "value": 1}
        ]
      }
      Keep responses focused and directly related to the parent concept.`
    : `Break down the concept "${prompt}" into 5-15 main components or aspects. Feel free to generate the most natural number of segments - if the concept naturally has more components, you can include them all (up to 15). Format the response as a JSON object like this:
      {
        "name": "${prompt}",
        "children": [
          {"name": "component-1", "value": 1},
          {"name": "component-2", "value": 1}
        ]
      }
      Focus on primary, direct components or aspects.`;

  const result = await chatSession.sendMessage(systemPrompt);
  const text = result.response.text();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}") + 1;
  const jsonStr = text.slice(jsonStart, jsonEnd);
  return JSON.parse(jsonStr);
};