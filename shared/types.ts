export interface SteamProfile {
  steamId: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  loccountrycode?: string;
  timecreated?: number;
  steamLevel: number;
  isSimulated?: boolean;
}

export interface GameData {
  appid: number;
  name: string;
  playtime_2weeks?: number; // in minutes
  playtime_forever: number; // in minutes
  img_icon_url?: string;
  genres?: string[]; // derived from local mapping or Steam API
  last_played?: number;
}

export interface AchievementData {
  apiname: string;
  achieved: number;
  name?: string;
  description?: string;
}

export interface AIStats {
  title: string;          // Gen Z title, e.g. "Achievement Goblin"
  archetype: string;      // Gaming archetype, e.g. "Tryhard Competitor"
  aura: string;           // Aura color & vibe, e.g. "Toxic Green Tryhard Aura"
  motto: string;          // Playful motto, e.g. "Sleep is for the weak, achievements are forever"
  roast: string;          // Direct playful roast
  scores: {
    iq: number;
    collector: number;
    completionist: number;
    competitive: number;
    explorer: number;
    social: number;
    backlog: number;
    touchGrass: number;
    rage: number;
    luck: number;
    saleAddiction: number;
  };
  genreBreakdown: { genre: string; hours: number; percentage: number }[];
  rareAchievementsCount: number;
  totalPlaytimeHours: number;
  totalGamesCount: number;
  completionPercentage: number;
  favoriteGenre: string;
  longestPlayedGame: { name: string; hours: number };
  newestGame?: { name: string; hours: number };
  oldestGame?: { name: string; hours: number };
}

export interface ProfileAnalysis {
  profile: SteamProfile;
  games: GameData[];
  aiStats: AIStats;
}

export interface CompareResult {
  player1: ProfileAnalysis;
  player2: ProfileAnalysis;
  winner: string; // name of the winner
  funnyVerdict: string;
  sharedGames: { name: string; p1Hours: number; p2Hours: number }[];
  metrics: {
    label: string;
    p1Val: string | number;
    p2Val: string | number;
    p1Winner: boolean;
  }[];
}

export interface LeaderboardEntry {
  steamId: string;
  personaname: string;
  avatar: string;
  value: number; // The numeric value being compared (e.g. playtime hours)
  subtitle: string; // e.g. "1,200 hours", "452 achievements"
}
