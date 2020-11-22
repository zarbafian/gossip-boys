namespace StorageKey {
    export const history = "history";
    //export const processes = "processes";
    //export const links = "links";
    //export const sequence = "sequence";
    
    export const initialProcessCount = "initialProcessCount";
    export const joiningProcessCount = "joiningProcessCount";
    export const displayLinks = "displayLinks";
    export const displayMessages = "displayMessages";
    export const simulationSpeed = "simulationSpeed";
    export const outgoingPeers = "outgoingPeers";
    export const incomingPeers = "incomingPeers";
}

function saveHistory() {
    localStorage.setItem(StorageKey.history, JSON.stringify(cmdManager.history));
}

function loadHistory(): string[] {
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
    if(localStorage.getItem(StorageKey.initialProcessCount)) {
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
/*
function saveProcesses() {
    let processesRaw: { [id: string]: ProcessData } = {};
    for(let pid in network.processes) {
        let p = network.processes[pid];
        processesRaw[p.id] = {
            id: p.id,
            position: p.position
        };
    }

    localStorage.setItem(StorageKey.processes, JSON.stringify(processesRaw));
}
*/