//var processManager: ProcessManager;
var cmdManager: CmdManager;
var networkController: NetworkController;
var svgManager: SvgManager;
var simulation: Simulation;

window.addEventListener("keyup", (event: any) => {
    //  console.log(event.keyCode);
    switch(event.keyCode) {
        case Key.Space:
            event.preventDefault();
            startStop();
            break;
    }
});

function init() {
    // Initialize SVG manager
    let width: number = window.innerWidth;
    let height: number = window.innerHeight;
    svgManager = new SvgManager(Html.svg, width, height);
    svgManager.init();

    // Command line
    cmdManager = new CmdManager(Html.cmd);
    document.getElementById(Html.cmd).addEventListener('keyup', cmdManager.handleKeyup);

    // Network of processes
    networkController = new NetworkController();

    // Simulation
    simulation = new Simulation();
}

function startStop() {
    if(simulation.running) {
        simulation.running = false;
        (document.getElementById('startStopButton') as HTMLInputElement).innerText = 'START';
    }
    else {
        simulation.running = true;
        simulation.start();
        (document.getElementById('startStopButton') as HTMLInputElement).innerText = 'STOP';
    }
}