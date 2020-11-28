var ProcessStatus;
(function (ProcessStatus) {
    ProcessStatus[ProcessStatus["Offline"] = 0] = "Offline";
    ProcessStatus[ProcessStatus["Starting"] = 1] = "Starting";
    ProcessStatus[ProcessStatus["Online"] = 2] = "Online";
    ProcessStatus[ProcessStatus["Source"] = 3] = "Source";
    ProcessStatus[ProcessStatus["Infected"] = 4] = "Infected";
})(ProcessStatus || (ProcessStatus = {}));
class Process {
    onMessage(message) {
    }
}
//# sourceMappingURL=process.js.map