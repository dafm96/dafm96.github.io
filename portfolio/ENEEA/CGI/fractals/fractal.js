var gl;
var vPosition;
var fractalValue;
var fractal;
var factorLoc, factor;
var scale, scaleLoc;
var desloc, t, draw;
var oldX, oldY, xdesl, ydesl;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    xdesl = 0, ydesl = 0;
    scale = 1;
    
    // Three vertices
    var vertices = [
        vec2(-1,1),
        vec2(-1,-1),
        vec2(1,1),
        vec2(1,-1)
    ];
    
    // Configure WebGL
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.clearColor(1.0, 0.0, 1.0, 1.0);
    
    // Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate our shader variables with our data buffer
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    fractalValue = gl.getUniformLocation(program, "fractalType");
    factorLoc = gl.getUniformLocation(program, "factorS");
    scaleLoc = gl.getUniformLocation(program, "scale");
    
    canvas.addEventListener("mousedown", function(event){ 
        draw = true;
        oldX = event.offsetX;
        oldY = event.offsetY;
        oldX = (-1 + (2 * oldX / canvas.width))/scale;
        oldY = (-1 + (2 * (canvas.height - oldY)/canvas.height))/scale;
        oldX += xdesl;
        oldY += ydesl;
    });
    
     canvas.addEventListener("mouseup", function(event){   
        draw = false;
    });
    
    canvas.addEventListener("mousemove", function(event){
        if(draw){
        xdesl = event.offsetX;
        ydesl = event.offsetY;

        xdesl = (-(-1 + (2 * xdesl / canvas.width)))/scale;
        ydesl = (-(-1 + (2 * (canvas.height - ydesl)/canvas.height)))/scale;
        xdesl += oldX;
        ydesl += oldY;
        var t = vec2(xdesl,ydesl);
        //console.log("x:" + t[0] + " y:" + t[1]);
        
        desloc = gl.getUniformLocation(program, "desl");
        gl.uniform2fv(desloc, t);
        }
    });
    
    window.onkeydown = function(event) {
         
         switch (event.keyCode) {
         case 97:
             case 65:
         scale *= 1.05;
         break;
         case 115:
             case 83:
         scale /= 1.05;
         break; 
         }
    }
    
    render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    fractal = document.getElementById("box").value;
    gl.uniform1i(fractalValue, fractal);
    
    factor = document.getElementById("slider").value;
    gl.uniform1f(factorLoc, factor);
    
    gl.uniform1f(scaleLoc, scale);
    
    
    requestAnimationFrame(render);
}

function changeFunction(){
    document.getElementById("slider").value = document.getElementById("slider").defaultValue;
    scale = 1;
    
}
