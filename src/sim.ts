class Simulation {

    running: boolean = true;

    async start() {
        // generate network of all potential processes
        networkController.generate();

        // randomly select primary processes
        let primaryProcessCount = 500;
        let processKeys = Object.keys(networkController.processes);
        let selectedProcessesIndex = getRandomCombination(processKeys.length, primaryProcessCount);
        let primaryProcess = [];
        for(let idx of selectedProcessesIndex) {
            primaryProcess.push(parseInt(processKeys[idx]));
        }
        networkController.primaryProcesses = primaryProcess.slice(0);

        // start the primary processes
        for(let pid of primaryProcess) {
            networkController.processes[pid].ready();
        }
        for(let pid of primaryProcess) {
            networkController.startProcess(pid);
        }
/*

*/
        // main event loop
        while(this.running) {
            // retrieve online processes
            let onlineProcesses = networkController.getProcessesByStatus(ProcessStatus.Online);

            // pick a random process
            let selectedProcess = onlineProcesses[getRandomInt(onlineProcesses.length)];

            // broadcast a message
            console.log(`broadcast from process: ${selectedProcess}`);
            svgManager.setProcessStatus(selectedProcess, ProcessStatus.Source);
            networkController.broadcast(selectedProcess, Message.new('test', selectedProcess));
            
            await sleep(5000);
            onlineProcesses.forEach(pid => svgManager.setProcessStatus(pid, ProcessStatus.Online));
            //svgManager.setProcessStatus(selectedProcess, ProcessStatus.Online);
        }
    }
}