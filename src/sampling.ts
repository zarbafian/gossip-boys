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
    private peers: PeerData[];
    //private peers: { [pid: string]: PeerData };
    
    init(id: number) {
        this.id = id;
        this.peers = [];
        for(let pid of DnsService.getInstance().getInitialPeers()) {
            if(this.id !== pid) {
                this.peers.push(new PeerData(pid, 0));
            }
        }
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
        sorted.sort((a, b) => b.age - a.age);
        
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
        // TODO
        Array.prototype.push.apply(this.peers, buffer.slice(0, 3));
        //this.peers = buffer.slice(0, 3);
    }

    getPeers(): PeerData[] {
        return this.peers.slice(0);
    }
}