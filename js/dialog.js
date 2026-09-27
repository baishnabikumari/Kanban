
const dialogEl = document.getElementById("dialog-modal");
const dialogTitleEl = document.getElementById("dialog-title");
const dialogMessageEl = document.getElementById("dialog-message");
const dialogInputRow = document.getElementById("dialog-input-row");
const dialogInput = document.getElementById("dialog-input");
const dialogCancelBtn = document.getElementById("dialog-cancel-btn");
const dialogConfirmBtn = document.getElementById("dialog-confirm-btn");

let resolvePromise = null;
let mode = "prompt";

dialogCancelBtn.addEventListener("click", () => close(mode === "prompt" ? null : false));

dialogConfirmBtn.addEventListener("click", () => {
    if (mode === "prompt") {
        close(dialogInput.value);
    } else {
        close(true);
    }
});

document.addEventListener("keydown", (e) => {
    if (dialogEl.classList.contains("hidden")) return;

    if (e.key === "Enter") {
        e.preventDefault();
        dialogConfirmBtn.click();
    }

    if (e.key === "Escape") {
        close(mode === "prompt" ? null : false);
    }
});

function close(value) {
    dialogEl.classList.add("hidden");
    if (resolvePromise) resolvePromise(value);
    resolvePromise = null;
}

export function openPrompt(title, defaultValue = "") {
    mode = "prompt";
    dialogTitleEl.textContent = title;
    dialogTitleEl.classList.remove("hidden");
    dialogMessageEl.classList.add("hidden");
    dialogInputRow.classList.remove("hidden");
    dialogInput.value = defaultValue;
    dialogConfirmBtn.textContent = "OK";

    dialogEl.classList.remove("hidden");
    dialogInput.focus();
    dialogInput.select();

    return new Promise(resolve => {
        resolvePromise = resolve;
    });
}

export function openConfirm(message) {
    mode = "confirm";
    dialogTitleEl.classList.add("hidden");
    dialogMessageEl.textContent = message;
    dialogMessageEl.classList.remove("hidden");
    dialogInputRow.classList.add("hidden");
    dialogConfirmBtn.textContent = "Confirm";

    dialogEl.classList.remove("hidden");

    return new Promise(resolve => {
        resolvePromise = resolve;
    });
}
