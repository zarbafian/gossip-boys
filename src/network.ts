class NetworkController {

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

    generate() {
        let creationProbability = 0.7;
        let areaSize = 24;
        let width = svgManager.width;
        let height = svgManager.height;
        let maxX = Math.floor(width / areaSize);
        let maxY = Math.floor(height / areaSize);
        
        let nextId = 1;

        for(let x = 1; x < maxX - 1; x++) {
            for (let y = 1; y < maxY - 1; y++) {
                let px = x * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.x;
                let py = y * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.y;

                let proba = Math.random();
                if(proba < creationProbability) {
                    let process = new Process(nextId, new Point(px, py), ProcessStatus.Offline);
                    nextId++;
                    this.processes[process.id] = process;
                    svgManager.createProcess(process);
                }
            }
        }

        console.log(`created ${nextId - 1} processes`);
        console.log(`processes length is ${Object.keys(this.processes).length}`);
    }

    async startProcess(pid: number) {
        //this.processes[pid].start();
        //svgManager.setProcessStatus(pid, ProcessStatus.Starting);
        
        // subscribe to topics
        this.processes[pid].init();

        // connect to peers
        let onlineProcesses = this.getProcessesByStatus(ProcessStatus.Online, true);
        let currentIndex = 0;
        let maxConnectionAttempts = this.processes[pid].maxOutgoingPeers * 2;
        let attemps = 0;
        while(this.processes[pid].outgoingPeers.length < this.processes[pid].maxOutgoingPeers) {
            let peerPid = onlineProcesses[currentIndex];
            let success: boolean = await this.processes[pid].requestPeerConnection(peerPid);
            if(success) {
                let id1 = pid;
                let id2 = peerPid;
                let link = new Link(id1, id2);
                networkController.links.addLink(link);
                let id = toLinkId(id1, id2);
                //svgManager.createLink(id, networkController.processes[link.from].position, networkController.processes[link.to].position);
            }
            currentIndex++;
            attemps++;
            if (attemps >= maxConnectionAttempts) {
                break;
            }
        }
        
        this.processes[pid].status = ProcessStatus.Online;
        svgManager.setProcessStatus(pid, ProcessStatus.Online);
    }

    // broadcast a message to all peers
    broadcast(pid: number, message: Message) {
        let sender = this.processes[pid];
        if(sender != null) {
            let targets: Process[] = [];
            for(let pid2 of this.links.getProcessPeers(pid)) {
                targets.push(this.processes[pid2]);
            }
            this.send(sender, targets, message);
        }
    }

    // gossip a message to all peers except sender
    gossip(pid: number, message: Message) {
        let sender = this.processes[pid];
        if(sender != null) {
            let targets: Process[] = [];
            for(let pid2 of this.links.getProcessPeers(pid)) {
                if(pid2 != message.sender) {
                    targets.push(this.processes[pid2]);
                }
            }
            this.send(sender, targets, message);
        }
    }

    async send(sender: Process, targets: Process[], message: Message) {
        //svgManager.send(sender, targets, message);
        await sleep(1000);
        for (let target of targets) {
            MessageBus.getInstance().notify(message, target.id.toString());
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
    /*
    processCount(): number {
        return Object.keys(this.processes).length;
    }
    */
}