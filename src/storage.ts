namespace StorageKey {
    export const history = "history";
    //export const processes = "processes";
    //export const links = "links";
    //export const sequence = "sequence";
}

function saveHistory() {
    localStorage.setItem(StorageKey.history, JSON.stringify(cmdManager.history));
}

function loadHistory(): string[] {
    return JSON.parse(localStorage.getItem(StorageKey.history)) || [];
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