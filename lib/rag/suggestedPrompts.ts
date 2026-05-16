// ============================================================
// suggestedPrompts.ts
// Service for managing suggested prompts rotation
// ============================================================

import { getRandomSuggestedPrompts, getSessionPrompts, clearPromptCache } from '@/data/rag/suggestedPromptsData';

/**
 * Get 4 suggested prompts for a new chat session
 * Prompts are rotated per session to avoid showing the same templates
 */
export function getSuggestedPromptsForSession(sessionId: string, jurusan: string): string[] {
  return getSessionPrompts(sessionId, jurusan);
}

/**
 * Get a fresh set of suggested prompts (ignores cache)
 * Useful for "refresh suggestions" button
 */
export function refreshSuggestedPrompts(sessionId: string, jurusan: string): string[] {
  clearPromptCache(sessionId);
  return getSessionPrompts(sessionId, jurusan);
}

/**
 * Check if a major has specific suggested prompts
 */
export function hasMajorPrompts(jurusan: string): boolean {
  const SUGGESTED_PROMPTS: Record<string, string[]> = require('@/data/rag/suggestedPromptsData').SUGGESTED_PROMPTS;
  return !!SUGGESTED_PROMPTS[jurusan.toLowerCase()];
}
