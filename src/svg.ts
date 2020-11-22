const SVG_NS = "http://www.w3.org/2000/svg";

// (id1 ,id2) -> id1-id2
function toLinkId(id1: number, id2: number): string {
    return id1 + "-" + id2;
}

class SvgManager {
    id: string;
    width: number;
    height: number;
    zero: Point;

    point: any;

    // process edition
    selectedElement: SVGGraphicsElement = null;
    offset: Point = null;
    addProcessOnMouseUp = false;
    move: Point = null;

    // link edition
    fromElement: SVGGraphicsElement = null;
    toElement: SVGGraphicsElement = null;

    constructor(id: string, width: number, height: number) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.zero = new Point(Math.round(this.width/2), Math.round(this.height/2));
    }

    init() {
        let svg = document.createElementNS(SVG_NS, "svg");

        svg.setAttribute("id", this.id);
        //svg.setAttribute("style", "border: 1px solid #444444");
        svg.setAttribute("width", this.width.toString());
        svg.setAttribute("height", this.height.toString());
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        
        this.point = svg.createSVGPoint();
        
        let self = this;

        let startDrag = (event: any) => {
            //if(event.which == MouseButton.Left && !event.altKey && fromElement == null) {
            if(event.which == MouseButton.Left) {
                if(event.target.classList.contains("draggable")) {
                    // left clicked on a process: move it
                    self.selectedElement = event.target.parentNode;
                    self.offset = this.getMousePosition(event);
                    let transformRaw = self.selectedElement.getAttributeNS(null, "transform");
                    let transform = self.parseTransform(transformRaw);
                    self.offset.x -= transform.x;
                    self.offset.y -= transform.y;

                }
            }
        };

        let endDrag = (event: any) => {
            if(event.which == MouseButton.Left) {
                if(event.altKey || self.fromElement != null) {
                    /*
                    if (event.target.classList.contains("draggable")) {
                        if(self.fromElement != null) {
                            // end of link
                            self.toElement = event.target.parentNode;
                            let fromElementId = parseInt(self.fromElement.id.substring(1));
                            let toElementId = parseInt(self.toElement.id.substring(1));
                            processManager.addLink(fromElementId, toElementId);
                            self.fromElement = null;
                            self.toElement = null;
                            removeTempLink();
                        }
                        else {
                            // start of link
                            self.fromElement = event.target.parentNode;
                            let elementId = parseInt(self.fromElement.id.substring(1));
                            let process = processManager.processes[elementId];
                            this.createLink(Html.tmpl, process.position, process.position);
                        }
                    }
                    */
                }
                else{
                    if(self.selectedElement != null) {
                        // either end of drag
                        
                        // TODO
                        // saveProcesses();
                    }
                    else if(self.addProcessOnMouseUp) {
                        /*
                        // creation of a new process
                        self.addProcessOnMouseUp = false;
                        self.point.x = event.clientX;
                        self.point.y = event.clientY;
        
                        // the cursor point, translated into svg coordinates
                        let screenPoint = self.point.matrixTransform(svg.getScreenCTM().inverse());
                        let cartesianPoint = this.screenToCartesian(new Point(screenPoint.x, screenPoint.y));

                        // TODO
                        //processManager.addProcess(cartesianPoint, event.shiftKey);
                        let process = new Process(-1, cartesianPoint);
                        process.position = cartesianPoint;
                        self.createProcess(process);
                        */
                    }
                    self.selectedElement = null;
                    self.offset = null;
                    self.move = null;
                }
            }
        };

        svg.addEventListener('mousedown', startDrag);
        //svg.addEventListener('mousemove', drag);
        svg.addEventListener('mouseup', endDrag);

        document.getElementById(Html.display).appendChild(svg);
    }

    getMousePosition(event: any): Point {
        var CTM = (document.getElementById(this.id) as unknown as SVGGraphicsElement).getScreenCTM();
        return new Point((event.clientX - CTM.e) / CTM.a, (event.clientY - CTM.f) / CTM.d);
    }

    parseTransform(transform: string): Point {
        let begin = transform.indexOf("(") + 1;
        let middle = transform.indexOf(",");
        let end = transform.indexOf(")");
        let x = parseFloat(transform.substring(begin, middle));
        let y = parseFloat(transform.substring(middle + 1, end));
        return new Point(x, y);
    }

    // convert screen coordinates to cartesian coordinates
    private screenToCartesian(point: Point) {
        let raw = new Point(point.x - this.zero.x, this.zero.y - point.y);
        return new Point(raw.x, raw.y);
    }
    // convert cartesian coordinates to screen coordinates
    private cartesianToScreen(point: Point) {
        return new Point(point.x + this.zero.x, -point.y + this.zero.y);
    }

    //createProcess(process: Process) {
    createProcess(process: any) {

        let center = this.cartesianToScreen(process.position);

        let group = document.createElementNS(SVG_NS, "g");
        group.setAttributeNS(null, "id", "g" + process.id);
        group.setAttributeNS(null, "text-anchor", "middle");
        group.setAttributeNS(null, "transform", "translate(" + center.x + "," + center.y + ")");
        
        // circle for process
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttributeNS(null, "id", process.id + "circle");
        circle.setAttributeNS(null, "cx", "0");
        circle.setAttributeNS(null, "cy", "0");
        circle.setAttributeNS(null, "r", "3");
        //circle.setAttributeNS(null, "r", PROCESS_SIZE.toString());
        circle.setAttributeNS(null, "fill", Color.ProcessOffline);
        circle.setAttributeNS(null, "opacity", "1");
        //circle.setAttributeNS(null, "fill", process.byzantine ? Color.ByzantineProcess : Color.CorrectProcess);
        circle.setAttributeNS(null, "stroke", "black");
        circle.setAttributeNS(null, "stroke-opacity", "0.1");
        circle.setAttributeNS(null, "class", "draggable process");

        group.appendChild(circle);

        document.getElementById(this.id).appendChild(group);
    }

    createLink(id: string, start: Point, end: Point) {
        
        let startScreen = this.cartesianToScreen(start);
        let endScreen = this.cartesianToScreen(end);
        
        let line = document.createElementNS(SVG_NS, "line");
        line.setAttributeNS(null, "id", id);
        line.setAttributeNS(null, "x1", startScreen.x.toString());
        line.setAttributeNS(null, "y1", startScreen.y.toString());
        line.setAttributeNS(null, "x2", endScreen.x.toString());
        line.setAttributeNS(null, "y2", endScreen.y.toString());
        line.setAttributeNS(null, "stroke", Color.LinkDefault);
        line.setAttributeNS(null, "stroke-width", "1px");
        line.setAttributeNS(null, "stroke-opacity", "0.2");
        line.setAttributeNS(null, "class", "link");
        line.setAttributeNS(null, "opacity", "0.5");

        let svgElement = document.getElementById(this.id);
        svgElement.insertBefore(line, svgElement.firstChild);
    }

    newMessage(id: string, position: Point, color: string): SVGGraphicsElement {

        let center = this.cartesianToScreen(position);

        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttributeNS(null, "id", id);
        circle.setAttributeNS(null, "cx", center.x.toString());
        circle.setAttributeNS(null, "cy", center.y.toString());
        circle.setAttributeNS(null, "r", "4");
        circle.setAttributeNS(null, "fill", color);
        circle.setAttributeNS(null, "stroke", "none");
        circle.setAttributeNS(null, "class", "message");
        circle.setAttributeNS(null, "opacity", "0.7");
        document.getElementById(this.id).appendChild(circle);

        return circle;
    }

    setSourceProcess(pid: number) {
        // circle for source
        let circle = document.createElementNS(SVG_NS, "circle");
        circle.setAttributeNS(null, "id", pid + "source");
        circle.setAttributeNS(null, "cx", "0");
        circle.setAttributeNS(null, "cy", "0");
        circle.setAttributeNS(null, "r", "10");
        circle.setAttributeNS(null, "fill", Color.ProcessSource);
        circle.setAttributeNS(null, "opacity", "0.2");

        document.getElementById('g' + pid).appendChild(circle);
    }

    clearSourceProcess(pid: number) {
        let group = document.getElementById('g' + pid);
        group.removeChild(group.lastChild);
    }

    send(process: Process, targets: Process[], message: Message) {
        for (let target of targets) {
            let msgId = "msgFROM" + process.id + "TO" + target.id;
            let svgElement = this.newMessage(msgId, process.position, Color.Message);
            let senderPositionScreen = this.cartesianToScreen(process.position);
            let targetPositionScreen = this.cartesianToScreen(target.position);

            let d = distance(process.position, target.position);
            let t = Math.round(d * simulation.speed);
            let animation = new MessageAnimation(svgElement, senderPositionScreen, targetPositionScreen, t);
            const onCompletion = () => {
                MessageBus.getInstance().notify(message, target.id.toString());
            };
            animation.start(onCompletion);
        }
    }

    setProcessStatus(pid: number, status: ProcessStatus) {
        let color;
        switch(status) {
            case ProcessStatus.Starting:
                color = Color.ProcessStarting;
                break;
            case ProcessStatus.Online:
                color = Color.ProcessOnline;
                break;
            case ProcessStatus.Source:
                color = Color.ProcessSource;
                break;
            case ProcessStatus.Infected:
                color = Color.ProcessInfected;
                break;
            case ProcessStatus.Offline:
            default:
                color = Color.ProcessOffline;
                break;
        }
        document.getElementById(pid + "circle").setAttributeNS(null, "fill", color);
    }
}