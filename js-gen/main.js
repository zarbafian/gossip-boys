var cmdManager;
var networkController;
var svgManager;
var simulation;
window.addEventListener("keyup", (event) => {
    switch (event.keyCode) {
        case Key.Space:
            event.preventDefault();
            startStop();
            break;
    }
});
function init() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    svgManager = new SvgManager(Html.svg, width, height);
    svgManager.init();
    cmdManager = new CmdManager(Html.cmd);
    document.getElementById(Html.cmd).addEventListener('keyup', cmdManager.handleKeyup);
    networkController = new NetworkController();
    simulation = new Simulation();
}
function startStop() {
    if (simulation.running) {
        simulation.running = false;
        document.getElementById('startStopButton').innerText = 'START';
    }
    else {
        simulation.running = true;
        simulation.start();
        document.getElementById('startStopButton').innerText = 'STOP';
    }
}
//# sourceMappingURL=main.js.map