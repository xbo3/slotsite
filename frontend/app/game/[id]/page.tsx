'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { gameApi } from '@/lib/api';
import { DEMO_GAMES } from '@/lib/gameData';
import { useLang } from '@/hooks/useLang';
import Link from 'next/link';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Static fallback games (same as lobby inline games, without thumbnails)
const STATIC_GAMES = [
  { id: 'gates-of-olympus', name: 'Gates of Olympus', provider: 'Pragmatic Play', category: 'SLOT', rtp: '96.5%', maxWin: 'x5000' },
  { id: 'sweet-bonanza', name: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'SLOT', rtp: '96.48%', maxWin: 'x21100' },
  { id: 'starlight-princess', name: 'Starlight Princess', provider: 'Pragmatic Play', category: 'SLOT', rtp: '96.5%', maxWin: 'x5000' },
  { id: 'sugar-rush', name: 'Sugar Rush', provider: 'Pragmatic Play', category: 'SLOT', rtp: '96.5%', maxWin: 'x5000' },
  { id: 'big-bass-bonanza', name: 'Big Bass Bonanza', provider: 'Pragmatic Play', category: 'SLOT', rtp: '96.71%', maxWin: 'x2100' },
  { id: 'wild-west-gold', name: 'Wild West Gold', provider: 'Pragmatic Play', category: 'SLOT', rtp: '96.51%', maxWin: 'x10000' },
  { id: 'fortune-tiger', name: 'Fortune Tiger', provider: 'PG Soft', category: 'SLOT', rtp: '96.81%', maxWin: 'x2500' },
  { id: 'fortune-ox', name: 'Fortune Ox', provider: 'PG Soft', category: 'SLOT', rtp: '96.75%', maxWin: 'x1000' },
  { id: 'fortune-rabbit', name: 'Fortune Rabbit', provider: 'PG Soft', category: 'SLOT', rtp: '96.75%', maxWin: 'x1000' },
  { id: 'mahjong-ways', name: 'Mahjong Ways', provider: 'PG Soft', category: 'SLOT', rtp: '96.95%', maxWin: 'x5000' },
  { id: 'crazy-time', name: 'Crazy Time', provider: 'Evolution', category: 'LIVE_CASINO', rtp: '95.5%', maxWin: 'x25000' },
  { id: 'lightning-roulette', name: 'Lightning Roulette', provider: 'Evolution', category: 'LIVE_CASINO', rtp: '97.3%', maxWin: 'x500' },
  { id: 'starburst', name: 'Starburst', provider: 'NetEnt', category: 'SLOT', rtp: '96.09%', maxWin: 'x500' },
  { id: 'book-of-dead', name: 'Book of Dead', provider: "Play'n GO", category: 'SLOT', rtp: '96.21%', maxWin: 'x5000' },
  { id: 'mega-moolah', name: 'Mega Moolah', provider: 'Microgaming', category: 'SLOT', rtp: '88.12%', maxWin: 'Progressive' },
];

function findDemoGame(id: string): any | null {
  // Check DEMO_GAMES first (has thumbnails)
  const demo = DEMO_GAMES.find(g => String(g.id) === id);
  if (demo) return { ...demo, rtp: demo.rtp, maxWin: demo.maxWin };
  // Check static inline games
  const stat = STATIC_GAMES.find(g => g.id === id);
  if (stat) return stat;
  return null;
}

export default function GamePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const { t } = useLang();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);
  const [gameUrl, setGameUrl] = useState<string | null>(null);

  useEffect(() => {
    const gameId = String(id);
    gameApi.getGame(gameId).then(res => {
      try {
        if (res.success && res.data) {
          setGame(res.data);
        } else {
          const demo = findDemoGame(gameId);
          if (demo) setGame(demo);
        }
      } catch {
        const demo = findDemoGame(gameId);
        if (demo) setGame(demo);
      }
      setLoading(false);
    }).catch(() => {
      const demo = findDemoGame(String(id));
      if (demo) setGame(demo);
      setLoading(false);
    });
  }, [id]);

  const handleLaunch = async () => {
    if (!isLoggedIn) { router.push('/login'); return; }
    setLaunching(true);
    try {
      const res = await gameApi.launchGame(String(id));
      if (res.success && res.data?.url) {
        setGameUrl(res.data.url);
      } else {
        // Game URL not available — show coming soon state
        setGameUrl(null);
      }
    } catch {
      setGameUrl(null);
    }
    setLaunching(false);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-white/50 font-light">Loading...</span></div>;
  if (!game) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-white/50 font-light">Game not found</span></div>;

  const gameName = game.name || 'Unknown';
  const gameProvider = game.provider || '';
  const gameRtp = game.rtp || '-';
  const gameMaxWin = game.maxWin || game.max_win || '-';
  const gameThumbnail = game.thumbnail || game.image || null;

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-4 py-6 md:py-8">
      {/* Back link */}
      <Link href="/lobby" className="text-white/40 text-sm font-light hover:text-white mb-4 inline-flex items-center gap-1">
        &larr; {t('games') || 'Games'}
      </Link>

      {/* Game image */}
      {gameThumbnail ? (
        <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video">
          <img src={gameThumbnail} alt={gameName} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="text-2xl md:text-4xl font-light text-white">{gameName}</h1>
            <p className="text-white/60 text-sm font-light">{gameProvider}</p>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-light text-white mb-1">{gameName}</h1>
          <p className="text-white/60 text-sm font-light">{gameProvider}</p>
        </div>
      )}

      {/* Game info cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/50 text-[10px] font-light uppercase tracking-wider">RTP</p>
          <p className="text-white text-lg font-light mt-1">{gameRtp}</p>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/50 text-[10px] font-light uppercase tracking-wider">Max Win</p>
          <p className="text-white text-lg font-light mt-1">{gameMaxWin}</p>
        </div>
        <div className="p-4 rounded-xl text-center" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/50 text-[10px] font-light uppercase tracking-wider">Provider</p>
          <p className="text-white text-lg font-light mt-1">{gameProvider}</p>
        </div>
      </div>

      {/* Game launch area */}
      {gameUrl ? (
        <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video" style={{ background: '#111' }}>
          <iframe src={gameUrl} className="w-full h-full border-0" allowFullScreen />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl mb-6" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
          {isLoggedIn ? (
            <>
              <p className="text-white/50 text-sm font-light mb-4">Ready to play?</p>
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="px-8 py-3 text-sm font-light tracking-wider uppercase text-white border border-white/40 rounded-lg hover:bg-white hover:text-black transition-all disabled:opacity-50"
              >
                {launching ? 'Loading...' : '\u25B6 PLAY NOW'}
              </button>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm font-light mb-4">Login to play this game</p>
              <Link href="/login" className="px-8 py-3 text-sm font-light tracking-wider uppercase text-white border border-white/40 rounded-lg hover:bg-white hover:text-black transition-all">
                LOGIN
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
