import { saveState, loadState } from './storage.js';
import { applyGamificationOnCompletion, recalcAll } from './rewards.js';
import { STARTER_PACK, getTemplateById } from './templates.js';

export const defaultState = () => ({
  created: Date.now(),
  version: 2,
  seededStarterPack: false,
  habits: [],
  gamification: {
    xp: 0,
    level: 1,
    achievements: [],
    totalCompletions: 0,
    daily: { date: todayId(), xp:0, completions:0 }
  }
});

export let state = loadState() || defaultState();
// Seed starter pack if first run (no habits yet)
if(!state.habits.length && !state.seededStarterPack){
  STARTER_PACK.map(getTemplateById).filter(Boolean).forEach(t => {
    state.habits.push({
      id: crypto.randomUUID(),
      name: t.name,
      description: t.description,
      scheduleType: 'daysOfWeek',
      days: [...t.days],
      target: t.target,
      history:{}, streak:0, bestStreak:0
    });
  });
  state.seededStarterPack = true;
}
saveState(state);

export function todayId(d = new Date()){
  return d.toISOString().slice(0,10);
}

export function getHabit(id){
  return state.habits.find(h => h.id === id);
}

export function addHabit(data){
  const scheduleType = data.scheduleType === 'timesPerWeek' ? 'timesPerWeek' : 'daysOfWeek';
  const habit = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    description: data.description?.trim() || '',
    scheduleType,
    days: scheduleType === 'daysOfWeek' ? data.days.map(Number).sort() : [],
    timesPerWeek: scheduleType === 'timesPerWeek' ? Number(data.timesPerWeek)||3 : undefined,
    target: Number(data.target)||1,
    history:{}, streak:0, bestStreak:0
  };
  state.habits.push(habit);
  saveState(state);
  return habit;
}

export function updateHabit(id, patch){
  const h = getHabit(id);
  if(!h) return;
  Object.assign(h, patch);
  saveState(state);
  return h;
}

export function deleteHabit(id){
  state.habits = state.habits.filter(h=>h.id!==id);
  saveState(state);
}

export function completeHabit(id, amount=1){
  const h = getHabit(id);
  if(!h) return null;
  const day = todayId();
  const before = h.history[day] || 0;
  const after = before + amount;
  h.history[day] = after;
  let firstTargetHit = false;
  if(before < h.target && after >= h.target){
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yId = todayId(yesterday);
    const prevDone = h.history[yId] && h.history[yId] >= h.target;
    h.streak = prevDone ? (h.streak+1) : 1;
    if(h.streak > h.bestStreak) h.bestStreak = h.streak;
    firstTargetHit = true;
  }
  saveState(state);
  return applyGamificationOnCompletion(state, h, firstTargetHit);
}

// Week utilities for timesPerWeek scheduling
export function weekId(d=new Date()){
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  return `${date.getUTCFullYear()}-${weekNo}`;
}

export function completionsThisWeek(h){
  let total = 0;
  for(let i=0;i<7;i++){
    const d = new Date(); d.setDate(d.getDate()-i);
    const id = todayId(d);
    total += (h.history[id]||0) >= h.target ? 1 : 0;
  }
  return total;
}

export function pruneTempFlags(){}

export function recalc(){
  recalcAll(state);
  saveState(state);
}