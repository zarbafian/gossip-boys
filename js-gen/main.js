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
    let width = window.innerWidth - 300;
    let height = window.innerHeight;
    svgManager = new SvgManager(Html.svg, width, height);
    svgManager.init();
    networkController = new NetworkController();
    simulation = new Simulation();
    setupContols();
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
function setupContols() {
    document.getElementById(Html.primary).addEventListener("keyup", (event) => {
        let rawValue = document.getElementById(Html.primary).value;
        let parsedValue = parseInt(rawValue);
        if (!isNaN(parsedValue)) {
            simulation.primaryProcessCount = parsedValue;
            console.log(`updated count of initial processes to ${simulation.primaryProcessCount}`);
        }
    });
    let linksCheckBox = document.getElementById(Html.displayLinks);
    linksCheckBox.checked = simulation.displayLinks;
    linksCheckBox.addEventListener("change", (event) => {
        simulation.displayLinks = document.getElementById(Html.displayLinks).checked;
        console.log(`display of links is now ${simulation.displayLinks ? 'enabled' : 'disabled'}`);
    });
    let msgCheckBox = document.getElementById(Html.displayMessages);
    msgCheckBox.checked = simulation.displayMessages;
    msgCheckBox.addEventListener("change", (event) => {
        simulation.displayMessages = document.getElementById(Html.displayMessages).checked;
        console.log(`display of messages is now ${simulation.displayMessages ? 'enabled' : 'disabled'}`);
    });
    let speedSlider = document.getElementById(Html.simulationSpeed);
    let speedValue = parseInt(speedSlider.value);
    updateSlider(speedValue);
}
function updateSlider(value) {
    simulation.speed = Math.round(100 / value);
    let span = this.document.getElementById("speedLabel");
    span.removeChild(span.firstChild);
    span.appendChild(document.createTextNode(value.toString()));
    console.log(`simulation speed is now ${simulation.speed}`);
}
//# sourceMappingURL=main.js.map