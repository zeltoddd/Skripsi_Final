// constants.ts - Entry point for all constants (Re-exported for backward compatibility)
export * from './constants/majors';
export * from './constants/persona';
export * from './constants/suggestions';

export const APP_NAME = "Kak Karir";

// Keep this for now to prevent breaking existing components
export const SYSTEM_INSTRUCTION = (userMajor: string) => `
PERAN: Kak Karir, mentor karir SMK ${userMajor}.
Gunakan constants/persona.ts untuk versi lengkapnya.
`;