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
        this.peerQueue = [];
        for (let pid of DnsService.getInstance().getInitialPeers()) {
            if (this.id !== pid) {
                this.peers.push(new PeerData(pid, 0));
            }
        }
    }
    updateQueue() {
        let newPeers = this.peers.map(peer => peer.id);
        let toDelete = this.peerQueue.filter(pid => !newPeers.includes(pid));
        let toAdd = newPeers.filter(pid => !this.peerQueue.includes(pid));
        toDelete.forEach(pid => this.peerQueue.splice(this.peerQueue.indexOf(pid), 1));
        toAdd.forEach(pid => this.peerQueue.push(pid));
    }
    getPeer() {
        if (this.peerQueue.length == 0) {
            let fallback = this.selectPeer();
            if (fallback != null) {
                return fallback.id;
            }
            return null;
        }
        return this.peerQueue.splice(0, 1)[0];
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
        sorted.sort((a, b) => a.age - b.age);
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
        Array.prototype.push.apply(this.peers, buffer);
        let map = {};
        this.peers.forEach(peer => {
            if (map.hasOwnProperty(peer.id)) {
                if (map[peer.id].age > peer.age) {
                    map[peer.id] = peer;
                }
                else {
                }
            }
            else {
                map[peer.id] = peer;
            }
        });
        this.peers = Object.values(map);
        let oldRemovalCount = Math.min(simulation.H, this.peers.length - simulation.c);
        let sorted = this.peers.slice(0);
        sorted.sort((a, b) => a.age - b.age);
        let idsToRemove = sorted.slice(sorted.length - oldRemovalCount).map(peerData => peerData.id);
        this.peers = this.peers.filter(peerData => !idsToRemove.includes(peerData.id));
        let headRemovalCount = Math.min(simulation.S, this.peers.length - simulation.c);
        this.peers.splice(0, headRemovalCount);
        let randomRemovalCount = this.peers.length - simulation.c;
        for (let i = 0; i < randomRemovalCount; i++) {
            let removalIndex = getRandomInt(this.peers.length);
            this.peers.splice(removalIndex, 1);
        }
        this.updateQueue();
    }
    increaseAge() {
        this.peers.forEach(peer => peer.age++);
    }
    getPeers() {
        return this.peers.slice(0);
    }
}
//# sourceMappingURL=sampling.js.map