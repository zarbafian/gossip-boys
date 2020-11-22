class Simulation {

    running: boolean = false;
    initialProcessCount: number = 100;
    joiningProcessCount: number = 10;

    outgoingPeers: number = 12;
    incomingPeers: number = 6;

    displayLinks: boolean = true;
    displayMessages: boolean = true;
    speed: number = 20;

    init() {
        // generate network of all potential processes
        networkController.generate();
    }

    async start() {

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
            if(offlineProcesses.length <= simulation.joiningProcessCount) {
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
}