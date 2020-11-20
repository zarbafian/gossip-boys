const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
var Html;
(function (Html) {
    Html.svg = "svg";
    Html.cmd = "cmd";
    Html.tmpl = "tmpl";
})(Html || (Html = {}));
var MouseButton;
(function (MouseButton) {
    MouseButton[MouseButton["Left"] = 1] = "Left";
    MouseButton[MouseButton["Middle"] = 2] = "Middle";
    MouseButton[MouseButton["Right"] = 3] = "Right";
})(MouseButton || (MouseButton = {}));
var Color;
(function (Color) {
    Color["ProcessOffline"] = "#666666";
    Color["ProcessStarting"] = "#dd9966";
    Color["ProcessOnline"] = "#22ff22";
    Color["ProcessContaminated"] = "#2222ff";
    Color["Message"] = "#4444ff";
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
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
function getRandomCombination(n, k) {
    let startIndex = 0;
    let delta = Math.round(n / k) * 2;
    let selectedIndices = [];
    while (selectedIndices.length < k) {
        let nextIndex = startIndex + getRandomInt(delta);
        if (nextIndex >= n) {
            nextIndex -= n;
        }
        startIndex = nextIndex + 1;
        if (startIndex >= n) {
            startIndex -= n;
        }
        if (selectedIndices.includes(nextIndex)) {
            continue;
        }
        else {
            selectedIndices.push(nextIndex);
        }
    }
    return selectedIndices;
}
//# sourceMappingURL=common.js.map