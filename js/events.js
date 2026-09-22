import { getActiveBoard, addColumn, addCard, editCard, findCard } from "./state.js";
import { commit } from "./main.js";

const boardEl = document.getElementById("board");

const modalEl = document.getElementById("card-modal");
const modalTitleEl = document.getElementById("modal-title");
const cardForm = document.getElementById("card-form");
const cardTitleInput = document.getElementById("card-title-input");
const cancelBtn = document.getElementById("modal-cancel-btn");

let modalMode = null;
let modalTargetColumnId = null;
let modalTargetCardId = null;

export function setupEvents() {
    boardEl.addEventListener("click", handleBoardClick);
    cancelBtn.addEventListener("click", closeModal);
    cardForm.addEventListener("submit", handleFormSubmit);
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

    if (e.target.matches(".add-card-btn")) {
        const columnEl = e.target.closest(".column");

        openModal("add", columnEl.dataset.columnId, null, "");

        return;
    }

    if (e.target.matches(".card")) {
        const cardId = e.target.dataset.cardId;
        const found = findCard(getActiveBoard(), cardId);

        if (found) {
            openModal("edit", found.column.id, cardId, found.card.title);
        }

        return;
    }
}

function openModal(mode, columnId, cardId, currentTitle) {
    modalMode = mode;
    modalTargetColumnId = columnId;
    modalTargetCardId = cardId;

    modalTitleEl.textContent = mode === "add" ? "Add card" : "Edit card";

    cardTitleInput.value = currentTitle;

    modalEl.classList.remove("hidden");

    cardTitleInput.focus();
}

function closeModal() {
    modalEl.classList.add("hidden");

    cardForm.reset();
}

function handleFormSubmit(e) {
    e.preventDefault();

    const title = cardTitleInput.value.trim();

    if (!title) return;

    const board = getActiveBoard();

    if (modalMode === "add") {
        const column = board.columns.find(c => c.id === modalTargetColumnId);

        addCard(column, title);
    } else if (modalMode === "edit") {
        editCard(board, modalTargetCardId, title);
    }

    closeModal();

    commit();
}