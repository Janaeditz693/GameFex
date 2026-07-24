import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, Search, ArrowRight, Flame, ArrowLeft, RefreshCw, 
  ShieldAlert, Receipt, LayoutGrid, Sun, Moon, HelpCircle
} from 'lucide-react';
import { fetchProfileAnalysis } from './services/api';
import { ProfileAnalysis } from '@shared/types';
import ShareCard from './components/ShareCard';

export default function App() {
  // Application State
  const [activeProfile, setActiveProfile] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Settings & Toggles
  const [topGamesCount, setTopGamesCount] = useState<number>(5); // Default top 5 games
  const [vibeTheme, setVibeTheme] = useState<'dark' | 'light'>('dark');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Main scan action
  const handleProfileScan = async (identifier: string) => {
    if (!identifier.trim()) {
      showToast('Enter a SteamID or Profile URL!', 'warning');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      
      const analysis = await fetchProfileAnalysis(identifier.trim());
      setActiveProfile(analysis);
      setSearchVal(identifier.trim());
      showToast(`Generated receipt for ${analysis.profile.personaname}!`, 'success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not fetch profile statistics.');
      showToast(err.message || 'Scan failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reset page state
  const handleClear = () => {
    setActiveProfile(null);
    setError(null);
  };

  return (
    <div className={`relative flex min-h-screen flex-col font-sans transition-colors duration-300 ${
      vibeTheme === 'light' ? 'bg-[#F4F6FA] text-slate-900' : 'bg-background text-white'
    }`}>
      
      {/* Decorative Blur Glows (Only render soft colors matching mode) */}
      <div className={`absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full blur-[100px] pointer-events-none transition-all duration-300 ${
        vibeTheme === 'light' ? 'bg-primary/10' : 'bg-primary/5'
      }`} />
      <div className={`absolute top-1/2 right-1/4 h-[400px] w-[400px] rounded-full blur-[120px] pointer-events-none transition-all duration-300 ${
        vibeTheme === 'light' ? 'bg-indigo-600/10' : 'bg-indigo-600/5'
      }`} />

      {/* Header bar */}
      <header className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${
        vibeTheme === 'light' ? 'border-slate-200 bg-white/80' : 'border-white/5 bg-background/80'
      }`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div onClick={handleClear} className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-600 shadow-glow-primary transition-transform group-hover:scale-105">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <span className={`font-outfit text-xl font-bold tracking-tight transition-colors ${
              vibeTheme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              Game<span className="text-primary">Flex</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const newT = vibeTheme === 'dark' ? 'light' : 'dark';
                setVibeTheme(newT);
                showToast(`Theme locked to ${newT.toUpperCase()}`, 'warning');
              }}
              className={`p-2 rounded-lg border transition-colors ${
                vibeTheme === 'light' 
                  ? 'bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {vibeTheme === 'dark' ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-warning" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center">

        {/* LOADING ANIMATION */}
        {loading && (
          <div className="text-center font-outfit animate-pulse py-20">
            <div className="flex justify-center mb-4">
              <Gamepad2 className="h-14 w-14 text-primary animate-spin" />
            </div>
            <h3 className={`text-lg font-bold uppercase tracking-widest mb-1 text-glow ${vibeTheme === 'light' ? 'text-slate-800' : 'text-white'}`}>Printing Steam Receipt...</h3>
            <p className="text-xs text-slate-400">Fetching game library, summing hours, and compiling roasts.</p>
          </div>
        )}

        {/* ERROR SCREEN */}
        {error && !loading && (
          <div className="max-w-lg px-4 py-16 text-center font-outfit">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 border border-danger/20 text-danger mb-4">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className={`text-xl font-extrabold uppercase mb-2 ${vibeTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Scan Failed</h2>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">{error}</p>
            <button
              onClick={handleClear}
              className={`px-5 py-3 rounded-xl border font-bold text-xs transition-all animate-bounce-short ${
                vibeTheme === 'light' 
                  ? 'bg-slate-800 text-white hover:bg-slate-950 border-transparent' 
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
              }`}
            >
              Try again
            </button>
          </div>
        )}

        {/* 1. MINIMALIST LANDING SEARCH VIEW */}
        {!activeProfile && !loading && !error && (
          <div className="w-full flex flex-col items-center justify-center py-6">
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
              
              {/* Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors mb-6 ${
                vibeTheme === 'light' 
                  ? 'border-slate-300 bg-slate-200/50 text-slate-700' 
                  : 'border-white/10 bg-white/5 text-slate-300'
              }`}>
                <Flame className="h-4 w-4 text-primary" />
                <span className="font-outfit text-xs font-semibold">Your Steam library printed as a receipt</span>
              </div>

              {/* Logo Title */}
              <h1 className={`font-outfit text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 uppercase transition-colors ${
                vibeTheme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                Game<span className="text-primary text-glow">Flex</span>
              </h1>

              {/* Subtitle */}
              <p className={`font-outfit text-base max-w-md mb-10 leading-relaxed transition-colors ${
                vibeTheme === 'light' ? 'text-slate-600' : 'text-slate-400'
              }`}>
                Analyze your Steam library and generate a beautiful, shareable Receiptify gaming slip.
              </p>

              {/* Paste Search bar */}
              <div className={`w-full max-w-md rounded-card p-5 border transition-all duration-300 mb-12 ${
                vibeTheme === 'light' 
                  ? 'bg-white border-slate-200 shadow-lg' 
                  : 'glass-card border-white/10 shadow-glow-primary'
              }`}>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => setSearchVal(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleProfileScan(searchVal)}
                      placeholder="Paste Steam profile URL or SteamID64"
                      className={`w-full rounded-xl border pl-12 pr-4 py-3.5 font-outfit text-sm focus:outline-none focus:border-primary transition-all ${
                        vibeTheme === 'light' 
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white' 
                          : 'bg-background border-white/10 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => handleProfileScan(searchVal)}
                    className="w-full rounded-xl bg-primary py-3.5 font-outfit text-sm font-bold text-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-glow-primary"
                  >
                    Generate Receipt
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Quick links to demo profiles */}
                <div className={`mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] font-outfit border-t pt-3 transition-colors ${
                  vibeTheme === 'light' ? 'text-slate-500 border-slate-200' : 'text-slate-500 border-white/5'
                }`}>
                  <span>Try demo:</span>
                  <button 
                    onClick={() => handleProfileScan('gamergod99')} 
                    className={`hover:underline font-semibold px-2 py-0.5 rounded transition-all ${
                      vibeTheme === 'light' ? 'text-indigo-600 bg-slate-100 hover:bg-slate-200' : 'text-primary bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    GamerGod99
                  </button>
                  <button 
                    onClick={() => handleProfileScan('cozycat')} 
                    className={`hover:underline font-semibold px-2 py-0.5 rounded transition-all ${
                      vibeTheme === 'light' ? 'text-indigo-600 bg-slate-100 hover:bg-slate-200' : 'text-primary bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    CozyCat
                  </button>
                  <button 
                    onClick={() => handleProfileScan('goblinking')} 
                    className={`hover:underline font-semibold px-2 py-0.5 rounded transition-all ${
                      vibeTheme === 'light' ? 'text-indigo-600 bg-slate-100 hover:bg-slate-200' : 'text-primary bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    GoblinKing
                  </button>
                </div>
              </div>
            </div>

            {/* How it Works cards */}
            <div className={`grid gap-6 sm:grid-cols-3 border-t pt-12 w-full transition-colors ${
              vibeTheme === 'light' ? 'border-slate-200' : 'border-white/5'
            }`}>
              {[
                { step: '1', title: 'Paste URL or ID', desc: 'Enter your Steam custom vanity username, complete URL, or SteamID64.' },
                { step: '2', title: 'Analyze Profile', desc: 'The AI statistics engine processes play patterns, libraries, and levels.' },
                { step: '3', title: 'Download Slip', desc: 'Choose Top 5 or Top 10 layouts and download your receipt card as a PNG.' }
              ].map((s) => (
                <div 
                  key={s.step} 
                  className={`rounded-card p-6 flex flex-col items-center text-center transition-all ${
                    vibeTheme === 'light' 
                      ? 'bg-white border border-slate-200 text-slate-900 shadow-sm' 
                      : 'glass-card border-white/10 text-white'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 mb-4 font-outfit text-lg font-bold">{s.step}</div>
                  <h4 className="font-outfit font-bold text-sm mb-2 uppercase">{s.title}</h4>
                  <p className={`font-outfit text-xs leading-relaxed ${vibeTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* FAQs */}
            <div className={`border-t pt-12 max-w-3xl w-full transition-colors ${
              vibeTheme === 'light' ? 'border-slate-200' : 'border-white/5'
            }`}>
              <div className="text-center mb-8 flex flex-col items-center">
                <HelpCircle className="h-8 w-8 text-primary mb-2 animate-bounce-short" />
                <h2 className={`font-outfit text-2xl font-bold uppercase text-glow ${vibeTheme === 'light' ? 'text-slate-900' : 'text-white'}`}>Frequently Asked Questions</h2>
              </div>
              <div className="flex flex-col gap-4">
                <div className={`rounded-card p-5 border transition-all ${
                  vibeTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'glass-card border-white/5'
                }`}>
                  <h4 className="font-bold text-sm mb-2">How do I verify if my Steam settings are visible?</h4>
                  <p className={`text-xs leading-relaxed ${vibeTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>By default, Steam profile URLs must be set to public. If private details are restricted, our engine automatically maps high-fidelity simulated accounts so you can preview custom designs instantly!</p>
                </div>
                <div className={`rounded-card p-5 border transition-all ${
                  vibeTheme === 'light' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'glass-card border-white/5'
                }`}>
                  <h4 className="font-bold text-sm mb-2">Is my login credential requested?</h4>
                  <p className={`text-xs leading-relaxed ${vibeTheme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>No, we never request your passwords. The application reads public metadata statistics only via Steam Web APIs, ensuring 100% security.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. DYNAMIC RECEIPT ONLY RESULT VIEW */}
        {activeProfile && !loading && !error && (
          <div className="w-full max-w-md flex flex-col items-center gap-6">
            
            {/* Top scanning / re-running actions */}
            <div className={`w-full flex items-center justify-between gap-4 border-b pb-4 transition-colors ${
              vibeTheme === 'light' ? 'border-slate-200' : 'border-white/5'
            }`}>
              <button 
                onClick={handleClear}
                className={`inline-flex items-center gap-1 text-xs font-bold transition-colors uppercase tracking-wider font-outfit ${
                  vibeTheme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                ← Back
              </button>

              {/* Game count selectors (Top 5 / Top 10 Toggle) */}
              <div className={`flex items-center gap-1 p-1 rounded-xl border transition-colors ${
                vibeTheme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-white/5 border-white/5'
              }`}>
                <button
                  onClick={() => {
                    setTopGamesCount(5);
                    showToast('Showing Top 5 Games', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    topGamesCount === 5 
                      ? 'bg-primary text-black' 
                      : (vibeTheme === 'light' ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  Top 5
                </button>
                <button
                  onClick={() => {
                    setTopGamesCount(10);
                    showToast('Showing Top 10 Games', 'success');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    topGamesCount === 10 
                      ? 'bg-primary text-black' 
                      : (vibeTheme === 'light' ? 'text-slate-600 hover:text-slate-950' : 'text-slate-400 hover:text-white')
                  }`}
                >
                  Top 10
                </button>
              </div>
            </div>

            {/* Simulated Data Warning Banner */}
            {activeProfile.profile.isSimulated && (
              <div className={`w-full p-4 rounded-xl border leading-relaxed flex flex-col gap-1.5 transition-all duration-300 ${
                vibeTheme === 'light' 
                  ? 'border-amber-300 bg-amber-50 text-slate-800 shadow-sm' 
                  : 'border-warning/20 bg-warning/5 text-slate-300 shadow-glow-warning'
              }`}>
                <span className={`font-bold flex items-center gap-1 ${vibeTheme === 'light' ? 'text-amber-700' : 'text-warning'}`}>
                  ⚠️ Showing Simulated Profile
                </span>
                <p className="text-xs">
                  Steam profile <strong>"{activeProfile.profile.personaname}"</strong> was not found or is set to private. Make sure you paste your correct Custom URL name or 17-digit SteamID64, and verify your <strong>"Game details"</strong> are set to <strong>Public</strong> in your Steam privacy settings.
                </p>
              </div>
            )}

            {/* The centered Receipt slip container */}
            <div className={`rounded-card border p-5 w-full flex flex-col items-center justify-center transition-all duration-300 ${
              vibeTheme === 'light' 
                ? 'bg-white border-slate-200 shadow-sm' 
                : 'glass-card border-white/5 shadow-2xl'
            }`}>
              <ShareCard data={activeProfile} topGamesCount={topGamesCount} theme={vibeTheme} />
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className={`w-full border-t py-4 text-center text-[10px] font-outfit transition-all duration-300 ${
        vibeTheme === 'light' ? 'border-slate-200 bg-slate-200/30 text-slate-500' : 'border-white/5 bg-[#080B12] text-slate-600'
      }`}>
        <p>&copy; {new Date().getFullYear()} GameFlex. Built for gamers. Not associated with Valve.</p>
      </footer>

      {/* Toast Alert overlay */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[999] flex items-center gap-2 rounded-xl border px-4 py-3 shadow-2xl transition-all duration-300 ${
          vibeTheme === 'light' 
            ? 'border-slate-300 bg-white/95 text-slate-800' 
            : 'border-white/10 bg-[#161B22]/90 text-white backdrop-blur-md'
        }`}>
          <span className={`h-2.5 w-2.5 rounded-full ${
            toast.type === 'success' ? 'bg-success shadow-glow-success' :
            toast.type === 'error' ? 'bg-danger shadow-glow-danger' :
            'bg-warning shadow-glow-warning'
          }`} />
          <span className="font-outfit text-xs font-medium">{toast.message}</span>
        </div>
      )}

    </div>
  );
}
