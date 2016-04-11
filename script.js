var canvas = document.getElementById('app');
var context = canvas.getContext('2d');

// Settings
var settings = {
    threshold: 8,
    vertSize: 4,
    vertColor: 'black',
    vertColorSelected: 'orange',
    edgeWidth: 0.5,
    edgeColor: 'black',
    edgeColorSelected: 'orange',
    faceColor: '#ABCDEF',
    faceColorSelected: 'orange'
};

var mouse = new Point();

// Testing utils
function displayInfo(info) {
    var infoBox = document.getElementById('info');
    infoBox.textContent += info;
}

// Canvas utils
function drawSquare(x, y, w, c) {
    context.fillStyle = c;
    context.fillRect(x, y, w, w);
}

// Utililty Classes
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


// Make this inherit Point for much easier coordinate access. :)
function Vertex() {
    this.coords = new Point(); // Center of the vert
    this.selected = false;
}

Vertex.prototype.draw = function() {
    var offsetX = this.coords.x - (settings.vertSize / 2);
    var offsetY = this.coords.y - (settings.vertSize / 2);

    // If less than the threshold, and closest to the mouse...
    this.selected = this.coords.distanceTo(mouse) <= settings.threshold;

    if (this.selected) {
        drawSquare(offsetX, offsetY, settings.vertSize, settings.vertColorSelected);
    } else {
        drawSquare(offsetX, offsetY, settings.vertSize, settings.vertColor);
    }
};


function Edge() {
    this.verts = []; // We leave this private so it stays fixed to 2 verts
}

Edge.prototype.setVerts = function(v1, v2) {
    this.verts = [];
    this.verts.push(v1);
    this.verts.push(v2);
};

Edge.prototype.getVerts = function() {
    return this.verts;
};

Edge.prototype.getVert = function(index) {
    if(index < 0) { index = 0 }
    if(index > 1) { index = 1 }

    return this.verts[index];
};

Edge.prototype.getPos = function() {
    var x = (this.verts[1].coords.x + this.verts[0].coords.x) / 2;
    var y = (this.verts[1].coords.y + this.verts[0].coords.y) / 2;

    return new Point(x, y);
};

Edge.prototype.connected = function(e) {
    for(var i = 0; i < 2; i++) {
        for(var j = 0; j < 2; j++) {
            if(this.verts[i].coords.compare(e.getVert(j).coords)) {
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
        context.moveTo(this.verts[0].coords.x, this.verts[0].coords.y);
        context.lineTo(this.verts[1].coords.x, this.verts[1].coords.y);
        context.stroke();
    }
};


function Face() {
    this.edges = []; // At least 3 (Must be closed!)
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
            context.lineTo(this.edges[i].getVert(0).coords.x, this.edges[i].getVert(0).coords.y);
            context.lineTo(this.edges[i].getVert(1).coords.x, this.edges[i].getVert(1).coords.y);
        }
        context.fillStyle = settings.faceColor;
        context.fill();
    }
};

// Create some geometry for testing purposes
v = new Vertex();
v.coords.setPoint(30, 55);

v1 = new Vertex();
v1.coords.setPoint(200, 300);

v2 = new Vertex();
v2.coords.setPoint(300, 100);

v3 = new Vertex();
v3.coords.setPoint(300, 150);

e = new Edge();
e.setVerts(v, v1);
//e.draw();

e1 = new Edge();
e1.setVerts(v1, v2);
//e1.draw();

e2 = new Edge();
e2.setVerts(v2, v);
//e2.draw();

e3 = new Edge();
e3.setVerts(v2, v3);
//e3.draw();

e4 = new Edge();
e4.setVerts(v1, v3);
//e4.draw();

f = new Face();
f.setEdges(e, e1, e2);

f1 = new Face();
f1.setEdges(e3, e4, e1);

mid = new Vertex();
mid.coords.x = e4.getPos().x;
mid.coords.y = e4.getPos().y;


function draw(e) {
    if(e) {
        var rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    console.log(mouse.x + ", " + mouse.y);

    f.draw();
    f1.draw();
    v.draw();
    v1.draw();
    v2.draw();
    v3.draw();
    mid.draw();
}

canvas.addEventListener('mousemove', draw);
draw();

console.log(v2.coords.distanceTo(v1.coords));