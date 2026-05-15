
import { GoogleGenAI, GenerateContentResponse, Type, GenerateContentParameters } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { QuickAction, FileData, VideoRecommendation, TrendData } from "../types";

const getGeminiKey = () => {
  // Support for both Next.js and legacy Vite environment variables
  const envKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || (process.env as any).VITE_GEMINI_API_KEY;
  if (envKey && envKey !== 'dummy_key') return envKey;
  
  const saved = typeof window !== 'undefined' ? localStorage.getItem('karirsmk_admin_config') : null;
  if (saved) {
    const config = JSON.parse(saved);
    if (config.geminiKey) return config.geminiKey;
  }
  return "dummy_key";
};

const ai = new GoogleGenAI({ apiKey: getGeminiKey() });

// Configuration for model fallback
const TEXT_MODELS = ['gemini-3.1-flash-lite-preview', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite-preview-09-2025', 'gemini-2.0-flash', 'gemini-flash-lite-latest'];
let currentModelIndex = 0;

/**
 * Generic wrapper to call Gemini with automatic fallback on 429 errors
 */
async function callWithFallback(params: Omit<GenerateContentParameters, 'model'>): Promise<GenerateContentResponse> {
  let lastError: any;
  
  // Try models in sequence starting from the last successful one or primary
  for (let i = 0; i < TEXT_MODELS.length; i++) {
    const modelToTry = TEXT_MODELS[(currentModelIndex + i) % TEXT_MODELS.length];
    
    try {
      const response = await ai.models.generateContent({
        ...params,
        model: modelToTry,
      });
      
      // Update the successful model index to use it first next time
      currentModelIndex = (currentModelIndex + i) % TEXT_MODELS.length;
      return response;
    } catch (error: any) {
      lastError = error;
      const isQuotaError = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota');
      
      if (isQuotaError && i < TEXT_MODELS.length - 1) {
        console.warn(`Model ${modelToTry} hit quota limit. Trying fallback...`);
        continue; // Try next model
      }
      
      throw error; // If it's not a quota error or we're out of models, throw it
    }
  }
  
  throw lastError;
}

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await callWithFallback({
      contents: `Ringkas bimbingan karir ini menjadi poin-poin yang SANGAT SINGKAT. Maksimal 3-4 poin. Gunakan format bullet. Langsung ke intinya tanpa kalimat pembuka.
      
      Teks: ${text}`,
    });
    return response.text?.trim() || "Gagal meringkas teks.";
  } catch (error) {
    console.error("Summarization error:", error);
    return "Maaf, kuota AI sedang penuh. Silakan coba lagi nanti.";
  }
};

export const fetchCareerTrends = async (userMajor: string): Promise<TrendData | undefined> => {
  try {
    const response = await callWithFallback({
      contents: `Berikan data tren karir terbaru tahun 2024/2025 untuk lulusan SMK jurusan ${userMajor} di Indonesia. 
      Berikan 4 peran pekerjaan paling populer.
      Hanya jawab dalam format JSON: 
      {
        "major": "${userMajor}",
        "items": [
          {"role": "Nama Peran", "demandScore": 85, "growth": "+15%", "avgSalary": "Rp 5-8 Juta"},
          ...
        ]
      }`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            major: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  demandScore: { type: Type.NUMBER },
                  growth: { type: Type.STRING },
                  avgSalary: { type: Type.STRING }
                },
                required: ["role", "demandScore", "growth", "avgSalary"]
              }
            }
          },
          required: ["major", "items"]
        }
      }
    });
    
    try {
      return JSON.parse(response.text || "{}") as TrendData;
    } catch (e) {
      return undefined;
    }
  } catch (error) {
    return undefined;
  }
};

export const fetchCVSuggestions = async (section: string, major: string): Promise<string[]> => {
  try {
    const prompt = section === 'skills' 
      ? `Berikan 6 keahlian (technical & soft skills) yang paling dicari perusahaan untuk lulusan SMK jurusan ${major}. Berikan dalam bentuk array string JSON: ["Skill 1", "Skill 2", ...]`
      : `Berikan 3 contoh deskripsi pengalaman PKL/Magang yang profesional untuk siswa SMK jurusan ${major}. Berikan dalam bentuk array string JSON: ["Contoh 1", "Contoh 2", ...]`;

    const response = await callWithFallback({
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const extractMetadata = async (text: string, userMajor: string, shouldFetchTrends: boolean): Promise<{
  visualKeyword: string,
  videoRecommendation?: VideoRecommendation,
  trendData?: TrendData
}> => {
  try {
    const prompt = `Berdasarkan saran karir berikut untuk SMK ${userMajor}:
    1. Buat 1 frasa pencarian visual (2-3 kata) yang spesifik untuk mencari gambar ilustrasi di Google.
    2. Buat 1 rekomendasi video YouTube (judul & query pencarian).
    ${shouldFetchTrends ? '3. Buat data tren karir (4 peran, demand score 1-100, growth, avg salary).' : ''}
    
    Jawab HANYA dalam JSON format.
    
    Teks: ${text.substring(0, 800)}`;

    const response = await callWithFallback({
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualKeyword: { type: Type.STRING },
            videoRecommendation: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                searchQuery: { type: Type.STRING }
              }
            },
            trendData: {
              type: Type.OBJECT,
              properties: {
                major: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      demandScore: { type: Type.NUMBER },
                      growth: { type: Type.STRING },
                      avgSalary: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Metadata extraction error:", error);
    return { visualKeyword: "SMK Career Indonesia" };
  }
};

export const searchImage = async (keyword: string): Promise<string | undefined> => {
  try {
    // We use callWithFallback but we need specific tools config, so we call generateContent directly 
    // or pass config to callWithFallback if we refactored it, but search is specific.
    // Let's just use a reliable model for search.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `Cari 1 URL gambar publik (harus direct link ending .jpg, .png, atau .webp) yang relevan, aman, dan profesional untuk topik: "${keyword}".
      PENTING: Hanya berikan URL-nya saja sebagai teks plain. Jangan pakai markdown.
      Pastikan URL tersebut benar-benar terlihat seperti link gambar.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const text = response.text?.trim();
    
    // Extract url using regex if the model was chatty
    const urlMatch = text?.match(/https?:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)/i);
    
    if (urlMatch) {
      return urlMatch[0];
    }
    
    if (text && text.startsWith('http')) {
       return text;
    }

    return undefined;
  } catch (error) {
    console.error("Image search error:", error);
    return undefined;
  }
};

const determineQuickActions = (text: string): QuickAction[] => {
  const lowerText = text.toLowerCase();
  const actions: QuickAction[] = [];

  const jobKeywords = ['kerja', 'loker', 'lowongan', 'magang', 'pkl', 'karir', 'profesi', 'gaji', 'perusahaan'];
  if (jobKeywords.some(kw => lowerText.includes(kw))) {
    actions.push({
      label: 'Cari Loker/Magang',
      actionId: 'search_jobs'
    });
  }

  const trendKeywords = ['tren', 'grafik', 'statistik', 'populer', 'masa depan', 'gaji'];
  if (trendKeywords.some(kw => lowerText.includes(kw))) {
    actions.push({
      label: 'Lihat Tren Karir',
      actionId: 'view_trends'
    });
  }

  const cvKeywords = ['cv', 'resume', 'lamaran', 'portofolio', 'riwayat hidup', 'pengalaman', 'profil'];
  if (cvKeywords.some(kw => lowerText.includes(kw))) {
    actions.push({
      label: 'Buat CV SMK',
      actionId: 'create_cv'
    });
  }

  const scholarshipKeywords = ['beasiswa', 'dana', 'bantuan', 'kuliah gratis', 'pendanaan', 'sponsor'];
  if (scholarshipKeywords.some(kw => lowerText.includes(kw))) {
    actions.push({
      label: 'Cari Beasiswa',
      actionId: 'search_scholarships'
    });
  }

  const courseKeywords = ['kursus', 'belajar', 'kuliah', 'jurusan', 'sertifikat', 'pelatihan', 'bootcamp', 'sekolah', 'kampus'];
  if (courseKeywords.some(kw => lowerText.includes(kw))) {
    actions.push({
      label: 'Lihat Kursus/Kampus',
      actionId: 'search_courses'
    });
  }

  return actions;
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  userMajor: string = "Belum ditentukan",
  fileData?: FileData | FileData[]
): Promise<{ text: string; groundingMetadata?: any; imageUrl?: string; imageCaption?: string; quickActions?: QuickAction[]; videoRecommendation?: VideoRecommendation; trendData?: TrendData }> => {
  try {
    // SYSTEM_INSTRUCTION is a function in constants.ts
    const personalizedInstruction = typeof SYSTEM_INSTRUCTION === 'function' 
      ? (SYSTEM_INSTRUCTION as any)(userMajor)
      : (SYSTEM_INSTRUCTION as any).replace(/{userMajor}/g, userMajor);

    const contents: any[] = [];
    
    history.forEach(item => {
      contents.push({
        role: item.role,
        parts: item.parts
      });
    });

    const currentParts: any[] = [{ text: message }];
    if (fileData) {
      const files = Array.isArray(fileData) ? fileData : [fileData];
      files.forEach(file => {
        currentParts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.data
          }
        });
      });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    const response = await callWithFallback({
      contents: contents,
      config: {
        systemInstruction: personalizedInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Maaf, saya tidak bisa memproses permintaan ini.";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    const shouldFetchTrends = message.toLowerCase().includes('tren') || message.toLowerCase().includes('grafik') || text.toLowerCase().includes('tren karir');
    
    const metadata = await extractMetadata(text, userMajor, shouldFetchTrends);
    
    const imageCaption = metadata.visualKeyword || "Karir SMK";
    const videoRecommendation = metadata.videoRecommendation;
    const trendData = metadata.trendData;

    // Use searchImage instead of generateIllustration
    const imageUrl = await searchImage(imageCaption);
    
    const quickActions = determineQuickActions(text);

    return {
      text,
      groundingMetadata,
      imageUrl,
      imageCaption,
      quickActions,
      videoRecommendation,
      trendData
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
};
