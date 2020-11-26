class Link {
    from: number;
    to: number;
    
    constructor(from: number, to: number) {
        this.from = from;
        this.to = to;
    }
    
    toId() {
        return toLinkId(this.from, this.to);
    }
}

class Links {
    private linksArray: Link[];
    private linksMap: { [pid: string]: number[] };

    constructor() {
        this.linksArray = [];
        this.linksMap = {};
    }
    asArray(): Link[] {
        return this.linksArray.slice(0);
    }

    getConnectedPeers(pid: number): number[] {
        if(this.linksMap.hasOwnProperty(pid)) {
            return this.linksMap[pid].slice(0);
        }
        return [];
    }

    getProcessLinks(pid: number): Link[] {
        let processLinks: Link[] = [];
        for(let link of this.linksArray) {
            if (pid == link.from || pid == link.to) {
                processLinks.push(new Link(link.from, link.to));
            }
        }
        return processLinks;
    }

    addLink(link: Link): boolean {
        for (let tmpLink of this.linksArray) {
            if ( (link.from == tmpLink.from && link.to == tmpLink.to) || (link.from == tmpLink.to && link.to == tmpLink.from) ) {
                console.log("link already exists: " + tmpLink.from + " -> " + tmpLink.to);
                return false;
            }
        }
        // add in array
        this.linksArray.push(link);
        // map link: from -> to
        if(!this.linksMap.hasOwnProperty(link.from)) {
            this.linksMap[link.from] = [];
        }
        this.linksMap[link.from].push(link.to);
        // map link: to -> from
        if(!this.linksMap.hasOwnProperty(link.to)) {
            this.linksMap[link.to] = [];
        }
        this.linksMap[link.to].push(link.from);
        return true;
    }

    removeLink(pid1: number, pid2: number): Link {
        for(let i=0; i < this.linksArray.length; i++) {
            if( (this.linksArray[i].from == pid1 && this.linksArray[i].to == pid2) || (this.linksArray[i].from == pid2 && this.linksArray[i].to == pid1)){
                // remove link from array
                let link = new Link(this.linksArray[i].from, this.linksArray[i].to);
                this.linksArray.splice(i, 1);
                // remove link from maps
                if(this.linksMap.hasOwnProperty(pid1)) {
                    for(let j=0; j < this.linksMap[pid1].length; j++) {
                        if(this.linksMap[pid1][j] == pid2) {
                            this.linksMap[pid1].splice(j, 1);
                            break;
                        }
                    }
                }
                if(this.linksMap.hasOwnProperty(pid2)) {
                    for(let j=0; j < this.linksMap[pid2].length; j++) {
                        if(this.linksMap[pid2][j] == pid1) {
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

    removeByProcess(pid: number): Link[] {
        let links: Link[] = []
        if(this.linksMap.hasOwnProperty(pid)) {
            // links of the process
            let processLinks = this.linksMap[pid].slice(0);
            // remove each link
            for(let pid2 of processLinks) {
                let removedLink = this.removeLink(pid, pid2);
                links.push(removedLink);
            }
        }
        return links;
    }
}