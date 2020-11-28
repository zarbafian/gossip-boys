class Network {
    constructor() {
        this.processes = {};
        this.links = new Links();
    }
    async send(sender, targets, message) {
        if (simulation.displayMessages) {
            svgManager.send(sender, targets, message);
        }
        else {
            await sleep((10 / simulation.speed) * 50);
            for (let target of targets) {
                MessageBus.getInstance().notify(message, target.id.toString());
            }
        }
    }
}
//# sourceMappingURL=network.js.map