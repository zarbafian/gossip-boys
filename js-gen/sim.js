class Simulation {
    constructor() {
        this.running = true;
    }
    async start() {
        networkController.generate();
        let primaryProcessCount = 20;
        let processKeys = Object.keys(networkController.processes);
        let selectedProcessesIndex = getRandomCombination(processKeys.length, primaryProcessCount);
        let primaryProcess = [];
        for (let idx of selectedProcessesIndex) {
            primaryProcess.push(parseInt(processKeys[idx]));
        }
        networkController.primaryProcesses = primaryProcess.slice(0);
        for (let pid of primaryProcess) {
            networkController.processes[pid].ready();
        }
        for (let pid of primaryProcess) {
            networkController.startProcess(pid);
        }
        while (this.running) {
            let onlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Online);
            let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];
            svgManager.setProcessStatus(selectedProcess, ProcessStatus.Contanimated);
            networkController.broadcast(selectedProcess, Message.new('test', selectedProcess));
            await sleep(10000);
            onlineProcesses.forEach(pid => svgManager.setProcessStatus(pid, ProcessStatus.Online));
        }
    }
}
//# sourceMappingURL=sim.js.map