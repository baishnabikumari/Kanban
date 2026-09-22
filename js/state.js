import { generateId } from "./utils.js";

export const state = {
    activeBoardId: "b1",
    boards: [
        {
            id: "b1",
            name: "My Project",
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
