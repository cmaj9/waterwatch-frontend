/**
 * LIFF Helper Service
 * Manages LINE Front-end Framework (LIFF) lifecycle and authentication
 */
import liff from '@line/liff';

export interface LiffUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

let isInitialized = false;

/**
 * Initialize LIFF with environment variable VITE_LIFF_ID
 */
export async function initLiff(): Promise<boolean> {
  if (isInitialized) return true;

  const liffId = import.meta.env.VITE_LIFF_ID || '';
  if (!liffId) {
    console.warn('[LIFF Service] VITE_LIFF_ID is not configured in .env yet.');
    return false;
  }

  try {
    await liff.init({ liffId });
    isInitialized = true;
    console.log('[LIFF Service] Initialized successfully. InClient:', liff.isInClient());
    return true;
  } catch (err: any) {
    console.error('[LIFF Service] Initialization error:', err?.message || err);
    return false;
  }
}

/**
 * Get profile of current user in LIFF
 */
export async function getLiffProfile(): Promise<LiffUserProfile | null> {
  const ready = await initLiff();
  if (!ready) return null;

  try {
    if (!liff.isLoggedIn() && !liff.isInClient()) {
      return null;
    }
    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage,
    };
  } catch (err: any) {
    console.warn('[LIFF Service] Could not fetch profile:', err?.message);
    return null;
  }
}

/**
 * Close LIFF window if open in LINE client
 */
export function closeLiffWindow(): void {
  if (liff.isInClient()) {
    liff.closeWindow();
  }
}

/**
 * Check if running inside LINE app
 */
export function isInLineClient(): boolean {
  try {
    return liff.isInClient();
  } catch {
    return false;
  }
}

export default liff;
