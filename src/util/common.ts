const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));

namespace Html {
    export const svg = "svg";
    export const cmd = "cmd";
    export const tmpl = "tmpl";
    export const display = "display";
    
    export const initialProcesses = "initialProcesses";
    export const joiningProcesses = "joiningProcesses";
    export const outgoingPeers = "outgoingPeers";
    export const incomingPeers = "incomingPeers";
    export const displayLinks = "displayLinks";
    export const displayMessages = "displayMessages";
    export const simulationSpeed = "simulationSpeed";
    
    export const samplingParamPush = "spPush";
    export const samplingParamPull = "spPull";
    export const samplingParamT = "spt";
    export const samplingParamC = "spc";
    export const samplingParamH = "sph";
    export const samplingParamS = "sps";
}

enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
}

enum Color {
    ProcessOffline = "#FFFFFF",
    ProcessOnline = "#44ff44",
    ProcessInfected = "#2222ff",
    ProcessRemoved = "#ff4444",
    MessageSampling = "#44ff44",
    MessageInfected = "#4444ff",
    LinkDefault = "#000000",
}

enum Key {
    Tab = 9,
    Enter = 13,
    Escape = 27,
    Space = 32,
    Up = 38,
    Down = 40,
}

enum Cmd {
    Test = "test",
}

class Point {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

function distance(p1: Point, p2: Point): number {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}
