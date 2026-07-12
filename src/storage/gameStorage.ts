import type { SimulatorState } from '../types';

const STORAGE_KEY = 'ai-life-simulator-mvp';

export function loadState(): SimulatorState | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SimulatorState;
  } catch {
    return null;
  }
}

export function saveState(state: SimulatorState): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
