var StorageKey;
(function (StorageKey) {
    StorageKey.initialProcessCount = "initialProcessCount";
    StorageKey.joiningProcessCount = "joiningProcessCount";
    StorageKey.displayLinks = "displayLinks";
    StorageKey.displayMessages = "displayMessages";
    StorageKey.simulationSpeed = "simulationSpeed";
    StorageKey.samplingParamPush = "spPush";
    StorageKey.samplingParamPull = "spPull";
    StorageKey.samplingParamT = "spt";
    StorageKey.samplingParamC = "spc";
    StorageKey.samplingParamH = "sph";
    StorageKey.samplingParamS = "sps";
})(StorageKey || (StorageKey = {}));
function saveSettings() {
    localStorage.setItem(StorageKey.initialProcessCount, simulation.initialProcessCount.toString());
    localStorage.setItem(StorageKey.joiningProcessCount, simulation.joiningProcessCount.toString());
    localStorage.setItem(StorageKey.displayLinks, simulation.displayLinks.toString());
    localStorage.setItem(StorageKey.displayMessages, simulation.displayMessages.toString());
    localStorage.setItem(StorageKey.simulationSpeed, simulation.speed.toString());
    localStorage.setItem(StorageKey.samplingParamPush, simulation.push.toString());
    localStorage.setItem(StorageKey.samplingParamPull, simulation.pull.toString());
    localStorage.setItem(StorageKey.samplingParamT, simulation.T.toString());
    localStorage.setItem(StorageKey.samplingParamT, simulation.T.toString());
    localStorage.setItem(StorageKey.samplingParamC, simulation.c.toString());
    localStorage.setItem(StorageKey.samplingParamH, simulation.H.toString());
    localStorage.setItem(StorageKey.samplingParamS, simulation.S.toString());
}
function loadSettings() {
    if (localStorage.getItem(StorageKey.initialProcessCount)) {
        console.log('loading settings');
        simulation.initialProcessCount = parseInt(localStorage.getItem(StorageKey.initialProcessCount));
        simulation.joiningProcessCount = parseInt(localStorage.getItem(StorageKey.joiningProcessCount));
        simulation.displayLinks = localStorage.getItem(StorageKey.displayLinks) == 'true';
        simulation.displayMessages = localStorage.getItem(StorageKey.displayMessages) == 'true';
        simulation.speed = parseInt(localStorage.getItem(StorageKey.simulationSpeed));
        simulation.push = localStorage.getItem(StorageKey.samplingParamPush) == 'true';
        simulation.pull = localStorage.getItem(StorageKey.samplingParamPull) == 'true';
        simulation.T = parseInt(localStorage.getItem(StorageKey.samplingParamT));
        simulation.c = parseInt(localStorage.getItem(StorageKey.samplingParamC));
        simulation.H = parseInt(localStorage.getItem(StorageKey.samplingParamH));
        simulation.S = parseInt(localStorage.getItem(StorageKey.samplingParamS));
    }
    else {
        console.log('no settings found');
    }
}
//# sourceMappingURL=storage.js.map