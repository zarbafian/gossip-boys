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
    let width: number = window.innerWidth - 300;
    let height: number = window.innerHeight;
    svgManager = new SvgManager(Html.svg, width, height);
    svgManager.init();

    // Command line
    //cmdManager = new CmdManager(Html.cmd);
    //document.getElementById(Html.cmd).addEventListener('keyup', cmdManager.handleKeyup);

    // Network of processes
    networkController = new NetworkController();

    // Simulation
    simulation = new Simulation();
    simulation.init();

    // keyboard contols
    loadSettings();
    setupContols();
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

function setupContols() {
    // initial number of processes
    setupTextInput(Html.initialProcesses, () => simulation.initialProcessCount.toString(), (value: number) => simulation.initialProcessCount = value);
    
    // number of processes added each round
    setupTextInput(Html.joiningProcesses, () => simulation.joiningProcessCount.toString(), (value: number) => simulation.joiningProcessCount = value);

    // number of outgoing processes
    setupTextInput(Html.outgoingPeers, () => simulation.outgoingPeers.toString(), (value: number) => simulation.outgoingPeers = value);

    // number of incoming processes
    setupTextInput(Html.incomingPeers, () => simulation.incomingPeers.toString(), (value: number) => simulation.incomingPeers = value);

    // display of links
    let linksCheckBox = (document.getElementById(Html.displayLinks) as HTMLInputElement);
    linksCheckBox.checked = simulation.displayLinks;
    linksCheckBox.addEventListener("change", (event: any) => {
        simulation.displayLinks = (document.getElementById(Html.displayLinks) as HTMLInputElement).checked;
        console.log(`display of links is now ${simulation.displayLinks?'enabled':'disabled'}`);
        saveSettings();
    });

    // display of messages
    let msgCheckBox = (document.getElementById(Html.displayMessages) as HTMLInputElement);
    msgCheckBox.checked = simulation.displayMessages;
    msgCheckBox.addEventListener("change", (event: any) => {
        simulation.displayMessages = (document.getElementById(Html.displayMessages) as HTMLInputElement).checked;
        console.log(`display of messages is now ${simulation.displayMessages?'enabled':'disabled'}`);
        saveSettings();
    });

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

function updateSliderText() {
    let span = this.document.getElementById("speedLabel");
    span.removeChild(span.firstChild);
    span.appendChild(document.createTextNode(simulation.speed.toString()));
}