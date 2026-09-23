import { generateId } from "./utils.js";

export const state = {
    activeBoardId: "b1",
    theme: "Light",
    boards: [
        {
            id: "b1",
            name: "My Project",
            labels: [],
            columns: [
                {
                    id: "c1",
                    title: "To Do",
                    cards: [
                        { id: "k1", title: "Fix login bug on mobile" },
                        { id: "k2", title: "Write unit tests for auth module" },
                        { id: "k3", title: "Update favicon" }
                    ]
                },
                {
                    id: "c2",
                    title: "In Progress",
                    cards: [
                        { id: "k4", title: "Redesign landing page hero" },
                        { id: "k5", title: "Set up CI pipeline"}
                    ]
                },
                {
                    id: "c3",
                    title: "Done",
                    cards: [
                        { id: "k6", title: "Initial project setup" }
                    ]
                }
            ]
        }
    ]
};

export function addBoard(name){
    const newBoard = {
        id: generateId(),
        name,
        labels: [],
        columns: []
    };
    state.boards.push(newBoard);
    return newBoard
}

export function setActiveBoard(boardId){
    state.activeBoardId = boardId;
}

export function getActiveBoard(){
    return state.boards.find(b => b.id === state.activeBoardId);
}

export function addColumn(board, title) {
  board.columns.push({
    id: generateId(),
    title,
    cards: []
  });
}

export function deleteColumn(board, columnId) {
    const idx = board.columns.findIndex(c => c.id === columnId);

    if (idx !== -1) {
        board.columns.splice(idx, 1);
    }
}

export function addCard(column, title) {
    column.cards.push({
        id: generateId(),
        title,
        createdAt: Date.now()
    });
}

export function findCard(board, cardId) {
    for (const column of board.columns) {
        const card = column.cards.find(c => c.id === cardId);

        if (card) {
            return { card, column };
        }
    }
    return null;
}

export function editCard(board, cardId, newTitle) {
    const found = findCard(board, cardId);

    if (found) {
        found.card.title = newTitle;
    }
}

export function deleteCard(board, cardId) {
    for (const column of board.columns) {
        const idx = column.cards.findIndex(c => c.id === cardId);

        if (idx !== -1) {
            column.cards.splice(idx, 1);
            
        }
    }
}
export function addLabel(board, name, color){
    board.labels.push({ id: generateId(), name, color });
}

export function toggleCardLabel(card, labelId){
    card.labelIds = card.labelIds || [];
    const idx = card.labelIds.indexOf(labelId);
    if(idx === -1){
        card.labelIds.push(labelId);
    } else {
        card.labelIds.splice(idx, 1);
    }
}

export function moveCard(board, cardId, targetColumnId, targetIndex){
    const found = findCard(board, cardId);
    if(!found) return;

    const sourceIndex = found.column.cards.findIndex(c => c.id === cardId);
    found.column.cards.splice(sourceIndex, 1);

    const targetColumn = board.columns.find(c => c.id === targetColumnId);
    targetColumn.cards.splice(targetIndex, 0, found.card);
}

export function addChecklistItem(card, text){
    card.checklist = card.checklist || [];
    card.checklist.push({ id: generateId(), text, done: false });
}

export function toggleChecklistItem(card, itemId){
    const item = (card.checklist || []).find(i => i.id === itemId);
    if(item) item.done = !item.done;
}

export function deleteChecklistItem(card, itemId){
    card.checklist = (card.checklist || []).filter(i => i.id !== itemId);
}

export function toggleTheme(){
    state.theme = state.theme === "dark" ? "light" : "dark";
}

