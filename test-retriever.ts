import { retrieveContext } from './lib/rag/retriever';

console.log("=== TEST RETRIEVER: BROADCASTING (Karier & Trend) ===");
const contextBroadcasting = retrieveContext({
  jurusan: 'broadcasting',
  intents: ['career', 'trend']
});
console.log(contextBroadcasting);

console.log("\n\n=== TEST RETRIEVER: Pemasaran (Kekhawatiran / Emotion) ===");
const contextPemasaran = retrieveContext({
  jurusan: 'pemasaran',
  intents: ['anxiety'],
  emotionDetected: true
});
console.log(contextPemasaran);
