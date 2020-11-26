var network;
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
    network = new Network();
    simulation = new Simulation();
    simulation.init();
    loadSettings();
    setupContols();
}
async function startStop() {
    if (simulation.running) {
        document.getElementById('startStopButton').disabled = true;
        simulation.running = false;
        await simulation.stop();
        document.getElementById('startStopButton').disabled = false;
        document.getElementById('startStopButton').innerText = 'START';
    }
    else {
        document.getElementById('startStopButton').disabled = true;
        simulation.running = true;
        simulation.start();
        document.getElementById('startStopButton').disabled = false;
        document.getElementById('startStopButton').innerText = 'STOP';
    }
}
function setupContols() {
    setupTextInput(Html.initialProcesses, () => simulation.initialProcessCount.toString(), (value) => simulation.initialProcessCount = value);
    setupTextInput(Html.joiningProcesses, () => simulation.joiningProcessCount.toString(), (value) => simulation.joiningProcessCount = value);
    setupTextInput(Html.outgoingPeers, () => simulation.outgoingPeers.toString(), (value) => simulation.outgoingPeers = value);
    setupTextInput(Html.incomingPeers, () => simulation.incomingPeers.toString(), (value) => simulation.incomingPeers = value);
    let linksCheckBox = document.getElementById(Html.displayLinks);
    linksCheckBox.checked = simulation.displayLinks;
    linksCheckBox.addEventListener("change", (event) => {
        simulation.displayLinks = document.getElementById(Html.displayLinks).checked;
        console.log(`display of links is now ${simulation.displayLinks ? 'enabled' : 'disabled'}`);
        saveSettings();
    });
    let msgCheckBox = document.getElementById(Html.displayMessages);
    msgCheckBox.checked = simulation.displayMessages;
    msgCheckBox.addEventListener("change", (event) => {
        simulation.displayMessages = document.getElementById(Html.displayMessages).checked;
        console.log(`display of messages is now ${simulation.displayMessages ? 'enabled' : 'disabled'}`);
        saveSettings();
    });
    let speedSlider = document.getElementById(Html.simulationSpeed);
    speedSlider.value = simulation.speed.toString();
    updateSliderText();
    speedSlider.addEventListener("change", (event) => {
        let rawValue = event.target.value;
        let parsedValue = parseInt(rawValue);
        simulation.speed = parsedValue;
        console.log(`simulation speed is now ${simulation.speed}`);
        updateSliderText();
        saveSettings();
    });
    setupTextInput(Html.samplingParamT, () => simulation.T.toString(), (value) => simulation.T = value);
    setupTextInput(Html.samplingParamC, () => simulation.c.toString(), (value) => simulation.c = value);
    setupTextInput(Html.samplingParamH, () => simulation.H.toString(), (value) => simulation.H = value);
    setupTextInput(Html.samplingParamS, () => simulation.S.toString(), (value) => simulation.S = value);
}
function setupTextInput(htmlId, initalValue, setterCallback) {
    let textInput = document.getElementById(htmlId);
    textInput.value = initalValue();
    textInput.addEventListener("keyup", (event) => {
        let rawValue = event.target.value;
        let parsedValue = parseInt(rawValue);
        if (!isNaN(parsedValue)) {
            setterCallback(parsedValue);
            console.log(`updated ${htmlId} to ${parsedValue}`);
            saveSettings();
        }
    });
}
function updateSliderText() {
    let span = this.document.getElementById("speedLabel");
    span.removeChild(span.firstChild);
    span.appendChild(document.createTextNode(simulation.speed.toString()));
}
//# sourceMappingURL=main.js.map