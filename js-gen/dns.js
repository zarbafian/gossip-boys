class DnsService {
    constructor() {
        console.log('DnsService.constructor');
        this.peers = [];
    }
    static getInstance() {
        if (DnsService.instance == null) {
            DnsService.instance = new DnsService();
        }
        return DnsService.instance;
    }
    getInitialPeers() {
        return this.peers.slice(0, 10);
    }
    registerPeer(pid) {
        this.peers.push(pid);
    }
    clearPeers() {
        this.peers.splice(0);
    }
}
DnsService.instance = null;
//# sourceMappingURL=dns.js.map