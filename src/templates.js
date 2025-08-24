// Predefined habit templates and starter pack selection
export const HABIT_TEMPLATES = [
  { id: 'hydrate', name: 'Hydration', description: 'Drink a glass of water', days: [0,1,2,3,4,5,6], target: 1 },
  { id: 'read10', name: 'Reading', description: 'Read 10 pages', days: [1,2,3,4,5], target: 1 },
  { id: 'move', name: 'Exercise', description: 'Move / exercise session', days: [1,3,5], target: 1 },
  { id: 'mindful', name: 'Mindfulness', description: '5 min mindfulness / breathing', days: [0,2,4,6], target: 1 },
  { id: 'journal', name: 'Reflection', description: '1 line journal/reflection', days: [0,1,2,3,4,5,6], target: 1 }
];

export const STARTER_PACK = ['hydrate','read10','mindful'];

export function getTemplateById(id){
  return HABIT_TEMPLATES.find(t=>t.id===id);
}
