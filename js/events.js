import { getActiveBoard, addColumn, deleteColumn, addCard, editCard, deleteCard, findCard, addLabel, toggleCardLabel, toggleChecklistItem, deleteChecklistItem, addChecklistItem } from "./state.js";
import { commit } from "./main.js";
import { setSearchFilter } from "./render.js";

const boardEl = document.getElementById("board");

const modalEl = document.getElementById("card-modal");
const modalTitleEl = document.getElementById("modal-title");
const cardForm = document.getElementById("card-form");
const cardTitleInput = document.getElementById("card-title-input");
const cancelBtn = document.getElementById("modal-cancel-btn");
const deleteBtn = document.getElementById("modal-delete-btn");
const modalLabelsEl = document.getElementById("modal-labels");
const addLabelBtn = document.getElementById("add-label-btn");
const searchInput = document.getElementById("search-input");
const modalCheckItemInput = document.getElementById("modal-checklist");
const checklistItemInput = document.getElementById("checklist-item-input");
const addChecklistItemBtn = document.getElementById("add-checklist-item-btn");
 
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

    if (e.target.matches(".delete-column-btn"))  {
        const columnE1 = e.target.closest(".column");

        const ok = confirm("Delete this column and all its card?");

        if(ok) {
            deleteColumn(getActiveBoard(), columnE1.dataset.columnId);
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
    deleteBtn.classList.toggle("hidden", mode !== "edit");

    modalEl.classList.remove("hidden");
    cardTitleInput.focus();
    renderModalLabels();
    renderModalChecklist();
}

function renderModalLabels(){
    modalLabelsEl.innerHTML = "";
    if(modalMode !== "edit") return;

    const board = getActiveBoard();
    const found = findCard(board, modalTargetCardId);
    if(!found) return;

    board.labels.forEach(label => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "modal-label-chip";
        chip.style.background = label.color;
        chip.classList.toggle("active", (found.card.labelIds || []).includes(label.id));

        chip.addEventListener("click", () => {
            toggleCardLabel(found.card, label.id);
            commit();
            renderModalLabels();
        });
        modalLabelsEl.appendChild(chip);
    });
}

function handleAddLabel(){
    const name = prompt("Label name:");
    if(!name || !name.trim()) return;

    const colors = ["#c1653d", "#5b7c99", "#7a8c5c", "#a8532f", "#8a6d9c"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    addLabel(getActiveBoard(), name.trim(), color);
    commit();
    renderModalLabels();
}

function renderModalChecklist(){
    renderModalChecklist.innerHTML = "";
    if(modalMode !== "edit") return;

    const board = getActiveBoard();
    const found = findCard(board, modalTargetCardId);
    if(!found) return;

    (found.card.checklist || []).forEach(item => {
        const row = document.createElementNS("div");
        row.className = "checklist-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkboc";
        checkbox.checked = item.done;
        checkbox.addEventListener("change", () => {
            toggleChecklistItem(found.card, item.id);
            commit();
            renderModalChecklist();
        });
        const label = document.createElement("span");
        label.textContent = item.text;
        if(item.done) label.classList.add("done");

        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "x";
        removeBtn.addEventListener("click", () => {
            deleteChecklistItem(found.card, item.id);
            commit();
            renderModalChecklist();
        });
        row.appendChild(checkbox)
        row.appendChild(label);
        row.appendChild(removeBtn);
        modalChecklistEl.appendChild(row);
    });
}

function handleAddChecklistItem(){
    const text = checklistItemInput.value.trim();
    if(!text) return;

    const board = getActiveBoard();
    const found = findCard(board, modalTargetCardId);
    if(!found) return;

    addChecklistItem(found.card, text);
    checklistItemInput.value = "";
    commit();
    renderModalChecklist();
}

function closeModal(){
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

function handleDeleteCard() {
    const ok = confirm("Delete this Card?");

    if(ok) {
        deleteCard(getActiveBoard(), modalTargetCardId);
        closeModal();
        commit();
    }
}