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

    constructor(id: number, position: Point) {
        this.id = id;
        this.position = position;
        this.status = PeerStatus.Offline;
        this.topics = ['broadcast'];
        this.topics.push(this.id.toString());
        this.view = new PeerSamplingService();
    }

    private init() {
        for(let topic of this.topics) {
            MessageBus.getInstance().subscribe(this, topic);
        }
        this.view.init(this.id);

        for(let peerData of this.view.getPeers()) {
            this.connectToPeer(peerData.id);
        }
    }

    connectToPeer(pid: number) {
        let id1 = this.id;
        let id2 = pid;
        let link = new Link(id1, id2);
        network.links.addLink(link);
        if(simulation.displayLinks) {
            svgManager.createLink(toLinkId(id1, id2), simulation.peerMap[link.from].position, simulation.peerMap[link.to].position);
        }
    }

    private drop() {
        for(let topic of this.topics) {
            MessageBus.getInstance().unsubscribe(this, topic);
        }
        
        this.topics = [];

        let removedLinks = network.links.removeByProcess(this.id);
        if(simulation.displayLinks) {
            removedLinks.forEach(link => svgManager.removeLink(link));
        }
    
        this.setStatus(PeerStatus.Offline);
    }

    setStatus(status: PeerStatus) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }
    
    onMessage(message: Message): void {
        console.log(`process ${this.id} received message (id=${message.id}, sender=${message.sender}, gossiper=${message.gossipers[message.gossipers.length-1]}, hops=${message.hops})`);

        if(message.value == 'swap') {
            // TODO
            this.view.select(message.payload);

            let removedLinks = network.links.removeByProcess(this.id);
            if(simulation.displayLinks) {
                //removedLinks.filter(link => link != null).forEach(link => svgManager.removeLink(link));
            }
            
            for(let peerData of this.view.getPeers()) {
                this.connectToPeer(peerData.id);
            }
            // TODO
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

            await this.push();
        }
        this.stopped = true;
    }

    async push() {
        let peerData = this.view.selectPeer();
        if(peerData != null) {
            console.log(`Peer ${this.id} selected ${peerData.id} for PUSH`);
            let buffer = [ new PeerData(this.id, 0) ];
            this.view.permute();
            this.view.moveOldestToEnd();
            Array.prototype.push.apply(buffer, this.view.getHead());

            let message = Message.new('swap', this.id, false);
            message.payload = buffer;
            network.send(this, [ simulation.peerMap[peerData.id]], message);
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