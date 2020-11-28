class Simulation {

    running: boolean = false;
    initialProcessCount: number = 100;
    joiningProcessCount: number = 10;

    //outgoingPeers: number = 12;
    //incomingPeers: number = 6;

    displayLinks: boolean = true;
    displayMessages: boolean = true;
    speed: number = 20;

    onlinePeers: Peer[] = [];
    offlinePeers: Peer[] = [];
    peerMap: { [pid: number]: Peer } = {};

    push: boolean = true;
    pull: boolean = true;
    T: number = 1000;
    c: number = 30;
    H: number = 2;
    S: number = 15;

    init() {
        // generate network of all potential processes
        this.offlinePeers = this.generateNetwork();
        for(let peer of this.offlinePeers) {
            this.peerMap[peer.id] = peer;
        }
    }

    async toggleProcess(pid: number) {
        if(this.peerMap[pid]) {
            let peer = this.peerMap[pid];
            if(peer.running) {
                await peer.stop();
                console.log(`peer ${peer.id} has stopped`);
                for(let i=0; i<this.onlinePeers.length; i++) {
                    if(this.onlinePeers[i].id == peer.id) {
                        let removedPeer: Peer = this.onlinePeers.splice(i, 1)[0];
                        this.offlinePeers.push(removedPeer);
                        break;
                    }
                }
            }
            else {
                peer.start();
                console.log(`peer ${peer.id} has started`);
                for(let i=0; i<this.offlinePeers.length; i++) {
                    if(this.offlinePeers[i].id == peer.id) {
                        let removedPeer: Peer = this.offlinePeers.splice(i, 1)[0];
                        this.onlinePeers.push(removedPeer);
                        break;
                    }
                }
            }
        }
    }

    infect(pid: number) {
        if(this.peerMap[pid]) {
            let peer = this.peerMap[pid];
            if(peer.running) {
                peer.startInfection();
            }
        }
    }

    async start() {
        console.log('Starting simulation...');
        
        // select initial peers
        shuffleArray(this.offlinePeers);
        this.onlinePeers = this.offlinePeers.splice(0, this.initialProcessCount);

        // setup DNS with initial peers
        /*
        for(let i=0; i < Math.min(10, this.onlinePeers.length); i++) {
            DnsService.getInstance().registerPeer(this.onlinePeers[i].id);
        }
        */
        DnsService.getInstance().registerPeer(this.onlinePeers[0].id);

        // start peers
        for(let p of this.onlinePeers) {
            p.start();
        }

        console.log('...simulation started');
    }

    async stop() {
        console.log(`Stopping simulation...`);

        // stop each peer
        this.onlinePeers.forEach(p => p.running = false);
        for(let p of this.onlinePeers) {
            await p.stop();
            console.log(`peer ${p.id} has stopped`);
        }

        // clear online peers structure
        Array.prototype.push.apply(this.offlinePeers, this.onlinePeers.splice(0));

        // clear DNS peers
        DnsService.getInstance().clearPeers();

        console.log(`...simulation stopped`);
    }

    generateNetwork(): Peer[] {
        let creationProbability = 0.7;
        let areaSize = 24;
        let width = svgManager.width;
        let height = svgManager.height;
        let maxX = Math.floor(width / areaSize);
        let maxY = Math.floor(height / areaSize);
        
        let nextId = 1;
        let peers = [];

        for(let x = 1; x < maxX - 1; x++) {
            for (let y = 1; y < maxY - 1; y++) {
                let px = x * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.x;
                let py = y * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.y;

                let proba = Math.random();
                if(proba < creationProbability) {
                    let peer = new Peer(nextId, new Point(px, py));
                    nextId++;
                    peers.push(peer)
                    svgManager.createProcess(peer);
                }
            }
        }

        console.log(`Created ${peers.length} peers`);
        
        return peers;
    }

    ////////////////
    ////////////////
    ////////////////
/*
    async startOld() {

        console.log('Simulation started');

        // randomly select primary processes
        let primaryProcess = getRandomCombination(networkController.getProcessKeys(), this.initialProcessCount);
        networkController.primaryProcesses = primaryProcess.slice(0);

        // start the primary processes
        for (let pid of primaryProcess) {
            networkController.processes[pid].setStatus(ProcessStatus.Online);
        }
        for (let pid of primaryProcess) {
            await networkController.startProcess(pid);
        }

        // main event loop
        while (this.running) {

            // retrieve online processes
            let onlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Online, false);
            
            //await this.gossipAlgoStep(onlineProcesses);
            await this.randomizedGossip(onlineProcesses);
            await sleep(3000);
            
            //await sleep(1000);

            onlineProcesses.forEach(pid => networkController.processes[pid].setStatus(ProcessStatus.Online));

            // add new processes
            let offlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Offline, true);
            if(offlineProcesses.length >= simulation.joiningProcessCount) {
                for (let i = 0; i < simulation.joiningProcessCount; i++) {
                    networkController.startProcess(offlineProcesses[i]);
                }
            }
        }

        await sleep(3000);

        // cleanup
        for (let pid of primaryProcess) {
            networkController.stopProcess(pid);
        }
        networkController.primaryProcesses = [];

        console.log('Simulation stopped');
    }

    async randomizedGossip(onlineProcesses: number[]) {

        console.log(`starting randomizedGossip with ${onlineProcesses.length} online processes;`)

        // pick a random process
        let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];
        svgManager.setSourceProcess(selectedProcess);

        let message = Message.new('test', selectedProcess, true);
        //networkController.processes[selectedProcess].setStatus(ProcessStatus.Infected);
        networkController.processes[selectedProcess].randomGossip(message);
        await sleep(1000);

        let threshold = onlineProcesses.length;

        let infectedProcesses = networkController.getProcessesByStatus(ProcessStatus.Infected, false);
        
        while(infectedProcesses.length < threshold) {
            
            for(let pid of infectedProcesses) {
                networkController.processes[pid].randomGossip(message);
            }

            await sleep(1000);

            infectedProcesses = networkController.getProcessesByStatus(ProcessStatus.Infected, false);
        }


        let messageCount = 0;
        infectedProcesses.forEach(pid => {
            let msgs = networkController.processes[pid].getMessageCount(message.id);
            messageCount += msgs;
        });

        svgManager.clearSourceProcess(selectedProcess);
        console.log(`Everyone up-to-date: messageCount=${messageCount}`);
        document.getElementById('processCount').innerText = infectedProcesses.length.toString();
        document.getElementById('messageCount').innerText = messageCount.toString();
    }

    async gossipAlgoStep(onlineProcesses: number[]) {

        // update outgoing connections
        for (let pid of onlineProcesses) {
            networkController.createOutgoingConnections(pid);
        }

        // pick a random process
        let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];
        let totalCount = onlineProcesses.length;

        console.log(`starting propagation with ${totalCount} online processes;`)

        // broadcast a message
        console.log(`broadcast from process: ${selectedProcess}`);
        svgManager.setSourceProcess(selectedProcess);
        let message = Message.new('test', selectedProcess, true);
        networkController.processes[selectedProcess].broadcast(message);

        let contaminatedProcesses = networkController.getProcessesByStatus(ProcessStatus.Infected, false);
        while (contaminatedProcesses.length < totalCount && simulation.running) {
            console.log('will wait for full propagation');
            await sleep(1000);
            contaminatedProcesses = networkController.getProcessesByStatus(ProcessStatus.Infected, false);
        }

        let maxHops = 1;
        let minHops = 1;
        let messageCount = 0;
        onlineProcesses.forEach(pid => {
            let hops = networkController.processes[pid].getHopCount(message.id);
            if (hops > maxHops) {
                maxHops = hops;
            }
            if (hops < minHops) {
                minHops = hops;
            }
            let msgs = networkController.processes[pid].getMessageCount(message.id);
            messageCount += msgs;
        });

        svgManager.clearSourceProcess(selectedProcess);
        console.log(`Everyone up-to-date: minHops=${minHops}, maxHops=${maxHops}, messageCount=${messageCount}`);
    }
    */
}