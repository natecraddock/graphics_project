function Input() {
    this.letters = "abcdefghijklmnopqrstuvwxyz";

    /*Type{Point}*/
    this.Mouse = function() {
        this.right = false;
        this.left = false;
    };
    this.Mouse.prototype = Object.create(Point.prototype);

    this.keys = {};
}

Input.prototype.init = function() {
    // Generate keys
    for(var i = 0; i < this.letters.length; i++) {
        this.keys[this.letters[i]] = false;
    }

    // Add listeners
    document.addEventListener('mousemove', Input.prototype.updateInputs.bind(this));
    canvas.addEventListener('mousedown', Input.prototype.updateInputs.bind(this));
    canvas.addEventListener('mouseup', Input.prototype.updateInputs.bind(this));
    document.addEventListener('keydown', Input.prototype.updateInputs.bind(this));
    document.addEventListener('keyup', Input.prototype.updateInputs.bind(this));
    
    // Hide that nasty context menu
    canvas.addEventListener('contextmenu', function (e) {e.preventDefault(); });
};

Input.prototype.updateInputs = function(e) {
    // Keyboard input
    if(e.type == "keyup") {
        var letter = String.fromCharCode(e.keyCode).toLowerCase();
        this.keys[letter] = false;
    }
    else if(e.type == "keydown") {
        var letter = String.fromCharCode(e.keyCode).toLowerCase();
        this.keys[letter] = true;
    }

    // Mouse input
    if(e.type == "mousemove") {
        var rect = canvas.getBoundingClientRect();
        this.Mouse.x = e.clientX - rect.left;
        this.Mouse.y = e.clientY - rect.top;
        
        // Because the mouse is moving, we don't care if the mouse is down anymore (hopefully)
        this.Mouse.right = false;
        this.Mouse.left = false;
    } else {
        // Mouse click detection
        if(e.type == "mousedown") {
            if(e.button == 0) {
                e.preventDefault();
                this.Mouse.left = true;
            }
            else if(e.button == 2) {
                this.Mouse.right = true;
            }
            console.log(this.Mouse.x, this.Mouse.y);
        }
        else if(e.type == "mouseup") {
            this.Mouse.right = false;
            this.Mouse.left = false;
        }
    }

    // We got input, so lets redraw to make sure everything updates right
    draw();
};