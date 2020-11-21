const OUTGOING_PEERS = 12;
const INCOMING_PEERS = 8;
class Simulation {
    constructor() {
        this.running = false;
        this.primaryProcessCount = 1500;
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
        let onlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Online, false);
        let totalCount = onlineProcesses.length;
        let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];
        console.log(`broadcast from process: ${selectedProcess}`);
        svgManager.setSourceProcess(selectedProcess);
        let message = Message.new('test', selectedProcess, true);
        networkController.processes[selectedProcess].broadcast(message);
        let contaminatedProcesses = networkController.getProcessesByStatus(ProcessStatus.Contaminated, false);
        while (contaminatedProcesses.length < totalCount) {
            console.log('will wait for full propagation');
            await sleep(1000);
            contaminatedProcesses = networkController.getProcessesByStatus(ProcessStatus.Contaminated, false);
        }
        let maxHops = 1;
        let minHops = 1;
        onlineProcesses.forEach(pid => {
            let hops = networkController.processes[pid].getHopCount(message.id);
            if (hops > maxHops) {
                maxHops = hops;
            }
            if (hops < minHops) {
                minHops = hops;
            }
        });
        console.log(`Everyone up-to-date: minHops=${minHops}, maxHops=${maxHops}`);
        await sleep(3000);
        svgManager.clearSourceProcess(selectedProcess);
        onlineProcesses.forEach(pid => svgManager.setProcessStatus(pid, ProcessStatus.Online));
        console.log('Simulation stopped');
    }
}
//# sourceMappingURL=sim.js.map