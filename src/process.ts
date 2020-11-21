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

    broadcast(message: Message) {
        if(message.epidemic) {
            this.setStatus(ProcessStatus.Contaminated);
        }
        this.gossipedMessages[message.id] = message;
        networkController.broadcast(this.id, message);
    }
    getHopCount(messageId: string): number {
        if(messageId in this.gossipedMessages) {
            return this.gossipedMessages[messageId].hops;
        }
        return -1;
    }

    onMessage(message: Message): void {
        //console.log(`process ${this.id} received message (id=${message.id}, sender=${message.sender}, gossiper=${message.gossipers[message.gossipers.length-1]}, hops=${message.hops}) from ${message.sender}`);

        if(message.epidemic) {
            this.setStatus(ProcessStatus.Contaminated);
            if(!Object.keys(this.gossipedMessages).includes(message.id)) {
                let copy = message.clone();
                copy.gossipers.push(this.id);
                copy.hops = copy.hops + 1;
                networkController.gossip(this.id, copy);
                this.gossipedMessages[copy.id] = copy;
            }
        }
    }
}