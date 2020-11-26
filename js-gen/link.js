class Link {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    toId() {
        return toLinkId(this.from, this.to);
    }
}
class Links {
    constructor() {
        this.linksArray = [];
        this.linksMap = {};
    }
    asArray() {
        return this.linksArray.slice(0);
    }
    getConnectedPeers(pid) {
        if (this.linksMap.hasOwnProperty(pid)) {
            return this.linksMap[pid].slice(0);
        }
        return [];
    }
    getProcessLinks(pid) {
        let processLinks = [];
        for (let link of this.linksArray) {
            if (pid == link.from || pid == link.to) {
                processLinks.push(new Link(link.from, link.to));
            }
        }
        return processLinks;
    }
    addLink(link) {
        for (let tmpLink of this.linksArray) {
            if ((link.from == tmpLink.from && link.to == tmpLink.to) || (link.from == tmpLink.to && link.to == tmpLink.from)) {
                console.log("link already exists: " + tmpLink.from + " -> " + tmpLink.to);
                return false;
            }
        }
        this.linksArray.push(link);
        if (!this.linksMap.hasOwnProperty(link.from)) {
            this.linksMap[link.from] = [];
        }
        this.linksMap[link.from].push(link.to);
        if (!this.linksMap.hasOwnProperty(link.to)) {
            this.linksMap[link.to] = [];
        }
        this.linksMap[link.to].push(link.from);
        return true;
    }
    removeLink(pid1, pid2) {
        for (let i = 0; i < this.linksArray.length; i++) {
            if ((this.linksArray[i].from == pid1 && this.linksArray[i].to == pid2) || (this.linksArray[i].from == pid2 && this.linksArray[i].to == pid1)) {
                let link = new Link(this.linksArray[i].from, this.linksArray[i].to);
                this.linksArray.splice(i, 1);
                if (this.linksMap.hasOwnProperty(pid1)) {
                    for (let j = 0; j < this.linksMap[pid1].length; j++) {
                        if (this.linksMap[pid1][j] == pid2) {
                            this.linksMap[pid1].splice(j, 1);
                            break;
                        }
                    }
                }
                if (this.linksMap.hasOwnProperty(pid2)) {
                    for (let j = 0; j < this.linksMap[pid2].length; j++) {
                        if (this.linksMap[pid2][j] == pid1) {
                            this.linksMap[pid2].splice(j, 1);
                            break;
                        }
                    }
                }
                return link;
            }
        }
        return null;
    }
    removeByProcess(pid) {
        let links = [];
        if (this.linksMap.hasOwnProperty(pid)) {
            let processLinks = this.linksMap[pid].slice(0);
            for (let pid2 of processLinks) {
                let removedLink = this.removeLink(pid, pid2);
                links.push(removedLink);
            }
        }
        return links;
    }
}
//# sourceMappingURL=link.js.map