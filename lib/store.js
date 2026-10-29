// Shared global store - persists within warm container
globalThis.__scrollsDb = globalThis.__scrollsDb || { nextId: 4, articles: {} };

export function getDb() { return globalThis.__scrollsDb; }
export function setDb(newDb) { globalThis.__scrollsDb = newDb; }