import { Router, Request, Response } from 'express';
import { fetchProfileData } from '../services/steam/steamService';
import { analyzeProfile } from '../services/ai/aiEngine';
import { ProfileAnalysis } from '../../../shared/types';

const router = Router();

// Store analysed profiles in a simple cache to make comparison and leaderboard endpoints work seamlessly
export const profileCache = new Map<string, ProfileAnalysis>();

router.get('/:identifier', async (req: Request, res: Response) => {
  const { identifier } = req.params;
  try {
    if (!identifier) {
      return res.status(400).json({ error: 'Profile URL or SteamID is required' });
    }

    const rawData = await fetchProfileData(identifier);
    const aiStats = analyzeProfile(
      rawData.profile,
      rawData.games,
      rawData.rareAchievementsCount,
      rawData.completionPercentage
    );

    const responsePayload: ProfileAnalysis = {
      profile: rawData.profile,
      games: rawData.games,
      aiStats
    };

    // Cache the analyzed profile
    profileCache.set(rawData.profile.steamId, responsePayload);
    // Also cache under input vanity url name if applicable
    profileCache.set(identifier.toLowerCase(), responsePayload);

    return res.json(responsePayload);
  } catch (error: any) {
    console.error('Error in profile routing:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch profile analysis' });
  }
});

export default router;
