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
        this.stopped = true;
        this.id = id;
        this.position = position;
        this.status = PeerStatus.Offline;
        this.topics = ['broadcast'];
        this.topics.push(this.id.toString());
        this.view = new PeerSamplingService();
        this.links = [];
        this.quarters = [];
    }
    init() {
        this.topics.forEach(topic => MessageBus.getInstance().subscribe(this, topic));
        this.view.init(this.id);
        this.refreshLinks();
    }
    drop() {
        this.topics.forEach(topic => MessageBus.getInstance().unsubscribe(this, topic));
        this.clearQuarters();
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
                    resp.quarters = this.quarters.slice(0);
                    resp.payload = buffer;
                    network.send(this, [simulation.peerMap[message.sender]], resp);
                }
                this.view.select(message.payload);
                this.view.increaseAge();
                for (let quarter of message.quarters) {
                    this.onQuarter(quarter);
                }
                this.refreshLinks();
                break;
            case MessageType.Pull:
                if (simulation.pull) {
                    this.view.select(message.payload);
                    this.refreshLinks();
                    for (let quarter of message.quarters) {
                        this.onQuarter(quarter);
                    }
                }
                this.view.increaseAge();
                break;
            default:
                console.error(`unhandled message type : ${message.type}`);
                break;
        }
    }
    onQuarter(direction) {
        if (!this.quarters.includes(direction)) {
            this.quarters.push(direction);
            svgManager.addQuarter(this.id, direction);
        }
    }
    clearQuarters() {
        this.quarters.splice(0);
        svgManager.clearQuarters(this.id);
    }
    async start() {
        this.init();
        this.setStatus(PeerStatus.Online);
        this.running = true;
        this.stopped = false;
        while (this.running) {
            await sleep(simulation.T + getRandomInt(simulation.T) / 2);
            await this.active();
        }
        this.stopped = true;
    }
    async active() {
        let peerData = this.view.selectPeer();
        if (peerData != null) {
            if (simulation.push) {
                let buffer = [new PeerData(this.id, 0)];
                this.view.permute();
                this.view.moveOldestToEnd();
                Array.prototype.push.apply(buffer, this.view.getHead());
                let message = Message.new(MessageType.Push, this.id);
                message.quarters = this.quarters.slice(0);
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
        while (!this.stopped) {
            await sleep(100);
        }
        this.drop();
        this.setStatus(PeerStatus.Offline);
    }
}
//# sourceMappingURL=peer.js.map