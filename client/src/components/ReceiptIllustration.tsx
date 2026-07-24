import React from 'react';

interface IllustrationProps {
  title: string;
  theme: 'dark' | 'light';
}

export default function ReceiptIllustration({ title, theme }: IllustrationProps) {
  const isLight = theme === 'light';
  const colorClass = isLight ? 'text-slate-800' : 'text-primary';
  const strokeColor = isLight ? '#1E293B' : '#00E5FF';

  const normalizedTitle = title.toLowerCase();

  // 1. STEAM SALE VICTIM (Shopping cart + %)
  if (normalizedTitle.includes('sale victim') || normalizedTitle.includes('curator')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        <path d="M12 9h.01M15 10h.01M13 11h3" strokeWidth="2" />
        <line x1="16" y1="8" x2="11" y2="13" />
      </svg>
    );
  }

  // 2. ACHIEVEMENT GOBLIN (Shining Trophy)
  if (normalizedTitle.includes('achievement') || normalizedTitle.includes('completionist')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
        <path d="M12 2a6 6 0 0 1 6 6v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6Z" />
        <polygon points="12 6 13.5 9 16.5 9.5 14.25 11.75 14.75 14.75 12 13.25 9.25 14.75 9.75 11.75 7.5 9.5 10.5 9" fill={isLight ? '#1E293B' : 'rgba(0,229,255,0.2)'} />
      </svg>
    );
  }

  // 3. RANKED DEMON (Devil Horns + Flame Controller)
  if (normalizedTitle.includes('ranked') || normalizedTitle.includes('demon') || normalizedTitle.includes('tryhard')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3c0 2-1 4-3 5 2 .5 3 2.5 3 4M18 3c0 2 1 4 3 5-2 .5-3 2.5-3 4" /> {/* Horns */}
        <rect x="2" y="10" width="20" height="11" rx="4" />
        <circle cx="7" cy="15" r="1.5" />
        <circle cx="17" cy="14" r="1" />
        <circle cx="18.5" cy="16" r="1" />
        <path d="M10 13v4M8 15h4" />
      </svg>
    );
  }

  // 4. SIDE QUEST ADDICT / COZY FARMER (Sprout leaf + Mug)
  if (normalizedTitle.includes('cozy') || normalizedTitle.includes('farmer') || normalizedTitle.includes('side quest') || normalizedTitle.includes('grind')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z" />
        <path d="M6 2v2M10 2v2M14 2v2" /> {/* Coffee steam */}
        <path d="M12 11c0 0 2-2 4-2s2 2 2 2-2 2-4 2-2-2-2-2Z" fill={isLight ? '#1E293B' : 'rgba(0,229,255,0.2)'} /> {/* Cute leaf */}
      </svg>
    );
  }

  // 5. INDIE ENJOYER (Retro Cassette Tape)
  if (normalizedTitle.includes('indie') || normalizedTitle.includes('connoisseur')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <rect x="6" y="8" width="12" height="8" rx="1" />
        <circle cx="9" cy="12" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <path d="M9 12h6" />
      </svg>
    );
  }

  // 6. TOUCH GRASS CHALLENGER (Sun + Grass)
  if (normalizedTitle.includes('grass') || normalizedTitle.includes('no-lifer')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M12 2v2M12 12v2M5.64 5.64l1.42 1.42M16.94 16.94l1.42 1.42M2 12h2M20 12h2M5.64 18.36l1.42-1.42M16.94 7.06l1.42-1.42" />
        <path d="M4 22c0-3 2-5 4-5s4 2 4 5M12 22c0-3 2-5 4-5s4 2 4 5" /> {/* Grass blades */}
      </svg>
    );
  }

  // 7. MAIN CHARACTER (Crown)
  if (normalizedTitle.includes('main character') || normalizedTitle.includes('pony')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7Z" />
        <rect x="5" y="18" width="14" height="2" rx="1" />
      </svg>
    );
  }

  // 8. LORE GOBLIN (Scroll / Open Book)
  if (normalizedTitle.includes('lore') || normalizedTitle.includes('explorer')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M12 6v6M9 9h6" />
      </svg>
    );
  }

  // 9. KEYBOARD WARRIOR (Target / Crosshair)
  if (normalizedTitle.includes('keyboard') || normalizedTitle.includes('warrior') || normalizedTitle.includes('fps')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill={strokeColor} />
        <line x1="12" y1="1" x2="12" y2="23" />
        <line x1="1" y1="12" x2="23" y2="12" />
      </svg>
    );
  }

  // 10. PATCH NOTES SURVIVOR (Hourglass)
  if (normalizedTitle.includes('survivor') || normalizedTitle.includes('ancient') || normalizedTitle.includes('veteran')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 2h14M5 22h14" />
        <path d="M19 2v4c0 3.31-2.69 6-6 6a6 6 0 0 1 6 6v4" />
        <path d="M5 2v4c0 3.31 2.69 6 6 6a6 6 0 0 0-6 6v4" />
        <path d="M12 12v4M10 16h4M11 18h2" />
      </svg>
    );
  }

  // 11. NPC ENERGY (Key)
  if (normalizedTitle.includes('npc') || normalizedTitle.includes('tourist')) {
    return (
      <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.778-7.778z" />
        <path d="M12.5 11.5l6-6M15.5 5.5l2 2M18.5 2.5l2 2" />
      </svg>
    );
  }

  // 12. CASUAL GRINDER / DEFAULT (Modern Gamepad)
  return (
    <svg className={`h-16 w-16 ${colorClass}`} viewBox="0 0 24 24" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <circle cx="16.5" cy="12" r="1.5" fill={strokeColor} />
      <circle cx="18.5" cy="10.5" r="1" fill={strokeColor} />
      <circle cx="18.5" cy="13.5" r="1" fill={strokeColor} />
      <path d="M6 12h4M8 10v4" />
    </svg>
  );
}
