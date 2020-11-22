var StorageKey;
(function (StorageKey) {
    StorageKey.history = "history";
    StorageKey.initialProcessCount = "initialProcessCount";
    StorageKey.joiningProcessCount = "joiningProcessCount";
    StorageKey.displayLinks = "displayLinks";
    StorageKey.displayMessages = "displayMessages";
    StorageKey.simulationSpeed = "simulationSpeed";
    StorageKey.outgoingPeers = "outgoingPeers";
    StorageKey.incomingPeers = "incomingPeers";
})(StorageKey || (StorageKey = {}));
function saveHistory() {
    localStorage.setItem(StorageKey.history, JSON.stringify(cmdManager.history));
}
function loadHistory() {
    return JSON.parse(localStorage.getItem(StorageKey.history)) || [];
}
function saveSettings() {
    localStorage.setItem(StorageKey.initialProcessCount, simulation.initialProcessCount.toString());
    localStorage.setItem(StorageKey.joiningProcessCount, simulation.joiningProcessCount.toString());
    localStorage.setItem(StorageKey.displayLinks, simulation.displayLinks.toString());
    localStorage.setItem(StorageKey.displayMessages, simulation.displayMessages.toString());
    localStorage.setItem(StorageKey.simulationSpeed, simulation.speed.toString());
    localStorage.setItem(StorageKey.outgoingPeers, simulation.outgoingPeers.toString());
    localStorage.setItem(StorageKey.incomingPeers, simulation.incomingPeers.toString());
}
function loadSettings() {
    if (localStorage.getItem(StorageKey.initialProcessCount)) {
        console.log('loading settings');
        simulation.initialProcessCount = parseInt(localStorage.getItem(StorageKey.initialProcessCount));
        simulation.joiningProcessCount = parseInt(localStorage.getItem(StorageKey.joiningProcessCount));
        simulation.displayLinks = localStorage.getItem(StorageKey.displayLinks) == 'true';
        simulation.displayMessages = localStorage.getItem(StorageKey.displayMessages) == 'true';
        simulation.outgoingPeers = parseInt(localStorage.getItem(StorageKey.outgoingPeers));
        simulation.incomingPeers = parseInt(localStorage.getItem(StorageKey.incomingPeers));
        simulation.speed = parseInt(localStorage.getItem(StorageKey.simulationSpeed));
    }
    else {
        console.log('no settings found');
    }
}
//# sourceMappingURL=storage.js.map