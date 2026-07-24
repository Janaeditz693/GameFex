import axios from 'axios';
import dotenv from 'dotenv';
import { SteamProfile, GameData } from '../../../../shared/types';

dotenv.config();

const STEAM_API_KEY = process.env.STEAM_API_KEY || '';
const STEAM_API_BASE = 'http://api.steampowered.com';

// Local genre mapping for common games to make parsing fast and independent of Steam Store API rate limits
export const GAME_GENRE_MAP: { [key: number]: string[] } = {
  730: ['FPS', 'Shooter', 'Competitive', 'Action'], // Counter-Strike 2
  570: ['MOBA', 'Strategy', 'Competitive'], // Dota 2
  1172470: ['FPS', 'Shooter', 'Competitive', 'Action'], // Apex Legends
  1245620: ['RPG', 'Soulslike', 'Open World', 'Action'], // Elden Ring
  1091500: ['RPG', 'Cyberpunk', 'Open World', 'Sci-Fi'], // Cyberpunk 2077
  413150: ['Simulation', 'Farming', 'Cozy', 'Indie'], // Stardew Valley
  433340: ['Adventure', 'Cozy', 'Simulation', 'Indie'], // Slime Rancher
  105600: ['Sandbox', 'Survival', 'Adventure', 'Crafting'], // Terraria
  1085660: ['RPG', 'Turn-Based', 'Fantasy', 'Adventure'], // Baldur's Gate 3
  289070: ['Strategy', 'Turn-Based', 'Historical'], // Civilization VI
  367520: ['Metroidvania', 'Platformer', 'Indie', 'Difficult'], // Hollow Knight
  504230: ['Platformer', 'Indie', 'Difficult', '2D'], // Celeste
  1145360: ['Roguelike', 'Action', 'Indie', 'Mythology'], // Hades
  268910: ['Strategy', 'Tactical', 'Sci-Fi'], // XCOM 2
  252490: ['Survival', 'Crafting', 'Open World', 'Multiplayer'], // Rust
  381210: ['Action', 'Horror', 'Survival', 'Multiplayer'], // Dead by Daylight
  292030: ['RPG', 'Open World', 'Fantasy', 'Story Rich'], // The Witcher 3: Wild Hunt
  400: ['Puzzle', 'Sci-Fi', 'Co-op'], // Portal
  620: ['Puzzle', 'Sci-Fi', 'Co-op', 'Comedy'], // Portal 2
  218620: ['Shooter', 'Action', 'Co-op', 'Crime'], // Payday 2
  440: ['FPS', 'Shooter', 'Action', 'Multiplayer'], // Team Fortress 2
  230410: ['Action', 'Sci-Fi', 'Shooter', 'Multiplayer'], // Warframe
  550: ['FPS', 'Shooter', 'Action', 'Co-op', 'Zombies'], // Left 4 Dead 2
  252950: ['Action', 'Sports', 'Competitive'], // Rocket League
  227300: ['Simulation', 'Driving', 'Casual'], // Euro Truck Simulator 2
};

const DEFAULT_GENRES = ['Action', 'Adventure', 'Indie', 'RPG', 'Strategy', 'Casual', 'Simulation', 'Sports'];

export function getGenresForGame(appid: number, name: string): string[] {
  if (GAME_GENRE_MAP[appid]) {
    return GAME_GENRE_MAP[appid];
  }
  // Simple heuristic based on game name keywords
  const lowerName = name.toLowerCase();
  const matched: string[] = [];
  if (lowerName.includes('war') || lowerName.includes('combat') || lowerName.includes('strike') || lowerName.includes('duty') || lowerName.includes('battle')) matched.push('Action');
  if (lowerName.includes('sim') || lowerName.includes('tycoon') || lowerName.includes('manager') || lowerName.includes('truck')) matched.push('Simulation');
  if (lowerName.includes('craft') || lowerName.includes('surviv') || lowerName.includes('world')) matched.push('Survival');
  if (lowerName.includes('quest') || lowerName.includes('fantasy') || lowerName.includes('scrolls') || lowerName.includes('elden')) matched.push('RPG');
  if (lowerName.includes('puzzle') || lowerName.includes('portal') || lowerName.includes('tetris')) matched.push('Puzzle');
  if (lowerName.includes('soccer') || lowerName.includes('race') || lowerName.includes('rally') || lowerName.includes('sport')) matched.push('Sports');
  
  if (matched.length > 0) return matched;
  // Deterministic fallback based on appid hash
  const hash = appid % DEFAULT_GENRES.length;
  return [DEFAULT_GENRES[hash], 'Indie'];
}

// Pre-defined High Fidelity Mock Profiles
export const MOCK_PROFILES: {
  [key: string]: {
    profile: SteamProfile;
    games: GameData[];
    rareAchievementsCount: number;
    completionPercentage: number;
  };
} = {
  gamergod99: {
    profile: {
      steamId: '76561198000000001',
      personaname: 'GamerGod99',
      profileurl: 'https://steamcommunity.com/id/gamergod99',
      avatar: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      avatarmedium: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      avatarfull: 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      loccountrycode: 'US',
      timecreated: 1358942400, // 2013
      steamLevel: 69,
      isSimulated: true
    },
    games: [
      { appid: 730, name: 'Counter-Strike 2', playtime_forever: 255000, playtime_2weeks: 2520, img_icon_url: '730_icon' }, // 4250 hours total, 42 hours recent
      { appid: 570, name: 'Dota 2', playtime_forever: 186000, playtime_2weeks: 600, img_icon_url: '570_icon' }, // 3100 hours
      { appid: 1172470, name: 'Apex Legends', playtime_forever: 72000, playtime_2weeks: 0, img_icon_url: '1172470_icon' }, // 1200 hours
      { appid: 1245620, name: 'Elden Ring', playtime_forever: 9000, playtime_2weeks: 0, img_icon_url: '1245620_icon' }, // 150 hours
      { appid: 1091500, name: 'Cyberpunk 2077', playtime_forever: 5400, playtime_2weeks: 0, img_icon_url: '1091500_icon' }, // 90 hours
      { appid: 105600, name: 'Terraria', playtime_forever: 4200, playtime_2weeks: 0, img_icon_url: '105600_icon' } // 70 hours
    ],
    rareAchievementsCount: 14,
    completionPercentage: 35
  },
  cozycat: {
    profile: {
      steamId: '76561198000000002',
      personaname: 'CozyCat',
      profileurl: 'https://steamcommunity.com/id/cozycat',
      avatar: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      avatarmedium: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      avatarfull: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      loccountrycode: 'JP',
      timecreated: 1512475200, // 2017
      steamLevel: 120,
      isSimulated: true
    },
    games: [
      { appid: 413150, name: 'Stardew Valley', playtime_forever: 51000, playtime_2weeks: 1440, img_icon_url: '413150_icon' }, // 850 hours
      { appid: 105600, name: 'Terraria', playtime_forever: 24600, playtime_2weeks: 0, img_icon_url: '105600_icon' }, // 410 hours
      { appid: 433340, name: 'Slime Rancher', playtime_forever: 14400, playtime_2weeks: 120, img_icon_url: '433340_icon' }, // 240 hours
      { appid: 1085660, name: 'Baldur\'s Gate 3', playtime_forever: 18600, playtime_2weeks: 0, img_icon_url: '1085660_icon' }, // 310 hours
      { appid: 620, name: 'Portal 2', playtime_forever: 2700, playtime_2weeks: 0, img_icon_url: '620_icon' },
      // Heavy backlog simulation:
      ...Array.from({ length: 245 }).map((_, i) => ({
        appid: 200000 + i,
        name: `Backlog Game ${i + 1}`,
        playtime_forever: i % 10 === 0 ? 6 : 0, // mostly 0 or 6 mins (0.1 hrs)
        playtime_2weeks: 0
      }))
    ],
    rareAchievementsCount: 3,
    completionPercentage: 12
  },
  goblinking: {
    profile: {
      steamId: '76561198000000003',
      personaname: 'GoblinKing',
      profileurl: 'https://steamcommunity.com/id/goblinking',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      avatarmedium: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      avatarfull: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      loccountrycode: 'CA',
      timecreated: 1420070400, // 2015
      steamLevel: 42,
      isSimulated: true
    },
    games: [
      { appid: 367520, name: 'Hollow Knight', playtime_forever: 9000, playtime_2weeks: 180, img_icon_url: '367520_icon' }, // 150 hours (100% complete)
      { appid: 504230, name: 'Celeste', playtime_forever: 6600, playtime_2weeks: 0, img_icon_url: '504230_icon' }, // 110 hours
      { appid: 1245620, name: 'Elden Ring', playtime_forever: 13200, playtime_2weeks: 480, img_icon_url: '1245620_icon' }, // 220 hours
      { appid: 1145360, name: 'Hades', playtime_forever: 10800, playtime_2weeks: 0, img_icon_url: '1145360_icon' }, // 180 hours
      { appid: 620, name: 'Portal 2', playtime_forever: 2700, playtime_2weeks: 0, img_icon_url: '620_icon' }
    ],
    rareAchievementsCount: 58,
    completionPercentage: 92
  }
};

/**
 * Parses user input (Steam Profile link, vanity name, or exact 17-digit SteamID)
 */
export function resolveIdentifier(input: string): { type: 'id' | 'vanity'; val: string } {
  const trimmed = input.trim();

  // If full URL (e.g. steamcommunity.com/profiles/12345678901234567)
  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileMatch) {
    return { type: 'id', val: profileMatch[1] };
  }

  // If vanity URL (e.g. steamcommunity.com/id/mycustomname)
  const idMatch = trimmed.match(/steamcommunity\.com\/id\/([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return { type: 'vanity', val: idMatch[1] };
  }

  // Check if direct 17-digit number
  if (/^\d{17}$/.test(trimmed)) {
    return { type: 'id', val: trimmed };
  }

  // Default to vanity name string
  return { type: 'vanity', val: trimmed };
}

/**
 * Resolves input and fetches player details
 */
export async function fetchProfileData(identifierInput: string): Promise<{
  profile: SteamProfile;
  games: GameData[];
  rareAchievementsCount: number;
  completionPercentage: number;
}> {
  const resolved = resolveIdentifier(identifierInput);

  // Check mock database first (for custom names or exact mock IDs)
  const mockKey = Object.keys(MOCK_PROFILES).find(
    k => k === resolved.val.toLowerCase() || MOCK_PROFILES[k].profile.steamId === resolved.val
  );

  if (mockKey) {
    return JSON.parse(JSON.stringify(MOCK_PROFILES[mockKey])); // deep copy
  }

  // Fallback to Live Steam API if API Key is configured, else generate a generic high fidelity mock
  if (!STEAM_API_KEY) {
    return generateDynamicMockData(resolved.val);
  }

  try {
    let steamId = '';
    if (resolved.type === 'vanity') {
      const resolveUrl = `${STEAM_API_BASE}/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${resolved.val}`;
      const res = await axios.get(resolveUrl);
      if (res.data.response && res.data.response.success === 1) {
        steamId = res.data.response.steamid;
      } else {
        // Fall back to dynamic mock if resolving vanity failed
        return generateDynamicMockData(resolved.val);
      }
    } else {
      steamId = resolved.val;
    }

    // 1. Get Player Summary
    const summaryUrl = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;
    const summaryRes = await axios.get(summaryUrl);
    const players = summaryRes.data.response?.players;
    if (!players || players.length === 0) {
      return generateDynamicMockData(resolved.val);
    }
    const rawPlayer = players[0];

    // 2. Get Steam Level
    let level = 10;
    try {
      const levelUrl = `${STEAM_API_BASE}/IPlayerService/GetSteamLevel/v1/?key=${STEAM_API_KEY}&steamid=${steamId}`;
      const levelRes = await axios.get(levelUrl);
      level = levelRes.data.response?.player_level || 10;
    } catch (e) {
      console.warn('Could not fetch Steam level, defaulting to 10');
    }

    const profile: SteamProfile = {
      steamId: rawPlayer.steamid,
      personaname: rawPlayer.personaname,
      profileurl: rawPlayer.profileurl,
      avatar: rawPlayer.avatar,
      avatarmedium: rawPlayer.avatarmedium,
      avatarfull: rawPlayer.avatarfull,
      loccountrycode: rawPlayer.loccountrycode,
      timecreated: rawPlayer.timecreated,
      steamLevel: level
    };

    // 3. Get Owned Games
    const gamesUrl = `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`;
    const gamesRes = await axios.get(gamesUrl);
    const rawGames = gamesRes.data.response?.games || [];

    const games: GameData[] = rawGames.map((g: any) => ({
      appid: g.appid,
      name: g.name,
      playtime_forever: g.playtime_forever,
      playtime_2weeks: g.playtime_2weeks || 0,
      img_icon_url: g.img_icon_url ? `http://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg` : undefined
    }));

    // Sort games by playtime
    games.sort((a, b) => b.playtime_forever - a.playtime_forever);

    // Calculate dynamic achievements details since we can't request achievements for all games (rate limit)
    // We mock/estimate rare achievements based on level and play hours to make it fast
    const totalPlaytimeMins = games.reduce((sum, g) => sum + g.playtime_forever, 0);
    const totalPlaytimeHours = totalPlaytimeMins / 60;
    const rareAchievementsCount = Math.floor(totalPlaytimeHours * 0.05 + level * 0.2) + 2;
    const completionPercentage = Math.min(95, Math.max(5, Math.floor((totalPlaytimeHours % 40) + level * 0.1)));

    return {
      profile,
      games,
      rareAchievementsCount,
      completionPercentage
    };

  } catch (error) {
    console.error('Error fetching Steam live data, falling back to mock:', error);
    return generateDynamicMockData(resolved.val);
  }
}

/**
 * Generates a consistent dynamic mock profile based on input string
 * so that any input generates a unique but deterministically stable profile.
 */
function generateDynamicMockData(input: string): {
  profile: SteamProfile;
  games: GameData[];
  rareAchievementsCount: number;
  completionPercentage: number;
} {
  // Simple hashing function
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const numGames = (hash % 180) + 15; // 15 to 195 games
  const level = (hash % 80) + 5; // Level 5 to 85
  const countryList = ['US', 'DE', 'GB', 'FR', 'CA', 'AU', 'KR', 'JP', 'BR', 'FI'];
  const country = countryList[hash % countryList.length];
  
  // Deterministic user avatar based on hash
  const avatarId = (hash % 70) + 1;
  const avatar = `https://xsgames.co/randomusers/assets/avatars/male/${avatarId}.jpg`;

  const username = input.charAt(0).toUpperCase() + input.slice(1).replace(/[^a-zA-Z0-9]/g, '') || 'SteamPlayer';

  const profile: SteamProfile = {
    steamId: '7656119' + String(hash).padStart(10, '0').slice(0, 10),
    personaname: username,
    profileurl: `https://steamcommunity.com/id/${input}`,
    avatar,
    avatarmedium: avatar,
    avatarfull: avatar,
    loccountrycode: country,
    timecreated: 1420070400 + (hash % 200000000), // ~2015 to 2021
    steamLevel: level,
    isSimulated: true
  };

  // Generate realistic game logs
  const libraryTemplates = [
    { appid: 730, name: 'Counter-Strike 2', baseHours: 800 },
    { appid: 570, name: 'Dota 2', baseHours: 1200 },
    { appid: 1245620, name: 'Elden Ring', baseHours: 140 },
    { appid: 1091500, name: 'Cyberpunk 2077', baseHours: 80 },
    { appid: 413150, name: 'Stardew Valley', baseHours: 250 },
    { appid: 105600, name: 'Terraria', baseHours: 180 },
    { appid: 1085660, name: 'Baldur\'s Gate 3', baseHours: 220 },
    { appid: 1172470, name: 'Apex Legends', baseHours: 500 },
    { appid: 1145360, name: 'Hades', baseHours: 90 },
    { appid: 620, name: 'Portal 2', baseHours: 25 },
    { appid: 227300, name: 'Euro Truck Simulator 2', baseHours: 150 },
    { appid: 252490, name: 'Rust', baseHours: 600 }
  ];

  // Pick 4 to 8 active games from templates
  const activeGamesCount = (hash % 5) + 4;
  const games: GameData[] = [];
  
  for (let i = 0; i < activeGamesCount; i++) {
    const templateIndex = (hash + i) % libraryTemplates.length;
    const template = libraryTemplates[templateIndex];
    // Add randomness to hours
    const multiplier = 0.3 + ((hash + i * 17) % 150) / 100; // 0.3x to 1.8x
    const playtime_forever = Math.floor(template.baseHours * multiplier * 60); // in mins
    const playtime_2weeks = (hash + i) % 3 === 0 ? Math.floor(((hash + i) % 1200) + 120) : 0; // some recent play
    
    if (!games.some(g => g.appid === template.appid)) {
      games.push({
        appid: template.appid,
        name: template.name,
        playtime_forever,
        playtime_2weeks,
        img_icon_url: `${template.appid}_icon`
      });
    }
  }

  // Fill up backlog of unplayed or barely played games
  const backlogCount = numGames - games.length;
  for (let i = 0; i < backlogCount; i++) {
    const fakeAppId = 300000 + i;
    const fakePlaytime = i % 8 === 0 ? Math.floor(((hash + i) % 55) + 5) : 0; // mostly 0 hours, some 10-60 mins
    games.push({
      appid: fakeAppId,
      name: `Indie Title ${i + 1}`,
      playtime_forever: fakePlaytime,
      playtime_2weeks: 0
    });
  }

  // Sort by playtime
  games.sort((a, b) => b.playtime_forever - a.playtime_forever);

  const totalPlaytimeHours = games.reduce((sum, g) => sum + g.playtime_forever, 0) / 60;
  const rareAchievementsCount = Math.floor(totalPlaytimeHours * 0.04 + level * 0.15);
  const completionPercentage = Math.min(88, Math.max(3, Math.floor(((hash % 30) + level * 0.3))));

  return {
    profile,
    games,
    rareAchievementsCount,
    completionPercentage
  };
}
