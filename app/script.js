var canvas = document.getElementById('app');
var context = canvas.getContext('2d');

window.onresize = setCanvasSize;

function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

var dragging = false;

var input = new Input();
input.init();

// Canvas utils
function drawSquare(x, y, w, c) {
    context.fillStyle = c;
    context.fillRect(x, y, w, w);
}

// Utility Classes
function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Point.prototype.compare = function(point) {
    if(this.x == point.x) {
        if(this.y == point.y) {
            return true;
        }
    }
    return false;
};

// Uses the pythagorean theorem to get the distance between two points
Point.prototype.distanceTo = function(point) {
    return Math.sqrt(Math.pow((this.x - point.x), 2) + Math.pow((this.y - point.y), 2));
};

// Sets the point to requested x and y coordinates
Point.prototype.setPoint = function(x, y) {
    this.x = x;
    this.y = y;
};

/*@Type{Point}*/
function Vertex() {
    this.selected = false;
    this.moving = false;

    this.mouseOffsetX = undefined;
    this.mouseOffsetY = undefined;
}
Vertex.prototype = Object.create(Point.prototype);

Vertex.prototype.draw = function() {
    var offsetX = this.x - (settings.vertSize / 2);
    var offsetY = this.y - (settings.vertSize / 2);

    if(input.keys['a']) {
        if(this.selected) {
            this.selected = false;
        }
    }

    if(this.selected) {
        if(input.keys['g'] && !this.moving) {
            this.moving = true;
            this.mouseOffsetX = this.x - input.Mouse.x;
            this.mouseOffsetY = this.y - input.Mouse.y;
        } else if(!input.keys['g'] && this.moving) {
            this.moving = false;
        }

        if(this.moving) {
            this.move(this.mouseOffsetX, this.mouseOffsetY);
        }
        drawSquare(offsetX, offsetY, settings.vertSize, settings.vertColorSelected);
    }
    else {
        if(this.distanceTo(input.Mouse) <= settings.selectionThreshold) {
            drawSquare(offsetX, offsetY, settings.vertSize, settings.vertColorHover);
        }
        else {
            drawSquare(offsetX, offsetY, settings.vertSize, settings.vertColor);
        }
    }
    
    if(this.distanceTo(input.Mouse) <= settings.selectionThreshold && input.Mouse.right) {
        this.selected = !this.selected;
    }

};

Vertex.prototype.move = function(x, y) {
    this.x = x + input.Mouse.x;
    this.y = y + input.Mouse.y;
};


function Edge() {
    this.verts = []; // We leave this private so it stays fixed to 2 verts
    this.selected = false;
}

Edge.prototype.setVerts = function(v1, v2) {
    this.verts = [];
    this.verts.push(v1);
    this.verts.push(v2);
};

Edge.prototype.getPos = function() {
    var x = (this.verts[1].x + this.verts[0].x) / 2;
    var y = (this.verts[1].y + this.verts[0].y) / 2;

    return new Point(x, y);
};

Edge.prototype.connected = function(e) {
    for(var i = 0; i < 2; i++) {
        for(var j = 0; j < 2; j++) {
            if(this.verts[i].compare(e.verts[j])) {
                return true;
            }
        }
    }
    return false;
};

Edge.prototype.draw = function() {
    context.strokeStyle = settings.edgeColor;
    context.lineWidth = settings.edgeWidth;

    if (this.verts.length == 2) {
        context.beginPath();
        context.moveTo(this.verts[0].x, this.verts[0].y);
        context.lineTo(this.verts[1].x, this.verts[1].y);
        context.stroke();
    }
};


function Face() {
    this.edges = []; // At least 3 (Must be closed!)
    this.selected = false;
}

Face.prototype.setEdges = function() {
    this.edges = [];

    if(arguments.length > 2) {
        for(var i = 0; i < arguments.length; i++) {
            this.edges.push(arguments[i]);
        }
    }
};

Face.prototype.validateFace = function() {
    var validFace = true;

    for(var i = 0; i < this.edges.length - 1; i++) {
        if(!this.edges[i].connected(this.edges[i + 1])) {
            validFace = false;
        }
    }

    // Compare first and last as well
    if(!this.edges[0].connected((this.edges[this.edges.length - 1]))) {
        validFace = false;
    }

    return validFace;
};

Face.prototype.draw = function() {
    if(this.validateFace()) {
        context.beginPath();
        for(var i = 0; i < this.edges.length; i++) {
            context.lineTo(this.edges[i].verts[0].x, this.edges[i].verts[0].y);
            context.lineTo(this.edges[i].verts[1].x, this.edges[i].verts[1].y);
        }
        context.fillStyle = settings.faceColor;
        context.fill();
    }
};


// Create some geometry for testing purposes
v = new Vertex();
v.setPoint(100, 100);

v1 = new Vertex();
v1.setPoint(100, 300);

v2 = new Vertex();
v2.setPoint(300, 100);

v3 = new Vertex();
v3.setPoint(300, 300);

e = new Edge();
e.setVerts(v, v1);

e1 = new Edge();
e1.setVerts(v1, v2);

e2 = new Edge();
e2.setVerts(v2, v);

e3 = new Edge();
e3.setVerts(v2, v3);

e4 = new Edge();
e4.setVerts(v1, v3);

f = new Face();
f.setEdges(e, e1, e2);

f1 = new Face();
f1.setEdges(e3, e4, e1);

function draw(event) {
    context.fillStyle = '#DDD';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all the testing stuff
    f.draw();
    f1.draw();
    e.draw();
    e1.draw();
    e2.draw();
    e3.draw();
    e4.draw();
    v.draw();
    v1.draw();
    v2.draw();
    v3.draw();
}
setCanvasSize()
draw();