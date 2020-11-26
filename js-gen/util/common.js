const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
var Html;
(function (Html) {
    Html.svg = "svg";
    Html.cmd = "cmd";
    Html.tmpl = "tmpl";
    Html.display = "display";
    Html.initialProcesses = "initialProcesses";
    Html.joiningProcesses = "joiningProcesses";
    Html.outgoingPeers = "outgoingPeers";
    Html.incomingPeers = "incomingPeers";
    Html.displayLinks = "displayLinks";
    Html.displayMessages = "displayMessages";
    Html.simulationSpeed = "simulationSpeed";
    Html.samplingParamPush = "spPush";
    Html.samplingParamPull = "spPull";
    Html.samplingParamT = "spt";
    Html.samplingParamC = "spc";
    Html.samplingParamH = "sph";
    Html.samplingParamS = "sps";
})(Html || (Html = {}));
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Left"] = 0] = "Left";
    MouseButton[MouseButton["Middle"] = 1] = "Middle";
    MouseButton[MouseButton["Right"] = 2] = "Right";
})(MouseButton || (MouseButton = {}));
var Color;
(function (Color) {
    Color["ProcessOffline"] = "#FFFFFF";
    Color["ProcessOnline"] = "#44ff44";
    Color["ProcessInfected"] = "#2222ff";
    Color["ProcessRemoved"] = "#ff4444";
    Color["MessageSampling"] = "#44ff44";
    Color["MessageInfected"] = "#4444ff";
    Color["LinkDefault"] = "#000000";
})(Color || (Color = {}));
var Key;
(function (Key) {
    Key[Key["Tab"] = 9] = "Tab";
    Key[Key["Enter"] = 13] = "Enter";
    Key[Key["Escape"] = 27] = "Escape";
    Key[Key["Space"] = 32] = "Space";
    Key[Key["Up"] = 38] = "Up";
    Key[Key["Down"] = 40] = "Down";
})(Key || (Key = {}));
var Cmd;
(function (Cmd) {
    Cmd["Test"] = "test";
})(Cmd || (Cmd = {}));
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y));
}
//# sourceMappingURL=common.js.map