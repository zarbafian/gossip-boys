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

    // keyboard contols
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
    // number of initial processes
    document.getElementById(Html.primary).addEventListener("keyup", (event: any) => {
        let rawValue = (document.getElementById(Html.primary) as HTMLInputElement).value;
        let parsedValue = parseInt(rawValue);
        if(!isNaN(parsedValue)) {
            simulation.primaryProcessCount = parsedValue;
            console.log(`updated count of initial processes to ${simulation.primaryProcessCount}`);
        }
    });

    // display of links
    let linksCheckBox = (document.getElementById(Html.displayLinks) as HTMLInputElement);
    linksCheckBox.checked = simulation.displayLinks;
    linksCheckBox.addEventListener("change", (event: any) => {
        simulation.displayLinks = (document.getElementById(Html.displayLinks) as HTMLInputElement).checked;
        console.log(`display of links is now ${simulation.displayLinks?'enabled':'disabled'}`);
    });

    // display of messages
    let msgCheckBox = (document.getElementById(Html.displayMessages) as HTMLInputElement);
    msgCheckBox.checked = simulation.displayMessages;
    msgCheckBox.addEventListener("change", (event: any) => {
        simulation.displayMessages = (document.getElementById(Html.displayMessages) as HTMLInputElement).checked;
        console.log(`display of messages is now ${simulation.displayMessages?'enabled':'disabled'}`);
    });

    // simulation speed
    let speedSlider = (document.getElementById(Html.simulationSpeed) as HTMLInputElement);
    let speedValue = parseInt(speedSlider.value);
    updateSlider(speedValue); 
}

function updateSlider(value: number) {
    simulation.speed = Math.round(100 / value);
    let span = this.document.getElementById("speedLabel");
    span.removeChild(span.firstChild);
    span.appendChild(document.createTextNode(value .toString()));
    console.log(`simulation speed is now ${simulation.speed}`);
}