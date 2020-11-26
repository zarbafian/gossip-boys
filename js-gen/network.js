class Network {
    constructor() {
        this.processes = {};
        this.links = new Links();
    }
    getProcessKeys() {
        return Object.keys(this.processes).map(key => parseInt(key));
    }
    async startProcess(pid) {
        this.processes[pid].init();
        this.createOutgoingConnections(pid);
        this.processes[pid].setStatus(ProcessStatus.Online);
    }
    async createOutgoingConnections(pid) {
        let onlineProcesses = this.getProcessesByStatus(ProcessStatus.Online, true);
        let currentIndex = 0;
        let maxConnectionAttempts = this.processes[pid].maxOutgoingPeers * 2;
        let attemps = 0;
        while (this.processes[pid].outgoingPeers.length < this.processes[pid].maxOutgoingPeers && currentIndex < onlineProcesses.length) {
            let peerPid = onlineProcesses[currentIndex];
            let success = await this.processes[pid].requestPeerConnection(peerPid);
            if (success) {
                let id1 = pid;
                let id2 = peerPid;
                let link = new Link(id1, id2);
                this.links.addLink(link);
                let id = toLinkId(id1, id2);
                if (simulation.displayLinks) {
                    svgManager.createLink(id, this.processes[link.from].position, this.processes[link.to].position);
                }
            }
            currentIndex++;
            attemps++;
            if (attemps >= maxConnectionAttempts) {
                break;
            }
        }
    }
    stopProcess(pid) {
        this.processes[pid].drop();
    }
    async send(sender, targets, message) {
        if (simulation.displayMessages) {
            svgManager.send(sender, targets, message);
        }
        else {
            await sleep(simulation.speed * 50);
            for (let target of targets) {
                MessageBus.getInstance().notify(message, target.id.toString());
            }
        }
    }
    getProcessesByStatus(status, shuffle) {
        let result = [];
        for (let pid in this.processes) {
            if (this.processes[pid].status == status) {
                result.push(this.processes[pid].id);
            }
        }
        if (shuffleArray) {
            shuffleArray(result);
        }
        return result;
    }
}
//# sourceMappingURL=network.js.map