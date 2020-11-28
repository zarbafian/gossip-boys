class DnsService {
    private static instance: DnsService = null;

    private peers: number[];

    private constructor() {
        console.log('DnsService.constructor');
        this.peers = [];
    }

    static getInstance(): DnsService {
        if(DnsService.instance == null) {
            DnsService.instance = new DnsService();
        }

        return DnsService.instance;
    }

    getInitialPeers(): number[] {
        return this.peers.slice(0, 10);
        //return this.peers.slice(0, 1);
    }

    registerPeer(pid: number) {
        this.peers.push(pid);
    }

    clearPeers() {
        this.peers.splice(0);
    }
}