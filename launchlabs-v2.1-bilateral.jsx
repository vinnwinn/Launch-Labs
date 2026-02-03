/**
 * LaunchLabs v2.1 - Bilateral Balance Edition
 * Enhanced with: Bilateral KPIs, Force Production, Risk Assessment
 */
import React, { useState, useMemo, useCallback, Component } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, Cell, ReferenceLine, ComposedChart } from 'recharts';
import { TrendingUp, Target, Dumbbell, Activity, ChevronRight, Clock, Zap, Check, Info, ChevronDown, CheckCircle, RefreshCw, Users, FileText, AlertTriangle, Footprints, Wind, AlertCircle, Loader, ArrowUpRight, ArrowDownRight, Minus, Shield } from 'lucide-react';

const Scale = (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
const Gauge = (p) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>;

const TABS = { CLIENTS: 'clients', DASHBOARD: 'dashboard', BILATERAL: 'bilateral', APPROACH: 'approach', ANALYSIS: 'analysis', PLAN: 'plan' };
const BENCHMARKS = { jumpHeight: { elite: { male: 75, female: 55 }, advanced: { male: 60, female: 45 }, intermediate: { male: 45, female: 35 }, beginner: { male: 35, female: 25 } }, rsi: { elite: 3.0, advanced: 2.5, intermediate: 2.0, fair: 1.5 }, gct: { elite: 0.15, advanced: 0.20, good: 0.25, fair: 0.30 }, approachBonus: { elite: 25, advanced: 20, good: 15, fair: 10 }, asymmetry: { optimal: 5, acceptable: 10, warning: 15, danger: 20 } };

const SPORT_BENCHMARKS = { basketball: { positions: { guard: { jumpHeight: { elite: 80, advanced: 65 }, rsi: { elite: 3.2, advanced: 2.6 }, approachBonus: { elite: 22, advanced: 18 } } } }, volleyball: { positions: { outside: { jumpHeight: { elite: 90, advanced: 75 }, rsi: { elite: 3.3, advanced: 2.7 }, approachBonus: { elite: 30, advanced: 25 } } } }, general: { positions: { fitness: { jumpHeight: { elite: 60, advanced: 48 }, rsi: { elite: 2.7, advanced: 2.2 }, approachBonus: { elite: 15, advanced: 12 } } } } };

const APPROACH_FACTORS = { low: [{ factor: 'Poor Penultimate Step', description: 'Second-to-last step should be longer and lower', exercises: ['Penultimate Drills'] }, { factor: 'Weak Arm Timing', description: 'Arms should drive up at takeoff', exercises: ['Arm Swing Drills'] }], high: [{ factor: 'Excellent Speed Conversion', description: 'Efficiently converting horizontal to vertical' }, { factor: 'Optimal Mechanics', description: 'Ideal takeoff position' }] };

const EXERCISES = { strength: [{ id: 's1', name: 'Back Squat', difficulty: 'intermediate', sets: '4-5', reps: '3-6', rest: '3-4 min' }, { id: 's2', name: 'Bulgarian Split Squat', difficulty: 'intermediate', sets: '3-4', reps: '6-10 each', rest: '2 min' }], power: [{ id: 'p1', name: 'Jump Squat', difficulty: 'beginner', sets: '4-5', reps: '5-8', rest: '2 min' }], plyometrics: [{ id: 'pl1', name: 'Box Jump', difficulty: 'intermediate', sets: '4-5', reps: '5-8', rest: '90 sec' }, { id: 'pl2', name: 'Pogo Jumps', difficulty: 'beginner', sets: '3-4', reps: '20-30 sec', rest: '60 sec' }], unilateral: [{ id: 'u1', name: 'Single Leg Squat', difficulty: 'advanced', sets: '3', reps: '6-8 each', rest: '90 sec' }, { id: 'u2', name: 'Single Leg RDL', difficulty: 'intermediate', sets: '3', reps: '8-10 each', rest: '60 sec' }, { id: 'u3', name: 'Single Leg Hop', difficulty: 'intermediate', sets: '3', reps: '5 each', rest: '90 sec' }] };

const WARMUP = [{ name: 'Light Jog' }, { name: 'Leg Swings' }, { name: 'Squats' }];
const COOLDOWN = [{ name: 'Quad Stretch' }, { name: 'Hamstring Stretch' }];
const TAB_CONFIG = [{ id: TABS.CLIENTS, label: 'Clients', icon: Users }, { id: TABS.DASHBOARD, label: 'Dashboard', icon: Activity }, { id: TABS.BILATERAL, label: 'Balance', icon: Scale }, { id: TABS.APPROACH, label: 'Approach', icon: Wind }, { id: TABS.ANALYSIS, label: 'Analysis', icon: Target }, { id: TABS.PLAN, label: 'Plan', icon: FileText }];

const SAMPLE_DATA = [
  { date: '2025-10-15', standingJump: 38.2, approachJump: 44.5, gct: 0.312, rsi: 1.22, leftLeg: 36.5, rightLeg: 39.8, leftForce: 1420, rightForce: 1580 },
  { date: '2025-10-27', standingJump: 40.8, approachJump: 47.2, gct: 0.285, rsi: 1.43, leftLeg: 38.8, rightLeg: 42.5, leftForce: 1480, rightForce: 1620 },
  { date: '2025-11-08', standingJump: 43.5, approachJump: 50.8, gct: 0.262, rsi: 1.66, leftLeg: 41.5, rightLeg: 45.2, leftForce: 1550, rightForce: 1680 },
  { date: '2025-11-20', standingJump: 46.2, approachJump: 54.1, gct: 0.248, rsi: 1.86, leftLeg: 44.2, rightLeg: 47.8, leftForce: 1620, rightForce: 1740 },
  { date: '2025-12-02', standingJump: 48.8, approachJump: 56.5, gct: 0.235, rsi: 2.08, leftLeg: 46.8, rightLeg: 50.5, leftForce: 1700, rightForce: 1820 },
  { date: '2025-12-14', standingJump: 51.5, approachJump: 58.2, gct: 0.222, rsi: 2.32, leftLeg: 49.5, rightLeg: 53.2, leftForce: 1780, rightForce: 1890 },
  { date: '2025-12-26', standingJump: 53.5, approachJump: 59.8, gct: 0.210, rsi: 2.55, leftLeg: 51.5, rightLeg: 55.2, leftForce: 1850, rightForce: 1950 },
  { date: '2026-01-07', standingJump: 55.0, approachJump: 61.5, gct: 0.200, rsi: 2.75, leftLeg: 53.0, rightLeg: 56.5, leftForce: 1920, rightForce: 2010 },
  { date: '2026-01-19', standingJump: 56.5, approachJump: 63.2, gct: 0.191, rsi: 2.96, leftLeg: 54.5, rightLeg: 58.2, leftForce: 1980, rightForce: 2080 }
];

const DEFAULT_PROFILE = { id: '001', name: 'Marcus Johnson', gender: 'male', sport: 'basketball', position: 'guard', bodyWeight: 81 };
const CLIENTS = [
  { id: '001', name: 'Marcus Johnson', sport: 'basketball', position: 'guard', gender: 'male', standingJump: 56.5, approachJump: 63.2, rsi: 2.96, leftLeg: 54.5, rightLeg: 58.2 },
  { id: '002', name: 'Sarah Chen', sport: 'volleyball', position: 'outside', gender: 'female', standingJump: 48.2, approachJump: 62.7, rsi: 2.45, leftLeg: 47.8, rightLeg: 48.5 },
  { id: '003', name: 'Tyler Rodriguez', sport: 'general', position: 'fitness', gender: 'male', standingJump: 71.3, approachJump: 79.5, rsi: 3.12, leftLeg: 70.2, rightLeg: 72.1 }
];

// Utilities
const calcAvg = (arr, key) => { if (!arr?.length) return 0; const v = arr.filter(i => typeof i[key] === 'number'); return v.length ? v.reduce((s, i) => s + i[key], 0) / v.length : 0; };
const getBonusColor = (b) => b >= 25 ? 'text-emerald-400' : b >= 20 ? 'text-green-400' : b >= 15 ? 'text-cyan-400' : b >= 10 ? 'text-amber-400' : 'text-red-400';
const getBonusRating = (b) => b >= 25 ? 'elite' : b >= 20 ? 'advanced' : b >= 15 ? 'good' : b >= 10 ? 'fair' : 'poor';
const getAsymColor = (a) => a <= 5 ? 'text-emerald-400' : a <= 10 ? 'text-green-400' : a <= 15 ? 'text-amber-400' : 'text-red-400';
const getAsymBg = (a) => a <= 10 ? 'bg-emerald-500/20 border-emerald-500/30' : a <= 15 ? 'bg-amber-500/20 border-amber-500/30' : 'bg-red-500/20 border-red-500/30';
const getDiffClasses = (d) => d === 'beginner' ? 'bg-emerald-500/20 text-emerald-300' : d === 'intermediate' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300';
const getSevClasses = (s) => s === 'high' ? 'bg-red-500/20 border-red-500/50 text-red-300' : s === 'medium' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
const getRatingClasses = (r) => r === 'elite' ? 'bg-emerald-500/20 border-emerald-500/30' : r === 'advanced' ? 'bg-green-500/20 border-green-500/30' : r === 'good' ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-amber-500/20 border-amber-500/30';
const calcWoW = (d, k) => { if (!d || d.length < 2) return 0; const r = d[d.length - 1][k], p = d[d.length - 2][k]; return p > 0 ? ((r - p) / p) * 100 : 0; };
const estimateForce = (jh, bw, gct) => { const g = 9.81, v = Math.sqrt(2 * g * (jh / 100)); return bw * (v / gct + g); };

class ErrorBoundary extends Component { state = { hasError: false }; static getDerivedStateFromError() { return { hasError: true }; } render() { if (this.state.hasError) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><AlertCircle className="w-12 h-12 text-red-400" /></div>; return this.props.children; } }

const StatCard = ({ icon: Icon, label, value, unit, colorClass, trend }) => {
  const TrendIcon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const trendColor = trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-slate-400';
  return (<div className={`${colorClass} rounded-lg border p-2`}><div className="flex items-center justify-between mb-0.5"><div className="flex items-center gap-1">{Icon && <Icon className="w-3 h-3" />}<p className="text-xs text-slate-400">{label}</p></div>{trend !== undefined && <div className={`flex items-center gap-0.5 ${trendColor}`}><TrendIcon className="w-3 h-3" /><span className="text-xs">{Math.abs(trend).toFixed(1)}%</span></div>}</div><p className="text-lg font-bold">{value}{unit && <span className="text-xs text-slate-400 ml-1">{unit}</span>}</p></div>);
};

const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (<button onClick={() => onClick(id)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${isActive ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>{Icon && <Icon className="w-3 h-3" />}<span>{label}</span></button>);

const SectionHeader = ({ icon: Icon, title, subtitle, color = 'indigo' }) => (<div className={`bg-${color}-500/20 rounded-xl border border-${color}-500/30 p-2 flex items-center gap-2`}>{Icon && <div className={`p-1.5 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg`}><Icon className="w-4 h-4" /></div>}<div><h3 className="font-bold text-sm">{title}</h3>{subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}</div></div>);

const ExpandableCard = ({ title, subtitle, badge, isExpanded, onToggle, children }) => (<div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden"><button onClick={onToggle} className="w-full p-2 flex items-center justify-between hover:bg-slate-700/20"><div className="flex items-center gap-2">{badge && <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-bold text-xs">{badge}</div>}<div className="text-left"><p className="font-semibold text-xs">{title}</p>{subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}</div></div><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>{isExpanded && <div className="px-2 pb-2 border-t border-slate-700/50 pt-2">{children}</div>}</div>);

const BalanceIndicator = ({ leftValue, rightValue, label, unit = 'cm' }) => {
  const total = leftValue + rightValue;
  const leftPct = total > 0 ? (leftValue / total) * 100 : 50;
  const asym = total > 0 ? Math.abs(rightValue - leftValue) / (total / 2) * 100 : 0;
  const dominant = rightValue > leftValue ? 'Right' : leftValue > rightValue ? 'Left' : 'Equal';
  return (<div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3"><div className="flex items-center justify-between mb-2"><h4 className="text-xs font-semibold">{label}</h4><span className={`text-xs ${getAsymColor(asym)}`}>{asym <= 10 ? 'Good' : asym <= 15 ? 'Warning' : 'High Risk'}</span></div><div className="relative h-6 bg-slate-700/50 rounded-full overflow-hidden mb-2 flex"><div className="bg-blue-500 h-full flex items-center justify-start pl-2" style={{ width: `${leftPct}%` }}><span className="text-xs font-bold">{leftValue.toFixed(1)}</span></div><div className="bg-orange-500 h-full flex items-center justify-end pr-2 flex-1"><span className="text-xs font-bold">{rightValue.toFixed(1)}</span></div></div><div className="flex justify-between text-xs"><span className="text-blue-400">Left</span><span className={getAsymColor(asym)}>Δ {asym.toFixed(1)}%</span><span className="text-orange-400">Right</span></div><p className="text-xs text-slate-500 mt-1 text-center">{dominant === 'Equal' ? 'Balanced' : `${dominant} dominant by ${Math.abs(rightValue - leftValue).toFixed(1)} ${unit}`}</p></div>);
};

const RiskIndicator = ({ level, label, desc }) => {
  const cfg = level === 'low' ? { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400', Icon: Shield } : level === 'medium' ? { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', Icon: AlertTriangle } : { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', Icon: AlertCircle };
  return (<div className={`${cfg.bg} ${cfg.border} border rounded-lg p-2`}><div className="flex items-center gap-2"><cfg.Icon className={`w-4 h-4 ${cfg.text}`} /><div><p className={`text-xs font-semibold ${cfg.text}`}>{label}</p><p className="text-xs text-slate-400">{desc}</p></div></div></div>);
};

// Analysis Engine
const analyze = (data, gender, profile) => {
  if (!data?.length) return { success: false, error: 'No data' };
  const g = ['male', 'female'].includes(gender) ? gender : 'male';
  const avgStanding = calcAvg(data, 'standingJump'), avgApproach = calcAvg(data, 'approachJump'), avgRSI = calcAvg(data, 'rsi'), avgGCT = calcAvg(data, 'gct');
  const bonus = avgStanding > 0 ? ((avgApproach - avgStanding) / avgStanding) * 100 : 0;
  const avgLeft = calcAvg(data, 'leftLeg'), avgRight = calcAvg(data, 'rightLeg'), avgLeftF = calcAvg(data, 'leftForce'), avgRightF = calcAvg(data, 'rightForce');
  const jumpAsym = avgLeft && avgRight ? Math.abs(avgRight - avgLeft) / ((avgLeft + avgRight) / 2) * 100 : 0;
  const forceAsym = avgLeftF && avgRightF ? Math.abs(avgRightF - avgLeftF) / ((avgLeftF + avgRightF) / 2) * 100 : 0;
  const asymDir = avgRight > avgLeft ? 'right dominant' : avgLeft > avgRight ? 'left dominant' : 'balanced';
  const forceDir = avgRightF > avgLeftF ? 'right dominant' : avgLeftF > avgRightF ? 'left dominant' : 'balanced';
  const bw = profile?.bodyWeight || 80, latest = data[data.length - 1];
  const peakForce = estimateForce(latest.standingJump, bw, latest.gct), rfd = peakForce / latest.gct, relForce = peakForce / bw;
  const wowStanding = calcWoW(data, 'standingJump'), wowApproach = calcWoW(data, 'approachJump'), wowRSI = calcWoW(data, 'rsi');
  const sportBench = SPORT_BENCHMARKS[profile?.sport]?.positions?.[profile?.position];
  const weaknesses = [], strengths = [], recs = [];
  const hBenchAdv = sportBench?.jumpHeight?.advanced || BENCHMARKS.jumpHeight.advanced[g];
  const hBenchInt = hBenchAdv * 0.75;
  const rsiBenchAdv = sportBench?.rsi?.advanced || BENCHMARKS.rsi.advanced;
  const abBenchAdv = sportBench?.approachBonus?.advanced || BENCHMARKS.approachBonus.advanced;
  
  if (avgStanding < BENCHMARKS.jumpHeight.beginner[g]) { weaknesses.push({ area: 'Standing Jump', severity: 'high', value: `${avgStanding.toFixed(1)} cm`, benchmark: `${hBenchInt.toFixed(0)} cm`, message: 'Below beginner' }); recs.push('strength'); }
  else if (avgStanding < hBenchInt) { weaknesses.push({ area: 'Standing Jump', severity: 'medium', value: `${avgStanding.toFixed(1)} cm`, benchmark: `${hBenchInt.toFixed(0)} cm`, message: 'Building foundation' }); recs.push('strength', 'power'); }
  else if (avgStanding >= hBenchAdv) { strengths.push({ area: 'Standing Jump', value: `${avgStanding.toFixed(1)} cm`, benchmark: `${hBenchAdv} cm`, message: 'Excellent!' }); }
  
  if (avgRSI > 0 && avgRSI < BENCHMARKS.rsi.fair) { weaknesses.push({ area: 'RSI', severity: 'medium', value: avgRSI.toFixed(2), benchmark: '2.0', message: 'Progress plyos gradually' }); recs.push('plyometrics'); }
  else if (avgRSI >= rsiBenchAdv) { strengths.push({ area: 'RSI', value: avgRSI.toFixed(2), benchmark: rsiBenchAdv.toString(), message: 'Strong!' }); }
  
  const bonusRating = getBonusRating(bonus);
  const approachAnalysis = { bonus, rating: bonusRating, factors: bonusRating === 'poor' || bonusRating === 'fair' ? APPROACH_FACTORS.low : APPROACH_FACTORS.high, interpretation: bonusRating === 'poor' ? 'Very low - technique issues' : bonusRating === 'fair' ? 'Below average' : bonusRating === 'good' ? 'Good mechanics' : 'Excellent!' };
  if (bonusRating === 'poor' || bonusRating === 'fair') { weaknesses.push({ area: 'Approach Bonus', severity: bonusRating === 'poor' ? 'high' : 'medium', value: `${bonus.toFixed(1)}%`, benchmark: `${abBenchAdv}%+`, message: 'Improve mechanics' }); recs.push('approach'); }
  else if (bonusRating === 'elite' || bonusRating === 'advanced') { strengths.push({ area: 'Approach Bonus', value: `${bonus.toFixed(1)}%`, benchmark: `${abBenchAdv}%+`, message: 'Strong!' }); }
  
  if (jumpAsym > BENCHMARKS.asymmetry.danger) { weaknesses.push({ area: 'Jump Asymmetry', severity: 'high', value: `${jumpAsym.toFixed(1)}%`, benchmark: '<10%', message: `High risk - ${asymDir}` }); recs.push('unilateral'); }
  else if (jumpAsym > BENCHMARKS.asymmetry.warning) { weaknesses.push({ area: 'Jump Asymmetry', severity: 'medium', value: `${jumpAsym.toFixed(1)}%`, benchmark: '<10%', message: `Moderate - ${asymDir}` }); recs.push('unilateral'); }
  else if (jumpAsym <= BENCHMARKS.asymmetry.optimal) { strengths.push({ area: 'Bilateral Balance', value: `${jumpAsym.toFixed(1)}%`, benchmark: '<5%', message: 'Excellent symmetry!' }); }
  
  let level = 'beginner';
  if (avgStanding >= hBenchAdv && avgRSI >= rsiBenchAdv) level = 'advanced';
  else if (avgStanding >= hBenchInt) level = 'intermediate';
  
  let injuryRisk = 'low';
  if (jumpAsym > 20 || forceAsym > 20) injuryRisk = 'high';
  else if (jumpAsym > 15 || forceAsym > 15) injuryRisk = 'medium';
  
  return { success: true, data: { averages: { standingJump: avgStanding, approachJump: avgApproach, approachBonus: bonus, rsi: avgRSI, gct: avgGCT, leftLeg: avgLeft, rightLeg: avgRight, leftForce: avgLeftF, rightForce: avgRightF, jumpAsymmetry: jumpAsym, forceAsymmetry: forceAsym, asymmetryDirection: asymDir, forceDirection: forceDir, peakForce, rfd, relativeForce: relForce }, trends: { standing: wowStanding, approach: wowApproach, rsi: wowRSI }, weaknesses, strengths, recommendations: [...new Set(recs)], level, approachAnalysis, injuryRisk } };
};

// Plan Generator
const generatePlan = (analysis, profile, opts = {}) => {
  if (!analysis) return { success: false, error: 'No analysis' };
  const { level, recommendations } = analysis, { days = 3, weeks = 8 } = opts;
  const getFocus = (i, t) => t <= 2 ? (i === 0 ? 'Strength + Power' : 'Plyo + Balance') : ['Strength', 'Power + Plyo', 'Balance'][i % 3];
  const selectExercises = (focus, lv, hasUni) => {
    const sel = [], ok = (ex) => lv === 'beginner' ? ex.difficulty !== 'advanced' : true, f = focus.toLowerCase();
    if (f.includes('strength')) sel.push(...EXERCISES.strength.filter(ok).slice(0, 2));
    if (f.includes('power')) sel.push(...EXERCISES.power.filter(ok));
    if (f.includes('plyo')) sel.push(...EXERCISES.plyometrics.filter(ok).slice(0, 2));
    if (f.includes('balance') || hasUni) sel.push(...EXERCISES.unilateral.filter(ok).slice(0, 2));
    return sel.slice(0, 5);
  };
  const hasUni = recommendations.includes('unilateral'), workoutDays = [];
  for (let i = 0; i < Math.min(days, 4); i++) { const focus = getFocus(i, days); workoutDays.push({ dayNumber: i + 1, name: `Day ${i + 1}: ${focus}`, warmup: WARMUP, exercises: selectExercises(focus, level, hasUni), cooldown: COOLDOWN }); }
  return { success: true, data: { clientInfo: { name: profile.name, sport: profile.sport, level }, programOverview: { duration: `${weeks} weeks`, sessionsPerWeek: days, focus: recommendations.join(', ') || 'Balanced' }, workoutDays, currentMetrics: { standingJump: analysis.averages.standingJump.toFixed(1), approachJump: analysis.averages.approachJump.toFixed(1), approachBonus: analysis.averages.approachBonus.toFixed(1), rsi: analysis.averages.rsi.toFixed(2), jumpAsymmetry: analysis.averages.jumpAsymmetry.toFixed(1), forceAsymmetry: analysis.averages.forceAsymmetry.toFixed(1) } } };
};

// Main App
const LaunchLabsApp = () => {
  const [jumpData] = useState(SAMPLE_DATA);
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [plan, setPlan] = useState(null);
  const [planOpts, setPlanOpts] = useState({ days: 3, weeks: 8 });
  const [expandedDay, setExpandedDay] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const result = useMemo(() => analyze(jumpData, profile.gender, profile), [jumpData, profile]);
  const analysis = result.success ? result.data : null;

  const handleGenPlan = useCallback(() => { if (!analysis) return; setIsLoading(true); setTimeout(() => { const r = generatePlan(analysis, profile, planOpts); if (r.success) setPlan(r.data); else setError(r.error); setIsLoading(false); }, 300); }, [analysis, profile, planOpts]);
  const handleClientSelect = useCallback((c) => { setProfile(p => ({ ...p, ...c })); setPlan(null); setActiveTab(TABS.DASHBOARD); }, []);

  const progressData = useMemo(() => jumpData.map((d, i) => ({ ...d, session: i + 1 })), [jumpData]);
  const radarData = useMemo(() => analysis ? [{ metric: 'Standing', value: Math.min((analysis.averages.standingJump / 60) * 100, 100) }, { metric: 'Approach', value: Math.min((analysis.averages.approachJump / 75) * 100, 100) }, { metric: 'Bonus', value: Math.min((analysis.averages.approachBonus / 25) * 100, 100) }, { metric: 'RSI', value: Math.min((analysis.averages.rsi / 2.5) * 100, 100) }, { metric: 'Balance', value: Math.max(100 - analysis.averages.jumpAsymmetry * 5, 0) }, { metric: 'Force', value: Math.min((analysis.averages.relativeForce / 30) * 100, 100) }] : [], [analysis]);
  const jumpCompData = useMemo(() => analysis ? [{ name: 'Standing', value: analysis.averages.standingJump, fill: '#818cf8' }, { name: 'Approach', value: analysis.averages.approachJump, fill: '#34d399' }] : [], [analysis]);
  const asymTrendData = useMemo(() => jumpData.map((d, i) => ({ session: i + 1, jumpAsym: d.leftLeg && d.rightLeg ? Math.abs(d.rightLeg - d.leftLeg) / ((d.leftLeg + d.rightLeg) / 2) * 100 : 0, forceAsym: d.leftForce && d.rightForce ? Math.abs(d.rightForce - d.leftForce) / ((d.leftForce + d.rightForce) / 2) * 100 : 0 })), [jumpData]);

  if (!result.success) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center"><AlertCircle className="w-12 h-12 text-red-400" /><p className="ml-2">{result.error}</p></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-3">
      <div className="max-w-3xl mx-auto">
        <header className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="p-1.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg"><Zap className="w-4 h-4" /></div><div><h1 className="text-lg font-bold">LaunchLabs</h1><p className="text-xs text-slate-400">v2.1 Bilateral Edition</p></div></div>
          <div className="flex items-center gap-2"><div className="text-right text-xs"><p className="text-slate-400">Client</p><p className="text-indigo-300 font-semibold">{profile.name}</p></div><div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-bold text-xs">{profile.name.charAt(0)}</div></div>
        </header>

        <nav className="flex gap-1 mb-3 p-1 bg-slate-800/50 rounded-lg w-fit flex-wrap">{TAB_CONFIG.map(t => <TabButton key={t.id} {...t} isActive={activeTab === t.id} onClick={setActiveTab} />)}</nav>

        {error && <div className="mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" /><p className="text-xs text-red-300 flex-1">{error}</p><button onClick={() => setError(null)} className="text-red-400">×</button></div>}

        <main>
          {/* DASHBOARD */}
          {activeTab === TABS.DASHBOARD && analysis && (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2">
                <StatCard icon={Footprints} label="Standing" value={analysis.averages.standingJump.toFixed(1)} unit="cm" colorClass="bg-indigo-500/20 border-indigo-500/30" trend={analysis.trends.standing} />
                <StatCard icon={Wind} label="Approach" value={analysis.averages.approachJump.toFixed(1)} unit="cm" colorClass="bg-emerald-500/20 border-emerald-500/30" trend={analysis.trends.approach} />
                <div className="bg-violet-500/20 rounded-lg border border-violet-500/30 p-2"><div className="flex items-center gap-1 mb-0.5"><TrendingUp className="w-3 h-3 text-violet-400" /><p className="text-xs text-slate-400">Bonus</p></div><p className={`text-lg font-bold ${getBonusColor(analysis.averages.approachBonus)}`}>+{analysis.averages.approachBonus.toFixed(1)}%</p></div>
                <StatCard icon={Zap} label="RSI" value={analysis.averages.rsi.toFixed(2)} colorClass="bg-amber-500/20 border-amber-500/30" trend={analysis.trends.rsi} />
                <StatCard icon={Clock} label="GCT" value={(analysis.averages.gct * 1000).toFixed(0)} unit="ms" colorClass="bg-cyan-500/20 border-cyan-500/30" />
                <div className={`rounded-lg border p-2 ${getAsymBg(analysis.averages.jumpAsymmetry)}`}><div className="flex items-center gap-1 mb-0.5"><Scale className="w-3 h-3" /><p className="text-xs text-slate-400">Balance</p></div><p className={`text-lg font-bold ${getAsymColor(analysis.averages.jumpAsymmetry)}`}>{analysis.averages.jumpAsymmetry.toFixed(1)}%</p><p className="text-xs text-slate-500">{analysis.averages.asymmetryDirection}</p></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h3 className="text-xs font-semibold mb-1 flex items-center gap-1"><Gauge className="w-3 h-3 text-orange-400" />Force</h3><div className="grid grid-cols-2 gap-1 text-center text-xs"><div><p className="text-slate-400">Peak</p><p className="font-bold text-orange-300">{analysis.averages.peakForce.toFixed(0)} N</p></div><div><p className="text-slate-400">Rel</p><p className="font-bold text-orange-300">{analysis.averages.relativeForce.toFixed(1)} N/kg</p></div></div><div className="mt-1 text-center text-xs"><p className="text-slate-400">RFD</p><p className="font-bold text-orange-300">{(analysis.averages.rfd / 1000).toFixed(1)}k N/s</p></div></div>
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h3 className="text-xs font-semibold mb-1 flex items-center gap-1"><Scale className="w-3 h-3 text-blue-400" />L/R</h3><div className="space-y-1"><div className="flex justify-between text-xs"><span className="text-blue-400">L:{analysis.averages.leftLeg.toFixed(1)}</span><span className="text-slate-400">Jump</span><span className="text-orange-400">R:{analysis.averages.rightLeg.toFixed(1)}</span></div><div className="h-2 bg-slate-700 rounded-full flex"><div className="bg-blue-500 h-full rounded-l-full" style={{ width: `${(analysis.averages.leftLeg / (analysis.averages.leftLeg + analysis.averages.rightLeg)) * 100}%` }} /><div className="bg-orange-500 h-full rounded-r-full flex-1" /></div><div className="flex justify-between text-xs"><span className="text-blue-400">L:{analysis.averages.leftForce.toFixed(0)}</span><span className="text-slate-400">Force</span><span className="text-orange-400">R:{analysis.averages.rightForce.toFixed(0)}</span></div><div className="h-2 bg-slate-700 rounded-full flex"><div className="bg-blue-500 h-full rounded-l-full" style={{ width: `${(analysis.averages.leftForce / (analysis.averages.leftForce + analysis.averages.rightForce)) * 100}%` }} /><div className="bg-orange-500 h-full rounded-r-full flex-1" /></div></div><button onClick={() => setActiveTab(TABS.BILATERAL)} className="w-full mt-1 text-xs text-indigo-400 hover:text-indigo-300">Details →</button></div>
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h3 className="text-xs font-semibold mb-1 flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" />Risk</h3><RiskIndicator level={analysis.injuryRisk} label={analysis.injuryRisk === 'low' ? 'Low Risk' : analysis.injuryRisk === 'medium' ? 'Moderate' : 'Elevated'} desc={analysis.injuryRisk === 'low' ? 'Safe' : 'Monitor'} /><div className="mt-1 grid grid-cols-2 gap-1 text-xs text-center"><div className="p-1 bg-slate-700/30 rounded"><p className="text-slate-400">Jump Δ</p><p className={getAsymColor(analysis.averages.jumpAsymmetry)}>{analysis.averages.jumpAsymmetry.toFixed(1)}%</p></div><div className="p-1 bg-slate-700/30 rounded"><p className="text-slate-400">Force Δ</p><p className={getAsymColor(analysis.averages.forceAsymmetry)}>{analysis.averages.forceAsymmetry.toFixed(1)}%</p></div></div></div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h3 className="text-xs font-semibold mb-1">Standing vs Approach</h3><ResponsiveContainer width="100%" height={80}><BarChart data={jumpCompData} layout="vertical"><XAxis type="number" stroke="#94a3b8" fontSize={8} domain={[0, 80]} /><YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={8} width={50} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '10px' }} /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{jumpCompData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar></BarChart></ResponsiveContainer><p className={`text-center text-sm font-bold ${getBonusColor(analysis.averages.approachBonus)}`}>+{(analysis.averages.approachJump - analysis.averages.standingJump).toFixed(1)} cm</p></div>
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h3 className="text-xs font-semibold mb-1">Performance Radar</h3><ResponsiveContainer width="100%" height={100}><RadarChart data={radarData}><PolarGrid stroke="#475569" /><PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={7} /><PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" tick={false} /><Radar dataKey="value" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} /></RadarChart></ResponsiveContainer></div>
              </div>

              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h3 className="text-xs font-semibold mb-1">Progress</h3><ResponsiveContainer width="100%" height={80}><LineChart data={progressData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="session" stroke="#94a3b8" fontSize={8} /><YAxis stroke="#94a3b8" fontSize={8} domain={['dataMin - 5', 'dataMax + 5']} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '10px' }} /><Line type="monotone" dataKey="standingJump" stroke="#818cf8" strokeWidth={2} dot={{ r: 2 }} /><Line type="monotone" dataKey="approachJump" stroke="#34d399" strokeWidth={2} dot={{ r: 2 }} /><Line type="monotone" dataKey="leftLeg" stroke="#3b82f6" strokeWidth={1} strokeDasharray="3 3" dot={false} /><Line type="monotone" dataKey="rightLeg" stroke="#f97316" strokeWidth={1} strokeDasharray="3 3" dot={false} /></LineChart></ResponsiveContainer><div className="flex justify-center gap-2 mt-1 text-xs"><span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-indigo-400" />Stand</span><span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-400" />App</span><span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400" />L</span><span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-400" />R</span></div></div>

              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h3 className="text-xs font-semibold mb-2">Quick Actions</h3><div className="grid grid-cols-5 gap-1">{[{ id: TABS.BILATERAL, label: 'Balance', icon: Scale, color: 'blue' }, { id: TABS.APPROACH, label: 'Approach', icon: Wind, color: 'emerald' }, { id: TABS.ANALYSIS, label: 'Analysis', icon: Target, color: 'indigo' }, { id: TABS.PLAN, label: 'Plan', icon: FileText, color: 'violet' }, { id: TABS.CLIENTS, label: 'Clients', icon: Users, color: 'cyan' }].map(a => (<button key={a.id} onClick={() => setActiveTab(a.id)} className="p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 text-center"><a.icon className={`w-4 h-4 mx-auto mb-0.5 text-${a.color}-400`} /><p className="text-xs">{a.label}</p></button>))}</div></div>
            </div>
          )}

          {/* BILATERAL BALANCE TAB */}
          {activeTab === TABS.BILATERAL && analysis && (
            <div className="space-y-3">
              <SectionHeader icon={Scale} title="Bilateral Balance Analysis" subtitle="Left vs Right comparison" color="blue" />
              <RiskIndicator level={analysis.injuryRisk} label={`Injury Risk: ${analysis.injuryRisk.charAt(0).toUpperCase() + analysis.injuryRisk.slice(1)}`} desc={analysis.injuryRisk === 'low' ? 'Within optimal range' : analysis.injuryRisk === 'medium' ? 'Include unilateral exercises' : 'Prioritize corrective work'} />
              <BalanceIndicator leftValue={analysis.averages.leftLeg} rightValue={analysis.averages.rightLeg} label="Jump Height" unit="cm" />
              <BalanceIndicator leftValue={analysis.averages.leftForce} rightValue={analysis.averages.rightForce} label="Force Production" unit="N" />
              <div className="grid grid-cols-4 gap-2">
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 text-center"><p className="text-xs text-slate-400">Jump Asym</p><p className={`text-2xl font-bold ${getAsymColor(analysis.averages.jumpAsymmetry)}`}>{analysis.averages.jumpAsymmetry.toFixed(1)}%</p><p className="text-xs text-slate-500">Target: &lt;10%</p></div>
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 text-center"><p className="text-xs text-slate-400">Force Asym</p><p className={`text-2xl font-bold ${getAsymColor(analysis.averages.forceAsymmetry)}`}>{analysis.averages.forceAsymmetry.toFixed(1)}%</p><p className="text-xs text-slate-500">Target: &lt;10%</p></div>
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 text-center"><p className="text-xs text-slate-400">Height Diff</p><p className="text-2xl font-bold">{Math.abs(analysis.averages.rightLeg - analysis.averages.leftLeg).toFixed(1)} cm</p><p className="text-xs text-slate-500">{analysis.averages.asymmetryDirection}</p></div>
                <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3 text-center"><p className="text-xs text-slate-400">Force Diff</p><p className="text-2xl font-bold">{Math.abs(analysis.averages.rightForce - analysis.averages.leftForce).toFixed(0)} N</p><p className="text-xs text-slate-500">{analysis.averages.forceDirection}</p></div>
              </div>
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3"><h3 className="text-sm font-semibold mb-2">Asymmetry Trend</h3><ResponsiveContainer width="100%" height={100}><ComposedChart data={asymTrendData}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="session" stroke="#94a3b8" fontSize={8} /><YAxis stroke="#94a3b8" fontSize={8} domain={[0, 20]} tickFormatter={v => `${v}%`} /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', fontSize: '10px' }} formatter={v => `${v.toFixed(1)}%`} /><ReferenceLine y={10} stroke="#f59e0b" strokeDasharray="5 5" /><Line type="monotone" dataKey="jumpAsym" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} /><Line type="monotone" dataKey="forceAsym" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} /></ComposedChart></ResponsiveContainer><div className="flex justify-center gap-4 mt-1 text-xs"><span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500" />Jump</span><span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500" />Force</span><span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-amber-500" />10%</span></div></div>
              {analysis.averages.jumpAsymmetry > 10 && (<div className="bg-amber-500/10 rounded-xl border border-amber-500/30 p-3"><h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" />Corrective Exercises</h3><div className="grid grid-cols-2 gap-2">{EXERCISES.unilateral.map((ex, i) => (<div key={i} className="p-2 bg-slate-800/50 rounded-lg"><p className="text-xs font-semibold">{ex.name}</p><p className="text-xs text-slate-400">{ex.sets} × {ex.reps}</p></div>))}</div></div>)}
            </div>
          )}

          {/* CLIENTS */}
          {activeTab === TABS.CLIENTS && (<div className="space-y-2"><div className="grid grid-cols-4 gap-2"><StatCard icon={Users} label="Clients" value={CLIENTS.length} colorClass="bg-indigo-500/20 border-indigo-500/30" /><StatCard icon={Footprints} label="Avg Stand" value={(CLIENTS.reduce((a, c) => a + c.standingJump, 0) / CLIENTS.length).toFixed(0)} unit="cm" colorClass="bg-emerald-500/20 border-emerald-500/30" /><StatCard icon={Wind} label="Avg App" value={(CLIENTS.reduce((a, c) => a + c.approachJump, 0) / CLIENTS.length).toFixed(0)} unit="cm" colorClass="bg-cyan-500/20 border-cyan-500/30" /><StatCard icon={Scale} label="Avg Bal" value={`${(CLIENTS.reduce((a, c) => a + Math.abs(c.rightLeg - c.leftLeg) / ((c.leftLeg + c.rightLeg) / 2) * 100, 0) / CLIENTS.length).toFixed(1)}%`} colorClass="bg-blue-500/20 border-blue-500/30" /></div><div className="bg-slate-800/30 rounded-xl border border-slate-700/50 divide-y divide-slate-700/50">{CLIENTS.map(c => { const bonus = ((c.approachJump - c.standingJump) / c.standingJump * 100), asym = Math.abs(c.rightLeg - c.leftLeg) / ((c.leftLeg + c.rightLeg) / 2) * 100; return (<button key={c.id} onClick={() => handleClientSelect(c)} className={`w-full p-2 hover:bg-slate-700/20 flex items-center gap-2 text-left ${profile.id === c.id ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : ''}`}><div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center font-bold text-xs">{c.name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="font-semibold text-xs truncate">{c.name}</p><p className="text-xs text-slate-400 capitalize">{c.sport}</p></div><div className="text-center px-1"><p className="text-xs text-slate-400">Stand</p><p className="text-sm font-bold text-indigo-300">{c.standingJump}</p></div><div className="text-center px-1"><p className="text-xs text-slate-400">App</p><p className="text-sm font-bold text-emerald-300">{c.approachJump}</p></div><div className="text-center px-1"><p className="text-xs text-slate-400">Bonus</p><p className={`text-sm font-bold ${getBonusColor(bonus)}`}>+{bonus.toFixed(0)}%</p></div><div className="text-center px-1"><p className="text-xs text-slate-400">Bal</p><p className={`text-sm font-bold ${getAsymColor(asym)}`}>{asym.toFixed(0)}%</p></div><ChevronRight className="w-3 h-3 text-slate-500" /></button>); })}</div></div>)}

          {/* ANALYSIS */}
          {activeTab === TABS.ANALYSIS && analysis && (<div className="space-y-3"><SectionHeader icon={Target} title="Performance Analysis" subtitle={`Level: ${analysis.level}`} color="indigo" />{analysis.weaknesses.length > 0 && (<div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3"><h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" />Areas to Improve</h3><div className="space-y-2">{analysis.weaknesses.map((w, i) => (<div key={i} className={`p-2 rounded-lg border ${getSevClasses(w.severity)}`}><div className="flex justify-between"><div><p className="font-semibold text-xs">{w.area}</p><p className="text-xs opacity-80">{w.message}</p></div><div className="text-right"><p className="text-xs font-bold">{w.value}</p><p className="text-xs opacity-60">Target: {w.benchmark}</p></div></div></div>))}</div></div>)}{analysis.strengths.length > 0 && (<div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3"><h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" />Strengths</h3><div className="space-y-2">{analysis.strengths.map((s, i) => (<div key={i} className="p-2 rounded-lg border bg-emerald-500/10 border-emerald-500/20"><div className="flex justify-between"><div><p className="font-semibold text-xs text-emerald-300">{s.area}</p><p className="text-xs text-emerald-200/80">{s.message}</p></div><p className="text-xs font-bold text-emerald-400">{s.value}</p></div></div>))}</div></div>)}{analysis.recommendations.length > 0 && (<div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3"><h3 className="text-sm font-semibold mb-2">Training Focus</h3><div className="flex flex-wrap gap-2 mb-3">{analysis.recommendations.map((r, i) => <span key={i} className="px-3 py-1 bg-indigo-500/20 rounded-full text-xs capitalize">{r}</span>)}</div><button onClick={() => setActiveTab(TABS.PLAN)} className="w-full py-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg text-xs font-semibold hover:opacity-90">Generate Plan →</button></div>)}</div>)}

          {/* APPROACH */}
          {activeTab === TABS.APPROACH && analysis && (<div className="space-y-3"><div className={`rounded-xl border p-3 ${getRatingClasses(analysis.approachAnalysis.rating)}`}><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><Wind className="w-5 h-5" /><div><h3 className="font-bold">Approach Analysis</h3><p className="text-xs opacity-80 capitalize">{analysis.approachAnalysis.rating}</p></div></div><div className="text-right"><p className={`text-2xl font-bold ${getBonusColor(analysis.averages.approachBonus)}`}>+{analysis.averages.approachBonus.toFixed(1)}%</p><p className="text-xs opacity-80">{analysis.averages.standingJump.toFixed(1)} → {analysis.averages.approachJump.toFixed(1)} cm</p></div></div><p className="text-sm">{analysis.approachAnalysis.interpretation}</p></div><div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3"><h3 className="text-sm font-semibold mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-amber-400" />Key Factors</h3><div className="space-y-2">{analysis.approachAnalysis.factors.map((f, i) => (<div key={i} className={`p-2 rounded-lg ${f.exercises ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}><div className="flex items-start gap-2">{f.exercises ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5" /> : <Check className="w-4 h-4 text-emerald-400 mt-0.5" />}<div><p className="font-semibold text-xs">{f.factor}</p><p className="text-xs text-slate-400">{f.description}</p></div></div></div>))}</div></div></div>)}

          {/* PLAN */}
          {activeTab === TABS.PLAN && (<div className="space-y-2"><SectionHeader icon={FileText} title="Personalized Plan" subtitle="AI-generated" color="violet" />{isLoading ? <div className="flex justify-center py-8"><Loader className="w-8 h-8 text-indigo-400 animate-spin" /></div> : !plan ? (<div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-3"><h3 className="text-xs font-semibold mb-2">Configure</h3><div className="grid grid-cols-2 gap-3 mb-3"><div><label className="text-xs text-slate-400 block mb-1">Days/Week</label><div className="flex gap-1">{[2, 3, 4].map(d => <button key={d} onClick={() => setPlanOpts(p => ({ ...p, days: d }))} className={`flex-1 py-2 rounded text-xs font-medium ${planOpts.days === d ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-slate-700/50 text-slate-400'}`}>{d}</button>)}</div></div><div><label className="text-xs text-slate-400 block mb-1">Weeks</label><div className="flex gap-1">{[4, 6, 8].map(w => <button key={w} onClick={() => setPlanOpts(p => ({ ...p, weeks: w }))} className={`flex-1 py-2 rounded text-xs font-medium ${planOpts.weeks === w ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-slate-700/50 text-slate-400'}`}>{w}</button>)}</div></div></div><button onClick={handleGenPlan} className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90"><Zap className="w-4 h-4" />Generate</button></div>) : (<><div className="bg-emerald-500/10 rounded-xl border border-emerald-500/30 p-3"><div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-emerald-400" /><h3 className="font-semibold">Plan Generated!</h3></div><div className="grid grid-cols-3 gap-2 text-center text-xs"><div><p className="text-slate-400">Duration</p><p className="font-bold">{plan.programOverview.duration}</p></div><div><p className="text-slate-400">Days/Week</p><p className="font-bold">{plan.programOverview.sessionsPerWeek}</p></div><div><p className="text-slate-400">Focus</p><p className="font-bold capitalize">{plan.programOverview.focus}</p></div></div></div><div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-2"><h4 className="text-xs font-semibold mb-2">Metrics</h4><div className="grid grid-cols-6 gap-1 text-center text-xs"><div><p className="text-slate-400">Stand</p><p className="font-bold text-indigo-300">{plan.currentMetrics.standingJump}</p></div><div><p className="text-slate-400">App</p><p className="font-bold text-emerald-300">{plan.currentMetrics.approachJump}</p></div><div><p className="text-slate-400">Bonus</p><p className={`font-bold ${getBonusColor(parseFloat(plan.currentMetrics.approachBonus))}`}>+{plan.currentMetrics.approachBonus}%</p></div><div><p className="text-slate-400">RSI</p><p className="font-bold text-amber-300">{plan.currentMetrics.rsi}</p></div><div><p className="text-slate-400">Jump Δ</p><p className={`font-bold ${getAsymColor(parseFloat(plan.currentMetrics.jumpAsymmetry))}`}>{plan.currentMetrics.jumpAsymmetry}%</p></div><div><p className="text-slate-400">Force Δ</p><p className={`font-bold ${getAsymColor(parseFloat(plan.currentMetrics.forceAsymmetry))}`}>{plan.currentMetrics.forceAsymmetry}%</p></div></div></div><div className="space-y-1"><h4 className="font-bold text-sm">Schedule</h4>{plan.workoutDays.map((day, di) => (<ExpandableCard key={di} title={day.name} subtitle={`${day.exercises.length} exercises`} badge={day.dayNumber} isExpanded={expandedDay === di} onToggle={() => setExpandedDay(expandedDay === di ? null : di)}><div className="space-y-2"><div><h5 className="text-xs text-amber-400 font-semibold mb-1">🔥 Warmup</h5><div className="flex flex-wrap gap-1">{day.warmup.map((w, i) => <span key={i} className="px-1.5 py-0.5 bg-amber-500/10 rounded text-xs">{w.name}</span>)}</div></div><div><h5 className="text-xs text-indigo-400 font-semibold mb-1">💪 Main</h5><div className="space-y-1">{day.exercises.map((ex, i) => (<div key={i} className="p-1.5 bg-slate-700/30 rounded-lg flex items-center gap-2"><span className="w-5 h-5 bg-indigo-500/20 text-indigo-400 rounded flex items-center justify-center text-xs font-bold">{i + 1}</span><div className="flex-1 min-w-0"><p className="text-xs font-semibold truncate">{ex.name}</p><p className="text-xs text-slate-400">{ex.sets} × {ex.reps}</p></div><span className={`text-xs px-1.5 py-0.5 rounded ${getDiffClasses(ex.difficulty)}`}>{ex.difficulty}</span></div>))}</div></div><div><h5 className="text-xs text-cyan-400 font-semibold mb-1">❄️ Cooldown</h5><div className="flex flex-wrap gap-1">{day.cooldown.map((c, i) => <span key={i} className="px-1.5 py-0.5 bg-cyan-500/10 rounded text-xs">{c.name}</span>)}</div></div></div></ExpandableCard>))}</div><button onClick={() => setPlan(null)} className="px-3 py-2 bg-slate-700/50 rounded-lg text-xs flex items-center gap-1 hover:bg-slate-700"><RefreshCw className="w-3 h-3" />Regenerate</button></>)}</div>)}
        </main>

        <footer className="mt-4 pt-3 border-t border-slate-800 text-center"><p className="text-xs text-slate-500">LaunchLabs v2.1 • Bilateral Balance Edition</p></footer>
      </div>
    </div>
  );
};

export default function App() { return <ErrorBoundary><LaunchLabsApp /></ErrorBoundary>; }
