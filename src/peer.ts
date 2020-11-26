enum PeerStatus {
    Offline,
    Online,
    Infected,
    Removed,
}

class Peer implements MessageBusSubscriber {
    id: number;
    position: Point;
    status: PeerStatus;
    topics: string[];

    view: PeerSamplingService;

    running: boolean = false;
    stopped: boolean = true;

    links: Link[];

    constructor(id: number, position: Point) {
        this.id = id;
        this.position = position;
        this.status = PeerStatus.Offline;
        this.topics = ['broadcast'];
        this.topics.push(this.id.toString());
        this.view = new PeerSamplingService();
        this.links = [];
    }

    private init() {
        for(let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
        this.view.init(this.id);

        if(simulation.displayLinks) {
            this.createLinks();
        }
    }

    updateLinks() {
        if(simulation.displayLinks) {
            this.removeLinks();
            this.createLinks();
        }
    }

    /**
     * Create visual links between this peer and its connected peers.
     */
    createLinks() {
        this.view.getPeers().forEach(peerData => this.addLink(peerData.id));
    }

    /**
     * Remove visual links between this peer and its connected peers.
     */
    removeLinks() {
        this.links.forEach(link => svgManager.removeLink(link));
        this.links.splice(0);
    }

    addLink(pid: number) {
        let link = new Link(this.id, pid);
        this.links.push(link);
        svgManager.createLink(toLinkId(link.from, link.to), simulation.peerMap[link.from].position, simulation.peerMap[link.to].position);
    }

    private drop() {
        this.topics.forEach(topic => MessageBus.getInstance().unsubscribe(this, topic));
        this.topics.splice(0);

        this.removeLinks();
    
        this.setStatus(PeerStatus.Offline);
    }

    setStatus(status: PeerStatus) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }
    
    onMessage(message: Message): void {
        //console.log(`process ${this.id} received message: id=${message.id}, type=${message.type}, sender=${message.sender}`);
        /*
        if(message.payload) {
            let payload = (message.payload as PeerData[]).map(p => `( ${p.id}@${p.age} )`).join(', ');
            console.log(`payload -> ${payload}`);
        }
        */

        switch(message.type) {
            case MessageType.Push:
                if(simulation.pull) {
                    // should I answer to a push: yes
                    let buffer = [ new PeerData(this.id, 0) ];
                    this.view.permute();
                    this.view.moveOldestToEnd();
                    Array.prototype.push.apply(buffer, this.view.getHead());

                    let message = Message.new(MessageType.Pull, this.id);
                    message.payload = buffer;
                    network.send(this, [ simulation.peerMap[message.sender]], message);
                }
                this.view.select(message.payload);
                this.view.increaseAge();

                // update display
                this.updateLinks();
                break;
                case MessageType.Pull:
                    if(simulation.pull) {
                        // should I handle a pull: yes
                        this.view.select(message.payload);
                        
                        // update display
                        this.updateLinks()
                }
                this.view.increaseAge();
                break;
            default:
                console.error(`unhandled message type : ${message.type}`);
                break;
        }
        /*
        if(message.epidemic) {
            this.setStatus(PeerStatus.Infected);
            if(!Object.keys(this.gossipedMessages).includes(message.id)) {
                let copy = message.clone();
                copy.gossipers.push(this.id);
                copy.hops = copy.hops + 1;
                networkController.gossip(this.id, copy);
                this.gossipedMessages[copy.id] = copy;
            }
        }
        */
    }

    async start() {
        
        this.init();

        this.setStatus(PeerStatus.Online);
        this.running = true;
        this.stopped = false;
        while(this.running) {

            await sleep(simulation.T);

            await this.active();
        }
        this.stopped = true;
    }

    async active() {
        let peerData = this.view.selectPeer();
        if(peerData != null) {
            if(simulation.push) {
                //console.log(`Peer ${this.id} selected ${peerData.id} for PUSH`);
                let buffer = [ new PeerData(this.id, 0) ];
                this.view.permute();
                this.view.moveOldestToEnd();
                Array.prototype.push.apply(buffer, this.view.getHead());
    
                let message = Message.new(MessageType.Push, this.id);
                message.payload = buffer;
                network.send(this, [ simulation.peerMap[peerData.id]], message);
            }
            else {
                //console.log(`Peer ${this.id} selected ${peerData.id} for PULL`);
                let message = Message.new(MessageType.Pull, this.id);
                message.payload = [];
                network.send(this, [ simulation.peerMap[peerData.id]], message);
            }
        }
        else {
            console.log(`Peer ${this.id} has no peers for PUSH`);
        }
    }

    async stop() {
        this.running = false;
        while(!this.stopped) {
            await sleep(100);
        }
        this.drop();
    }
}