class PeerData {
    constructor(id, age) {
        this.id = id;
        this.age = age;
    }
}
class PeerSamplingService {
    init(id) {
        this.id = id;
        this.peers = [];
        for (let pid of DnsService.getInstance().getInitialPeers()) {
            if (this.id !== pid) {
                this.peers.push(new PeerData(pid, 0));
            }
        }
    }
    selectPeer() {
        if (this.peers.length > 0) {
            return this.peers[getRandomInt(this.peers.length)];
        }
        return null;
    }
    permute() {
        shuffleArray(this.peers);
    }
    moveOldestToEnd() {
        let sorted = this.peers.slice(0);
        sorted.sort((a, b) => b.age - a.age);
        if (sorted.length > simulation.H) {
            let endIds = [];
            for (let i = (sorted.length - simulation.H); i < sorted.length; i++) {
                endIds.push(sorted[i].id);
            }
            let newViewStart = [];
            let newViewEnd = [];
            for (let peerData of this.peers) {
                if (endIds.includes(peerData.id)) {
                    newViewEnd.push(peerData);
                }
                else {
                    newViewStart.push(peerData);
                }
            }
            Array.prototype.push.apply(newViewStart, newViewEnd);
            this.peers = newViewStart;
        }
    }
    getHead() {
        return this.peers.slice(0, simulation.c / 2 - 1);
    }
    select(buffer) {
        Array.prototype.push.apply(this.peers, buffer.slice(0, 3));
    }
    getPeers() {
        return this.peers.slice(0);
    }
}
//# sourceMappingURL=sampling.js.map