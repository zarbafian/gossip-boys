class Simulation {
    constructor() {
        this.running = false;
        this.initialProcessCount = 100;
        this.joiningProcessCount = 10;
        this.outgoingPeers = 12;
        this.incomingPeers = 6;
        this.displayLinks = true;
        this.displayMessages = true;
        this.speed = 20;
        this.onlinePeers = [];
        this.offlinePeers = [];
        this.peerMap = {};
        this.push = true;
        this.pull = true;
        this.T = 1000;
        this.c = 30;
        this.H = 2;
        this.S = 15;
    }
    init() {
        this.offlinePeers = this.generateNetwork();
        for (let peer of this.offlinePeers) {
            this.peerMap[peer.id] = peer;
        }
    }
    async toggleProcess(pid) {
        if (this.peerMap[pid]) {
            let peer = this.peerMap[pid];
            if (peer.running) {
                await peer.stop();
                console.log(`peer ${peer.id} has stopped`);
                for (let i = 0; i < this.onlinePeers.length; i++) {
                    if (this.onlinePeers[i].id == peer.id) {
                        let removedPeer = this.onlinePeers.splice(i, 1)[0];
                        this.offlinePeers.push(removedPeer);
                        break;
                    }
                }
            }
            else {
                peer.start();
                console.log(`peer ${peer.id} has started`);
                for (let i = 0; i < this.offlinePeers.length; i++) {
                    if (this.offlinePeers[i].id == peer.id) {
                        let removedPeer = this.offlinePeers.splice(i, 1)[0];
                        this.onlinePeers.push(removedPeer);
                        break;
                    }
                }
            }
        }
    }
    infect(pid) {
        if (this.peerMap[pid]) {
            let peer = this.peerMap[pid];
            if (peer.running) {
                peer.startInfection();
            }
        }
    }
    async start() {
        console.log('Starting simulation');
        shuffleArray(this.offlinePeers);
        this.onlinePeers = this.offlinePeers.splice(0, this.initialProcessCount);
        DnsService.getInstance().registerPeer(this.onlinePeers[0].id);
        for (let p of this.onlinePeers) {
            p.start();
        }
        console.log('Simulation started');
    }
    async stop() {
        this.onlinePeers.forEach(p => p.running = false);
        for (let p of this.onlinePeers) {
            await p.stop();
            console.log(`peer ${p.id} has stopped`);
        }
        Array.prototype.push.apply(this.offlinePeers, this.onlinePeers.splice(0));
        DnsService.getInstance().clearPeers();
        console.log(`Simulation stopped`);
    }
    generateNetwork() {
        let creationProbability = 0.7;
        let areaSize = 24;
        let width = svgManager.width;
        let height = svgManager.height;
        let maxX = Math.floor(width / areaSize);
        let maxY = Math.floor(height / areaSize);
        let nextId = 1;
        let peers = [];
        for (let x = 1; x < maxX - 1; x++) {
            for (let y = 1; y < maxY - 1; y++) {
                let px = x * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.x;
                let py = y * areaSize + getRandomInt(areaSize - 8) + 4 - svgManager.zero.y;
                let proba = Math.random();
                if (proba < creationProbability) {
                    let peer = new Peer(nextId, new Point(px, py));
                    nextId++;
                    peers.push(peer);
                    svgManager.createProcess(peer);
                }
            }
        }
        console.log(`Created ${peers.length} peers`);
        return peers;
    }
}
//# sourceMappingURL=sim.js.map