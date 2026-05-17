// Polyfill DOMMatrix for Node.js environments before importing pdfjs-dist / pdf-export-images
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  } as any;
}

import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    console.log(`[PDF Parser] Received file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamically import to ensure polyfill executes first and defeats ESM hoisting
    console.log(`[PDF Parser] Loading dynamic dependencies...`);
    const { default: pdf2md } = await import('@opendocsg/pdf2md');

    // Parse the PDF to Markdown
    console.log(`[PDF Parser] Initiating pdf2md parsing...`);
    let extractedText = await pdf2md(buffer);
    console.log(`[PDF Parser] pdf2md extraction completed. Text length: ${extractedText ? extractedText.length : 0} chars.`);

    // If the extracted text is empty or only whitespace, run OCR fallback
    if (!extractedText || !extractedText.trim()) {
      console.log(`[PDF Parser] Extracted text is empty. Activating fallback OCR for scanned document...`);
      
      const tempDirName = `vokara-ocr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const tempDir = path.join(os.tmpdir(), tempDirName);
      
      try {
        await fs.mkdir(tempDir, { recursive: true });
        console.log(`[PDF Parser] Created temporary directory for OCR: ${tempDir}`);
        
        // Dynamically load OCR dependencies to bypass any static evaluation constraints
        const { getDocumentProxy, extractImages } = await import('unpdf');
        const { default: sharp } = await import('sharp');
        const { createWorker } = await import('tesseract.js');

        // Load the PDF proxy
        const pdf = await getDocumentProxy(new Uint8Array(arrayBuffer));
        const numPages = pdf.numPages;
        console.log(`[PDF Parser] Loaded PDF proxy with ${numPages} pages.`);
        
        let ocrTexts: string[] = [];
        let imageCounter = 0;

        // Pre-resolve the tesseract worker path to prevent module resolution bugs in Next.js/Turbopack
        const tesseractPath = require.resolve('tesseract.js');
        const tesseractDir = path.dirname(tesseractPath);
        let workerPath = path.resolve(tesseractDir, 'worker-script/node/index.js');
        
        // Clean up any Next.js Turbopack virtual '[project]' directory path injections
        if (workerPath.includes('[project]')) {
          workerPath = workerPath.replace('[project]', '');
          workerPath = path.normalize(workerPath);
        }
        
        console.log(`[PDF Parser] Initializing Tesseract worker with path: ${workerPath}`);

        const worker = await createWorker('eng+ind', 1, {
          workerPath: workerPath
        });
        
        for (let p = 1; p <= numPages; p++) {
          console.log(`[PDF Parser] Extracting images from page ${p}/${numPages}...`);
          const pageImages = await extractImages(pdf, p);
          console.log(`[PDF Parser] Page ${p} contained ${pageImages.length} images.`);
          
          for (let i = 0; i < pageImages.length; i++) {
            const imgData = pageImages[i];
            imageCounter++;
            
            const imgPath = path.join(tempDir, `page_${p}_img_${i}.png`);
            
            // Save the raw pixel buffer using sharp
            await sharp(imgData.data, {
              raw: { width: imgData.width, height: imgData.height, channels: imgData.channels }
            })
              .png()
              .toFile(imgPath);
              
            console.log(`[PDF Parser] Saved extracted image ${imageCounter} to ${imgPath}. Performing OCR...`);
            
            const { data: { text } } = await worker.recognize(imgPath);
            if (text && text.trim()) {
              ocrTexts.push(`[Halaman ${p} - Hasil Pindai Gambar (OCR)]\n${text.trim()}`);
            }
          }
        }

        // Clean up worker memory
        await worker.terminate();
        
        if (ocrTexts.length > 0) {
          extractedText = ocrTexts.join('\n\n');
          console.log(`[PDF Parser] Fallback OCR succeeded! Extracted text length: ${extractedText.length} chars.`);
        }
      } catch (ocrError: any) {
        console.error('[PDF Parser] Failure during fallback OCR processing:', ocrError);
      } finally {
        // Clean up temporary files and folder
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
          console.log(`[PDF Parser] Successfully cleaned up temporary directory: ${tempDir}`);
        } catch (cleanupError) {
          console.error('[PDF Parser] Error cleaning up temporary directory:', cleanupError);
        }
      }
    }

    if (extractedText) {
      console.log(`[PDF Parser] Text preview: ${extractedText.substring(0, 200)}...`);
    }

    return NextResponse.json({ text: extractedText });
  } catch (error: any) {
    console.error('[PDF Parser] Error during parsing:', error);
    return NextResponse.json({ error: error.message || 'Failed to parse PDF' }, { status: 500 });
  }
}
