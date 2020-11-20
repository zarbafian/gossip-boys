enum ProcessStatus {
    Offline,
    Starting,
    Online,
    Contanimated,
}

class Process implements MessageBusSubscriber {
    id: number;
    position: Point;
    status: ProcessStatus;

    topics: string[];

    peerCount: number;
    peers: number[];

    gossipedMessages: string[];

    constructor(id: number, position: Point, status: ProcessStatus, peerCount: number) {
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
        for(let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
    }

    drop() {
        for(let topic of this.topics) {
            MessageBus.getInstance().unsubscribe(this, topic);
        }
    }

    setPeers(peers: number[]) {
        this.peers = peers;
        // create links
        for(let peerId of this.peers) {
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

    onMessage(message: Message): void {
        //console.log(`process ${this.id} received message (${message.id}) from ${message.sender}`);
        svgManager.setProcessStatus(this.id, ProcessStatus.Contanimated);
        
        if(!this.gossipedMessages.includes(message.id)) {
            networkController.broadcast(this.id, message);
            this.gossipedMessages.push(message.id);
        }
    }
}