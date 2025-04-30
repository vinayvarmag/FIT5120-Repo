/* LocalStorage helpers (runs only in browser) */
const STORAGE_KEY = "moduleProgress";

/** Return a { [moduleId]: { overview:true, ... } } object */
function readStore() {
    if (typeof window === "undefined") return {};
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function writeStore(obj) {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

/** Mark a page complete and return new % */
export function markCompleted(id, page) {
    const store = readStore();
    store[id] = { ...(store[id] || {}), [page]: true };
    writeStore(store);
    return calcProgress(store[id]);
}

/** Get current % for module id */
export function getProgress(id) {
    const store = readStore();
    return calcProgress(store[id]);
}

function calcProgress(moduleObj = {}) {
    const completed = Object.keys(moduleObj).length;
    return Math.round((completed / 4) * 100); // 4 pages total
}
