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
        this.setStatus(ProcessStatus.Offline);
        this.gossipedMessages = {};
        for (let pid of this.outgoingPeers) {
            this.requestPeerDisconnection(pid);
        }
        for (let pid of this.incomingPeers) {
            this.requestPeerDisconnection(pid);
        }
        networkController.links.removeByProcess(this.id);
        this.outgoingPeers = [];
        this.incomingPeers = [];
    }
    setStatus(status) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }
    disconnectFromPeer(pid) {
        if (this.outgoingPeers.indexOf(pid) !== -1) {
            this.outgoingPeers.splice(this.outgoingPeers.indexOf(pid), 1);
        }
        if (this.incomingPeers.indexOf(pid) !== -1) {
            this.incomingPeers.splice(this.incomingPeers.indexOf(pid), 1);
        }
    }
    onPeerDisconnectionRequest(pid) {
        this.disconnectFromPeer(pid);
    }
    async onPeerConnectionRequest(pid) {
        if (this.incomingPeers.length >= this.maxIncomingPeers) {
            return false;
        }
        this.incomingPeers.push(pid);
        return true;
    }
    requestPeerDisconnection(pid) {
        networkController.processes[pid].onPeerDisconnectionRequest(this.id);
        this.disconnectFromPeer(pid);
    }
    async requestPeerConnection(pid) {
        let success = await networkController.processes[pid].onPeerConnectionRequest(this.id);
        if (success) {
            this.outgoingPeers.push(pid);
            return true;
        }
        return false;
    }
    broadcast(message) {
        if (message.epidemic) {
            this.setStatus(ProcessStatus.Contaminated);
        }
        this.gossipedMessages[message.id] = message;
        networkController.broadcast(this.id, message);
    }
    getHopCount(messageId) {
        if (messageId in this.gossipedMessages) {
            return this.gossipedMessages[messageId].hops;
        }
        return -1;
    }
    onMessage(message) {
        if (message.epidemic) {
            this.setStatus(ProcessStatus.Contaminated);
            if (!Object.keys(this.gossipedMessages).includes(message.id)) {
                let copy = message.clone();
                copy.gossipers.push(this.id);
                copy.hops = copy.hops + 1;
                networkController.gossip(this.id, copy);
                this.gossipedMessages[copy.id] = copy;
            }
        }
    }
}
//# sourceMappingURL=process.js.map