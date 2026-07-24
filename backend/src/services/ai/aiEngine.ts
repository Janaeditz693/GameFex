import { GameData, AIStats, SteamProfile } from '../../../../shared/types';
import { getGenresForGame } from '../steam/steamService';

export function analyzeProfile(
  profile: SteamProfile,
  games: GameData[],
  rareAchievementsCount: number,
  completionPercentage: number
): AIStats {
  const totalGamesCount = games.length;
  
  // Calculate total playtime
  const totalPlaytimeMins = games.reduce((sum, g) => sum + g.playtime_forever, 0);
  const totalPlaytimeHours = Math.round((totalPlaytimeMins / 60) * 10) / 10;

  // Find longest played game
  let longestPlayedGame = { name: 'None', hours: 0 };
  if (games.length > 0) {
    longestPlayedGame = {
      name: games[0].name,
      hours: Math.round((games[0].playtime_forever / 60) * 10) / 10
    };
  }

  // Calculate genre breakdown
  const genreHoursMap: { [key: string]: number } = {};
  games.forEach(game => {
    const hours = game.playtime_forever / 60;
    if (hours === 0) return;
    
    const genres = getGenresForGame(game.appid, game.name);
    genres.forEach(genre => {
      genreHoursMap[genre] = (genreHoursMap[genre] || 0) + hours;
    });
  });

  const totalGenreHours = Object.values(genreHoursMap).reduce((sum, h) => sum + h, 0);
  const genreBreakdown = Object.entries(genreHoursMap)
    .map(([genre, hours]) => ({
      genre,
      hours: Math.round(hours * 10) / 10,
      percentage: totalGenreHours > 0 ? Math.round((hours / totalGenreHours) * 100) : 0
    }))
    .sort((a, b) => b.hours - a.hours);

  const favoriteGenre = genreBreakdown.length > 0 ? genreBreakdown[0].genre : 'Variety';

  // Backlog calculations (games with < 1 hour of playtime)
  const backlogGamesCount = games.filter(g => g.playtime_forever < 60).length;
  const backlogRatio = totalGamesCount > 0 ? backlogGamesCount / totalGamesCount : 0;

  // Competitive games hours
  const competitiveHours = games
    .filter(g => {
      const genres = getGenresForGame(g.appid, g.name);
      return genres.includes('Competitive') || genres.includes('FPS') || genres.includes('MOBA');
    })
    .reduce((sum, g) => sum + g.playtime_forever / 60, 0);

  const competitiveRatio = totalPlaytimeHours > 0 ? competitiveHours / totalPlaytimeHours : 0;

  // Cozy/Simulation games hours
  const cozyHours = games
    .filter(g => {
      const genres = getGenresForGame(g.appid, g.name);
      return genres.includes('Cozy') || genres.includes('Simulation') || genres.includes('Casual');
    })
    .reduce((sum, g) => sum + g.playtime_forever / 60, 0);

  const cozyRatio = totalPlaytimeHours > 0 ? cozyHours / totalPlaytimeHours : 0;

  // RPG/Sandbox/Adventure explorer hours
  const explorerHours = games
    .filter(g => {
      const genres = getGenresForGame(g.appid, g.name);
      return genres.includes('RPG') || genres.includes('Sandbox') || genres.includes('Open World') || genres.includes('Adventure');
    })
    .reduce((sum, g) => sum + g.playtime_forever / 60, 0);

  const explorerRatio = totalPlaytimeHours > 0 ? explorerHours / totalPlaytimeHours : 0;

  // Recent playtimes (in the last 2 weeks)
  const recentPlaytimeMins = games.reduce((sum, g) => sum + (g.playtime_2weeks || 0), 0);
  const recentPlaytimeHours = recentPlaytimeMins / 60;

  // Calculate the personality scores out of 100:
  const collector = Math.min(100, Math.max(10, Math.floor((totalGamesCount / 200) * 80 + (profile.steamLevel / 100) * 20)));
  const completionist = completionPercentage;
  const competitive = Math.min(100, Math.max(5, Math.floor(competitiveRatio * 100)));
  const explorer = Math.min(100, Math.max(5, Math.floor(explorerRatio * 100)));
  const social = Math.min(100, Math.max(5, Math.floor(totalPlaytimeHours > 0 ? (games.filter(g => getGenresForGame(g.appid, g.name).includes('Multiplayer')).reduce((sum, g) => sum + g.playtime_forever / 60, 0) / totalPlaytimeHours) * 100 : 0)));
  const backlog = Math.min(100, Math.max(5, Math.floor(backlogRatio * 100)));
  const touchGrass = Math.max(1, Math.min(100, Math.floor(100 - (recentPlaytimeHours * 1.5 + (totalPlaytimeHours / 100)))));
  
  const soulslikeHours = games
    .filter(g => getGenresForGame(g.appid, g.name).includes('Soulslike') || getGenresForGame(g.appid, g.name).includes('Difficult'))
    .reduce((sum, g) => sum + g.playtime_forever / 60, 0);
  const difficultRatio = totalPlaytimeHours > 0 ? (soulslikeHours + competitiveHours) / totalPlaytimeHours : 0;
  const rage = Math.min(100, Math.max(5, Math.floor(difficultRatio * 85 + (recentPlaytimeHours > 10 ? 15 : 0))));

  const steamIdNum = parseInt(profile.steamId.slice(-4)) || 50;
  const luck = Math.min(100, Math.max(10, (steamIdNum % 90) + 10));
  const saleAddiction = Math.min(100, Math.max(5, Math.floor(backlog * 0.7 + (totalGamesCount > 100 ? 30 : totalGamesCount * 0.3))));

  const baseIq = 90;
  const iqBonus = Math.floor((explorer * 0.2) + (completionist * 0.15) - (competitive * 0.05) + (games.some(g => g.name.includes('Portal')) ? 15 : 0));
  const iq = Math.max(65, Math.min(150, baseIq + iqBonus));

  // Determine Dynamic Title based on custom keywords
  let title = 'Casual Grinder';
  let archetype = 'All-Rounder';
  let aura = 'Balanced Cyan Aura';
  let motto = 'GG WP, let\'s queue again.';

  const topGameName = longestPlayedGame.name;
  const topHours = longestPlayedGame.hours;

  const csKeywords = ['counter-strike', 'cs:go', 'cs2', 'dota', 'league', 'apex', 'rust', 'valorant', 'pubg', 'rainbow six', 'overwatch'];
  const soulsKeywords = ['elden ring', 'dark souls', 'sekiro', 'bloodborne', 'lies of p', 'hades', 'hollow knight', 'monster hunter'];
  const cozyKeywords = ['stardew', 'terraria', 'minecraft', 'sims', 'slime', 'animal crossing', 'house flipper', 'dave the diver'];
  const rpgKeywords = ['cyberpunk', 'witcher', 'baldur', 'skyrim', 'fallout', 'starfield', 'gta', 'red dead'];

  const isCompetitive = csKeywords.some(kw => topGameName.toLowerCase().includes(kw));
  const isSouls = soulsKeywords.some(kw => topGameName.toLowerCase().includes(kw));
  const isCozy = cozyKeywords.some(kw => topGameName.toLowerCase().includes(kw));
  const isRpg = rpgKeywords.some(kw => topGameName.toLowerCase().includes(kw));

  if (isCompetitive && topHours > 100) {
    title = 'Ranked Demon';
    archetype = 'The Hardcore Competitor';
    aura = 'Toxic Lime Tryhard Aura';
    motto = 'GG WP, cope harder.';
  } else if (isSouls && topHours > 50) {
    title = 'Soulsborne Masochist';
    archetype = 'The Pain Seeker';
    aura = 'Death Screen Red Aura';
    motto = 'You died. Again. And again.';
  } else if (isCozy && topHours > 50) {
    title = 'Cozy Crop Cultivator';
    archetype = 'The Escape Artist';
    aura = 'Pastel Lavender Comfort Aura';
    motto = 'Virtual farming cures the existential dread.';
  } else if (isRpg && topHours > 80) {
    title = 'Lore Scholar';
    archetype = 'The Open-World Explorer';
    aura = 'Mystic Gold Explorer Aura';
    motto = 'Let me read this 400-page book in-game.';
  } else if (backlog > 75 && totalGamesCount > 40) {
    title = 'Steam Sale Victim';
    archetype = 'The Digital Curator';
    aura = 'Infinite Grey Backlog Aura';
    motto = 'I buy games on sale to play them... eventually.';
  } else if (completionist > 80) {
    title = 'Achievement Goblin';
    archetype = 'The 100% Completionist';
    aura = 'Golden Glow Completionist Aura';
    motto = 'Every achievement is a checkmark in my soul.';
  } else if (totalPlaytimeHours > 2500) {
    title = 'Patch Notes Survivor';
    archetype = 'The Ancient Gamer';
    aura = 'Deep Crimson Veteran Aura';
    motto = 'I was there when lobbies were silent.';
  } else if (touchGrass < 15) {
    title = 'Touch Grass Challenger';
    archetype = 'No-Lifer';
    aura = 'Dark Void Neon Aura';
    motto = 'What is this "outside" DLC everyone talks about?';
  } else if (totalGamesCount < 8 && totalPlaytimeHours < 30) {
    title = 'NPC Energy';
    archetype = 'The Tourist';
    aura = 'Faint Green Starter Aura';
    motto = 'I just play what my friends tell me to.';
  }

  // Generate highly customized and randomized Roast pools
  const roastsPool: string[] = [];
  
  if (isCompetitive && topHours > 50) {
    roastsPool.push(`You spent ${topHours} hours in ${topGameName}. That's enough time to learn a language, but instead you learned 50 new ways to get flamed by teenagers in lobby chat.`);
    roastsPool.push(`Imagine grinding ${topGameName} for ${topHours} hours just to stay hardstuck in Gold rank. The definition of gaming insanity.`);
  }
  
  if (isSouls && topHours > 30) {
    roastsPool.push(`You have ${topHours} hours in ${topGameName}. We get it, you like pain and your favorite hobby is rolling off virtual cliffs. Seek therapy.`);
    roastsPool.push(`Imagine spending ${topHours} hours getting crushed by bosses in ${topGameName} just to feel a spark of achievement. High-level masochism.`);
  }

  if (isCozy && topHours > 30) {
    roastsPool.push(`Farming crops in ${topGameName} for ${topHours} hours while your real-life room is a disaster area is a level of deflection that deserves a trophy.`);
    roastsPool.push(`You have ${topHours} hours in ${topGameName}. You are running away from adult responsibilities into a digital village where plants actually grow.`);
  }

  if (isRpg && topHours > 50) {
    roastsPool.push(`You spent ${topHours} hours in ${topGameName}. You know more about virtual map lore and questlines than your own family history. Go touch some real leaves.`);
    roastsPool.push(`With ${topHours} hours in ${topGameName}, talking to NPCs has officially become easier for you than making eye contact with real people.`);
  }

  if (backlog > 70) {
    roastsPool.push(`Your backlog of ${backlogGamesCount} unplayed games is so huge, your library is officially a digital museum. Steam sales aren't a deal for you, they are a donation.`);
    roastsPool.push(`You own ${totalGamesCount} games but only have real hours in a handful. You don't play games, you collect digital license agreements.`);
  }

  if (touchGrass < 20) {
    roastsPool.push(`Your Touch Grass score is ${touchGrass}%. The last time you saw sunlight, it was a high-resolution lens flare in an RPG.`);
    roastsPool.push(`With ${totalPlaytimeHours} hours total, your keyboard has more food crumbs than a toaster. Go take a walk outside.`);
  }

  if (completionist > 75) {
    roastsPool.push(`You have a ${completionPercentage}% achievement completion rate. We get it, you have control issues and need validation from little golden popup boxes.`);
  }

  if (totalGamesCount < 8 && totalPlaytimeHours < 30) {
    roastsPool.push(`You own ${totalGamesCount} games and have played for ${totalPlaytimeHours} hours. Your Steam profile has the energy of a default browser homepage. Are you sure you are a gamer?`);
  }

  // General fallbacks to add variety
  roastsPool.push(`Your library has officially become a retirement plan. With ${totalGamesCount} games and ${totalPlaytimeHours} hours of playtime, at least you'll have something to do in the nursing home.`);
  roastsPool.push(`With ${totalPlaytimeHours} total hours logged, Valve should send you a Christmas card. At this point, Gabe Newell owns your soul.`);
  roastsPool.push(`With ${totalGamesCount} games in your library and ${totalPlaytimeHours} hours played, your backlog is screaming for help. Stop browsing sales and play a game.`);

  // Pick deterministic roast index based on last 4 digits of steamId to keep it unique per user but stable
  const steamIdNumLast = parseInt(profile.steamId.slice(-4)) || 0;
  const roastIndex = steamIdNumLast % roastsPool.length;
  const roast = roastsPool[roastIndex];

  return {
    title,
    archetype,
    aura,
    motto,
    roast,
    scores: {
      iq,
      collector,
      completionist,
      competitive,
      explorer,
      social,
      backlog,
      touchGrass,
      rage,
      luck,
      saleAddiction
    },
    genreBreakdown,
    rareAchievementsCount,
    totalPlaytimeHours,
    totalGamesCount,
    completionPercentage,
    favoriteGenre,
    longestPlayedGame,
    newestGame,
    oldestGame
  };
}
