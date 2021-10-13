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
    stoppedSamplingLoop: boolean = true;
    stoppedUpdateLoop: boolean = true;

    links: Link[];

    parts: PartIndex[];

    constructor(id: number, position: Point) {
        this.id = id;
        this.position = position;
        this.status = PeerStatus.Offline;
        this.topics = ['broadcast'];
        this.topics.push(this.id.toString());
        this.view = new PeerSamplingService();
        this.links = [];
        this.parts = [];
    }

    private init() {
        // subscribe to topics
        this.topics.forEach(topic => MessageBus.getInstance().subscribe(this, topic));

        // initialize view
        this.view.init(this.id);

        // display connections
        this.refreshLinks();
    }

    private drop() {
        // unsubscribe to topics
        this.topics.forEach(topic => MessageBus.getInstance().unsubscribe(this, topic));

        // clear data status
        this.clearParts();

        // remove connections
        this.removeAllLinks();
    }

    refreshLinks() {
        if(simulation.displayLinks) {
            let actualLinks = this.view.getPeers().map(peer => peer.id);
            let legacyLinks = this.links.map(link => link.to);
            let shouldBeAdded = actualLinks.filter(pid => !legacyLinks.includes(pid));
            let shouldBeDeleted = legacyLinks.filter(pid => !actualLinks.includes(pid));
            shouldBeAdded.forEach(pid => this.addLink(pid));
            shouldBeDeleted.forEach(pid => this.removeLink(pid));
        }
    }

    removeLink(pid: number) {
        for(let i=0; i < this.links.length; i++) {
            if(this.links[i].to == pid) {
                let link = this.links.splice(i, 1)[0];
                svgManager.removeLink(link);
                break;
            }
        }
    }

    removeAllLinks() {
        this.links.forEach(link => svgManager.removeLink(link));
        this.links.splice(0);
    }

    addLink(pid: number) {
        let link = new Link(this.id, pid);
        this.links.push(link);
        svgManager.createLink(toLinkId(link.from, link.to), simulation.peerMap[link.from].position, simulation.peerMap[link.to].position);
    }

    setStatus(status: PeerStatus) {
        this.status = status;
        svgManager.setProcessStatus(this.id, this.status);
    }
    
    onMessage(message: Message): void {
        //console.log(`process ${this.id} received message: id=${message.id}, type=${message.type}, sender=${message.sender}`);
        /*
        console.log(`${this.id}: received parts -> ${message.parts}`);
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

                    let resp = Message.new(MessageType.Pull, this.id);
                    resp.payload = buffer;
                    network.send(this, [ simulation.peerMap[message.sender]], resp);
                }
                this.view.select(message.payload);
                this.view.increaseAge();

                // update display
                this.refreshLinks();
                break;

                case MessageType.Pull:
                    if(simulation.pull) {
                        // should I handle a pull: yes
                        this.view.select(message.payload);
                        
                        // update display
                        this.refreshLinks()
                    }
                    this.view.increaseAge();

                break;
            case MessageType.UpdatePush:
                //console.log('handle update from ' + message.sender);
                if(simulation.pull) {
                    let resp = Message.new(MessageType.UpdatePull, this.id);
                    resp.parts = this.parts.slice(0);
                    network.send(this, [ simulation.peerMap[message.sender] ], resp);
                }
                for(let part of message.parts) {
                    this.onDataPart(part);
                }
                break;
            case MessageType.UpdatePull:
                if(simulation.pull) {
                    for(let part of message.parts) {
                        this.onDataPart(part);
                    }
                }
                break;
            default:
                console.error(`unhandled message type : ${message.type}`);
                break;
        }
    }

    onDataPart(partIndex: PartIndex) {
        if(!this.parts.includes(partIndex)) {
            this.parts.push(partIndex);
            svgManager.addDataPart(this.id, partIndex);
        }
    }

    clearParts() {
        this.parts.splice(0);
        svgManager.clearDataParts(this.id);
    }

    async start() {
        this.init();
        this.setStatus(PeerStatus.Online);
        this.running = true;
        this.peerSamplingLoop();
        this.stoppedSamplingLoop = false;
        this.updateLoop();
        this.stoppedUpdateLoop = false;
    }

    async peerSamplingLoop() {
        while(this.running) {
            await sleep(simulation.T + getRandomInt(simulation.T) / 2);
            await this.peerSamplingPeriod();
        }
        this.stoppedSamplingLoop = true;
    }

    async updateLoop() {
        while(this.running) {
            await sleep(500);
            await this.updatePeriod();
        }
        this.stoppedUpdateLoop = true;
    }

    async updatePeriod() {
        // check for update
        //if(this.parts.length > 0) {
            let pid = this.view.getPeer();
            if(pid != null) {
                let message = Message.new(MessageType.UpdatePush, this.id);
                message.parts = this.parts.slice(0);
                network.send(this, [ simulation.peerMap[pid] ], message);
            }
        //}
    }

    async peerSamplingPeriod() {
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

    startInfection() {
        this.setStatus(PeerStatus.Infected);
    }

    async stop() {
        this.running = false;
        while(!this.stoppedSamplingLoop && !this.stoppedUpdateLoop) {
            await sleep(100);
        }
        this.drop();

        this.setStatus(PeerStatus.Offline);
    }
}