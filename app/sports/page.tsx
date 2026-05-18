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

const SPORTS_LIST = [
  { id: 'all', name: 'All Sports', icon: '🌍' },
  { id: 'football', name: 'Football', icon: '⚽' },
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'ufc', name: 'UFC / MMA', icon: '🥊' },
  { id: 'f1', name: 'Formula 1', icon: '🏎️' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'esports', name: 'Esports', icon: '🎮' },
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
      // 1. Fetch live matches directly from API gateway (No fake/mock additions injected!)
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
    <div className="min-h-screen bg-[#070707] text-white px-4 md:px-12 py-10 space-y-8 pb-32">
      {/* Page Header (Simple, clean, human design) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#ff0000] text-white text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
              LIVE SCOREBOARD
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wider mt-2">
            Sports Live Centre
          </h1>
          <p className="text-gray-400 text-xs mt-1 max-w-xl">
            Real-time live scores, match summaries, upcoming fixtures, and league standings.
          </p>
        </div>

        <button 
          onClick={handleManualRefresh}
          className="flex items-center gap-2 bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
        >
          {refreshing ? (
            <RefreshCw className="animate-spin text-[#ff0000]" size={14} />
          ) : (
            <RefreshCw className="text-[#ff0000]" size={14} />
          )}
          <span className="text-white">Refresh Data</span>
        </button>
      </div>

      {/* Sports Horizontal Tab Selector */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none border-b border-white/10">
        {SPORTS_LIST.map((sport) => {
          const isActive = activeSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => {
                setActiveSport(sport.id);
                setExpandedMatchId(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold uppercase tracking-wide transition-all ${
                isActive 
                  ? 'bg-[#ff0000] border-[#ff0000] text-white font-bold' 
                  : 'bg-[#121212] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
              }`}
            >
              <span>{sport.icon}</span>
              <span>{sport.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-navigation Switcher (Live / Fixtures / Standings) */}
      <div className="flex gap-1 p-1 bg-[#121212] border border-white/10 rounded-lg max-w-md">
        <button
          onClick={() => setSubTab('live')}
          className={`flex-1 py-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            subTab === 'live' ? 'bg-[#ff0000] text-white font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Zap size={13} /> Live scores
        </button>
        <button
          onClick={() => setSubTab('fixtures')}
          className={`flex-1 py-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            subTab === 'fixtures' ? 'bg-[#ff0000] text-white font-bold' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Calendar size={13} /> Fixtures
        </button>
        <button
          onClick={() => setSubTab('standings')}
          className={`flex-1 py-2.5 rounded-md flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide transition-all ${
            subTab === 'standings' ? 'bg-[#ff0000] text-white font-bold' : 'text-gray-400 hover:text-white'
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
            <Activity className="animate-pulse text-[#ff0000]" size={36} />
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider">Syncing live match servers...</p>
          </motion.div>
        ) : subTab === 'live' ? (
          /* LIVE MATCHES SCOREBOARD VIEW */
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-5"
          >
            {matches.length === 0 ? (
              <div className="col-span-full bg-[#121212] border border-white/10 rounded-xl p-12 text-center space-y-4">
                <Trophy className="mx-auto text-gray-500" size={36} />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">No Active Competitions</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-xs">
                  There are no live match events recorded at the moment. Switch to upcoming fixtures.
                </p>
                <button
                  onClick={() => setSubTab('fixtures')}
                  className="bg-[#ff0000] hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest px-5 py-2.5 rounded-lg transition-colors"
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
                    className="bg-[#121212] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all space-y-4"
                  >
                    {/* Card Header (League & Sport badge info) */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-white/5 text-gray-300 border border-white/10">
                          {match.sport}
                        </span>
                        <span className="text-xs text-gray-300 font-semibold">{match.league}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {match.status === 'live' && (
                          <div className="flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 bg-[#ff0000] rounded-full animate-ping" />
                            <span className="text-[9px] font-bold uppercase tracking-wide">LIVE</span>
                          </div>
                        )}
                        {match.timer && (
                          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {match.timer}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Classic Scoreboard Row (Highly visible, white text, bold score numbers) */}
                    <div className="grid grid-cols-3 items-center py-2">
                      {/* Home Team */}
                      <div className="flex flex-col items-center gap-2">
                        {match.teamHome.logo ? (
                          <img src={match.teamHome.logo} alt={match.teamHome.name} className="h-12 w-12 object-contain" />
                        ) : (
                          <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {match.teamHome.name[0]}
                          </div>
                        )}
                        <span className="text-xs font-bold text-white text-center max-w-[110px]">
                          {match.teamHome.name}
                        </span>
                        {match.teamHome.detail && (
                          <span className="text-[10px] text-gray-400 font-semibold uppercase">
                            {match.teamHome.detail}
                          </span>
                        )}
                      </div>

                      {/* Scoreboard Number Display (White & Red bold styling) */}
                      <div className="text-center space-y-1">
                        <div className="flex justify-center items-center gap-3">
                          <span className="text-2xl font-black text-white">{match.teamHome.score || '0'}</span>
                          <span className="text-lg text-gray-500 font-bold">-</span>
                          <span className="text-2xl font-black text-white">{match.teamAway.score || '0'}</span>
                        </div>
                        <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">Score</span>
                      </div>

                      {/* Away Team */}
                      <div className="flex flex-col items-center gap-2">
                        {match.teamAway.logo ? (
                          <img src={match.teamAway.logo} alt={match.teamAway.name} className="h-12 w-12 object-contain" />
                        ) : (
                          <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center text-sm font-bold text-white">
                            {match.teamAway.name[0]}
                          </div>
                        )}
                        <span className="text-xs font-bold text-white text-center max-w-[110px]">
                          {match.teamAway.name}
                        </span>
                        {match.teamAway.detail && (
                          <span className="text-[10px] text-gray-400 font-semibold uppercase">
                            {match.teamAway.detail}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stats/Events Toggle Button */}
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      className="w-full border-t border-white/5 pt-3 flex justify-center items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <span className="font-semibold">{isExpanded ? 'Hide Match Stats' : 'View Match Stats & Details'}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>

                    {/* Collapsible Stats and Timeline details */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 pt-1"
                      >
                        {/* Statistics (High Contrast white text and clean layout) */}
                        {match.stats && match.stats.length > 0 && (
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3.5 space-y-2.5">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block border-b border-white/5 pb-1">
                              Match Telemetry Stats
                            </span>
                            {match.stats.map((stat: any, i: number) => (
                              <div key={i} className="flex justify-between items-center py-1 text-xs">
                                <span className="font-bold text-white w-10">{stat.home}</span>
                                <span className="text-gray-400 uppercase font-semibold text-[10px]">{stat.label}</span>
                                <span className="font-bold text-white w-10 text-right">{stat.away}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Events Timeline */}
                        {match.events && match.events.length > 0 && (
                          <div className="bg-black/40 border border-white/5 rounded-lg p-3.5 space-y-3">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block border-b border-white/5 pb-1">
                              Live Play Timeline
                            </span>
                            <div className="space-y-3.5 pl-1.5 border-l border-white/10 ml-1">
                              {match.events.map((ev: any, i: number) => (
                                <div key={i} className="relative pl-5">
                                  <span className="absolute -left-[11px] top-1.5 w-2 h-2 bg-[#ff0000] rounded-full border border-black" />
                                  <div className="text-xs">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-emerald-400 font-extrabold">{ev.time}</span>
                                      <span className="font-bold text-white uppercase text-[10px]">{ev.player}</span>
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
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {fixtures.length === 0 ? (
              <div className="col-span-full bg-[#121212] border border-white/10 rounded-xl p-12 text-center space-y-4">
                <Calendar className="mx-auto text-gray-500" size={36} />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">No Upcoming Matches</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-xs">
                  There are no fixtures recorded for the selected period.
                </p>
              </div>
            ) : (
              fixtures.map((item) => (
                <div key={item.id} className="bg-[#121212] border border-white/10 rounded-xl p-4.5 space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                    <span className="text-[9px] font-bold uppercase text-[#ff0000] tracking-wider">{item.league}</span>
                    <span className="text-xs text-gray-400 font-bold">{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-2.5 w-[42%]">
                      {item.teamHome.logo ? (
                        <img src={item.teamHome.logo} alt={item.teamHome.name} className="h-7 w-7 object-contain" />
                      ) : (
                        <div className="h-7 w-7 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                          {item.teamHome.name[0]}
                        </div>
                      )}
                      <span className="text-xs font-bold text-white truncate">{item.teamHome.name}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-bold text-[#ff0000] italic">VS</span>
                      <span className="text-[9px] text-gray-400 font-semibold">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-2.5 justify-end w-[42%] text-right">
                      <span className="text-xs font-bold text-white truncate">{item.teamAway.name}</span>
                      {item.teamAway.logo ? (
                        <img src={item.teamAway.logo} alt={item.teamAway.name} className="h-7 w-7 object-contain" />
                      ) : (
                        <div className="h-7 w-7 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                          {item.teamAway.name[0]}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.venue && (
                    <div className="flex items-center justify-center gap-1 text-[9px] text-gray-500 pt-2 border-t border-white/5">
                      <MapPin size={9} />
                      <span className="font-semibold truncate">{item.venue}</span>
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
            className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden"
          >
            {standings.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <Trophy className="mx-auto text-gray-500" size={36} />
                <h3 className="text-base font-bold text-white uppercase tracking-wider">Standings Unavailable</h3>
                <p className="text-gray-400 max-w-sm mx-auto text-xs">
                  Standings table and rankings are not applicable or currently empty for the selected category.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[9px] font-bold uppercase text-gray-400 tracking-wider border-b border-white/10">
                      <th className="py-3 px-5 text-center w-14">Rank</th>
                      <th className="py-3 px-5">Team / Competitor</th>
                      <th className="py-3 px-5 text-center w-16">Played</th>
                      <th className="py-3 px-5 text-center w-16">Wins</th>
                      {activeSport === 'football' && <th className="py-3 px-5 text-center w-16">Draws</th>}
                      <th className="py-3 px-5 text-center w-16">Losses</th>
                      <th className="py-3 px-5 text-center w-20 text-[#ff0000]">Points</th>
                      <th className="py-3 px-5 w-32">Recent Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => (
                      <tr key={row.rank} className="border-b border-white/5 hover:bg-white/2 bg-transparent text-xs transition-colors">
                        <td className="py-3.5 px-5 text-center font-bold text-gray-300">{row.rank}</td>
                        <td className="py-3.5 px-5 font-bold flex items-center gap-2.5">
                          {row.team.logo ? (
                            <img src={row.team.logo} alt={row.team.name} className="h-5 w-5 object-contain" />
                          ) : (
                            <div className="h-5 w-5 bg-white/5 rounded-full" />
                          )}
                          <span className="text-white">{row.team.name}</span>
                        </td>
                        <td className="py-3.5 px-5 text-center text-white">{row.played}</td>
                        <td className="py-3.5 px-5 text-center text-emerald-400 font-semibold">{row.won}</td>
                        {activeSport === 'football' && <td className="py-3.5 px-5 text-center text-gray-400">{row.drawn ?? 0}</td>}
                        <td className="py-3.5 px-5 text-center text-red-400 font-semibold">{row.lost}</td>
                        <td className="py-3.5 px-5 text-center font-bold text-white">{row.points}</td>
                        <td className="py-3.5 px-5">
                          <div className="flex gap-1">
                            {row.form && row.form.split('').slice(0, 5).map((char: string, i: number) => {
                              let bg = 'bg-gray-600';
                              if (char === 'W') bg = 'bg-emerald-500';
                              if (char === 'L') bg = 'bg-red-500';
                              return (
                                <span 
                                  key={i} 
                                  className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[8px] font-black text-black ${bg}`}
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
