var canvas = document.getElementById('app');
var context = canvas.getContext('2d');

// Settings
var settings = {
    threshold: 16,
    vertSize: 4,
    vertColor: 'black',
    vertColorSelected: 'orange',
    edgeWidth: 0.5,
    edgeColor: 'black',
    edgeColorSelected: 'orange',
    faceColor: '#ABCDEF',
    faceColorSelected: 'orange'
};

// Temporary array until multiple file structure is enabled
var hasFocus = undefined;

/*Type{Point}*/
function Mouse() {
    this.down = false;
    this.drag = false;
}

Mouse.prototype = Object.create(Point.prototype);

// Testing utils
function displayInfo(info) {
    var infoBox = document.getElementById('info');
    infoBox.textContent = info;
}

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
}

// Inheritance
Vertex.prototype = Object.create(Point.prototype);

Vertex.prototype.draw = function() {
    var offsetX = this.x - (settings.vertSize / 2);
    var offsetY = this.y - (settings.vertSize / 2);

    // If less than the threshold, and closest to the mouse...
    if(this.distanceTo(Mouse) <= settings.threshold && Mouse.down) {
        this.selected = !this.selected;
    }

    if (this.selected) {
        if(Mouse.drag) {
            this.x = Mouse.x;
            this.y = Mouse.y;
        }
        drawSquare(offsetX, offsetY, settings.vertSize, settings.vertColorSelected);
    } else {
        drawSquare(offsetX, offsetY, settings.vertSize, settings.vertColor);
    }
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

        // Draw midpoints
        vert = new Vertex();
        vert.setPoint(this.getPos().x, this.getPos().y);
        vert.draw();
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
v.setPoint(30, 55);

v1 = new Vertex();
v1.setPoint(200, 300);

v2 = new Vertex();
v2.setPoint(300, 100);

v3 = new Vertex();
v3.setPoint(300, 130);

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
    if(event) {
        var rect = canvas.getBoundingClientRect();
        Mouse.x = event.clientX - rect.left;
        Mouse.y = event.clientY - rect.top;

        if(event.type == 'mousedown') {
            Mouse.down = true;
            hasFocus = event.target;
        }
        else if(event.type == 'mouseup') {
            Mouse.down = false;
        }
        else if(event.keyCode == 71 && event.type == 'keydown') {
            if(hasFocus == canvas) {
                Mouse.drag = true;
            }
        }
        else if(event.type == "keyup" && event.keyCode == 71) {
            if(hasFocus == canvas) {
                Mouse.drag = false;
            }
        }

    }

    context.clearRect(0, 0, canvas.width, canvas.height);

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

canvas.addEventListener('mousemove', draw);
document.addEventListener('mousedown', draw);
canvas.addEventListener('mouseup', draw);
document.addEventListener('keydown', draw);
document.addEventListener('keyup', draw);
draw();

