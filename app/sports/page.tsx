'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Calendar, 
  Activity, 
  Award, 
  Zap, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  MapPin 
} from 'lucide-react';

// Official, sharp SVG icons for all sports
const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const FootballIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2L2 7l1.5 12 8.5 3 8.5-3L22 7.5L12 2zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z" />
  </svg>
);

const CricketIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M18.5 5.5a2.12 2.12 0 0 0-3-3L3.5 14.5a3 3 0 0 0 4.2 4.2L19.7 6.7a2.12 2.12 0 0 0-1.2-1.2zM21 21a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
  </svg>
);

const BasketballIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M6.2 6.2a8 8 0 0 0 11.6 11.6M17.8 6.2a8 8 0 0 0-11.6 11.6M2 12h20M12 2v20" />
  </svg>
);

const UfcIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const F1Icon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.7 16 10 14 10H4v7h15zM2 17h2M14 10V5c0-.6-.4-1-1-1H9c-.6 0-1 .4-1 1v5" />
  </svg>
);

const TennisIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a10 10 0 0 1 8 8M4 14a10 10 0 0 1 8 8" />
  </svg>
);

const EsportsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
  </svg>
);

const SPORTS_LIST = [
  { id: 'all', name: 'All Sports', icon: <GlobeIcon /> },
  { id: 'football', name: 'Football', icon: <FootballIcon /> },
  { id: 'cricket', name: 'Cricket', icon: <CricketIcon /> },
  { id: 'basketball', name: 'Basketball', icon: <BasketballIcon /> },
  { id: 'ufc', name: 'UFC / MMA', icon: <UfcIcon /> },
  { id: 'f1', name: 'Formula 1', icon: <F1Icon /> },
  { id: 'tennis', name: 'Tennis', icon: <TennisIcon /> },
  { id: 'esports', name: 'Esports', icon: <EsportsIcon /> },
];

export default function SportsHubPage() {
  const [activeSport, setActiveSport] = useState('all');
  const [subTab, setSubTab] = useState<'live' | 'fixtures' | 'standings'>('live');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const sportToFetch = activeSport === 'all' ? 'football' : activeSport;

  const fetchSportsData = async (sport = sportToFetch) => {
    setLoading(true);
    try {
      // 1. Fetch live matches
      const resMatches = await fetch(`/api/sports/${sport}/live`);
      const dataMatches = await resMatches.json();
      setMatches(dataMatches || []);

      // 2. Fetch fixtures
      const resFixtures = await fetch(`/api/sports/${sport}/fixtures`);
      const dataFixtures = await resFixtures.json();
      setFixtures(dataFixtures || []);

      // 3. Fetch standings
      const resStandings = await fetch(`/api/sports/${sport}/standings`);
      const dataStandings = await resStandings.json();
      setStandings(dataStandings || []);
    } catch (err) {
      console.error("Error querying live sports gateway:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSportsData(sportToFetch);
  }, [activeSport]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchSportsData(sportToFetch);
  };

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 space-y-8 bg-brand-black">
      {/* Page Header (Simple, clean, human design) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-brand-red text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-lg shadow-brand-red/20">
              LIVE SCOREBOARD
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white uppercase tracking-tight mt-2">
            SPORTS <span className="text-brand-red">LIVE CENTRE</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium mt-1 max-w-xl">
            Real-time live scores, match summaries, upcoming fixtures, and league standings.
          </p>
        </div>

        <button 
          onClick={handleManualRefresh}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-colors"
        >
          {refreshing ? (
            <RefreshCw className="animate-spin text-brand-red" size={14} />
          ) : (
            <RefreshCw className="text-brand-red" size={14} />
          )}
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Sports Horizontal Tab Selector (Creamy Gray Background and sharp outline) */}
      <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar border-b border-white/5">
        {SPORTS_LIST.map((sport) => {
          const isActive = activeSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => {
                setActiveSport(sport.id);
                setExpandedMatchId(null);
              }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-brand-red'}>{sport.icon}</span>
              <span>{sport.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-navigation Switcher (Live / Fixtures / Standings) */}
      <div className="flex gap-1.5 p-1 bg-white/5 border border-white/10 rounded-xl max-w-md shadow-sm">
        <button
          onClick={() => setSubTab('live')}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
            subTab === 'live' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap size={13} /> Live scores
        </button>
        <button
          onClick={() => setSubTab('fixtures')}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
            subTab === 'fixtures' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar size={13} /> Fixtures
        </button>
        <button
          onClick={() => setSubTab('standings')}
          className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all ${
            subTab === 'standings' ? 'bg-brand-red text-white shadow-lg shadow-brand-red/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy size={13} /> Standings
        </button>
      </div>

      {/* Main Content Render Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 gap-3"
          >
            <Activity className="animate-pulse text-brand-red" size={36} />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-wider">Syncing live match servers...</p>
          </motion.div>
        ) : subTab === 'live' ? (
          /* LIVE MATCHES SCOREBOARD VIEW */
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {matches.length === 0 ? (
              <div className="col-span-full border-y border-gray-200 py-12 text-center space-y-4">
                <Trophy className="mx-auto text-gray-600" size={36} />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">No Active Competitions</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-xs">
                  There are no live match events recorded at the moment. Switch to upcoming fixtures.
                </p>
                <button
                  onClick={() => setSubTab('fixtures')}
                  className="bg-brand-red hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl transition-colors shadow-lg shadow-brand-red/20"
                >
                  View upcoming fixtures
                </button>
              </div>
            ) : (
              matches.map((match) => {
                const isExpanded = expandedMatchId === match.id;
                return (
                  <div 
                    key={match.id}
                    className="border-b border-gray-200 py-6 hover:bg-gray-50/50 transition-all space-y-5"
                  >
                    {/* Card Header */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-white/5 text-gray-400 border border-white/5">
                          {match.sport}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{match.league}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {match.status === 'live' && (
                          <div className="flex items-center gap-1.5 bg-brand-red/20 px-2.5 py-0.5 rounded text-brand-red border border-brand-red/20">
                            <span className="w-1.5 h-1.5 bg-brand-red rounded-full animate-pulse" />
                            <span className="text-[9px] font-extrabold uppercase tracking-widest">LIVE</span>
                          </div>
                        )}
                        {match.timer && (
                          <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20 tracking-wider">
                            {match.timer}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Classic Scoreboard Row (Excellent large fonts, creamy gray contrast) */}
                    <div className="grid grid-cols-3 items-center py-2">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-2.5">
                        {match.teamHome.logo ? (
                          <img src={match.teamHome.logo} alt={match.teamHome.name} className="h-14 w-14 object-contain brightness-90" />
                        ) : (
                          <div className="h-14 w-14 bg-white/5 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">
                            {match.teamHome.name[0]}
                          </div>
                        )}
                        <span className="text-sm md:text-base font-extrabold text-white text-center max-w-[120px]">
                          {match.teamHome.name}
                        </span>
                        {match.teamHome.detail && (
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {match.teamHome.detail}
                          </span>
                        )}
                      </div>

                      {/* Scoreboard Display */}
                      <div className="text-center space-y-1">
                        <div className="flex justify-center items-center gap-3">
                          <span className="text-3xl md:text-4xl font-extrabold text-white">{match.teamHome.score || '0'}</span>
                          <span className="text-xl text-gray-600 font-bold">-</span>
                          <span className="text-3xl md:text-4xl font-extrabold text-white">{match.teamAway.score || '0'}</span>
                        </div>
                        <span className="text-[9px] text-gray-500 font-bold tracking-widest uppercase">Scoreboard</span>
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-2.5">
                        {match.teamAway.logo ? (
                          <img src={match.teamAway.logo} alt={match.teamAway.name} className="h-14 w-14 object-contain brightness-90" />
                        ) : (
                          <div className="h-14 w-14 bg-white/5 rounded-full flex items-center justify-center text-sm font-bold text-gray-400">
                            {match.teamAway.name[0]}
                          </div>
                        )}
                        <span className="text-sm md:text-base font-extrabold text-white text-center max-w-[120px]">
                          {match.teamAway.name}
                        </span>
                        {match.teamAway.detail && (
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                            {match.teamAway.detail}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats/Events Toggle */}
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      className="w-full border-t border-white/5 pt-3 flex justify-center items-center gap-1.5 text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                    >
                      <span className="font-bold">{isExpanded ? 'Hide Match Stats' : 'View Match Stats & Details'}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* Collapsible Stats and Timeline */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-1"
                      >
                        {/* Statistics (High Contrast white text and clean layout) */}
                        {match.stats && match.stats.length > 0 && (
                          <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3 shadow-inner">
                            <span className="text-[9px] font-bold text-brand-red uppercase tracking-wider block border-b border-white/5 pb-2">
                              Match Telemetry Stats
                            </span>
                            {match.stats.map((stat: any, i: number) => (
                              <div key={i} className="flex justify-between items-center py-1.5 text-xs text-gray-400">
                                <span className="font-extrabold text-white w-10">{stat.home}</span>
                                <span className="text-gray-500 uppercase font-semibold text-[10px] tracking-widest">{stat.label}</span>
                                <span className="font-extrabold text-white w-10 text-right">{stat.away}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Events Timeline */}
                        {match.events && match.events.length > 0 && (
                          <div className="bg-white/5 border border-white/5 rounded-xl p-4 space-y-3.5 shadow-inner">
                            <span className="text-[9px] font-bold text-brand-red uppercase tracking-wider block border-b border-white/5 pb-2">
                              Live Play Timeline
                            </span>
                            <div className="space-y-4 pl-2 border-l border-white/10 ml-1">
                              {match.events.map((ev: any, i: number) => (
                                <div key={i} className="relative pl-5">
                                  <span className="absolute -left-[13px] top-1.5 w-2 h-2 bg-brand-red rounded-full border border-brand-black" />
                                  <div className="text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-emerald-500 font-extrabold">{ev.time}</span>
                                      <span className="font-bold text-white uppercase text-[10px] tracking-widest">{ev.player}</span>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-semibold uppercase">{ev.type}: {ev.detail || ''}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.venue && (
                          <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
                            <MapPin size={11} />
                            <span>Venue: {match.venue}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        ) : subTab === 'fixtures' ? (
          /* FIXTURES CALENDAR VIEW */
          <motion.div
            key="fixtures"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {fixtures.length === 0 ? (
              <div className="col-span-full border-y border-gray-200 py-12 text-center space-y-4">
                <Calendar className="mx-auto text-gray-600" size={36} />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">No Upcoming Matches</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-xs">
                  There are no fixtures recorded for the selected period.
                </p>
              </div>
            ) : (
              fixtures.map((item) => (
                <div key={item.id} className="border-b border-gray-200 py-5 space-y-4 hover:bg-gray-50/50 transition-all">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-[9px] font-bold uppercase text-brand-red tracking-wider">{item.league}</span>
                    <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5 w-[42%]">
                      {item.teamHome.logo ? (
                        <img src={item.teamHome.logo} alt={item.teamHome.name} className="h-8 w-8 object-contain brightness-90" />
                      ) : (
                        <div className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {item.teamHome.name[0]}
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-white truncate">{item.teamHome.name}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-brand-red italic">VS</span>
                      <span className="text-[9px] text-gray-400 font-semibold tracking-wider">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2.5 justify-end w-[42%] text-right">
                      <span className="text-[11px] font-bold text-white truncate">{item.teamAway.name}</span>
                      {item.teamAway.logo ? (
                        <img src={item.teamAway.logo} alt={item.teamAway.name} className="h-8 w-8 object-contain brightness-90" />
                      ) : (
                        <div className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                          {item.teamAway.name[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.venue && (
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 pt-2 border-t border-white/5">
                      <MapPin size={9} />
                      <span className="font-semibold truncate uppercase tracking-widest">{item.venue}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        ) : (
          /* LEAGUE TABLE / STANDINGS VIEW */
            <motion.div
            key="standings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-y border-gray-200 overflow-hidden"
          >
            {standings.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <Trophy className="mx-auto text-gray-600" size={36} />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Standings Unavailable</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-xs">
                  Standings table and rankings are not applicable or currently empty for the selected category.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full min-w-[650px] text-left border-collapse">
                  <thead>
                    <tr className="bg-black/20 text-[9px] font-bold uppercase text-gray-500 tracking-wider border-b border-white/5">
                      <th className="py-3.5 px-5 text-center w-14">Rank</th>
                      <th className="py-3.5 px-5">Team / Competitor</th>
                      <th className="py-3.5 px-5 text-center w-16">Played</th>
                      <th className="py-3.5 px-5 text-center w-16">Wins</th>
                      {activeSport === 'football' && <th className="py-3.5 px-5 text-center w-16">Draws</th>}
                      <th className="py-3.5 px-5 text-center w-16">Losses</th>
                      <th className="py-3.5 px-5 text-center w-20 text-brand-red">Points</th>
                      <th className="py-3.5 px-5 w-32">Recent Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => (
                      <tr key={row.rank} className="border-b border-white/5 hover:bg-white/5 bg-transparent text-xs text-gray-300 transition-colors">
                        <td className="py-3.5 px-5 text-center font-bold text-gray-500">{row.rank}</td>
                        <td className="py-3.5 px-5 font-bold flex items-center gap-2.5">
                          {row.team.logo ? (
                            <img src={row.team.logo} alt={row.team.name} className="h-5 w-5 object-contain brightness-90" />
                          ) : (
                            <div className="h-5 w-5 bg-white/10 rounded-full" />
                          )}
                          <span className="text-white font-bold">{row.team.name}</span>
                        </td>
                        <td className="py-3.5 px-5 text-center">{row.played}</td>
                        <td className="py-3.5 px-5 text-center text-emerald-500 font-bold">{row.won}</td>
                        {activeSport === 'football' && <td className="py-3.5 px-5 text-center text-gray-500">{row.drawn ?? 0}</td>}
                        <td className="py-3.5 px-5 text-center text-red-500 font-bold">{row.lost}</td>
                        <td className="py-3.5 px-5 text-center font-extrabold text-white">{row.points}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex gap-1">
                            {row.form && row.form.split('').slice(0, 5).map((char: string, i: number) => {
                              let bg = 'bg-white/10 text-gray-400';
                              if (char === 'W') bg = 'bg-emerald-500/20 text-emerald-500';
                              if (char === 'L') bg = 'bg-brand-red/20 text-brand-red';
                              return (
                                <span 
                                  key={i} 
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${bg}`}
                                >
                                  {char}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
