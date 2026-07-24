import { Router, Request, Response } from 'express';
import { fetchProfileData } from '../services/steam/steamService';
import { analyzeProfile } from '../services/ai/aiEngine';
import { CompareResult, ProfileAnalysis } from '../../../shared/types';
import { profileCache } from './profile';

const router = Router();

// Helper to fetch or analyze profile for comparison
async function getOrAnalyze(identifier: string): Promise<ProfileAnalysis> {
  const cached = profileCache.get(identifier.toLowerCase());
  if (cached) return cached;

  const rawData = await fetchProfileData(identifier);
  const aiStats = analyzeProfile(
    rawData.profile,
    rawData.games,
    rawData.rareAchievementsCount,
    rawData.completionPercentage
  );

  const analysis: ProfileAnalysis = {
    profile: rawData.profile,
    games: rawData.games,
    aiStats
  };

  profileCache.set(rawData.profile.steamId, analysis);
  profileCache.set(identifier.toLowerCase(), analysis);
  return analysis;
}

router.get('/', async (req: Request, res: Response) => {
  const { p1, p2 } = req.query;

  if (!p1 || !p2) {
    return res.status(400).json({ error: 'Two profile identifiers (p1 and p2) are required.' });
  }

  try {
    const player1 = await getOrAnalyze(p1 as string);
    const player2 = await getOrAnalyze(p2 as string);

    // Compute shared games
    const p1GamesMap = new Map(player1.games.map(g => [g.appid, g]));
    const sharedGamesList: { name: string; p1Hours: number; p2Hours: number }[] = [];

    player2.games.forEach(g2 => {
      const g1 = p1GamesMap.get(g2.appid);
      if (g1 && (g1.playtime_forever > 0 || g2.playtime_forever > 0)) {
        sharedGamesList.push({
          name: g2.name,
          p1Hours: Math.round((g1.playtime_forever / 60) * 10) / 10,
          p2Hours: Math.round((g2.playtime_forever / 60) * 10) / 10
        });
      }
    });

    // Limit shared games to top 10 by combined play hours
    sharedGamesList.sort((a, b) => (b.p1Hours + b.p2Hours) - (a.p1Hours + a.p2Hours));
    const sharedGames = sharedGamesList.slice(0, 10);

    // Form comparison metrics
    const metrics = [
      {
        label: 'Steam Level',
        p1Val: player1.profile.steamLevel,
        p2Val: player2.profile.steamLevel,
        p1Winner: player1.profile.steamLevel > player2.profile.steamLevel
      },
      {
        label: 'Total Games Owned',
        p1Val: player1.aiStats.totalGamesCount,
        p2Val: player2.aiStats.totalGamesCount,
        p1Winner: player1.aiStats.totalGamesCount > player2.aiStats.totalGamesCount
      },
      {
        label: 'Total Playtime (Hours)',
        p1Val: player1.aiStats.totalPlaytimeHours,
        p2Val: player2.aiStats.totalPlaytimeHours,
        p1Winner: player1.aiStats.totalPlaytimeHours > player2.aiStats.totalPlaytimeHours
      },
      {
        label: 'Achievement Completion %',
        p1Val: `${player1.aiStats.completionPercentage}%`,
        p2Val: `${player2.aiStats.completionPercentage}%`,
        p1Winner: player1.aiStats.completionPercentage > player2.aiStats.completionPercentage
      },
      {
        label: 'Touch Grass Score',
        p1Val: `${player1.aiStats.scores.touchGrass}%`,
        p2Val: `${player2.aiStats.scores.touchGrass}%`,
        // Touch grass score: higher is better (wins)
        p1Winner: player1.aiStats.scores.touchGrass > player2.aiStats.scores.touchGrass
      },
      {
        label: 'Gaming IQ',
        p1Val: player1.aiStats.scores.iq,
        p2Val: player2.aiStats.scores.iq,
        p1Winner: player1.aiStats.scores.iq > player2.aiStats.scores.iq
      }
    ];

    // Determine the ultimate winner and write a funny verdict
    let winner = '';
    let funnyVerdict = '';

    const p1Wins = metrics.filter(m => m.p1Winner).length;
    const p2Wins = metrics.filter(m => !m.p1Winner && m.p1Val !== m.p2Val).length;

    if (p1Wins > p2Wins) {
      winner = player1.profile.personaname;
      funnyVerdict = `${player1.profile.personaname} wins! They have assertively established gaming dominance. ${player2.profile.personaname}'s gaming statistics look like an unfinished tutorial.`;
    } else if (p2Wins > p1Wins) {
      winner = player2.profile.personaname;
      funnyVerdict = `${player2.profile.personaname} wins! They swept the floor with gaming metrics. ${player1.profile.personaname} needs to lock in and stop collecting backlog games.`;
    } else {
      winner = 'Draw';
      funnyVerdict = `It's a dead tie! Both players are equally matched in their refusal to go outside. Shake hands and buy another Steam sale game together.`;
    }

    // Custom funny details based on specific metrics
    if (player1.aiStats.scores.touchGrass < 10 && player2.aiStats.scores.touchGrass > 50) {
      funnyVerdict += ` Mind you, ${player2.profile.personaname} actually touched tree bark recently, whereas ${player1.profile.personaname} probably thinks grass is a downloadable texture pack.`;
    } else if (player2.aiStats.scores.touchGrass < 10 && player1.aiStats.scores.touchGrass > 50) {
      funnyVerdict += ` Mind you, ${player1.profile.personaname} actually touched tree bark recently, whereas ${player2.profile.personaname} probably thinks grass is a downloadable texture pack.`;
    }

    const result: CompareResult = {
      player1,
      player2,
      winner,
      funnyVerdict,
      sharedGames,
      metrics
    };

    return res.json(result);
  } catch (error: any) {
    console.error('Error comparing profiles:', error);
    return res.status(500).json({ error: error.message || 'Failed to compare profiles.' });
  }
});

export default router;
