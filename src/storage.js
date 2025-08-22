const KEY = 'openhabits:v1';

function deepClone(obj){
  if(typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse state', e);
    return null;
  }
}

export function saveState(state) {
  const safe = deepClone(state);
  safe._lastSaved = Date.now();
  localStorage.setItem(KEY, JSON.stringify(safe));
}

export function exportState(state){
  const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.download = `openhabits-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.href = URL.createObjectURL(blob);
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importState(file){
  const text = await file.text();
  const json = JSON.parse(text);
  if(!json.habits || !json.gamification) throw new Error('Invalid backup');
  localStorage.setItem(KEY, JSON.stringify(json));
  return json;
}

export function resetAll(){
  localStorage.removeItem(KEY);
}