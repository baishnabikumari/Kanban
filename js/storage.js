const STORAGE_KEY = "kanban-state";

export function saveState(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function loadState(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return null;
    try{
        return JSON.parse(raw);
    } catch (err){
        console.warn("saved stat was corrupted and starting it fresh", err);
        return null;
    }
}