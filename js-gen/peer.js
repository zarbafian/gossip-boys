var PeerStatus;
(function (PeerStatus) {
    PeerStatus[PeerStatus["Offline"] = 0] = "Offline";
    PeerStatus[PeerStatus["Online"] = 1] = "Online";
    PeerStatus[PeerStatus["Infected"] = 2] = "Infected";
    PeerStatus[PeerStatus["Removed"] = 3] = "Removed";
})(PeerStatus || (PeerStatus = {}));
class Peer {
    constructor(id, position) {
        this.running = false;
        this.stoppedSamplingLoop = true;
        this.stoppedUpdateLoop = true;
        this.id = id;
        this.position = position;
        this.status = PeerStatus.Offline;
        this.topics = ['broadcast'];
        this.topics.push(this.id.toString());
        this.view = new PeerSamplingService();
        this.links = [];
        this.parts = [];
    }
    init() {
        this.topics.forEach(topic => MessageBus.getInstance().subscribe(this, topic));
        this.view.init(this.id);
        this.refreshLinks();
    }
    drop() {
        this.topics.forEach(topic => MessageBus.getInstance().unsubscribe(this, topic));
        this.clearParts();
        this.removeAllLinks();
    }
    refreshLinks() {
        if (simulation.displayLinks) {
            let actualLinks = this.view.getPeers().map(peer => peer.id);
            let legacyLinks = this.links.map(link => link.to);
            let shouldBeAdded = actualLinks.filter(pid => !legacyLinks.includes(pid));
            let shouldBeDeleted = legacyLinks.filter(pid => !actualLinks.includes(pid));
            shouldBeAdded.forEach(pid => this.addLink(pid));
            shouldBeDeleted.forEach(pid => this.removeLink(pid));
        }
    }
    removeLink(pid) {
        for (let i = 0; i < this.links.length; i++) {
            if (this.links[i].to == pid) {
                let link = this.links.splice(i, 1)[0];
                svgManager.removeLink(link);
                break;
            }
        }
    }
    removeAllLinks() {
        this.links.forEach(link => svgManager.removeLink(link));
        this.links.splice(0);
    }
    addLink(pid) {
        let link = new Link(this.id, pid);
        this.links.push(link);
        svgManager.createLink(toLinkId(link.from, link.to), simulation.peerMap[link.from].position, simulation.peerMap[link.to].position);
    }
    setStatus(status) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }
    onMessage(message) {
        switch (message.type) {
            case MessageType.Push:
                if (simulation.pull) {
                    let buffer = [new PeerData(this.id, 0)];
                    this.view.permute();
                    this.view.moveOldestToEnd();
                    Array.prototype.push.apply(buffer, this.view.getHead());
                    let resp = Message.new(MessageType.Pull, this.id);
                    resp.payload = buffer;
                    network.send(this, [simulation.peerMap[message.sender]], resp);
                }
                this.view.select(message.payload);
                this.view.increaseAge();
                this.refreshLinks();
                break;
            case MessageType.Pull:
                if (simulation.pull) {
                    this.view.select(message.payload);
                    this.refreshLinks();
                }
                this.view.increaseAge();
                break;
            case MessageType.UpdatePush:
                if (simulation.pull) {
                    let resp = Message.new(MessageType.UpdatePull, this.id);
                    resp.parts = this.parts.slice(0);
                    network.send(this, [simulation.peerMap[message.sender]], resp);
                }
                for (let part of message.parts) {
                    this.onDataPart(part);
                }
                break;
            case MessageType.UpdatePull:
                if (simulation.pull) {
                    for (let part of message.parts) {
                        this.onDataPart(part);
                    }
                }
                break;
            default:
                console.error(`unhandled message type : ${message.type}`);
                break;
        }
    }
    onDataPart(partIndex) {
        if (!this.parts.includes(partIndex)) {
            this.parts.push(partIndex);
            svgManager.addDataPart(this.id, partIndex);
        }
    }
    clearParts() {
        this.parts.splice(0);
        svgManager.clearDataParts(this.id);
    }
    async start() {
        this.init();
        this.setStatus(PeerStatus.Online);
        this.running = true;
        this.peerSamplingLoop();
        this.stoppedSamplingLoop = false;
        this.updateLoop();
        this.stoppedUpdateLoop = false;
    }
    async peerSamplingLoop() {
        while (this.running) {
            await sleep(simulation.T + getRandomInt(simulation.T) / 2);
            await this.peerSamplingPeriod();
        }
        this.stoppedSamplingLoop = true;
    }
    async updateLoop() {
        while (this.running) {
            await sleep(500);
            await this.updatePeriod();
        }
        this.stoppedUpdateLoop = true;
    }
    async updatePeriod() {
        let pid = this.view.getPeer();
        if (pid != null) {
            let message = Message.new(MessageType.UpdatePush, this.id);
            message.parts = this.parts.slice(0);
            network.send(this, [simulation.peerMap[pid]], message);
        }
    }
    async peerSamplingPeriod() {
        let peerData = this.view.selectPeer();
        if (peerData != null) {
            if (simulation.push) {
                let buffer = [new PeerData(this.id, 0)];
                this.view.permute();
                this.view.moveOldestToEnd();
                Array.prototype.push.apply(buffer, this.view.getHead());
                let message = Message.new(MessageType.Push, this.id);
                message.payload = buffer;
                network.send(this, [simulation.peerMap[peerData.id]], message);
            }
            else {
                let message = Message.new(MessageType.Pull, this.id);
                message.payload = [];
                network.send(this, [simulation.peerMap[peerData.id]], message);
            }
        }
        else {
            console.log(`Peer ${this.id} has no peers for PUSH`);
        }
    }
    startInfection() {
        this.setStatus(PeerStatus.Infected);
    }
    async stop() {
        this.running = false;
        while (!this.stoppedSamplingLoop && !this.stoppedUpdateLoop) {
            await sleep(100);
        }
        this.drop();
        this.setStatus(PeerStatus.Offline);
    }
}
//# sourceMappingURL=peer.js.map