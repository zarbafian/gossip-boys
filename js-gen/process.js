var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus[ProcessStatus["Offline"] = 0] = "Offline";
    ProcessStatus[ProcessStatus["Starting"] = 1] = "Starting";
    ProcessStatus[ProcessStatus["Online"] = 2] = "Online";
    ProcessStatus[ProcessStatus["Contanimated"] = 3] = "Contanimated";
})(ProcessStatus || (ProcessStatus = {}));
class Process {
    constructor(id, position, status, peerCount) {
        this.id = id;
        this.position = position;
        this.status = status;
        this.peerCount = peerCount;
        this.peers = [];
        this.gossipedMessages = [];
        this.topics = ['broadcast'];
        this.topics.push(this.id.toString());
    }
    init() {
        for (let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
    }
    drop() {
        for (let topic of this.topics) {
            MessageBus.getInstance().unsubscribe(this, topic);
        }
    }
    setPeers(peers) {
        this.peers = peers;
        for (let peerId of this.peers) {
            let id1 = this.id;
            let id2 = peerId;
            let link = new Link(id1, id2);
            networkController.links.addLink(link);
            let id = toLinkId(id1, id2);
            svgManager.createLink(id, networkController.processes[link.from].position, networkController.processes[link.to].position);
        }
    }
    start() {
        this.status = ProcessStatus.Starting;
    }
    ready() {
        this.status = ProcessStatus.Online;
    }
    onMessage(message) {
        svgManager.setProcessStatus(this.id, ProcessStatus.Contanimated);
        if (!this.gossipedMessages.includes(message.id)) {
            networkController.broadcast(this.id, message);
            this.gossipedMessages.push(message.id);
        }
    }
}
//# sourceMappingURL=process.js.map