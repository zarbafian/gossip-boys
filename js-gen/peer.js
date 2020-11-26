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
    }
    init() {
        for (let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
        this.view.init(this.id);
        if (simulation.displayLinks) {
            this.createLinks();
        }
    }
    updateLinks() {
        if (simulation.displayLinks) {
            this.removeLinks();
            this.createLinks();
        }
    }
    createLinks() {
        this.view.getPeers().forEach(peerData => this.addLink(peerData.id));
    }
    removeLinks() {
        this.links.forEach(link => svgManager.removeLink(link));
        this.links.splice(0);
    }
    addLink(pid) {
        let link = new Link(this.id, pid);
        this.links.push(link);
        svgManager.createLink(toLinkId(link.from, link.to), simulation.peerMap[link.from].position, simulation.peerMap[link.to].position);
    }
    drop() {
        this.topics.forEach(topic => MessageBus.getInstance().unsubscribe(this, topic));
        this.topics.splice(0);
        this.removeLinks();
        this.setStatus(PeerStatus.Offline);
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
                    let message = Message.new(MessageType.Pull, this.id);
                    message.payload = buffer;
                    network.send(this, [simulation.peerMap[message.sender]], message);
                }
                this.view.select(message.payload);
                this.view.increaseAge();
                this.updateLinks();
                break;
            case MessageType.Pull:
                if (simulation.pull) {
                    this.view.select(message.payload);
                    this.updateLinks();
                }
                this.view.increaseAge();
                break;
            default:
                console.error(`unhandled message type : ${message.type}`);
                break;
        }
    }
    async start() {
        this.init();
        this.setStatus(PeerStatus.Online);
        this.running = true;
        this.stopped = false;
        while (this.running) {
            await sleep(simulation.T);
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
    async stop() {
        this.running = false;
        while (!this.stopped) {
            await sleep(100);
        }
        this.drop();
    }
}
//# sourceMappingURL=peer.js.map