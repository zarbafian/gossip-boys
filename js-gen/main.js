var cmdManager;
var networkController;
var svgManager;
var simulation;
function init() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    svgManager = new SvgManager(Html.svg, width, height);
    svgManager.init();
    cmdManager = new CmdManager(Html.cmd);
    document.getElementById(Html.cmd).addEventListener("keyup", cmdManager.handleKeyup);
    networkController = new NetworkController();
    simulation = new Simulation();
    simulation.start();
}
//# sourceMappingURL=main.js.map