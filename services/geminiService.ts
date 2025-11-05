import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Shop, WasteInfo, EcoAlternativesResponse, DisposalGuide, DIYProject, LanguageCode } from "../types";
import { translations } from '../lib/translations';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const shopSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        wasteTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
        phone: { type: Type.STRING, description: "A 10-digit Indian phone number." },
        address: { type: Type.STRING, description: "A plausible Indian address." },
        location: { type: Type.STRING, description: "A valid Google Maps link for the address." },
      },
      required: ["name", "wasteTypes", "phone", "address", "location"],
    },
};

export const searchShopsByWasteType = async (
  wasteType: string,
  location: { lat: number; lng: number },
  languageCode: LanguageCode
): Promise<Shop[]> => {
  const languageName = translations[languageCode].languageName;
  const prompt = `Based on the user's location (latitude: ${location.lat}, longitude: ${location.lng}) and the waste type "${wasteType}", generate a list of 5 fictional but realistic-sounding nearby shops in India that would buy this waste. Provide the response as a valid JSON array. CRITICAL: The entire response, including all text inside the JSON values, must be in the ${languageName} language.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: shopSchema,
    },
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};

const wasteInfoSchema = {
    type: Type.OBJECT,
    properties: {
      classification: { type: Type.STRING, enum: ['Biodegradable', 'Non-biodegradable'] },
      explanation: { type: Type.STRING },
      wasteCategory: { type: Type.STRING, description: "e.g., e-waste, plastic, organic waste, metal" },
    },
    required: ["classification", "explanation", "wasteCategory"],
};

export const identifyWasteFromImage = async (
  base64Image: string,
  mimeType: string,
  languageCode: LanguageCode
): Promise<WasteInfo> => {
  const languageName = translations[languageCode].languageName;
  const imagePart = {
    inlineData: { data: base64Image, mimeType },
  };
  const textPart = {
    text: `Analyze this image of a waste item. First, classify it as either 'Biodegradable' or 'Non-biodegradable'. Then, provide a brief, easy-to-understand explanation of what the item is and why it's classified that way. Finally, suggest the general category of waste this item belongs to. Return the response as a valid JSON object. CRITICAL: The entire response, including all text inside the JSON values, must be in the ${languageName} language.`,
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
        responseMimeType: 'application/json',
        responseSchema: wasteInfoSchema
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};


const ecoAlternativesSchema = {
  type: Type.OBJECT,
  properties: {
    originalProduct: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The name of the product identified from the user's input." },
        classification: { type: Type.STRING, enum: ['Biodegradable', 'Non-biodegradable'] },
        material: { type: Type.STRING, description: "The primary material of the product (e.g., Plastic, Paper, Glass)." },
        degradationTime: { type: Type.STRING, description: "Estimated time for the product to decompose (e.g., '450 years', '2-6 weeks')." },
        description: { type: Type.STRING, description: "A brief description of the environmental impact of this product." },
      },
      required: ["name", "classification", "material", "degradationTime", "description"],
    },
    alternatives: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          imagePrompt: { type: Type.STRING, description: "A detailed, descriptive prompt for an image generation model to create a photorealistic product image." },
          degradationTime: { type: Type.STRING },
          material: { type: Type.STRING },
          buyLink: { type: Type.STRING, description: "A plausible example URL to an online store selling this product." },
          shops: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                location: { type: Type.STRING, description: "A valid Google Maps link for a fictional but realistic shop in India." },
                phone: { type: Type.STRING, description: "A 10-digit Indian phone number." },
              },
              required: ["name", "location", "phone"],
            },
          },
        },
        required: ["name", "description", "imagePrompt", "degradationTime", "material", "buyLink", "shops"],
      },
    },
  },
  required: ["originalProduct", "alternatives"],
};


export const findEcoAlternatives = async (
  productIdentifier: string,
  location: { lat: number; lng: number },
  languageCode: LanguageCode,
  mimeType?: string
): Promise<EcoAlternativesResponse> => {
    let contents;
    const languageName = translations[languageCode].languageName;
    const commonPrompt = `
      First, analyze the user's input product. Provide a brief analysis including its name, classification (Biodegradable/Non-biodegradable), primary material, estimated degradation time, and a short description of its environmental impact.

      Second, based on the user's location (latitude: ${location.lat}, longitude: ${location.lng}), suggest 3 eco-friendly alternatives. For each alternative, you must provide:
      1. 'name': The name of the alternative product.
      2. 'description': A short description explaining why it's a better choice.
      3. 'imagePrompt': A detailed, descriptive prompt for an image generation model to create a photorealistic product image on a clean, simple background (e.g., 'A bamboo toothbrush resting on a white marble surface').
      4. 'degradationTime': Its estimated time to decompose.
      5. 'material': Its primary material.
      6. 'buyLink': A plausible example URL to an online store.
      7. 'shops': A list of 2 fictional but realistic-sounding nearby shops in India that might sell this item. For each shop, provide a 'name', a Google Maps 'location' link, and a 10-digit Indian 'phone' number.

      Return a single, valid JSON object that strictly follows the provided schema.
      CRITICAL: The entire response, including all text inside the JSON values, must be in the ${languageName} language.
    `;

    if (mimeType) { // It's an image
        contents = {
            parts: [
                { inlineData: { data: productIdentifier, mimeType } },
                { text: `The user uploaded an image. ${commonPrompt}`}
            ]
        };
    } else { // It's a text string
        contents = `The user is asking about the product: "${productIdentifier}". ${commonPrompt}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: ecoAlternativesSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Generate a photorealistic product shot of the following: ${prompt}. The item should be on a clean, neutral background.`,
        },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  
  throw new Error("Image generation failed.");
};

const disposalInstructionSchema = {
    type: Type.OBJECT,
    properties: {
        itemName: { type: Type.STRING, description: "The name of the item identified from the user's input." },
        steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "A list of clear, actionable steps for disposal preparation."
        },
        safetyWarnings: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of important safety warnings, if any. If none, return an empty array."
        }
    },
    required: ["itemName", "steps", "safetyWarnings"],
};

export const getDisposalInstructions = async (
  identifier: string,
  languageCode: LanguageCode,
  mimeType?: string
): Promise<DisposalGuide> => {
    let contents;
    const languageName = translations[languageCode].languageName;
    const commonPrompt = `
      Analyze the user's input, which is a waste item.
      Identify the specific item.
      Generate a step-by-step guide for its safe and proper disposal preparation before it's recycled or sold.
      For example, for a plastic bottle, steps could be "1. Empty the bottle completely", "2. Rinse with water", "3. Remove and discard the plastic cap separately", "4. Crush the bottle to save space".
      Also, provide a list of any important safety warnings related to handling this item (e.g., "Wear gloves when handling broken glass"). If there are no specific warnings, provide an empty array.
      Return the response as a single, valid JSON object that strictly follows the provided schema.
      CRITICAL: The entire response, including all text inside the JSON values, must be in the ${languageName} language.
    `;

    if (mimeType) { // It's an image
        contents = {
            parts: [
                { inlineData: { data: identifier, mimeType } },
                { text: `The user uploaded an image of a waste item. ${commonPrompt}`}
            ]
        };
    } else { // It's a text string
        contents = `The user is asking for a disposal guide for the following item: "${identifier}". ${commonPrompt}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: disposalInstructionSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

const diyProjectSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A creative and catchy title for the DIY project." },
    description: { type: Type.STRING, description: "A brief, engaging summary of the project." },
    materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of materials needed for the project." },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          step: { type: Type.INTEGER },
          instruction: { type: Type.STRING, description: "A clear, concise instruction for this step." },
          imagePrompt: { type: Type.STRING, description: "A detailed prompt for an image model to visually represent this specific step. E.g., 'A close-up shot of hands carefully cutting a plastic bottle with scissors.'" }
        },
        required: ["step", "instruction", "imagePrompt"]
      }
    }
  },
  required: ["title", "description", "materials", "steps"]
};


export const getDIYProjectIdeas = async (
  identifier: string,
  languageCode: LanguageCode,
  mimeType?: string
): Promise<DIYProject> => {
    let contents;
    const languageName = translations[languageCode].languageName;
    const commonPrompt = `
      Based on the user's input, which is a waste item, generate one creative, practical, and inspiring DIY upcycling project.
      The project should be explained in a step-by-step format.
      For each step, provide a detailed 'imagePrompt' that an AI image generation model can use to create a clear, helpful visual representation of that action. The image prompt should describe the action, the objects involved, and the setting (e.g., on a wooden workbench).
      Return the response as a single, valid JSON object that strictly follows the provided schema. Ensure the materials list is practical and the steps are easy to follow.
      CRITICAL: The entire response, including all text inside the JSON values (title, description, materials, instructions), must be in the ${languageName} language.
    `;

    if (mimeType) { // It's an image
        contents = {
            parts: [
                { inlineData: { data: identifier, mimeType } },
                { text: `The user uploaded an image of a waste item. ${commonPrompt}`}
            ]
        };
    } else { // It's a text string
        contents = `The user is asking for a DIY project for the following item: "${identifier}". ${commonPrompt}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: diyProjectSchema,
        }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};

export const startChat = (languageCode: LanguageCode): Chat => {
  const languageName = translations[languageCode].languageName;
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `You are a friendly and helpful AI assistant for an app called Ecoloop. Your goal is to answer user questions about waste management, recycling, sustainability, and how to use the app. Keep your answers concise, positive, and encouraging. CRITICAL: You must converse with the user in the ${languageName} language.`,
    },
  });
};