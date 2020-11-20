var StorageKey;
(function (StorageKey) {
    StorageKey.history = "history";
})(StorageKey || (StorageKey = {}));
function saveHistory() {
    localStorage.setItem(StorageKey.history, JSON.stringify(cmdManager.history));
}
function loadHistory() {
    return JSON.parse(localStorage.getItem(StorageKey.history)) || [];
}
//# sourceMappingURL=storage.js.map