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

  // Let's calculate the personality scores out of 100:
  
  // 1. Collector Score: based on total games count and level
  const collector = Math.min(100, Math.max(10, Math.floor((totalGamesCount / 200) * 80 + (profile.steamLevel / 100) * 20)));

  // 2. Completionist Score: based on steam achievements progress
  const completionist = completionPercentage;

  // 3. Competitive Score: based on FPS/MOBA playtime ratio
  const competitive = Math.min(100, Math.max(5, Math.floor(competitiveRatio * 100)));

  // 4. Explorer Score: based on RPG/Adventure ratio
  const explorer = Math.min(100, Math.max(5, Math.floor(explorerRatio * 100)));

  // 5. Social Score: based on multiplayer popularity
  const multiplayerHours = games
    .filter(g => {
      const genres = getGenresForGame(g.appid, g.name);
      return genres.includes('Multiplayer') || genres.includes('Competitive') || genres.includes('Co-op');
    })
    .reduce((sum, g) => sum + g.playtime_forever / 60, 0);
  const social = Math.min(100, Math.max(5, Math.floor(totalPlaytimeHours > 0 ? (multiplayerHours / totalPlaytimeHours) * 100 : 0)));

  // 6. Backlog Score: based on backlog ratio
  const backlog = Math.min(100, Math.max(5, Math.floor(backlogRatio * 100)));

  // 7. Touch Grass Score: inversely proportional to total & recent playtimes
  // e.g. 100 hours in 2 weeks = 0 touch grass score
  const touchGrass = Math.max(1, Math.min(100, Math.floor(100 - (recentPlaytimeHours * 1.5 + (totalPlaytimeHours / 100)))));

  // 8. Rage Score: higher for competitive, difficult, or soulslike games
  const soulslikeHours = games
    .filter(g => getGenresForGame(g.appid, g.name).includes('Soulslike') || getGenresForGame(g.appid, g.name).includes('Difficult'))
    .reduce((sum, g) => sum + g.playtime_forever / 60, 0);
  const difficultRatio = totalPlaytimeHours > 0 ? (soulslikeHours + competitiveHours) / totalPlaytimeHours : 0;
  const rage = Math.min(100, Math.max(5, Math.floor(difficultRatio * 85 + (recentPlaytimeHours > 10 ? 15 : 0))));

  // 9. Luck Score: semi-deterministic based on steamId hash
  const steamIdNum = parseInt(profile.steamId.slice(-4)) || 50;
  const luck = Math.min(100, Math.max(10, (steamIdNum % 90) + 10));

  // 10. Steam Sale Addiction Score: based on high games count and high backlog
  const saleAddiction = Math.min(100, Math.max(5, Math.floor(backlog * 0.7 + (totalGamesCount > 100 ? 30 : totalGamesCount * 0.3))));

  // 11. Gaming IQ Score: funny computation
  const baseIq = 90;
  const iqBonus = Math.floor(
    (explorer * 0.2) + 
    (completionist * 0.15) - 
    (competitive * 0.05) + 
    (games.some(g => g.name.includes('Portal')) ? 15 : 0)
  );
  const iq = Math.max(65, Math.min(150, baseIq + iqBonus));

  // Determine Gen Z Title
  let title = 'Casual Grinder';
  let archetype = 'All-Rounder';
  let aura = 'Balanced Cyan Aura';
  let motto = 'GG WP, let\'s queue again.';

  if (backlog > 75 && totalGamesCount > 80) {
    title = 'Steam Sale Victim';
    archetype = 'The Digital Curator';
    aura = 'Infinite Grey Backlog Aura';
    motto = 'I don\'t play games, I collect licenses.';
  } else if (completionist > 80) {
    title = 'Achievement Goblin';
    archetype = 'The 100% Completionist';
    aura = 'Golden Glow Completionist Aura';
    motto = 'Every achievement is a checkmark in my soul.';
  } else if (competitive > 70 && totalPlaytimeHours > 800) {
    title = 'Ranked Demon';
    archetype = 'The Hardcore Competitor';
    aura = 'Toxic Lime Tryhard Aura';
    motto = 'Losing is not an option, rage-quitting is.';
  } else if (cozyRatio > 0.6) {
    title = 'Side Quest Addict';
    archetype = 'The Cozy Farmer';
    aura = 'Cozy Pastel Lavender Aura';
    motto = 'Farming virtual parsnips cures the existential dread.';
  } else if (totalPlaytimeHours > 3000) {
    title = 'Patch Notes Survivor';
    archetype = 'The Ancient Gamer';
    aura = 'Deep Crimson Veteran Aura';
    motto = 'I was there when the lobbies were silent.';
  } else if (touchGrass < 15) {
    title = 'Touch Grass Challenger';
    archetype = 'No-Lifer';
    aura = 'Dark Void Neon Aura';
    motto = 'What is this "outside" DLC everyone talks about?';
  } else if (explorerRatio > 0.6) {
    title = 'Lore Goblin';
    archetype = 'The Adventurous Explorer';
    aura = 'Mystic Turquoise Explorer Aura';
    motto = 'If there is a wall, I will try to jump over it.';
  } else if (totalGamesCount < 10 && totalPlaytimeHours < 50) {
    title = 'NPC Energy';
    archetype = 'The Tourist';
    aura = 'Faint Green Starter Aura';
    motto = 'I just play what my friends tell me to.';
  } else if (games.some(g => getGenresForGame(g.appid, g.name).includes('FPS')) && competitive > 50) {
    title = 'Keyboard Warrior';
    archetype = 'The FPS Addict';
    aura = 'Adrenaline Rush Red Aura';
    motto = 'A click of the mouse, another headshot down.';
  } else if (games.some(g => g.playtime_forever > 120000)) { // 2000+ hours in single game
    title = 'Main Character';
    archetype = 'The One-Trick Pony';
    aura = 'Focused Indigo Hyper-Focus Aura';
    motto = 'Why play many games when one game does the trick?';
  } else if (genreHoursMap['Indie'] && (genreHoursMap['Indie'] / totalPlaytimeMins * 60) > 0.6) {
    title = 'Indie Enjoyer';
    archetype = 'The Connoisseur';
    aura = 'Retro Pixel Orange Aura';
    motto = 'You\'ve probably never heard of my favorite game.';
  }

  // Generate customized Roast
  let roast = '';
  if (longestPlayedGame.hours > 2000 && (longestPlayedGame.name.includes('Counter-Strike') || longestPlayedGame.name.includes('Dota') || longestPlayedGame.name.includes('League') || longestPlayedGame.name.includes('Apex'))) {
    roast = `You have spent ${longestPlayedGame.hours} hours in ${longestPlayedGame.name}. That's enough time to earn a college degree, but instead you learned 50 new ways to get flamed by teenagers in online lobbies.`;
  } else if (backlog > 75 && totalGamesCount > 100) {
    roast = `Your backlog is so huge (${backlogGamesCount} unplayed games) it has officially transitioned from a gaming library to a digital museum. Steam sales aren't a deal for you, they are a donation.`;
  } else if (touchGrass < 15) {
    roast = `Your Touch Grass score is ${touchGrass}%. The last time you saw sunlight, it was a high-resolution lens flare in an RPG. Your keyboard has more food crumbs than a toaster.`;
  } else if (cozyRatio > 0.6 && longestPlayedGame.name.includes('Stardew')) {
    roast = `Farming parsnips and talking to virtual villagers for ${longestPlayedGame.hours} hours while your real-life houseplants wither away is a level of irony that is hard to ignore.`;
  } else if (completionist > 85) {
    roast = `You have a ${completionPercentage}% completion rate. You refuse to leave a game unfinished. We get it, you have trust issues and need external validation from achievement popups.`;
  } else if (totalGamesCount < 8 && totalPlaytimeHours < 30) {
    roast = `You own ${totalGamesCount} games and have played for ${totalPlaytimeHours} hours. Your Steam profile has the energy of a default browser homepage. Are you sure you're a gamer?`;
  } else {
    roast = `Your library has officially become a retirement plan. With ${totalGamesCount} games and ${totalPlaytimeHours} hours of playtime, at least you'll have something to do in the nursing home.`;
  }

  // Add the newest active game info
  const newestGame = games.length > 1 ? { name: games[games.length - 2].name, hours: Math.round(games[games.length - 2].playtime_forever / 6) / 10 } : undefined;
  const oldestGame = games.length > 0 ? { name: games[games.length - 1].name, hours: Math.round(games[games.length - 1].playtime_forever / 6) / 10 } : undefined;

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
