class PeerData {
    id: number;
    age: number;
    constructor(id: number, age: number) {
        this.id = id;
        this.age = age;
    }
}

class PeerSamplingService {

    id: number;
    peers: PeerData[];
    peerQueue: number[];
    
    init(id: number) {
        this.id = id;
        this.peers = [];
        this.peerQueue = [];
        for(let pid of DnsService.getInstance().getInitialPeers()) {
            if(this.id !== pid) {
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

    getPeer(): number {
        if(this.peerQueue.length == 0) {
            let fallback = this.selectPeer();
            if(fallback != null) {
                return fallback.id;
            }
            return null;
        }
        return this.peerQueue.splice(0, 1)[0];
    }

    selectPeer(): PeerData {
        if(this.peers.length > 0) {
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
        
        if(sorted.length > simulation.H) {
            // the ids of peers moved to the end
            let endIds = [];
            for(let i = (sorted.length - simulation.H); i < sorted.length; i++) {
                endIds.push(sorted[i].id);
            }
            // build the beginning and and separately
            let newViewStart = [];
            let newViewEnd = [];
            for(let peerData of this.peers) {
                if(endIds.includes(peerData.id)) {
                    // move to the end part of future view
                    newViewEnd.push(peerData);
                }
                else {
                    // move to beginning part of future view
                    newViewStart.push(peerData);
                }
            }
            // merge two parts
            Array.prototype.push.apply(newViewStart, newViewEnd);
            this.peers = newViewStart;
        }
    }

    getHead(): PeerData[] {
        return this.peers.slice(0, simulation.c/2 - 1);
    }

    select(buffer: PeerData[]) {

        //let peerData = this.getPeers().map(p => `( ${p.id}@${p.age} )`).join(', ');
        //let bufferData = buffer.slice(0).map(p => `( ${p.id}@${p.age} )`).join(', ');
        //console.log(`[${this.id}] peerData=${peerData}, buffer=${bufferData}`);

        // merge view and buffer
        Array.prototype.push.apply(this.peers, buffer);

        // remove duplicates
        let map: { [pid: number]: PeerData } = {};
        this.peers.forEach(peer => {
            if(map.hasOwnProperty(peer.id)) {
                if(map[peer.id].age > peer.age) {
                    // duplicate and newer: replace
                    map[peer.id] = peer;
                }
                else {
                    // duplicate and older: discard
                }
            }
            else {
                // unique: keep
                map[peer.id] = peer;
            }
        });
        this.peers = Object.values(map);

        // remove old items
        let oldRemovalCount = Math.min(simulation.H, this.peers.length - simulation.c);
        let sorted = this.peers.slice(0);
        sorted.sort((a, b) => a.age - b.age);
        let idsToRemove = sorted.slice(sorted.length - oldRemovalCount).map(peerData => peerData.id);
        this.peers = this.peers.filter(peerData => !idsToRemove.includes(peerData.id));

        // remove head
        let headRemovalCount = Math.min(simulation.S, this.peers.length - simulation.c);
        this.peers.splice(0, headRemovalCount);

        // remove at random
        let randomRemovalCount = this.peers.length - simulation.c;
        for(let i=0; i < randomRemovalCount; i++) {
            let removalIndex = getRandomInt(this.peers.length);
            this.peers.splice(removalIndex, 1);
        }

        this.updateQueue();
        //let newPeerData = this.getPeers().map(p => `( ${p.id}@${p.age} )`).join(', ');
        //console.log(`[${this.id}] newPeerData=${newPeerData}`);
    }

    increaseAge() {
        this.peers.forEach(peer => peer.age++);
    }

    getPeers(): PeerData[] {
        return this.peers.slice(0);
    }
}