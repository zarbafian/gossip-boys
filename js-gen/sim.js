const OUTGOING_PEERS = 6;
const INCOMING_PEERS = 4;
class Simulation {
    constructor() {
        this.running = false;
        this.primaryProcessCount = 1000;
        networkController.generate();
    }
    async start() {
        console.log('Simulation started');
        let primaryProcess = getRandomCombination(networkController.getProcessKeys(), this.primaryProcessCount);
        networkController.primaryProcesses = primaryProcess.slice(0);
        for (let pid of primaryProcess) {
            networkController.processes[pid].setStatus(ProcessStatus.Online);
        }
        for (let pid of primaryProcess) {
            await networkController.startProcess(pid);
        }
        while (this.running) {
            let onlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Online, false);
            let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];
            console.log(`broadcast from process: ${selectedProcess}`);
            svgManager.setProcessStatus(selectedProcess, ProcessStatus.Source);
            networkController.broadcast(selectedProcess, Message.new('test', selectedProcess));
            await sleep(20000);
            onlineProcesses.forEach(pid => svgManager.setProcessStatus(pid, ProcessStatus.Online));
        }
        console.log('Simulation stopped');
    }
}
//# sourceMappingURL=sim.js.map