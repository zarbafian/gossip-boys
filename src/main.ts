var network: Network;
var svgManager: SvgManager;
var simulation: Simulation;

function getTestView(): PeerSamplingService {
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

function getTestBuffer(): PeerData[] {
    let buffer = [];
    buffer.push(new PeerData(77, 77));
    buffer.push(new PeerData(22, 22));
    buffer.push(new PeerData(44, 44));
    buffer.push(new PeerData(66, 66));
    buffer.push(new PeerData(88, 8));
    buffer.push(new PeerData(11, 11));
    return buffer;
}

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
    let width: number = window.innerWidth - 300;
    let height: number = window.innerHeight;
    svgManager = new SvgManager(Html.svg, width, height);
    svgManager.init();

    // Network of processes
    network = new Network();

    // Simulation
    simulation = new Simulation();
    simulation.init();

    // keyboard contols
    loadSettings();
    setupContols();
}

async function startStop() {
    if(simulation.running) {
        (document.getElementById('startStopButton') as HTMLInputElement).disabled = true;
        simulation.running = false;
        await simulation.stop();
        (document.getElementById('startStopButton') as HTMLInputElement).disabled = false;
        (document.getElementById('startStopButton') as HTMLInputElement).innerText = 'START';
    }
    else {
        (document.getElementById('startStopButton') as HTMLInputElement).disabled = true;
        simulation.running = true;
        simulation.start();
        (document.getElementById('startStopButton') as HTMLInputElement).disabled = false;
        (document.getElementById('startStopButton') as HTMLInputElement).innerText = 'STOP';
    }
}

function setupContols() {
    setupTextInput(Html.initialProcesses, () => simulation.initialProcessCount.toString(), (value: number) => simulation.initialProcessCount = value);
    setupTextInput(Html.joiningProcesses, () => simulation.joiningProcessCount.toString(), (value: number) => simulation.joiningProcessCount = value);
    setupTextInput(Html.outgoingPeers, () => simulation.outgoingPeers.toString(), (value: number) => simulation.outgoingPeers = value);
    setupTextInput(Html.incomingPeers, () => simulation.incomingPeers.toString(), (value: number) => simulation.incomingPeers = value);
    setupCheckBoxInput(Html.displayLinks, () => simulation.displayLinks, (value: boolean) => simulation.displayLinks = value);
    setupCheckBoxInput(Html.displayMessages, () => simulation.displayMessages, (value: boolean) => simulation.displayMessages = value);

    // simulation speed
    let speedSlider = (document.getElementById(Html.simulationSpeed) as HTMLInputElement);
    speedSlider.value = simulation.speed.toString();
    updateSliderText();
    speedSlider.addEventListener("change", (event: InputEvent) => {
        let rawValue = (event.target as HTMLInputElement).value;
        let parsedValue = parseInt(rawValue);
        simulation.speed = parsedValue;
        console.log(`simulation speed is now ${simulation.speed}`);
        updateSliderText();
        saveSettings();
    });

    // peer sampling algorithm
    setupCheckBoxInput(Html.samplingParamPush, () => simulation.push, (value: boolean) => simulation.push = value);
    setupCheckBoxInput(Html.samplingParamPull, () => simulation.pull, (value: boolean) => simulation.pull = value);
    setupTextInput(Html.samplingParamT, () => simulation.T.toString(), (value: number) => simulation.T = value);
    setupTextInput(Html.samplingParamC, () => simulation.c.toString(), (value: number) => simulation.c = value);
    setupTextInput(Html.samplingParamH, () => simulation.H.toString(), (value: number) => simulation.H = value);
    setupTextInput(Html.samplingParamS, () => simulation.S.toString(), (value: number) => simulation.S = value);
}

function setupTextInput(htmlId: string, initalValue: () => string, setterCallback: (value: number) => void) {
    let textInput = (document.getElementById(htmlId) as HTMLInputElement);
    textInput.value = initalValue();
    textInput.addEventListener("keyup", (event: KeyboardEvent) => {
        let rawValue = (event.target as HTMLInputElement).value;
        let parsedValue = parseInt(rawValue);
        if(!isNaN(parsedValue)) {
            setterCallback(parsedValue);
            console.log(`updated ${htmlId} to ${parsedValue}`);
            saveSettings();
        }
    });
}

function setupCheckBoxInput(htmlId: string, initalValue: () => boolean, setterCallback: (value: boolean) => void) {
    let checkBox = (document.getElementById(htmlId) as HTMLInputElement);
    checkBox.checked = initalValue();
    checkBox.addEventListener("change", (event: Event) => {
        let cbValue = (event.target as HTMLInputElement).checked;
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