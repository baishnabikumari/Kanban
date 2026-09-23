import { getActiveBoard, state } from "./state.js";

const boardEl = document.getElementById("board");
let filters = { search: "", labelId: "", priority: ""};

export function setSearchFilter(text){
    filters.search = text.trim().toLowerCase();
    render();
}

export function setLabelFilter(labelId){
    filters.labelId = labelId;
    render();
}

export function setPriorityFilter(priority){
    filters.priority = priority;
    render();
}

export function render() {
    const board = getActiveBoard();

    boardEl.innerHTML = "";

    board.columns.forEach(column => {
        boardEl.appendChild(renderColumn(column, board.labels || []));
    });

    const addColumnBtn = document.createElement("button");
    addColumnBtn.className = "add-column-btn";
    addColumnBtn.textContent = "+ add column";

    boardEl.appendChild(addColumnBtn);
    renderSlider();
    renderLabelFilterOptions(board.labels || []);
}

function renderSlider(){
    const boardListEl = document.getElementById("board-list");
    boardListEl.innerHTML = "";

    state.boards.forEach(b => {
        const item = document.createElement("div");
        item.className = "board-list-item";
        item.dataset.boardId = b.id;
        item.textContent = b.name;
        if(b.id === state.activeBoardId) item.classList.add("active");
        boardListEl.appendChild(item);
    });
}

function renderLabelFilterOptions(labels){
    const labelFilterEl = document.getElementById("label-filter");
    const currentValue = labelFilterEl.value;
    labelFilterEl.innerHTML = '<option value="">All labels</option>';

    labels.forEach(label => {
        const opt = document.createElement("option");
        opt.value = label.id;
        opt.textContent = label.name;
        labelFilterEl.appendChild(opt);
    });
    labelFilterEl.value = currentValue;
}

function renderColumn(column, labels){
    const columnEl = document.createElement("div");
    columnEl.className = "column";
    columnEl.dataset.columnId = column.id;

    const header = document.createElement("div");
    header.className = "column-header";

    const titleEl = document.createElement("h2");
    titleEl.textContent = column.title;

    const countEl = document.createElement("span");
    countEl.className = "card-count";
    countEl.textContent = column.cards.length;

    const headerLeft = document.createElement("div");
    headerLeft.className = "column-header-left";

    headerLeft.appendChild(titleEl);
    headerLeft.appendChild(countEl);

    const deleteColumnBtn = document.createElement("button");
    deleteColumnBtn.className = "delete-column-btn";
    deleteColumnBtn.textContent = "x";
    deleteColumnBtn.title = "Delete column";
    deleteColumnBtn.setAttribute("aria-label", "Delete column");

    header.appendChild(headerLeft);
    header.appendChild(deleteColumnBtn);

    columnEl.appendChild(header);

    const cardList = document.createElement("div");
    cardList.className = "card-list";
    column.cards
        .filter(card => card.title.toLowerCase().includes(filters.search))
        .filter(card => !filters.labelId || (card.labelIds || []).includes(filters.labelId))
        .filter(card => !filters.priority || card.priority === filters.priority)
        .forEach(card => cardList.appendChild(renderCard(card, labels)));
    columnEl.appendChild(cardList);

    const addCardBtn = document.createElement("button");
    addCardBtn.className = "add-card-btn";
    addCardBtn.textContent = "+ add card";
    columnEl.appendChild(addCardBtn);

    return columnEl;
}

function renderCard(card, labels) {
    const cardEl = document.createElement("div");

    cardEl.className = "card";
    cardEl.dataset.cardId = card.id;
    cardEl.draggable = true;

    const cardLabels = (card.labelIds || [])
        .map(id => labels.find(l => l.id === id))
        .filter(Boolean);

    if (cardLabels.length){
        const labelRow = document.createElement("div");
        labelRow.className = "card-labels";
        cardLabels.forEach(label => {
            const chip = document.createElement("span");
            chip.className = "label-chip";
            chip.style.background = label.color;
            chip.title = label.name;
            labelRow.appendChild(chip);
        });
        cardEl.appendChild(labelRow);
    }
    const titleEl = document.createElement("div");
    titleEl.textContent = card.title;
    cardEl.appendChild(titleEl);

    if(card.checklist && card.checklist.length){
        const done = card.checklist.filter(i => i.done).length;
        const progressEl = document.createElement("div");
        progressEl.className = "card-checklist-progress";
        progressEl.textContent = `${done}/${card.checklist.length}`;
        cardEl.appendChild(progressEl);
    }
    return cardEl;
}