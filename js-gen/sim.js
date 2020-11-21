class Simulation {
    constructor() {
        this.running = true;
    }
    async start() {
        networkController.generate();
        let primaryProcessCount = 500;
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
            console.log(`broadcast from process: ${selectedProcess}`);
            svgManager.setProcessStatus(selectedProcess, ProcessStatus.Source);
            networkController.broadcast(selectedProcess, Message.new('test', selectedProcess));
            await sleep(5000);
            onlineProcesses.forEach(pid => svgManager.setProcessStatus(pid, ProcessStatus.Online));
        }
    }
}
//# sourceMappingURL=sim.js.map