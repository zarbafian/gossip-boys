const OUTGOING_PEERS = 6;
const INCOMING_PEERS = 4;

class Simulation {

    running: boolean = false;
    primaryProcessCount:number = 1000;

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

            // pick a random process
            let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];

            // broadcast a message
            console.log(`broadcast from process: ${selectedProcess}`);
            svgManager.setProcessStatus(selectedProcess, ProcessStatus.Source);
            networkController.broadcast(selectedProcess, Message.new('test', selectedProcess));
            
            await sleep(20000);
            onlineProcesses.forEach(pid => svgManager.setProcessStatus(pid, ProcessStatus.Online));
            //svgManager.setProcessStatus(selectedProcess, ProcessStatus.Online);
        }

        console.log('Simulation stopped');
    }
}