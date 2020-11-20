class NetworkController {
    constructor() {
        this.processes = {};
        this.links = new Links();
    }
    generate() {
        let creationProbability = 0.7;
        let areaSize = 24;
        let width = svgManager.width;
        let height = svgManager.height;
        let maxX = Math.floor(width / areaSize);
        let maxY = Math.floor(height / areaSize);
        let nextId = 1;
        for (let x = 1; x < maxX - 1; x++) {
            for (let y = 1; y < maxY - 1; y++) {
                let px = x * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.x;
                let py = y * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.y;
                let proba = Math.random();
                if (proba < creationProbability) {
                    let process = new Process(nextId, new Point(px, py), ProcessStatus.Offline, 6);
                    nextId++;
                    this.processes[process.id] = process;
                    svgManager.createProcess(process);
                }
            }
        }
        console.log(`created ${nextId - 1} processes`);
        console.log(`processes length is ${Object.keys(this.processes).length}`);
    }
    async startProcess(pid) {
        this.processes[pid].init();
        let processPeers = this.getRandomPeers(pid);
        this.processes[pid].setPeers(processPeers);
        await sleep(100);
        this.processes[pid].ready();
        svgManager.setProcessStatus(pid, ProcessStatus.Online);
    }
    getRandomPeers(pid) {
        let onlineProcesses = this.getProcessesByStatus(ProcessStatus.Online);
        let myIndex = onlineProcesses.indexOf(pid);
        if (myIndex < 0) {
            console.log(`ERROR: process ${pid} not found`);
        }
        else {
            onlineProcesses.splice(myIndex, 1);
        }
        let selectedPeers = getRandomCombination(onlineProcesses.length, this.processes[pid].peerCount)
            .map(idx => onlineProcesses[idx]);
        return selectedPeers;
    }
    broadcast(pid, message) {
        let sender = this.processes[pid];
        if (sender != null) {
            let targets = [];
            for (let pid2 of this.links.getProcessPeers(pid)) {
                targets.push(this.processes[pid2]);
            }
            targets.push(this.processes[pid]);
            svgManager.send(sender, targets, message);
        }
    }
    getProcessesByStatus(status) {
        let result = [];
        for (let pid in this.processes) {
            if (this.processes[pid].status == status) {
                result.push(this.processes[pid].id);
            }
        }
        return result;
    }
}
//# sourceMappingURL=network.js.map