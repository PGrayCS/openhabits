// Minimal port of existing vanilla state logic (no TS yet) for initial SvelteKit integration.
import { browser } from '$app/environment';

const KEY = 'openhabits:v1';

export function todayId(d=new Date()){return d.toISOString().slice(0,10);} 

export function defaultState(){
  return {
    created: Date.now(),
    version: 2,
    seededStarterPack: false,
    habits: [],
    gamification: { xp:0, level:1, achievements: [], totalCompletions:0, daily:{ date: todayId(), xp:0, completions:0 } }
  };
}

export function load(){
  if(!browser) return defaultState();
  try{ const raw = localStorage.getItem(KEY); return raw? JSON.parse(raw): defaultState(); }catch{ return defaultState(); }
}
export function save(state){ if(browser){ const clone = structuredClone(state); clone._lastSaved = Date.now(); localStorage.setItem(KEY, JSON.stringify(clone)); }}

export const state = load();

function seedStarter(){
  if(state.seededStarterPack || state.habits.length) return;
  const templates=[
    { name:'Hydration', description:'Drink a glass of water', days:[0,1,2,3,4,5,6], target:1 },
    { name:'Reading', description:'Read 10 pages', days:[1,2,3,4,5], target:1 },
    { name:'Mindfulness', description:'5 min mindfulness', days:[0,2,4,6], target:1 }
  ];
  templates.forEach(t=> state.habits.push({ id:crypto.randomUUID(), name:t.name, description:t.description, scheduleType:'daysOfWeek', days:t.days, target:t.target, history:{}, streak:0, bestStreak:0 }));
  state.seededStarterPack = true; save(state);
}
seedStarter();

export function addHabit(data){
  const scheduleType = data.scheduleType === 'timesPerWeek' ? 'timesPerWeek':'daysOfWeek';
  const habit = { id: crypto.randomUUID(), name: data.name.trim(), description:data.description?.trim()||'', scheduleType, days: scheduleType==='daysOfWeek'? data.days.map(Number).sort():[], timesPerWeek: scheduleType==='timesPerWeek'? Number(data.timesPerWeek)||3: undefined, target:Number(data.target)||1, history:{}, streak:0, bestStreak:0 };
  state.habits.push(habit); save(state); return habit;
}

export function completeHabit(id){
  const h = state.habits.find(x=>x.id===id); if(!h) return;
  const day = todayId();
  const before = h.history[day]||0; h.history[day]= before+1;
  if(before < h.target && h.history[day] >= h.target){
    const y = new Date(); y.setDate(y.getDate()-1); const yId = todayId(y);
    const prevMet = h.history[yId] && h.history[yId] >= h.target;
    h.streak = prevMet ? h.streak+1 : 1;
    if(h.streak > h.bestStreak) h.bestStreak = h.streak;
  }
  save(state);
}

export function completionsThisWeek(h){
  let total=0; for(let i=0;i<7;i++){ const d=new Date(); d.setDate(d.getDate()-i); const id=todayId(d); total += (h.history[id]||0) >= h.target ? 1:0; } return total;
}
