const OUTGOING_PEERS = 4;
const INCOMING_PEERS = 2;

class Simulation {

    running: boolean = false;
    primaryProcessCount:number = 20;

    displayLinks: boolean = true;
    displayMessages: boolean = true;
    speed: number;

    constructor() {
        // generate network of all potential processes
        networkController.generate();
    }

    async start() {

        console.log('Simulation started');

        // randomly select primary processes
        let primaryProcess = getRandomCombination(networkController.getProcessKeys(), this.primaryProcessCount);
        networkController.primaryProcesses = primaryProcess.slice(0);

        // start the primary processes
        for(let pid of primaryProcess) {
            networkController.processes[pid].setStatus(ProcessStatus.Online);
        }
        for(let pid of primaryProcess) {
            await networkController.startProcess(pid);
        }

        // main event loop
        while(this.running) {
            // retrieve online processes
            let onlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Online, false);
            let totalCount = onlineProcesses.length;

            console.log(`starting propagation with ${totalCount} online processes;`)

            // update outgoing connections
            for(let pid of onlineProcesses) {
                networkController.createOutgoingConnections(pid);
            }

            // pick a random process
            let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];

            // broadcast a message
            console.log(`broadcast from process: ${selectedProcess}`);
            svgManager.setSourceProcess(selectedProcess);
            let message = Message.new('test', selectedProcess, true);
            networkController.processes[selectedProcess].broadcast(message);
            
            let contaminatedProcesses = networkController.getProcessesByStatus(ProcessStatus.Infected, false);
            while(contaminatedProcesses.length < totalCount) {
                console.log('will wait for full propagation');
                await sleep(1000);
                contaminatedProcesses = networkController.getProcessesByStatus(ProcessStatus.Infected, false);
            }

            let maxHops = 1;
            let minHops = 1;
            let messageCount = 0;
            onlineProcesses.forEach(pid => {
                let hops = networkController.processes[pid].getHopCount(message.id);
                if(hops > maxHops) {
                    maxHops = hops;
                }
                if(hops < minHops) {
                    minHops = hops;
                }
                let msgs = networkController.processes[pid].getMessageCount(message.id);
                messageCount += msgs;
            });

            console.log(`Everyone up-to-date: minHops=${minHops}, maxHops=${maxHops}, messageCount=${messageCount}`);
            
            await sleep(3000);
            
            svgManager.clearSourceProcess(selectedProcess);
            onlineProcesses.forEach(pid => networkController.processes[pid].setStatus(ProcessStatus.Online));

            // add new processes
            let offlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Offline, true);
            for(let i=0; i < 4; i++) {
                networkController.startProcess(offlineProcesses[i]);
            }
        }

        await sleep(3000);
        
        // cleanup
        for(let pid of primaryProcess) {
            networkController.stopProcess(pid);
        }
        networkController.primaryProcesses = [];

        console.log('Simulation stopped');
    }
}