

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.BPYwnQFk.js","_app/immutable/chunks/Bl0xz5QB.js","_app/immutable/chunks/IHki7fMi.js","_app/immutable/chunks/DC7pQ_Y9.js"];
export const stylesheets = [];
export const fonts = [];
