namespace StorageKey {
    //export const history = "history";
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
    
    export const samplingParamT = "spt";
    export const samplingParamC = "spc";
    export const samplingParamH = "sph";
    export const samplingParamS = "sps";
}

function saveSettings() {
    localStorage.setItem(StorageKey.initialProcessCount, simulation.initialProcessCount.toString());
    localStorage.setItem(StorageKey.joiningProcessCount, simulation.joiningProcessCount.toString());
    localStorage.setItem(StorageKey.displayLinks, simulation.displayLinks.toString());
    localStorage.setItem(StorageKey.displayMessages, simulation.displayMessages.toString());
    localStorage.setItem(StorageKey.simulationSpeed, simulation.speed.toString());
    localStorage.setItem(StorageKey.outgoingPeers, simulation.outgoingPeers.toString());
    localStorage.setItem(StorageKey.incomingPeers, simulation.incomingPeers.toString());
    
    localStorage.setItem(StorageKey.samplingParamT, simulation.T.toString());
    localStorage.setItem(StorageKey.samplingParamC, simulation.c.toString());
    localStorage.setItem(StorageKey.samplingParamH, simulation.H.toString());
    localStorage.setItem(StorageKey.samplingParamS, simulation.S.toString());
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
        
        simulation.T = parseInt(localStorage.getItem(StorageKey.samplingParamT));
        simulation.c = parseInt(localStorage.getItem(StorageKey.samplingParamC));
        simulation.H = parseInt(localStorage.getItem(StorageKey.samplingParamH));
        simulation.S = parseInt(localStorage.getItem(StorageKey.samplingParamS));
    }
    else {
        console.log('no settings found');
    }
}
