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
                    let process = new Process(nextId, new Point(px, py), ProcessStatus.Offline, 4);
                    nextId++;
                    this.processes[process.id] = process;
                    svgManager.createProcess(process);
                }
            }
        }

        console.log(`created ${nextId - 1} processes`);
        console.log(`processes length is ${Object.keys(this.processes).length}`);
    }

    startProcess(pid: number) {
        //this.processes[pid].start();
        //svgManager.setProcessStatus(pid, ProcessStatus.Starting);
        
        this.processes[pid].init();

        let processPeers = this.getRandomPeers(pid);
        this.processes[pid].setPeers(processPeers);
        
        this.processes[pid].ready();
        svgManager.setProcessStatus(pid, ProcessStatus.Online);
    }

    getRandomPeers(pid: number): number[] {
        let onlineProcesses = this.getProcessesByStatus(ProcessStatus.Online);
        let myIndex = onlineProcesses.indexOf(pid);
        if(myIndex < 0) {
            console.log(`ERROR: process ${pid} not found`);
        }
        else {
            onlineProcesses.splice(myIndex, 1);
        }

        let selectedPeers = getRandomCombination(onlineProcesses.length, this.processes[pid].peerCount)
            .map(idx => onlineProcesses[idx]);
        
        return selectedPeers;
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
        await sleep(200);
        for (let target of targets) {
            MessageBus.getInstance().notify(message, target.id.toString());
        }
    }

    getProcessesByStatus(status: ProcessStatus): number[] {
        let result = [];
        for(let pid in this.processes) {
            if(this.processes[pid].status == status) {
                result.push(this.processes[pid].id);
            }
        }
        return result;
    }
    /*
    processCount(): number {
        return Object.keys(this.processes).length;
    }
    */
}