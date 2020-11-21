enum ProcessStatus {
    Offline,
    Starting,
    Online,
    Source,
    Contaminated,
}

class Process implements MessageBusSubscriber {
    id: number;
    position: Point;
    status: ProcessStatus;

    topics: string[];

    maxOutgoingPeers: number;
    maxIncomingPeers: number;
    outgoingPeers: number[];
    incomingPeers: number[];

    gossipedMessages: { [mid: string]: Message };

    constructor(id: number, position: Point, status: ProcessStatus) {
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
        for(let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
    }

    drop() {
        for(let topic of this.topics) {
            MessageBus.getInstance().unsubscribe(this, topic);
        }
    }

    setStatus(status: ProcessStatus) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }

    async onPeerConnectionRequest(pid: number): Promise<boolean> {
        if(this.incomingPeers.length >= this.maxIncomingPeers) {
            return false;
        }
        this.incomingPeers.push(pid);
        //await sleep(1000);
        return true;
    }

    async requestPeerConnection(pid: number): Promise<boolean> {
        let success: boolean = await networkController.processes[pid].onPeerConnectionRequest(this.id);
        if(success) {
            this.outgoingPeers.push(pid);
            return true;
        }
        return false;
    }

    onMessage(message: Message): void {
        //console.log(`process ${this.id} received message (${message.id}) from ${message.sender}`);
        svgManager.setProcessStatus(this.id, ProcessStatus.Contaminated);
        
        if(!Object.keys(this.gossipedMessages).includes(message.id)) {
            networkController.gossip(this.id, message);
            this.gossipedMessages[message.id] = message;
        }
    }
}