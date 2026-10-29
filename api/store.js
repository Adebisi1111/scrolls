// Shared in-memory store (persists within warm container)
let db = { nextId: 4, articles: {} };

function getDb() { return db; }
function setDb(newDb) { db = newDb; }

export { getDb, setDb };