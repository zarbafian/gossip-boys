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
    }
    init() {
        for (let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
        this.view.init(this.id);
        for (let peerData of this.view.getPeers()) {
            this.connectToPeer(peerData.id);
        }
    }
    connectToPeer(pid) {
        let id1 = this.id;
        let id2 = pid;
        let link = new Link(id1, id2);
        network.links.addLink(link);
        if (simulation.displayLinks) {
            svgManager.createLink(toLinkId(id1, id2), simulation.peerMap[link.from].position, simulation.peerMap[link.to].position);
        }
    }
    drop() {
        for (let topic of this.topics) {
            MessageBus.getInstance().unsubscribe(this, topic);
        }
        this.topics = [];
        let removedLinks = network.links.removeByProcess(this.id);
        if (simulation.displayLinks) {
            removedLinks.forEach(link => svgManager.removeLink(link));
        }
        this.setStatus(PeerStatus.Offline);
    }
    setStatus(status) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }
    onMessage(message) {
        console.log(`process ${this.id} received message (id=${message.id}, sender=${message.sender}, gossiper=${message.gossipers[message.gossipers.length - 1]}, hops=${message.hops})`);
        if (message.value == 'swap') {
            this.view.select(message.payload);
            let removedLinks = network.links.removeByProcess(this.id);
            if (simulation.displayLinks) {
            }
            for (let peerData of this.view.getPeers()) {
                this.connectToPeer(peerData.id);
            }
        }
    }
    async start() {
        this.init();
        this.setStatus(PeerStatus.Online);
        this.running = true;
        this.stopped = false;
        while (this.running) {
            await sleep(simulation.T);
            await this.push();
        }
        this.stopped = true;
    }
    async push() {
        let peerData = this.view.selectPeer();
        if (peerData != null) {
            console.log(`Peer ${this.id} selected ${peerData.id} for PUSH`);
            let buffer = [new PeerData(this.id, 0)];
            this.view.permute();
            this.view.moveOldestToEnd();
            Array.prototype.push.apply(buffer, this.view.getHead());
            let message = Message.new('swap', this.id, false);
            message.payload = buffer;
            network.send(this, [simulation.peerMap[peerData.id]], message);
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