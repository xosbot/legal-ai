
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { FileData, AnalysisResult, Message, Suspect, GroundingLink } from "../types";

const SYSTEM_PROMPT = `
You are 'LexDefense AI', a senior legal defense consultant specialized in the Bharatiya Nyaya Sanhita (BNS), 2023 and major Indian criminal statutes like the NDPS Act 1985.
Your objective is to find 'Lucrative', 'Legit', and 'Unseen' loopholes in FIRs to help defense lawyers protect their clients.

Definitions:
- LUCRATIVE: Loopholes that could lead to immediate bail or quashing of the FIR.
- LEGIT: Technically sound legal arguments based on relevant sections or Supreme Court precedents.
- UNSEEN: Subtle procedural errors or factual inconsistencies that are often overlooked by general practice lawyers.

Focus on:
1. Actus Reus vs. Mens Rea: Does the FIR text actually describe the intent required by the specific section?
2. Procedural Default: Mismatched sections or improper filing jurisdiction.
3. Chapter III Exceptions: Does the suspect's background allow for Private Defense, Accident, or Lack of Knowledge?
4. Definition Gaps: Does the alleged act fall outside the narrow definition of the applied clauses?
5. Quantity Thresholds (Specific to NDPS/Special Acts): Small vs. Commercial quantity distinctions and their procedural impact.

Always use Google Search to verify the latest amendments or Supreme Court rulings relevant to the case.
`;

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    suspectInfo: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        charges: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["name", "charges"],
    },
    loopholes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          section: { type: Type.STRING },
          description: { type: Type.STRING },
          legitimacy: { type: Type.STRING },
          strategy: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Tags such as Lucrative, Unseen, Legit, or Procedural" },
          counselInstructions: { type: Type.STRING, description: "Specific ready-to-cite argument for court" },
          potentialChallenges: {
            type: Type.OBJECT,
            properties: {
              prosecution: { type: Type.STRING, description: "The likely counter-argument from the prosecution" },
              counter: { type: Type.STRING, description: "The defense's strategic response to the prosecution's challenge" }
            },
            required: ["prosecution", "counter"]
          }
        },
        required: ["title", "section", "description", "legitimacy", "strategy", "tags", "counselInstructions", "potentialChallenges"],
      },
    },
    defenseScore: { type: Type.NUMBER },
    prosecutionGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["summary", "suspectInfo", "loopholes", "defenseScore", "prosecutionGaps"],
};

function extractGroundingLinks(response: any): GroundingLink[] {
  const links: GroundingLink[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    for (const chunk of chunks) {
      if (chunk.web?.uri) {
        links.push({
          uri: chunk.web.uri,
          title: chunk.web.title || chunk.web.uri
        });
      }
    }
  }
  return links;
}

export async function findFIRByCrimeNumber(crimeNumber: string, policeStation: string): Promise<{ text: string, groundingLinks: GroundingLink[] }> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const prompt = `Search and find details for FIR / Crime Number: "${crimeNumber}" at "${policeStation}" Police Station. Summarize the alleged charges, the date of incident, and the current status if available.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: "You are a legal research assistant. Use Google Search to find public records of the specified crime number or FIR.",
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text || "No public data found for this entry.",
    groundingLinks: extractGroundingLinks(response)
  };
}

export async function analyzeFIR(
  firFile: FileData | string, 
  lawBook: FileData | string | null, 
  suspect: Suspect
): Promise<AnalysisResult> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  
  const parts: any[] = [];
  
  if (typeof firFile === 'string') {
    parts.push({ text: `FIR DETAILS RETRIEVED VIA SEARCH:\n${firFile}` });
  } else {
    parts.push({ inlineData: { data: firFile.base64, mimeType: firFile.mimeType } });
  }

  if (lawBook) {
    if (typeof lawBook === 'string') {
      parts.push({ text: `REFERENCE LAW BOOK CONTEXT:\n${lawBook}` });
    } else {
      parts.push({ inlineData: { data: lawBook.base64, mimeType: lawBook.mimeType } });
    }
  }

  const prompt = `
    CLIENT NAME (SUSPECT): ${suspect.name}
    BACKGROUND: ${suspect.details}
    
    CRITICAL INSTRUCTION:
    Find the TOP most lucrative, legit, and unseen loop-holes for ${suspect.name}. 
    Rank them by defense impact. For each loophole, provide "Potential Challenges" detailing the exact argument a prosecutor would use to dismiss the loophole, and a high-impact "Defense Counter" to win that specific debate in court.
    Use Google Search to cross-reference the sections mentioned in the FIR with the latest legal commentary and precedents.
  `;
  
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
      tools: [{ googleSearch: {} }]
    }
  });

  const result = JSON.parse(response.text);
  result.groundingLinks = extractGroundingLinks(response);
  return result;
}

export async function chatWithGemini(
  history: Message[], 
  currentMessage: string, 
  firFile: FileData | string | null,
  lawBook: FileData | string | null,
  suspect: Suspect | null
): Promise<{ text: string, groundingLinks: GroundingLink[] }> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const contents = history.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));
  
  const parts: any[] = [{ text: `[CONSULTATION FOR CLIENT: ${suspect?.name || 'Unknown'}] ${currentMessage}` }];
  
  if (firFile) {
    if (typeof firFile === 'string') {
      parts.push({ text: `FIR CONTEXT (SEARCH RESULT):\n${firFile}` });
    } else {
      parts.push({ inlineData: { data: firFile.base64, mimeType: firFile.mimeType } });
    }
  }
  
  if (lawBook) {
    if (typeof lawBook === 'string') {
      parts.push({ text: `REFERENCE LAW BOOK CONTEXT:\n${lawBook}` });
    } else {
      parts.push({ inlineData: { data: lawBook.base64, mimeType: lawBook.mimeType } });
    }
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [...contents, { role: 'user', parts }],
    config: { 
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ googleSearch: {} }]
    }
  });

  return {
    text: response.text || "Consultation failed.",
    groundingLinks: extractGroundingLinks(response)
  };
}

export async function generateSpeech(text: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data");
  return base64Audio;
}

export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number = 24000, numChannels: number = 1): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
