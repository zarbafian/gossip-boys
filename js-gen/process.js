var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus[ProcessStatus["Offline"] = 0] = "Offline";
    ProcessStatus[ProcessStatus["Starting"] = 1] = "Starting";
    ProcessStatus[ProcessStatus["Online"] = 2] = "Online";
    ProcessStatus[ProcessStatus["Source"] = 3] = "Source";
    ProcessStatus[ProcessStatus["Contaminated"] = 4] = "Contaminated";
})(ProcessStatus || (ProcessStatus = {}));
class Process {
    constructor(id, position, status) {
        this.id = id;
        this.position = position;
        this.status = status;
        this.maxOutgoingPeers = OUTGOING_PEERS;
        this.maxIncomingPeers = INCOMING_PEERS;
        this.outgoingPeers = [];
        this.incomingPeers = [];
        this.gossipedMessages = {};
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
    setStatus(status) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }
    async onPeerConnectionRequest(pid) {
        if (this.incomingPeers.length >= this.maxIncomingPeers) {
            return false;
        }
        this.incomingPeers.push(pid);
        return true;
    }
    async requestPeerConnection(pid) {
        let success = await networkController.processes[pid].onPeerConnectionRequest(this.id);
        if (success) {
            this.outgoingPeers.push(pid);
            return true;
        }
        return false;
    }
    onMessage(message) {
        svgManager.setProcessStatus(this.id, ProcessStatus.Contaminated);
        if (!Object.keys(this.gossipedMessages).includes(message.id)) {
            networkController.gossip(this.id, message);
            this.gossipedMessages[message.id] = message;
        }
    }
}
//# sourceMappingURL=process.js.map