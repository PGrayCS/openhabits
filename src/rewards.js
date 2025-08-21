import { todayId } from './models.js';

export function xpForLevel(l){
  return Math.floor(50 * l * l * 0.5);
}

export function levelForXp(xp){
  let lvl = 1;
  while(xp >= xpForLevel(lvl+1)) lvl++;
  return lvl;
}

export const achievementsCatalog = [
  { id:'first_complete', title:'First Step', desc:'Complete a habit for the first time.', xp:20 },
  { id:'streak_3', title:'On A Roll', desc:'Reach a 3‑day streak.', xp:40 },
  { id:'streak_7', title:'One Week Warrior', desc:'Reach a 7‑day streak.', xp:80 },
  { id:'streak_30', title:'Month Machine', desc:'Reach a 30‑day streak.', xp:200 },
  { id:'early_bird', title:'Early Bird', desc:'Complete a habit before 9:00 local time.', xp:30 },
  { id:'hundred_completions', title:'Century', desc:'Log 100 total habit completions.', xp:150 },
  { id:'daily_5', title:'Quest Crusher', desc:'Finish 5 daily quests in one day.', xp:100 },
];

export function hasAch(state,id){
  return state.gamification.achievements.some(a=>a.id===id);
}

export function unlock(state, id){
  if(hasAch(state,id)) return false;
  const def = achievementsCatalog.find(a=>a.id===id);
  if(!def) return false;
  state.gamification.achievements.push({id, unlockedAt: Date.now()});
  grantXp(state, def.xp);
  return def;
}

export function grantXp(state, amount){
  state.gamification.xp += amount;
  const newLevel = levelForXp(state.gamification.xp);
  if(newLevel !== state.gamification.level){
    state.gamification.level = newLevel;
    return { leveled: true, level:newLevel };
  }
  return { leveled:false };
}

export function applyGamificationOnCompletion(state, habit){
  state.gamification.totalCompletions++;
  const today = todayId();
  if(state.gamification.daily.date !== today){
    state.gamification.daily = { date: today, xp:0, completions:0 };
  }
  if(habit.history[today] >= habit.target && habit._counted){
    let baseXp = 10 + Math.min(habit.bestStreak, 30);
    state.gamification.daily.completions++;
    state.gamification.daily.xp += baseXp;
    const res = grantXp(state, baseXp);
    if(state.gamification.totalCompletions === 1) unlock(state,'first_complete');
    if(habit.bestStreak === 3) unlock(state,'streak_3');
    if(habit.bestStreak === 7) unlock(state,'streak_7');
    if(habit.bestStreak === 30) unlock(state,'streak_30');
    if(state.gamification.totalCompletions === 100) unlock(state,'hundred_completions');
    if(state.gamification.daily.completions === 5) unlock(state,'daily_5');
    const hour = new Date().getHours();
    if(hour < 9) unlock(state,'early_bird');
    return { xp: baseXp, leveled: res.leveled, level: res.level };
  }
  return { xp:0, leveled:false };
}

export function recalcAll(state){
  state.gamification.level = levelForXp(state.gamification.xp);
}