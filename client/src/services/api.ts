import { ProfileAnalysis, CompareResult } from '@shared/types';

// Use standard API base (vite proxies /api calls in development, or we hit absolute backend url)
const API_BASE = '/api';

export async function fetchProfileAnalysis(identifier: string): Promise<ProfileAnalysis> {
  const encoded = encodeURIComponent(identifier);
  const response = await fetch(`${API_BASE}/profile/${encoded}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Profile not found: ${identifier}`);
  }
  return response.json();
}

export async function compareProfiles(p1: string, p2: string): Promise<CompareResult> {
  const response = await fetch(`${API_BASE}/compare?p1=${encodeURIComponent(p1)}&p2=${encodeURIComponent(p2)}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to compare profiles');
  }
  return response.json();
}

export async function fetchLeaderboards(): Promise<{
  playtime: any[];
  library: any[];
  achievements: any[];
  rpg: any[];
  fps: any[];
  level: any[];
}> {
  const response = await fetch(`${API_BASE}/leaderboard`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || 'Failed to fetch leaderboard');
  }
  return response.json();
}
