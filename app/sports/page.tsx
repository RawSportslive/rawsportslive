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
  MapPin, 
  Clock 
} from 'lucide-react';
import Image from 'next/image';

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
      // 1. Fetch live matches
      const resMatches = await fetch(`/api/sports/${sport}/live`);
      const dataMatches = await resMatches.json();
      
      // Inject some multi-sport live cards when 'all' is selected to make a stunning composite view
      if (activeSport === 'all') {
        const extraMatches = [
          {
            id: 'cr-live-all-1',
            sport: 'cricket',
            league: 'IPL T20 League',
            status: 'live',
            timer: 'Overs: 14.2',
            teamHome: { name: 'Mumbai Indians', logo: 'https://www.thesportsdb.com/images/media/team/badge/mumbai.png', score: '142/3' },
            teamAway: { name: 'Chennai Super Kings', logo: 'https://www.thesportsdb.com/images/media/team/badge/chennai.png', score: 'Yet to Bat' },
            venue: 'Wankhede Stadium',
            stats: [{ label: 'Run Rate', home: '9.91', away: 'N/A' }],
            events: [{ time: '12.4 Ov', type: 'wicket', player: 'Rohit Sharma', detail: 'c. Dhoni b. Jadeja 72(45)' }]
          },
          {
            id: 'bk-live-all-1',
            sport: 'basketball',
            league: 'NBA Regular Season',
            status: 'live',
            timer: 'Qtr 4 - 8:12',
            teamHome: { name: 'LA Lakers', logo: 'https://www.thesportsdb.com/images/media/team/badge/trryqu1421415273.png', score: '102' },
            teamAway: { name: 'Golden State Warriors', logo: 'https://www.thesportsdb.com/images/media/team/badge/qvruyt1421413812.png', score: '98' },
            venue: 'Crypto.com Arena'
          }
        ];
        setMatches([...dataMatches, ...extraMatches]);
      } else {
        setMatches(dataMatches);
      }

      // 2. Fetch fixtures
      const resFixtures = await fetch(`/api/sports/${sport}/fixtures`);
      const dataFixtures = await resFixtures.json();
      setFixtures(dataFixtures);

      // 3. Fetch standings
      const resStandings = await fetch(`/api/sports/${sport}/standings`);
      const dataStandings = await resStandings.json();
      setStandings(dataStandings);
    } catch (err) {
      console.error("Error fetching sports data:", err);
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

  const getSportBadgeColor = (sport: string) => {
    switch (sport) {
      case 'football': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cricket': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'basketball': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'ufc': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'f1': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'tennis': return 'bg-lime-500/10 text-lime-400 border-lime-500/20';
      default: return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-brand-black text-white px-4 md:px-12 py-10 space-y-8 pb-32">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-brand-red text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">LIVE ARENA</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
            SPORTS <span className="text-brand-red">HUB & SCORES</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xl">
            Stream real-time live telemetry, schedules, rankings, and deep stats metrics for all major global events.
          </p>
        </div>

        <button 
          onClick={handleManualRefresh}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all"
        >
          {refreshing ? (
            <RefreshCw className="animate-spin text-brand-red" size={16} />
          ) : (
            <RefreshCw className="text-brand-red" size={16} />
          )}
          <span>Refresh Scores</span>
        </button>
      </div>

      {/* Sports Grid Category Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none border-b border-white/5">
        {SPORTS_LIST.map((sport) => {
          const isActive = activeSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => {
                setActiveSport(sport.id);
                setExpandedMatchId(null);
              }}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20 scale-102' 
                  : 'bg-[#121212] border-white/5 text-gray-400 hover:text-white hover:border-white/10'
              }`}
            >
              <span>{sport.icon}</span>
              <span>{sport.name}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Navigation Switcher */}
      <div className="flex gap-1.5 p-1 bg-[#121212] border border-white/5 rounded-2xl max-w-md">
        <button
          onClick={() => setSubTab('live')}
          className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all ${
            subTab === 'live' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Zap size={14} /> Live scores
        </button>
        <button
          onClick={() => setSubTab('fixtures')}
          className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all ${
            subTab === 'fixtures' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Calendar size={14} /> Fixtures
        </button>
        <button
          onClick={() => setSubTab('standings')}
          className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition-all ${
            subTab === 'standings' ? 'bg-brand-red text-white shadow-lg' : 'text-gray-500 hover:text-white'
          }`}
        >
          <Trophy size={14} /> Standings
        </button>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4"
          >
            <Activity className="animate-pulse text-brand-red" size={48} />
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Querying live sports networks...</p>
          </motion.div>
        ) : subTab === 'live' ? (
          /* LIVE SCORES TAB */
          <motion.div
            key="live"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {matches.length === 0 ? (
              <div className="col-span-full bg-[#121212] border border-white/5 rounded-3xl p-12 text-center space-y-4">
                <Trophy className="mx-auto text-gray-600" size={48} />
                <h3 className="text-xl font-bold uppercase">No Active Matches</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">
                  There are no live {activeSport === 'all' ? '' : activeSport} competitions at this time. Toggle to the Fixtures tab to view upcoming match dates!
                </p>
                <button
                  onClick={() => setSubTab('fixtures')}
                  className="bg-brand-red hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg transition-all"
                >
                  View Upcoming fixtures
                </button>
              </div>
            ) : (
              matches.map((match) => {
                const isExpanded = expandedMatchId === match.id;
                return (
                  <div 
                    key={match.id}
                    className="bg-[#121212] border border-white/5 hover:border-white/10 rounded-3xl p-6 transition-all space-y-6"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded border ${getSportBadgeColor(match.sport)}`}>
                          {match.sport}
                        </span>
                        <span className="text-xs text-gray-400 font-bold">{match.league}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {match.status === 'live' && (
                          <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded text-red-400">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            <span className="text-[9px] font-black uppercase tracking-wider">LIVE</span>
                          </div>
                        )}
                        {match.timer && (
                          <span className="text-xs text-emerald-400 font-black">{match.timer}</span>
                        )}
                      </div>
                    </div>

                    {/* Scoreboard Grid */}
                    <div className="grid grid-cols-3 items-center py-4">
                      {/* Home */}
                      <div className="flex flex-col items-center gap-2">
                        {match.teamHome.logo ? (
                          <img src={match.teamHome.logo} alt={match.teamHome.name} className="h-16 w-16 object-contain" />
                        ) : (
                          <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center text-xl font-bold uppercase">
                            {match.teamHome.name[0]}
                          </div>
                        )}
                        <span className="text-sm font-black text-center max-w-[120px]">{match.teamHome.name}</span>
                        {match.teamHome.detail && <span className="text-[10px] text-gray-500 font-bold uppercase">{match.teamHome.detail}</span>}
                      </div>

                      {/* VS/Scores */}
                      <div className="text-center space-y-1">
                        <div className="flex justify-center items-center gap-4">
                          <span className="text-4xl font-black">{match.teamHome.score || '0'}</span>
                          <span className="text-xl text-gray-600 font-black">-</span>
                          <span className="text-4xl font-black">{match.teamAway.score || '0'}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">SCOREBOARD</span>
                      </div>

                      {/* Away */}
                      <div className="flex flex-col items-center gap-2">
                        {match.teamAway.logo ? (
                          <img src={match.teamAway.logo} alt={match.teamAway.name} className="h-16 w-16 object-contain" />
                        ) : (
                          <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center text-xl font-bold uppercase">
                            {match.teamAway.name[0]}
                          </div>
                        )}
                        <span className="text-sm font-black text-center max-w-[120px]">{match.teamAway.name}</span>
                        {match.teamAway.detail && <span className="text-[10px] text-gray-500 font-bold uppercase">{match.teamAway.detail}</span>}
                      </div>
                    </div>

                    {/* Expand Toggle */}
                    <button
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                      className="w-full border-t border-white/5 pt-4 flex justify-center items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                    >
                      <span>{isExpanded ? 'Hide Match Statistics' : 'View Match Stats & Events'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-6 pt-2"
                      >
                        {/* Stats */}
                        {match.stats && match.stats.length > 0 && (
                          <div className="bg-black/30 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-brand-red">
                              <Activity size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">TELEMTRY METRICS</span>
                            </div>
                            {match.stats.map((stat: any, i: number) => (
                              <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 text-xs">
                                <span className="font-black w-12">{stat.home}</span>
                                <span className="text-gray-500 uppercase tracking-wider font-bold text-[10px]">{stat.label}</span>
                                <span className="font-black w-12 text-right">{stat.away}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Events */}
                        {match.events && match.events.length > 0 && (
                          <div className="bg-black/30 rounded-2xl p-4 space-y-4">
                            <div className="flex items-center gap-2 text-brand-red">
                              <Award size={14} />
                              <span className="text-[10px] font-black uppercase tracking-widest">LIVE EVENT TIMELINE</span>
                            </div>
                            <div className="space-y-4 pl-2 relative border-l border-white/10 ml-2">
                              {match.events.map((ev: any, i: number) => (
                                <div key={i} className="relative pl-6">
                                  <span className="absolute -left-[31px] top-1 w-3 h-3 bg-brand-red rounded-full border-2 border-[#121212]" />
                                  <div className="text-xs space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-emerald-400 font-black">{ev.time}</span>
                                      <span className="font-black uppercase tracking-wider text-[10px] text-gray-300">{ev.player}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{ev.type}: {ev.detail || ''}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.venue && (
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                            <MapPin size={14} />
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
          /* FIXTURES CALENDAR TAB */
          <motion.div
            key="fixtures"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {fixtures.length === 0 ? (
              <div className="col-span-full bg-[#121212] border border-white/5 rounded-3xl p-12 text-center space-y-4">
                <Calendar className="mx-auto text-gray-600" size={48} />
                <h3 className="text-xl font-bold uppercase">No Scheduled Fixtures</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">
                  There are no scheduled {activeSport === 'all' ? '' : activeSport} fixtures registered for the next 15 days.
                </p>
              </div>
            ) : (
              fixtures.map((item) => (
                <div key={item.id} className="bg-[#121212] border border-white/5 rounded-3xl p-5 space-y-5">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <span className="text-[10px] font-black uppercase text-brand-red tracking-wider">{item.league}</span>
                    <span className="text-xs text-gray-500 font-black">{new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 w-[40%]">
                      {item.teamHome.logo ? (
                        <img src={item.teamHome.logo} alt={item.teamHome.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <div className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center text-xs font-bold">{item.teamHome.name[0]}</div>
                      )}
                      <span className="text-xs font-black truncate">{item.teamHome.name}</span>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-black text-brand-red italic">VS</span>
                      <span className="text-[9px] text-gray-500 font-bold">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex items-center gap-3 justify-end w-[40%] text-right">
                      <span className="text-xs font-black truncate">{item.teamAway.name}</span>
                      {item.teamAway.logo ? (
                        <img src={item.teamAway.logo} alt={item.teamAway.name} className="h-8 w-8 object-contain" />
                      ) : (
                        <div className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center text-xs font-bold">{item.teamAway.name[0]}</div>
                      )}
                    </div>
                  </div>

                  {item.venue && (
                    <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-500 pt-2 border-t border-white/5">
                      <MapPin size={10} />
                      <span className="font-bold truncate">{item.venue}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        ) : (
          /* LEAGUE STANDINGS TAB */
          <motion.div
            key="standings"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl"
          >
            {standings.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <Trophy className="mx-auto text-gray-600" size={48} />
                <h3 className="text-xl font-bold uppercase">No Standings Table</h3>
                <p className="text-gray-500 max-w-sm mx-auto text-sm">
                  League standings data is unavailable or not applicable for the selected category.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-white/5">
                      <th className="py-4 px-6 text-center w-16">Rank</th>
                      <th className="py-4 px-6">Team / Competitor</th>
                      <th className="py-4 px-6 text-center">Played</th>
                      <th className="py-4 px-6 text-center">Wins</th>
                      {activeSport === 'football' && <th className="py-4 px-6 text-center">Draws</th>}
                      <th className="py-4 px-6 text-center">Losses</th>
                      <th className="py-4 px-6 text-center text-brand-red">Points</th>
                      <th className="py-4 px-6">Recent Form</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((row) => (
                      <tr key={row.rank} className="border-b border-white/5 hover:bg-white/2 bg-transparent text-sm transition-colors">
                        <td className="py-4 px-6 text-center font-black text-gray-400">{row.rank}</td>
                        <td className="py-4 px-6 font-black flex items-center gap-3">
                          {row.team.logo ? (
                            <img src={row.team.logo} alt={row.team.name} className="h-6 w-6 object-contain" />
                          ) : (
                            <div className="h-6 w-6 bg-white/5 rounded-full" />
                          )}
                          <span>{row.team.name}</span>
                        </td>
                        <td className="py-4 px-6 text-center font-bold">{row.played}</td>
                        <td className="py-4 px-6 text-center font-bold text-emerald-400">{row.won}</td>
                        {activeSport === 'football' && <td className="py-4 px-6 text-center font-bold text-gray-400">{row.drawn ?? 0}</td>}
                        <td className="py-4 px-6 text-center font-bold text-red-500">{row.lost}</td>
                        <td className="py-4 px-6 text-center font-black text-white">{row.points}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-1">
                            {row.form && row.form.split('').slice(0, 5).map((char: string, i: number) => {
                              let bg = 'bg-gray-600';
                              if (char === 'W') bg = 'bg-emerald-500';
                              if (char === 'L') bg = 'bg-red-500';
                              return (
                                <span 
                                  key={i} 
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-black ${bg}`}
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
