class Network {

    // list of primary processes
    // user for trusted retrieval of peers
    primaryProcesses: number[];

    // list of all processes
    processes: { [id: string]: Process; };

    // process peering: links between processes
    links: Links;

    constructor() {
        this.processes = {};
        this.links = new Links();
    }

    getProcessKeys(): number[] {
        return Object.keys(this.processes).map(key => parseInt(key));
    }

    async startProcess(pid: number) {
        //this.processes[pid].start();
        //svgManager.setProcessStatus(pid, ProcessStatus.Starting);
        
        // subscribe to topics
        this.processes[pid].init();

        // connect to other peers
        this.createOutgoingConnections(pid);

        // update status
        this.processes[pid].setStatus(ProcessStatus.Online);
    }

    async createOutgoingConnections(pid: number) {
        let onlineProcesses = this.getProcessesByStatus(ProcessStatus.Online, true);
        let currentIndex = 0;
        let maxConnectionAttempts = this.processes[pid].maxOutgoingPeers * 2;
        let attemps = 0;
        while(this.processes[pid].outgoingPeers.length < this.processes[pid].maxOutgoingPeers && currentIndex < onlineProcesses.length) {
            let peerPid = onlineProcesses[currentIndex];
            let success: boolean = await this.processes[pid].requestPeerConnection(peerPid);
            if(success) {
                let id1 = pid;
                let id2 = peerPid;
                let link = new Link(id1, id2);
                this.links.addLink(link);
                let id = toLinkId(id1, id2);
                if(simulation.displayLinks) {
                    svgManager.createLink(id, this.processes[link.from].position, this.processes[link.to].position);
                }
            }
            currentIndex++;
            attemps++;
            if (attemps >= maxConnectionAttempts) {
                break;
            }
        }
    }

    stopProcess(pid: number) {
        this.processes[pid].drop();
    }
/*
    // broadcast a message to all peers
    broadcast(pid: number, message: Message): number {
        let sender = this.processes[pid];
        if(sender != null) {
            let targets: Process[] = [];
            for(let pid2 of this.links.getConnectedPeers(pid)) {
                targets.push(this.processes[pid2]);
            }
            this.send(sender, targets, message);
            return targets.length;
        }
        return 0;
    }

    // gossip a message to all peers except its sender and gossipers
    gossip(pid: number, message: Message) {
        let sender = this.processes[pid];
        if(sender != null) {
            let targets: Process[] = [];
            for(let pid2 of this.links.getConnectedPeers(pid)) {
                if(pid2 != message.sender && !message.gossipers.includes(pid2)) {
                    targets.push(this.processes[pid2]);
                }
            }
            this.send(sender, targets, message);
        }
    }
*/
    async send(sender: Peer, targets: Peer[], message: Message) {
        if(simulation.displayMessages) {
            svgManager.send(sender, targets, message);
        }
        else {
            await sleep(simulation.speed * 50);
            for (let target of targets) {
                MessageBus.getInstance().notify(message, target.id.toString());
            }
        }
    }

    getProcessesByStatus(status: ProcessStatus, shuffle: boolean): number[] {
        let result = [];
        for(let pid in this.processes) {
            if(this.processes[pid].status == status) {
                result.push(this.processes[pid].id);
            }
        }
        if(shuffleArray) {
            shuffleArray(result);
        }
        return result;
    }
}