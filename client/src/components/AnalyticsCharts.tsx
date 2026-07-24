import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { GameData, AIStats } from '@shared/types';

interface ChartsProps {
  games: GameData[];
  aiStats: AIStats;
}

const COLORS = ['#00E5FF', '#8B5CF6', '#6CFF6C', '#FFB000', '#FF5C5C', '#3B82F6', '#EC4899', '#10B981'];

export default function AnalyticsCharts({ games, aiStats }: ChartsProps) {
  // 1. Get top 10 games by playtime
  const top10Games = games
    .slice(0, 10)
    .map(g => ({
      name: g.name.length > 18 ? g.name.slice(0, 15) + '...' : g.name,
      hours: Math.round((g.playtime_forever / 60) * 10) / 10
    }));

  // 2. Genre Breakdown data
  const genreData = aiStats.genreBreakdown.slice(0, 8);

  // 3. Recently played timeline (simulated or real history if available)
  // We can plot hours in active games to draw a gorgeous area chart
  const activeGames = games
    .filter(g => g.playtime_forever > 120) // at least 2 hours
    .slice(0, 6)
    .map(g => ({
      name: g.name.length > 15 ? g.name.slice(0, 12) + '...' : g.name,
      hours: Math.round((g.playtime_forever / 60) * 10) / 10,
      recent: Math.round(((g.playtime_2weeks || 0) / 60) * 10) / 10
    }));

  // Tooltip custom style
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-[#161B22]/90 p-3 shadow-2xl backdrop-blur-md font-outfit text-xs">
          <p className="font-semibold text-white mb-1">{label || payload[0].name}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color || item.fill }} className="font-medium">
              {item.name}: {item.value} {item.name.toLowerCase().includes('percentage') ? '%' : 'hrs'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Chart 1: Top 10 Games */}
      <div className="rounded-card glass-card p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-outfit font-bold text-lg text-white mb-1">Top 10 Games By Playtime</h3>
          <p className="font-outfit text-xs text-slate-400 mb-6">Aggregate hours in your most played Steam games.</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top10Games} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" stroke="#475569" fontSize={11} tickFormatter={(v) => `${v}h`} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="hours" 
                fill="#00E5FF" 
                name="Total Playtime"
                radius={[0, 4, 4, 0]}
                className="drop-shadow-[0_0_10px_rgba(0,229,255,0.4)]"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Genre Breakdown */}
      <div className="rounded-card glass-card p-6 flex flex-col justify-between">
        <div>
          <h3 className="font-outfit font-bold text-lg text-white mb-1">Hours by Genre Breakdown</h3>
          <p className="font-outfit text-xs text-slate-400 mb-6">Percentage breakdown of hours spent across game genres.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 h-72">
          <div className="h-full w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="hours"
                  nameKey="genre"
                >
                  {genreData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="rgba(11,15,25,0.8)" 
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 w-full sm:w-1/2 text-xs font-outfit">
            {genreData.map((item, index) => (
              <div key={item.genre} className="flex items-center gap-2">
                <span 
                  className="h-3 w-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}55` }}
                />
                <span className="text-slate-300 truncate max-w-[85px] sm:max-w-none">{item.genre}</span>
                <span className="text-slate-500 ml-auto font-medium">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 3: Active Games Vs Recent Play */}
      <div className="rounded-card glass-card p-6 md:col-span-2 flex flex-col justify-between">
        <div>
          <h3 className="font-outfit font-bold text-lg text-white mb-1">Recent Activity VS Total Investment</h3>
          <p className="font-outfit text-xs text-slate-400 mb-6">Playtime in the last 2 weeks compared to your lifetime gaming footprint.</p>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeGames} margin={{ left: 0, right: 10, top: 10, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#475569" fontSize={11} />
              <YAxis stroke="#475569" fontSize={11} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="totalGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="recentGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="#8B5CF6" 
                fillOpacity={1} 
                fill="url(#totalGlow)" 
                name="Lifetime Hours"
              />
              <Area 
                type="monotone" 
                dataKey="recent" 
                stroke="#00E5FF" 
                fillOpacity={1} 
                fill="url(#recentGlow)" 
                name="Recent (2 Weeks) Hours"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
