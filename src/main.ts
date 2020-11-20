//var processManager: ProcessManager;
var cmdManager: CmdManager;
var networkController: NetworkController;
var svgManager: SvgManager;
var simulation: Simulation;

function init() {
    // Initialize SVG manager
    let width: number = window.innerWidth;
    let height: number = window.innerHeight;
    svgManager = new SvgManager(Html.svg, width, height);
    svgManager.init();

    // Command line
    cmdManager = new CmdManager(Html.cmd);
    document.getElementById(Html.cmd).addEventListener("keyup", cmdManager.handleKeyup);

    // Network of processes
    networkController = new NetworkController();

    // Simulation
    simulation = new Simulation();
    simulation.start();
}