export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function formatDate(isostring) {
    if (!isostring) return "";
    const date = new Date(isostring);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}