import { Router, Request, Response } from 'express';
import { LeaderboardEntry } from '../../../shared/types';
import { profileCache } from './profile';
import { MOCK_PROFILES, getGenresForGame } from '../services/steam/steamService';
import { analyzeProfile } from '../services/ai/aiEngine';

const router = Router();

// Pre-seeded players for a rich leaderboard experience
const SEEDED_PLAYERS = [
  {
    steamId: '76561198000000004',
    personaname: 'FPS_Demon_X',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    totalHours: 14250,
    gamesCount: 14,
    achievementsCount: 8,
    rpgHours: 0,
    fpsHours: 13900,
    level: 15
  },
  {
    steamId: '76561198000000005',
    personaname: 'BacklogMuseumOwner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    totalHours: 42,
    gamesCount: 954,
    achievementsCount: 2,
    rpgHours: 8,
    fpsHours: 4,
    level: 210
  },
  {
    steamId: '76561198000000006',
    personaname: 'LoreEnthusiast',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    totalHours: 4800,
    gamesCount: 52,
    achievementsCount: 42,
    rpgHours: 4100,
    fpsHours: 150,
    level: 48
  }
];

router.get('/', (req: Request, res: Response) => {
  // Collect all players: Seeded players + mock profiles + dynamically searched profiles
  const allLeaderboardPlayers: Array<{
    steamId: string;
    personaname: string;
    avatar: string;
    totalHours: number;
    gamesCount: number;
    achievementsCount: number;
    rpgHours: number;
    fpsHours: number;
    level: number;
  }> = [...SEEDED_PLAYERS];

  // Add the 3 standard mock profiles if they aren't already included
  Object.keys(MOCK_PROFILES).forEach(key => {
    const raw = MOCK_PROFILES[key];
    const ai = analyzeProfile(raw.profile, raw.games, raw.rareAchievementsCount, raw.completionPercentage);
    
    // Calculate RPG and FPS hours
    let rpg = 0;
    let fps = 0;
    raw.games.forEach(g => {
      const hours = g.playtime_forever / 60;
      const genres = getGenresForGame(g.appid, g.name);
      if (genres.includes('RPG')) rpg += hours;
      if (genres.includes('FPS') || genres.includes('Shooter')) fps += hours;
    });

    allLeaderboardPlayers.push({
      steamId: raw.profile.steamId,
      personaname: raw.profile.personaname,
      avatar: raw.profile.avatar,
      totalHours: ai.totalPlaytimeHours,
      gamesCount: ai.totalGamesCount,
      achievementsCount: raw.rareAchievementsCount,
      rpgHours: Math.round(rpg),
      fpsHours: Math.round(fps),
      level: raw.profile.steamLevel
    });
  });

  // Add cached profiles from user queries
  profileCache.forEach(analysis => {
    // Avoid duplicates
    if (allLeaderboardPlayers.some(p => p.steamId === analysis.profile.steamId)) {
      return;
    }

    let rpg = 0;
    let fps = 0;
    analysis.games.forEach(g => {
      const hours = g.playtime_forever / 60;
      const genres = getGenresForGame(g.appid, g.name);
      if (genres.includes('RPG')) rpg += hours;
      if (genres.includes('FPS') || genres.includes('Shooter')) fps += hours;
    });

    allLeaderboardPlayers.push({
      steamId: analysis.profile.steamId,
      personaname: analysis.profile.personaname,
      avatar: analysis.profile.avatar,
      totalHours: analysis.aiStats.totalPlaytimeHours,
      gamesCount: analysis.aiStats.totalGamesCount,
      achievementsCount: analysis.aiStats.rareAchievementsCount,
      rpgHours: Math.round(rpg),
      fpsHours: Math.round(fps),
      level: analysis.profile.steamLevel
    });
  });

  // helper formats numbers beautifully
  const fmt = (num: number) => Math.round(num).toLocaleString();

  // 1. Playtime Leaderboard
  const playtime: LeaderboardEntry[] = [...allLeaderboardPlayers]
    .sort((a, b) => b.totalHours - a.totalHours)
    .map((p, idx) => ({
      steamId: p.steamId,
      personaname: p.personaname,
      avatar: p.avatar,
      value: p.totalHours,
      subtitle: `${fmt(p.totalHours)} hours played`
    }));

  // 2. Library Size Leaderboard
  const library: LeaderboardEntry[] = [...allLeaderboardPlayers]
    .sort((a, b) => b.gamesCount - a.gamesCount)
    .map((p, idx) => ({
      steamId: p.steamId,
      personaname: p.personaname,
      avatar: p.avatar,
      value: p.gamesCount,
      subtitle: `${fmt(p.gamesCount)} games owned`
    }));

  // 3. Most Achievements
  const achievements: LeaderboardEntry[] = [...allLeaderboardPlayers]
    .sort((a, b) => b.achievementsCount - a.achievementsCount)
    .map((p, idx) => ({
      steamId: p.steamId,
      personaname: p.personaname,
      avatar: p.avatar,
      value: p.achievementsCount,
      subtitle: `${fmt(p.achievementsCount)} rare achievements`
    }));

  // 4. Most RPG Hours
  const rpgHours: LeaderboardEntry[] = [...allLeaderboardPlayers]
    .sort((a, b) => b.rpgHours - a.rpgHours)
    .map((p, idx) => ({
      steamId: p.steamId,
      personaname: p.personaname,
      avatar: p.avatar,
      value: p.rpgHours,
      subtitle: `${fmt(p.rpgHours)} RPG hours`
    }));

  // 5. Most FPS Hours
  const fpsHours: LeaderboardEntry[] = [...allLeaderboardPlayers]
    .sort((a, b) => b.fpsHours - a.fpsHours)
    .map((p, idx) => ({
      steamId: p.steamId,
      personaname: p.personaname,
      avatar: p.avatar,
      value: p.fpsHours,
      subtitle: `${fmt(p.fpsHours)} FPS hours`
    }));

  // 6. Level Collector
  const level: LeaderboardEntry[] = [...allLeaderboardPlayers]
    .sort((a, b) => b.level - a.level)
    .map((p, idx) => ({
      steamId: p.steamId,
      personaname: p.personaname,
      avatar: p.avatar,
      value: p.level,
      subtitle: `Level ${p.level}`
    }));

  return res.json({
    playtime,
    library,
    achievements,
    rpg: rpgHours,
    fps: fpsHours,
    level
  });
});

export default router;
