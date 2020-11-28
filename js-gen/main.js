var network;
var svgManager;
var simulation;
function getTestView() {
    let view = new PeerSamplingService();
    view.init(123);
    view.peers.push(new PeerData(11, 111));
    view.peers.push(new PeerData(33, 33));
    view.peers.push(new PeerData(88, 88));
    view.peers.push(new PeerData(77, 777));
    view.peers.push(new PeerData(99, 99));
    view.peers.push(new PeerData(55, 555));
    return view;
}
function getTestBuffer() {
    let buffer = [];
    buffer.push(new PeerData(77, 77));
    buffer.push(new PeerData(22, 22));
    buffer.push(new PeerData(44, 44));
    buffer.push(new PeerData(66, 66));
    buffer.push(new PeerData(88, 8));
    buffer.push(new PeerData(11, 11));
    return buffer;
}
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
    setupCheckBoxInput(Html.displayLinks, () => simulation.displayLinks, (value) => simulation.displayLinks = value);
    setupCheckBoxInput(Html.displayMessages, () => simulation.displayMessages, (value) => simulation.displayMessages = value);
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
    setupCheckBoxInput(Html.samplingParamPush, () => simulation.push, (value) => simulation.push = value);
    setupCheckBoxInput(Html.samplingParamPull, () => simulation.pull, (value) => simulation.pull = value);
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
function setupCheckBoxInput(htmlId, initalValue, setterCallback) {
    let checkBox = document.getElementById(htmlId);
    checkBox.checked = initalValue();
    checkBox.addEventListener("change", (event) => {
        let cbValue = event.target.checked;
        setterCallback(cbValue);
        console.log(`updated ${htmlId} to ${cbValue}`);
        saveSettings();
    });
}
function updateSliderText() {
    let span = this.document.getElementById("speedLabel");
    span.removeChild(span.firstChild);
    span.appendChild(document.createTextNode(simulation.speed.toString()));
}
//# sourceMappingURL=main.js.map