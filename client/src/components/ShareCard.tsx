import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Download, Share2, Smartphone, Square as SquareIcon } from 'lucide-react';
import { ProfileAnalysis } from '@shared/types';
import ReceiptIllustration from './ReceiptIllustration';

interface ShareCardProps {
  data: ProfileAnalysis;
  topGamesCount: number;
  theme: 'dark' | 'light';
}

export default function ShareCard({ data, topGamesCount, theme }: ShareCardProps) {
  const [format, setFormat] = useState<'square' | 'story'>('square');
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  const glareRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !glareRef.current || downloading || sharing) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    glareRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, ${isLight ? 0.08 : 0.15}) 0%, transparent 65%)`;
    glareRef.current.style.opacity = '1';
  };

  const handleMouseLeave = () => {
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  const { profile, aiStats, games } = data;

  // Standard File Download handler
  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2.5, // High resolution export
        backgroundColor: isLight ? '#FAF9F6' : '#0F131C',
      });
      
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `GameFlexReceipt_${profile.personaname}.png`;
      link.href = imgData;
      link.click();
    } catch (err) {
      console.error('Error generating receipt image:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Social sharing handler with Native share sheets & Clipboard integration
  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      setSharing(true);
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2.5,
        backgroundColor: isLight ? '#FAF9F6' : '#0F131C',
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          throw new Error('Failed to generate image file');
        }

        const file = new File([blob], `GameFlex_${profile.personaname}.png`, { type: 'image/png' });

        // 1. Mobile & Web Share API support (Safari, Chrome on iOS/Android)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'GameFlex Gaming Receipt',
              text: `Check out my gaming receipt generated on GameFlex!`,
            });
            return;
          } catch (shareErr: any) {
            // Ignore abort error (user dismissed the sheet)
            if (shareErr.name !== 'AbortError') {
              console.error('Share aborted or failed:', shareErr);
            } else {
              return;
            }
          }
        }

        // 2. Clipboard & Download Fallback (Desktop / browsers without share sheet)
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob
            })
          ]);
          alert('📥 Receipt copied to clipboard and downloaded! Paste (Ctrl+V) it to share instantly, or upload the PNG to your Instagram Story or post.');
        } catch (clipErr) {
          alert('📥 Receipt image downloaded! Upload the PNG directly to your Instagram Story or post.');
        }

        // Trigger file download backup
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `GameFlexReceipt_${profile.personaname}.png`;
        link.href = imgData;
        link.click();

      }, 'image/png');

    } catch (err) {
      console.error('Error in sharing flow:', err);
      alert('Failed to generate sharing card.');
    } finally {
      setSharing(false);
    }
  };

  // Select top games based on count
  const topGames = games.slice(0, topGamesCount);

  // Generate random barcode lines
  const barcodeLines = [1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 4, 1, 1, 3, 2, 1, 3, 1, 4, 2, 1];

  return (
    <div className="flex flex-col items-center gap-6 w-full animate-fade-in">
      {/* Format layout switchers */}
      <div className={`flex items-center gap-3 rounded-xl p-1 border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-white/5 border-white/5'}`}>
        <button
          onClick={() => setFormat('square')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-outfit font-medium transition-all ${
            format === 'square' 
              ? 'bg-primary text-black shadow-glow-primary' 
              : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
          }`}
        >
          <SquareIcon className="h-3.5 w-3.5" />
          Square Layout
        </button>
        <button
          onClick={() => setFormat('story')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-outfit font-medium transition-all ${
            format === 'story' 
              ? 'bg-primary text-black shadow-glow-primary' 
              : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          Story Layout
        </button>
      </div>

      {/* Dynamic Receipt Canvas */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative flex flex-col justify-start overflow-hidden border p-6 shadow-2xl transition-all duration-300 font-mono text-xs cursor-pointer ${
          isLight 
            ? 'border-slate-300 bg-[#FAF9F6] text-slate-800 shadow-md hover:shadow-xl' 
            : 'border-white/10 bg-[#0F131C] text-white shadow-2xl hover:border-white/20'
        }`}
        style={{
          width: format === 'square' ? '360px' : '320px',
          height: 'auto',
        }}
      >
        {/* Interactive Glare overlay (ref-based for zero re-render lag during scrolling) */}
        {!(downloading || sharing) && (
          <div 
            ref={glareRef}
            className="absolute inset-0 pointer-events-none z-50 transition-opacity duration-300 opacity-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0) 0%, transparent 65%)`,
            }}
          />
        )}

        {/* Subtle auric glow matching theme */}
        <div className={`absolute inset-x-0 top-0 h-40 pointer-events-none ${
          isLight ? 'bg-gradient-to-b from-slate-200/30 to-transparent' : 'bg-gradient-to-b from-primary/10 to-transparent'
        }`} />

        {/* Receipt content wrapper */}
        <div className="relative z-10 flex flex-col w-full gap-3">
          
          {/* Header */}
          <div className="text-center font-bold">
            <h3 className={`text-base uppercase tracking-widest ${isLight ? 'text-slate-900 font-extrabold' : 'text-primary text-glow'}`}>GAMEFLEX</h3>
            <p className={`text-[10px] uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>GAMING RECEIPT</p>
            <p className={`text-[9px] mt-1 font-semibold uppercase tracking-widest ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              ORDER #00{profile.steamLevel || 42} &bull; SALES SLIP
            </p>
            <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/')}
            </p>
            <p className={`text-[9px] ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              CUSTOMER: {profile.personaname.toUpperCase()}
            </p>
            <div className={`border-t border-dashed my-2 ${isLight ? 'border-slate-300' : 'border-white/20'}`} />
          </div>

          {/* Table Headers */}
          <div>
            <div className={`flex justify-between font-bold text-[10px] mb-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              <span className="w-8 text-left">QTY</span>
              <span className="flex-1 text-left px-2">ITEM</span>
              <span className="w-20 text-right">PLAYTIME</span>
            </div>
            <div className={`border-t border-dashed my-2 ${isLight ? 'border-slate-300' : 'border-white/20'}`} />
          </div>

          {/* Games list */}
          <div className="space-y-3 my-1">
            {topGames.map((game, idx) => {
              const gameHours = Math.round(game.playtime_forever / 6) / 10;
              return (
                <div key={game.appid} className="flex justify-between items-center text-[11px] leading-normal">
                  <span className={`w-8 text-left ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>0{idx + 1}</span>
                  <span className={`flex-1 text-left px-2 truncate block py-0.5 font-bold ${isLight ? 'text-slate-700' : 'text-slate-200'}`}>
                    {game.name.toUpperCase()}
                  </span>
                  <span className={`w-20 text-right font-bold ${isLight ? 'text-indigo-600' : 'text-primary'}`}>
                    {gameHours.toLocaleString()} HRS
                  </span>
                </div>
              );
            })}
          </div>

          {/* Summary / Total Section */}
          <div>
            <div className={`border-t border-dashed my-2 ${isLight ? 'border-slate-300' : 'border-white/20'}`} />
            <div className="flex justify-between font-bold text-[11px] my-1">
              <span>TOTAL ITEMS:</span>
              <span className={isLight ? 'text-slate-600' : 'text-slate-300'}>{aiStats.totalGamesCount} GAMES</span>
            </div>
            <div className="flex justify-between font-bold text-sm my-1">
              <span>TOTAL PLAYTIME:</span>
              <span className={`font-bold text-sm my-1 ${isLight ? 'text-slate-900' : 'text-primary text-glow'}`}>{Math.round(aiStats.totalPlaytimeHours).toLocaleString()} HRS</span>
            </div>
            <div className={`border-t border-dashed my-2 ${isLight ? 'border-slate-300' : 'border-white/20'}`} />
          </div>

          {/* AI Roast / Motto */}
          <div className="text-center my-1 flex flex-col items-center gap-1">
            <ReceiptIllustration title={aiStats.title} theme={theme} />
            <span className={`text-[10px] font-bold uppercase tracking-widest block mt-2 mb-1 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>AI EVALUATION</span>
            <span className={`font-bold text-[11px] uppercase block leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>{aiStats.title}</span>
            <span className={`text-[9px] italic block mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>"{aiStats.motto}"</span>
            
            <div className={`mt-2.5 rounded-lg p-2.5 border w-full ${isLight ? 'bg-slate-200/40 border-slate-300/60' : 'bg-white/[0.02] border-white/5'}`}>
              <p className={`text-[9px] leading-relaxed text-left ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                👉 {aiStats.roast}
              </p>
            </div>
          </div>

          {/* Barcode & Thank You */}
          <div className="text-center flex flex-col items-center">
            <div className={`border-t border-dashed my-2 ${isLight ? 'border-slate-300' : 'border-white/20'}`} />
            
            {/* Barcode lines */}
            <div className="flex justify-center items-center gap-[1.5px] h-6 mt-2 w-full opacity-60">
              {barcodeLines.map((width, idx) => (
                <div 
                  key={idx} 
                  className={`h-full ${isLight ? 'bg-slate-800' : 'bg-white'}`} 
                  style={{ width: `${width}px` }} 
                />
              ))}
            </div>
            
            <span className={`text-[8px] tracking-widest mt-1 block ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
              {profile.steamId}
            </span>
            <span className={`text-[9px] font-bold tracking-wider mt-2.5 block uppercase ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              THANK YOU FOR PLAYING!
            </span>
          </div>

        </div>
      </div>

      {/* Action Buttons Group */}
      <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-sm px-4">
        {/* Download Button */}
        <button
          onClick={handleDownload}
          disabled={downloading || sharing}
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-outfit text-sm font-semibold transition-all disabled:opacity-50 flex-1 ${
            isLight 
              ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 shadow-sm border border-slate-300/50' 
              : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white'
          }`}
        >
          <Download className="h-4 w-4" />
          Download PNG
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          disabled={downloading || sharing}
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-outfit text-sm font-semibold text-black transition-all disabled:opacity-50 flex-1 shadow-glow-primary hover:shadow-glow-primary-heavy ${
            isLight
              ? 'bg-slate-800 text-white hover:bg-slate-900 font-bold'
              : 'bg-gradient-to-r from-primary to-indigo-600 hover:from-white hover:to-white font-bold'
          }`}
        >
          <Share2 className="h-4 w-4" />
          {sharing ? 'Sharing...' : 'Share to Socials'}
        </button>
      </div>
    </div>
  );
}
