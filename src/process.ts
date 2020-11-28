enum ProcessStatus {
    Offline,
    Starting,
    Online,
    Source,
    Infected,
}

class Process implements MessageBusSubscriber {
    id: number;
    /*
    position: Point;
    status: ProcessStatus;

    topics: string[];

    maxOutgoingPeers: number;
    maxIncomingPeers: number;
    outgoingPeers: number[];
    incomingPeers: number[];

    gossipedMessages: { [mid: string]: Message };
    sentMessagesCount: { [mid: string]: number };
    gossipedPeers: { [mid: string]: number[] };

    constructor(id: number, position: Point, status: ProcessStatus) {
        this.id = id;
        this.position = position;
        this.status = status;
        this.maxOutgoingPeers = simulation.outgoingPeers;
        this.maxIncomingPeers = simulation.incomingPeers;
        this.outgoingPeers = [];
        this.incomingPeers = [];

        this.gossipedMessages = {};
        this.sentMessagesCount = {};
        this.gossipedPeers = {};

        this.topics = ['broadcast'];
        this.topics.push(this.id.toString());
    }

    init() {
        for(let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
    }

    drop() {
        for(let topic of this.topics) {
            MessageBus.getInstance().unsubscribe(this, topic);
        }
        this.setStatus(ProcessStatus.Offline);
        this.gossipedMessages = {};
        for(let pid of this.outgoingPeers) {
            this.requestPeerDisconnection(pid);
        }
        for(let pid of this.incomingPeers) {
            this.requestPeerDisconnection(pid);
        }
        network.links.removeByProcess(this.id);
        this.outgoingPeers = [];
        this.incomingPeers = [];
    }

    setStatus(status: ProcessStatus) {
        this.status = status;
        //svgManager.setProcessStatus(this.id, this.status);
    }

    disconnectFromPeer(pid: number) {
        if(this.outgoingPeers.indexOf(pid) !== -1) {
            this.outgoingPeers.splice(this.outgoingPeers.indexOf(pid), 1);
        }
        if(this.incomingPeers.indexOf(pid) !== -1) {
            this.incomingPeers.splice(this.incomingPeers.indexOf(pid), 1);
        }
    }

    onPeerDisconnectionRequest(pid: number) {
        this.disconnectFromPeer(pid);
    }

    async onPeerConnectionRequest(pid: number): Promise<boolean> {
        if(this.incomingPeers.length >= this.maxIncomingPeers) {
            return false;
        }
        this.incomingPeers.push(pid);
        //await sleep(1000);
        return true;
    }

    requestPeerDisconnection(pid: number) {
        // disconnect from remote side
        network.processes[pid].onPeerDisconnectionRequest(this.id);
        // disconnect from my side
        this.disconnectFromPeer(pid);
    }

    async requestPeerConnection(pid: number): Promise<boolean> {
        let success: boolean = await network.processes[pid].onPeerConnectionRequest(this.id);
        if(success) {
            this.outgoingPeers.push(pid);
            return true;
        }
        return false;
    }

    broadcast(message: Message) {
        if(message.epidemic) {
            this.setStatus(ProcessStatus.Infected);
        }
        this.gossipedMessages[message.id] = message;
        let peerCount = network.broadcast(this.id, message);
        this.sentMessagesCount[message.id] = peerCount;
    }
    getHopCount(messageId: string): number {
        if(messageId in this.gossipedMessages) {
            return this.gossipedMessages[messageId].hops;
        }
        return -1;
    }
    getMessageCount(messageId: string) {
        if(messageId in this.sentMessagesCount) {
            return this.sentMessagesCount[messageId];
        }
        return 0;
    }
    */
    
    onMessage(message: Message): void {
        //console.log(`process ${this.id} received message (id=${message.id}, sender=${message.sender}, gossiper=${message.gossipers[message.gossipers.length-1]}, hops=${message.hops}) from ${message.sender}`);
        
        /*
        if(message.epidemic) {
            this.setStatus(ProcessStatus.Infected);
            if(!Object.keys(this.gossipedMessages).includes(message.id)) {
                let copy = message.clone();
                copy.gossipers.push(this.id);
                copy.hops = copy.hops + 1;
                network.gossip(this.id, copy);
                this.gossipedMessages[copy.id] = copy;
            }
        }
        */
    }
    /*
    randomGossip(message: Message) {
        this.setStatus(ProcessStatus.Infected);
        let onlineProcesses = network.getProcessesByStatus(ProcessStatus.Online, true);
        for(let pid of onlineProcesses) {
            if(!this.gossipedPeers[message.id]) {
                network.send(network.processes[this.id], [network.processes[pid]], message);
                this.gossipedPeers[message.id] = [pid];
                break;
            }
            else if(!this.gossipedPeers[message.id].includes(pid)){
                network.send(network.processes[this.id], [network.processes[pid]], message);
                this.gossipedPeers[message.id].push(pid);
                break;
            }
            else {
                continue;
            }
        }
        this.gossipedMessages[message.id] = message;
        this.sentMessagesCount[message.id] = (this.sentMessagesCount[message.id] || 0) + 1;
    }
    */
}