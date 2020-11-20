class CmdManager {
    constructor(id) {
        this.id = id;
        this.history = loadHistory();
        this.historyIndex = -1;
    }
    handleKeyup(event) {
        let self = cmdManager;
        event.preventDefault();
        switch (event.keyCode) {
            case Key.Enter:
                let cmdLine = document.getElementById(self.id).value;
                if (cmdLine != null && cmdLine.trim().length > 0) {
                    let args = cmdLine.split(/(\s+)/).filter(s => s.trim().length > 0);
                    self.execute(args);
                    self.history.push(cmdLine.trim());
                    saveHistory();
                    self.historyIndex = -1;
                    document.getElementById(self.id).value = "";
                }
                break;
            case Key.Up:
                if (self.history.length > 0) {
                    if (self.historyIndex == -1) {
                        self.historyIndex = self.history.length - 1;
                    }
                    else {
                        if (self.historyIndex > 0) {
                            self.historyIndex = self.historyIndex - 1;
                        }
                        else {
                            break;
                        }
                    }
                    document.getElementById(self.id).value = self.history[self.historyIndex];
                }
                break;
            case Key.Down:
                if (self.historyIndex != -1 && self.history.length > 0) {
                    self.historyIndex = self.historyIndex + 1;
                    if (self.historyIndex > (self.history.length - 1)) {
                        self.historyIndex = -1;
                        document.getElementById(self.id).value = "";
                    }
                    else {
                        document.getElementById(self.id).value = self.history[self.historyIndex];
                    }
                }
                break;
        }
    }
    execute(args) {
        switch (args[0]) {
            case Cmd.Test:
                this.test(args);
                break;
            default:
                console.log('cmd not defined: ' + args);
        }
    }
    test(args) {
        console.log(args);
    }
}
//# sourceMappingURL=cmd.js.map