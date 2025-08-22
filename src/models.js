import { saveState, loadState } from './storage.js';
import { applyGamificationOnCompletion, recalcAll } from './rewards.js';

export const defaultState = () => ({
  created: Date.now(),
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
saveState(state);

export function todayId(d = new Date()){
  return d.toISOString().slice(0,10);
}

export function getHabit(id){
  return state.habits.find(h => h.id === id);
}

export function addHabit(data){
  const habit = {
    id: crypto.randomUUID(),
    name: data.name.trim(),
    description: data.description?.trim() || '',
    days: data.days.map(Number).sort(),
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

export function pruneTempFlags(){}

export function recalc(){
  recalcAll(state);
  saveState(state);
}