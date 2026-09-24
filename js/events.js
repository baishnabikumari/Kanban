import { state, getActiveBoard, addColumn, deleteColumn, setColumnColor, setColumnWipLimit, addCard, editCard, deleteCard, findCard, addLabel, toggleCardLabel, toggleChecklistItem, deleteChecklistItem, addChecklistItem, addBoard, renameBoard, deleteBoard, setActiveBoard, toggleTheme } from "./state.js";
import { commit, undo, redo } from "./main.js";
import { setSearchFilter, setLabelFilter, setPriorityFilter } from "./render.js";
import { renderStats } from "./stats.js";

const boardEl = document.getElementById("board");

const modalEl = document.getElementById("card-modal");
const modalTitleEl = document.getElementById("modal-title");
const cardForm = document.getElementById("card-form");
const cardTitleInput = document.getElementById("card-title-input");
const cardPriorityInput = document.getElementById("card-priority-input");
const cardDueInput = document.getElementById("card-due-input");
const cancelBtn = document.getElementById("modal-cancel-btn");
const deleteBtn = document.getElementById("modal-delete-btn");
const modalLabelsEl = document.getElementById("modal-labels");
const addLabelBtn = document.getElementById("add-label-btn");
const searchInput = document.getElementById("search-input");
const modalChecklistEl = document.getElementById("modal-checklist");
const checklistItemInput = document.getElementById("checklist-item-input");
const addChecklistItemBtn = document.getElementById("add-checklist-item-btn");
const priorityFilterEl = document.getElementById("priority-filter");
const labelFilterEl = document.getElementById("label-filter");
const boardListEl = document.getElementById("board-list");
const addBoardBtn = document.getElementById("add-board-btn");
const themeToggleBtn = document.getElementById("theme-toggle-btn");
const statsToggleBtn = document.getElementById("stats-toggle-btn");
const statsPanelEl = document.getElementById("stats-panel");

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importInput = document.getElementById("import-input");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

let modalMode = null;
let modalTargetColumnId = null;
let modalTargetCardId = null;

export function setupEvents() {
    boardEl.addEventListener("click", handleBoardClick);
    cancelBtn.addEventListener("click", closeModal);
    deleteBtn.addEventListener("click", handleDeleteCard);
    cardForm.addEventListener("submit", handleFormSubmit);
    addLabelBtn.addEventListener("click", handleAddLabel);
    addChecklistItemBtn.addEventListener("click", handleAddChecklistItem);
    searchInput.addEventListener("input", () => setSearchFilter(searchInput.value));
    priorityFilterEl.addEventListener("change", () => setPriorityFilter(priorityFilterEl.value));
    labelFilterEl.addEventListener("change", () => setLabelFilter(labelFilterEl.value));
    addBoardBtn.addEventListener("click", handleAddBoard);
    boardListEl.addEventListener("click", handleBoardListClick);
    themeToggleBtn.addEventListener("click", handleThemeToggle);
    statsToggleBtn.addEventListener("click", handleStatsToggle);
    exportBtn.addEventListener("click", handleExport);
    importBtn.addEventListener("click", () => importInput.click());
    importInput.addEventListener("change", handleImport);
    undoBtn.addEventListener("click", undo);
    redoBtn.addEventListener("click", redo);
    document.addEventListener("keydown", handleKeyDown);
}

function handleExport() {
    const dataStr = JSON.stringify(state, null, 2);

    const blob = new Blob([dataStr], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "kanban-export.json";

    a.click();

    URL.revokeObjectURL(url);
}

function handleImport(e) {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        try {
            const imported = JSON.parse(reader.result);

            if (
                !imported ||
                !Array.isArray(imported.boards) ||
                !imported.boards.some(
                    b => b.id === imported.activeBoardId &&
                    Array.isArray(b.columns) &&
                    Array.isArray(b.labels) &&
                    b.columns.every(c => Array.isArray(c.cards))
                )
            ) {
                throw new Error("Invalid board data");
            }

            Object.assign(state, imported);

            commit();

        } catch (err) {
            alert("That file does not look like a valid Kanban export.");
        }
    };

    reader.readAsText(file);

    importInput.value = "";
}

function handleStatsToggle() {
    statsPanelEl.classList.toggle("hidden");

    if (!statsPanelEl.classList.contains("hidden")) {
        renderStats();
    }
}

function handleThemeToggle() {
    toggleTheme();

    commit();
}

function handleKeyDown(e) {
    if (e.key === "Escape" && !modalEl.classList.contains("hidden")) {
        closeModal();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
    }

    if (e.key === "n" && modalEl.classList.contains("hidden")) {
        if (e.target.matches("input, textarea, select")) return;

        const board = getActiveBoard();

        if (board && board.columns.length) {
            openModal("add", board.columns[0].id, null, "", "medium", "");
        }
    }
}

function handleAddBoard() {
    const name = prompt("Board name:");

    if (!name || !name.trim()) return;

    const newBoard = addBoard(name.trim());

    setActiveBoard(newBoard.id);

    commit();
}

function handleBoardListClick(e) {
    if (e.target.matches(".board-rename-btn")) {
        const item = e.target.closest(".board-list-item");

        const board = state.boards.find(
            b => b.id === item.dataset.boardId
        );

        if (!board) return;

        const name = prompt("Board name:", board.name);

        if (name && name.trim()) {
            renameBoard(board, name.trim());
            commit();
        }

        return;
    }

    if (e.target.matches(".board-delete-btn")) {
        const item = e.target.closest(".board-list-item");

        if (state.boards.length <= 1) {
            alert("You need at least one board.");
            return;
        }

        const ok = confirm("Delete this board and everything on it?");

        if (ok) {
            deleteBoard(item.dataset.boardId);
            commit();
        }

        return;
    }

    const item = e.target.closest(".board-list-item");

    if (!item) return;

    setActiveBoard(item.dataset.boardId);

    commit();
}

function handleBoardClick(e) {
    if (e.target.matches(".add-column-btn")) {
        const title = prompt("Column name:");

        if (title && title.trim()) {
            addColumn(getActiveBoard(), title.trim());
            commit();
        }

        return;
    }

    if (e.target.matches(".column-settings-btn")) {
        const columnEl = e.target.closest(".column");

        const board = getActiveBoard();

        const column = board.columns.find(
            c => c.id === columnEl.dataset.columnId
        );

        const color = prompt(
            "Column color (hex, leave blank for none):",
            column.color || ""
        );

        setColumnColor(column, color ? color.trim() : null);

        const limitInput = prompt(
            "WIP limit (number, leave blank for none):",
            column.wipLimit || ""
        );

        const limit = limitInput ? parseInt(limitInput, 10) : null;

        setColumnWipLimit(column, isNaN(limit) ? null : limit);

        commit();

        return;
    }

    if (e.target.matches(".delete-column-btn")) {
        const columnEl = e.target.closest(".column");

        const ok = confirm("Delete this column and all its cards?");

        if (ok) {
            deleteColumn(getActiveBoard(), columnEl.dataset.columnId);
            commit();
        }

        return;
    }

    if (e.target.matches(".add-card-btn")) {
        const columnEl = e.target.closest(".column");

        openModal(
            "add",
            columnEl.dataset.columnId,
            null,
            "",
            "medium",
            ""
        );

        return;
    }

    const cardEl = e.target.closest(".card");

    if (cardEl) {
        const cardId = cardEl.dataset.cardId;

        const found = findCard(getActiveBoard(), cardId);

        if (found) {
            openModal(
                "edit",
                found.column.id,
                cardId,
                found.card.title,
                found.card.priority || "medium",
                found.card.dueDate || ""
            );
        }

        return;
    }
}

function openModal(mode, columnId, cardId, currentTitle, currentPriority, currentDue) {
    modalMode = mode;
    modalTargetColumnId = columnId;
    modalTargetCardId = cardId;

    modalTitleEl.textContent = mode === "add" ? "Add card" : "Edit card";

    cardTitleInput.value = currentTitle;
    cardPriorityInput.value = currentPriority || "medium";
    cardDueInput.value = currentDue || "";

    deleteBtn.classList.toggle("hidden", mode !== "edit");

    modalEl.classList.remove("hidden");

    cardTitleInput.focus();

    renderModalLabels();
    renderModalChecklist();
}

function renderModalLabels() {
    modalLabelsEl.innerHTML = "";

    if (modalMode !== "edit") return;

    const board = getActiveBoard();

    const found = findCard(board, modalTargetCardId);

    if (!found) return;

    board.labels.forEach(label => {
        const chip = document.createElement("button");

        chip.type = "button";
        chip.className = "modal-label-chip";
        chip.style.background = label.color;
        chip.textContent = label.name;

        chip.classList.toggle(
            "active",
            (found.card.labelIds || []).includes(label.id)
        );

        chip.addEventListener("click", () => {
            toggleCardLabel(found.card, label.id);

            commit();

            renderModalLabels();
        });

        modalLabelsEl.appendChild(chip);
    });
}

function handleAddLabel() {
    const name = prompt("Label name:");

    if (!name || !name.trim()) return;

    const colors = [
        "#c1653d",
        "#5b7c99",
        "#7a8c5c",
        "#a8532f",
        "#8a6d9c"
    ];

    const color = colors[Math.floor(Math.random() * colors.length)];

    addLabel(getActiveBoard(), name.trim(), color);

    commit();

    renderModalLabels();
}

function renderModalChecklist() {
    modalChecklistEl.innerHTML = "";

    if (modalMode !== "edit") return;

    const board = getActiveBoard();

    const found = findCard(board, modalTargetCardId);

    if (!found) return;

    (found.card.checklist || []).forEach(item => {
        const row = document.createElement("div");

        row.className = "checklist-item";

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = item.done;

        checkbox.addEventListener("change", () => {
            toggleChecklistItem(found.card, item.id);

            commit();

            renderModalChecklist();
        });

        const label = document.createElement("span");

        label.textContent = item.text;

        if (item.done) {
            label.classList.add("done");
        }

        const removeBtn = document.createElement("button");

        removeBtn.type = "button";
        removeBtn.textContent = "x";

        removeBtn.addEventListener("click", () => {
            deleteChecklistItem(found.card, item.id);

            commit();

            renderModalChecklist();
        });

        row.appendChild(checkbox);
        row.appendChild(label);
        row.appendChild(removeBtn);

        modalChecklistEl.appendChild(row);
    });
}

function handleAddChecklistItem() {
    const text = checklistItemInput.value.trim();

    if (!text) return;

    const board = getActiveBoard();

    const found = findCard(board, modalTargetCardId);

    if (!found) return;

    addChecklistItem(found.card, text);

    checklistItemInput.value = "";

    commit();

    renderModalChecklist();
}

function closeModal() {
    modalEl.classList.add("hidden");

    cardForm.reset();
}

function handleFormSubmit(e) {
    e.preventDefault();

    const title = cardTitleInput.value.trim();

    if (!title) return;

    const priority = cardPriorityInput.value;
    const dueDate = cardDueInput.value;

    const board = getActiveBoard();

    if (modalMode === "add") {
        const column = board.columns.find(
            c => c.id === modalTargetColumnId
        );

        addCard(column, title, priority, dueDate);

    } else if (modalMode === "edit") {
        editCard(board, modalTargetCardId, {
            title,
            priority,
            dueDate: dueDate || null
        });
    }

    closeModal();

    commit();
}

function handleDeleteCard() {
    const ok = confirm("Delete this card?");

    if (ok) {
        deleteCard(getActiveBoard(), modalTargetCardId);

        closeModal();

        commit();
    }
}