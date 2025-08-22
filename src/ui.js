import { state, todayId, addHabit, completeHabit } from './models.js';
import { achievementsCatalog, xpForLevel } from './rewards.js';
import { saveState, exportState, importState } from './storage.js';

const els = {};

export function initUI(){
  els.habits = document.getElementById('habits');
  els.habitDialog = document.getElementById('habit-dialog');
  els.habitForm = document.getElementById('habit-form');
  els.level = document.getElementById('level');
  els.xp = document.getElementById('xp');
  els.toast = document.getElementById('toast');
  els.statsPanel = document.getElementById('stats-panel');
  els.achPanel = document.getElementById('achievements-panel');
  els.achContent = document.getElementById('achievements-content');
  els.statsContent = document.getElementById('stats-content');
  els.streaksSummary = document.getElementById('streaks-summary');
  els.dailyQuests = document.getElementById('daily-quests');
  els.dailyXp = document.getElementById('daily-xp');
  els.confetti = document.getElementById('confetti');
  els.levelProgressBar = document.getElementById('level-progress-ring');
  els.levelProgressLabel = document.getElementById('level-progress-label');
  els.todayDate = document.getElementById('today-date');
  if(els.todayDate){
    const d = new Date();
    els.todayDate.textContent = d.toLocaleDateString(undefined,{weekday:'long', month:'short', day:'numeric'});
  }

  const themeBtn = document.getElementById('btn-theme');
  if(themeBtn){ themeBtn.addEventListener('click', toggleTheme); }
  initTheme();

  document.getElementById('btn-add-habit').addEventListener('click', () => openHabitDialog());
  document.getElementById('btn-stats').addEventListener('click',()=> togglePanel(els.statsPanel));
  document.getElementById('btn-achievements').addEventListener('click',()=> togglePanel(els.achPanel));
  document.getElementById('btn-export').addEventListener('click',()=> exportState(state));
  document.getElementById('import-file').addEventListener('change', async e => {
    if(e.target.files[0]){
      try { Object.assign(state, await importState(e.target.files[0])); showToast('Imported backup'); renderAll(); }
      catch(err){ showToast('Import failed'); }
      e.target.value='';
    }
  });

  els.habitForm.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(els.habitForm);
    const days = fd.getAll('days');
    if(days.length===0){ showToast('Select at least one day'); return; }
    const name = (fd.get('name')||'').trim();
    if(!name){ showToast('Name required'); return; }
    addHabit({
      name,
      description: fd.get('description'),
      days,
      target: fd.get('target')
    });
    els.habitDialog.close();
    showToast('Habit added');
    renderHabits();
    renderStats();
  });

  // (legacy) no beforeunload cleanup needed anymore
  renderAll();
  setupConfetti();
}

function togglePanel(panel){
  const panels = [els.statsPanel, els.achPanel];
  panels.forEach(p=> p.hidden = (p!==panel) ? true : !p.hidden);
  if(panel===els.achPanel && !panel.hidden) renderAchievements();
  if(panel===els.statsPanel && !panel.hidden) renderStats();
}

function openHabitDialog(){
  els.habitForm.reset();
  els.habitDialog.showModal();
}

function dayName(i){
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i];
}

export function renderHabits(){
  const today = new Date();
  const todayIdStr = todayId(today);
  const container = els.habits;
  if(state.habits.length===0){ container.textContent='No habits yet – add one!'; container.classList.add('empty-msg'); return; }
  container.classList.remove('empty-msg');
  container.innerHTML='';
  state.habits.forEach(h => {
    const card = document.createElement('div');
    card.className='habit-card';
    const doneToday = h.history[todayIdStr] || 0;
    if(doneToday >= h.target) card.classList.add('completed-today');
    card.innerHTML = `
      <h3>${escapeHtml(h.name)}</h3>
      <div class="desc">${escapeHtml(h.description)}</div>
      <div class="streak">🔥 ${h.streak || 0} (best ${h.bestStreak||0})</div>
      <div class="streak">Days: ${h.days.map(dayName).join(', ')}</div>
      <div class="streak">Progress: ${doneToday}/${h.target}</div>
      <div class="habit-actions"></div>
    `;
    const actions = card.querySelector('.habit-actions');
    const btn = document.createElement('button');
    btn.textContent = doneToday >= h.target ? 'Done' : '+1';
    btn.className = doneToday >= h.target ? '' : 'do';
    btn.addEventListener('click', ()=>{
      if(doneToday >= h.target) return;
      const res = completeHabit(h.id,1);
      saveState(state);
      renderAll();
      if(res && res.leveled) levelConfetti();
    });
    actions.appendChild(btn);
    container.appendChild(card);
  });
  renderStreakSummary();
}

function renderStreakSummary(){
  const top = [...state.habits].sort((a,b)=> (b.streak||0) - (a.streak||0)).slice(0,5);
  els.streaksSummary.innerHTML = top.map(h=> `<span>${escapeHtml(h.name)}: 🔥${h.streak||0}</span>`).join('');
}

function renderAchievements(){
  const unlocked = new Set(state.gamification.achievements.map(a=>a.id));
  els.achContent.innerHTML = '';
  achievementsCatalog.forEach(def => {
    const div = document.createElement('div');
    const isUnlocked = unlocked.has(def.id);
    const details = state.gamification.achievements.find(a=>a.id===def.id);
    div.className = 'achievement'+(isUnlocked?' unlocked':'');
    div.innerHTML = `
      <div class="title">${def.title}</div>
      <div class="body">${def.desc}</div>
      <div class="reward">Reward: ${def.xp} XP</div>
      ${isUnlocked? `<div class="date">${new Date(details.unlockedAt).toLocaleDateString()}</div>`:''}
    `;
    els.achContent.appendChild(div);
  });
}

function renderStats(){
  const total = state.gamification.totalCompletions;
  const avgStreak = state.habits.length ? (state.habits.reduce((a,h)=> a+(h.streak||0),0)/state.habits.length).toFixed(1) : 0;
  const daysActive = Math.ceil((Date.now() - state.created)/(86400e3));
  els.statsContent.innerHTML = `
    <p>Total completions: <strong>${total}</strong></p>
    <p>Habits: ${state.habits.length}</p>
    <p>Avg current streak: ${avgStreak}</p>
    <p>Days since start: ${daysActive}</p>
  `;
}

function renderDailyQuests(){
  const today = new Date();
  const weekday = today.getDay();
  const due = state.habits.filter(h => h.days.includes(weekday));
  const container = els.dailyQuests;
  if(due.length===0){ container.textContent='No quests today'; container.classList.add('empty-msg'); return; }
  container.classList.remove('empty-msg');
  container.innerHTML='';
  due.forEach(h=>{
    const div = document.createElement('div');
    const todayStr = todayId();
    const done = h.history[todayStr] || 0;
    div.className = 'habit-card';
    if(done>=h.target) div.classList.add('completed-today');
    div.innerHTML = `
      <h3>${escapeHtml(h.name)}</h3>
      <div class="desc">${escapeHtml(h.description)}</div>
      <div class="streak">${done}/${h.target}</div>
      <div class="habit-actions"></div>`;
    const btn = document.createElement('button');
    btn.textContent = done>=h.target ? '✓' : '+1';
    btn.className = done>=h.target? '' : 'do';
    btn.addEventListener('click',()=> {
      if(done>=h.target) return;
      const res = completeHabit(h.id,1);
      saveState(state);
      renderAll();
      if(res && res.leveled) levelConfetti();
    });
    div.querySelector('.habit-actions').appendChild(btn);
    container.appendChild(div);
  });
  els.dailyXp.textContent = `(${state.gamification.daily.xp} XP today)`;
}

export function renderAll(){
  renderHabits();
  renderDailyQuests();
  renderAchievements();
  els.level.textContent = state.gamification.level;
  els.xp.textContent = state.gamification.xp;
  renderLevelProgress();
  return {};
}

function showToast(msg){
  if(els.toast.open) els.toast.close();
  els.toast.textContent = msg;
  els.toast.show();
  setTimeout(()=> { if(els.toast.open) els.toast.close(); }, 2200);
}

let confettiCtx; let pieces=[]; let raf;
function setupConfetti(){
  confettiCtx = els.confetti.getContext('2d');
  window.addEventListener('resize', resizeConfetti);
  resizeConfetti();
}
function resizeConfetti(){
  els.confetti.width = window.innerWidth;
  els.confetti.height = window.innerHeight;
}
export function levelConfetti(){
  pieces = Array.from({length:180},()=> ({
    x: Math.random()*els.confetti.width,
    y: -20 - Math.random()*els.confetti.height*0.3,
    r: 4+Math.random()*4,
    c: randomColor(),
    vy: 3+Math.random()*4,
    vx: -2+Math.random()*4,
    a: Math.random()*360,
    va: -6+Math.random()*12
  }));
  cancelAnimationFrame(raf);
  loop();
}
function loop(){
  confettiCtx.clearRect(0,0,els.confetti.width,els.confetti.height);
  pieces.forEach(p=>{
    p.x += p.vx; p.y += p.vy; p.a += p.va;
    confettiCtx.save();
    confettiCtx.translate(p.x,p.y); confettiCtx.rotate(p.a*Math.PI/180);
    confettiCtx.fillStyle=p.c; confettiCtx.fillRect(-p.r/2,-p.r/2,p.r,p.r);
    confettiCtx.restore();
  });
  pieces = pieces.filter(p=> p.y < els.confetti.height+30);
  if(pieces.length){ raf = requestAnimationFrame(loop);} else confettiCtx.clearRect(0,0,els.confetti.width,els.confetti.height);
}
function randomColor(){
  const colors=['#ff4757','#ffa502','#2ed573','#1e90ff','#9b59b6'];
  return colors[Math.random()*colors.length|0];
}

function escapeHtml(str=''){ return str.replace(/[&<>"']/g, c=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

function renderLevelProgress(){
  const xp = state.gamification.xp;
  const lvl = state.gamification.level;
  const curBase = xpForLevel(lvl);
  const nextBase = xpForLevel(lvl+1);
  const span = nextBase - curBase;
  const into = xp - curBase;
  const pct = span ? Math.min(100, (into/span)*100) : 100;
  if(els.levelProgressBar){
    const circumference = 2*Math.PI*52; // r=52 matches SVG
    const offset = circumference - (pct/100)*circumference;
    els.levelProgressBar.style.strokeDashoffset = offset;
  }
  if(els.levelProgressLabel){ els.levelProgressLabel.textContent = `${Math.max(0,nextBase - xp)} XP to go`; }
}

function initTheme(){
  const stored = localStorage.getItem('openhabits:theme');
  if(stored === 'light') document.body.classList.add('light');
  updateThemeButton();
}
function toggleTheme(){
  document.body.classList.toggle('light');
  localStorage.setItem('openhabits:theme', document.body.classList.contains('light') ? 'light':'dark');
  updateThemeButton();
}
function updateThemeButton(){
  const btn = document.getElementById('btn-theme');
  if(!btn) return;
  const light = document.body.classList.contains('light');
  btn.textContent = light ? '🌙' : '☀️';
  btn.title = light ? 'Switch to dark theme' : 'Switch to light theme';
}
