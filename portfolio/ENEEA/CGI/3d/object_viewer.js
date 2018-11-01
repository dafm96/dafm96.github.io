var gl;
var canvas;
var program, program1, program2;


var mModelView;
var mModelViewLoc;
var mProjection;
var mProjectionLoc;
var mNormals;
var mNormalsLoc;

var polygonType = 0;
var fill = 0;

var projection;

var obliqual = 1, obliquab = 45;
var perspetivad = 3;
var theta;
var gamma;

function load_file() {
    var selectedFile = this.files[0];
    var reader = new FileReader();
    var id=this.id == "vertex" ? "vertex-shader-2" : "fragment-shader-2";
    reader.onload = (function(f){
        var fname = f.name;
        return function(e) {
            console.log(fname);
            console.log(e.target.result);
            console.log(id);
            document.getElementById(id).textContent = e.target.result;
            program2 = initShaders(gl, "vertex-shader-2", "fragment-shader-2");
            reset_program(program2);
            program = program2;
        }
    })(selectedFile);
    reader.readAsText(selectedFile);
}

function reset_program(prg) {
    mModelViewLoc = gl.getUniformLocation(prg, "mModelView");
    mNormalsLoc = gl.getUniformLocation(prg, "mNormals");
    mProjectionLoc = gl.getUniformLocation(prg, "mProjection");
    program = prg;
}

window.onload = function init() {
    // Get the canvas
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }

    // Setup the contexts and the program
    gl = WebGLUtils.setupWebGL(canvas);
    program1 = initShaders(gl, "vertex-shader", "fragment-shader");
    
    document.getElementById("vertex").onchange = load_file;
    document.getElementById("fragment").onchange = load_file;

    document.getElementById("polygon").value = 0;
    document.getElementById("fill").value = 0;
    document.getElementById("projection").value = "Perspetiva";

    mModelViewLoc = gl.getUniformLocation(program, "mModelView");
    mProjectionLoc = gl.getUniformLocation(program, "mProjection");
    mNormalsLoc = gl.getUniformLocation(program, "mNormals");

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0,0,canvas.width, canvas.height);

    gl.enable(gl.DEPTH_TEST);

    sphereInit(gl);
    cubeInit(gl);
    pyramidInit(gl);
    torusInit(gl);
    
    aspect = canvas.clientWidth / canvas.clientHeight;
    resize(aspect);

    window.onresize = function() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        aspect = canvas.width / canvas.height;
        
        resize(aspect);

    }
    
    
    mModelView = mat4(
                 1,0,0,0,
                 0,1,0,0,
                 0,0,1,0,
                 0,0,-1/perspetivad,1);
    
    mNormals = mat4();
    
    document.getElementById("polygon").onchange = function(){
        polygonType = this.value;
    }
    
    document.getElementById("fill").onchange = function(){
        fill = this.value;
    }
    
    document.getElementById("projection").oninput = function() {
        switch(this.value) {
            case "Axonometrica": 
                theta = toDegrees(Math.atan(Math.sqrt(Math.tan(radians(42))/Math.tan(radians(7)))) - Math.PI/2);
                document.getElementById("axo-theta").value = theta;
                gamma = toDegrees(Math.asin(Math.sqrt(Math.tan(radians(42))*Math.tan(radians(7)))));
                document.getElementById("axo-gamma").value = gamma;
                
                mModelView = mult(rotateX(gamma), rotateY(theta));
                mNormals = transpose(inverse(mModelView));
                
                document.getElementById("Obliqua").style.display = "none";
                document.getElementById("Perspetiva").style.display = "none"; 
                document.getElementById("Axonometrica").style.display = "block";
                projection = this.value;
                break;
                
            case "Obliqua":
                mNormals = mat4();
                mModelView = mat4(
                 1,0, -obliqual*Math.cos(obliquab),0,
                 0,1, -obliqual*Math.sin(obliquab),0,
                 0,0,1,0, 
                 0,0,0,1);
                
                document.getElementById("Axonometrica").style.display = "none";
                document.getElementById("Perspetiva").style.display = "none";
                document.getElementById("Obliqua").style.display = "block";
                
                projection = this.value;
                break;
            case "Perspetiva":
                mNormals = mat4();
                mModelView = mat4(
                 1,0,0,0,
                 0,1,0,0,
                 0,0,1,0,
                 0,0,-1/perspetivad,1); 
                document.getElementById("Axonometrica").style.display = "none";
                document.getElementById("Obliqua").style.display = "none";
                document.getElementById("Perspetiva").style.display = "block";
                projection = this.value;
                break;
                
        }
    }
    
     document.getElementById("perspetiva-d").oninput = function(){
        perspetivad = this.value;
        mModelView = mat4(
                 1,0,0,0,
                 0,1,0,0,
                 0,0,1,0,
                 0,0,-1/perspetivad,1);
    }
     
    document.getElementById("axo-theta").oninput = function(){
        theta = this.value;
		mModelView = mult(rotateX(gamma), rotateY(theta));
    }
    
    document.getElementById("axo-gamma").oninput = function(){
        gamma = this.value;
		mModelView = mult(rotateX(gamma), rotateY(theta));
    }
     
    document.getElementById("obliqua-l").oninput = function(){
        obliqual = this.value;
        mModelView = mat4(
                 1,0, -obliqual*Math.cos(radians(obliquab)),0,
                 0,1, -obliqual*Math.sin(radians(obliquab)),0,
                 0,0,1,0, 
                 0,0,0,1);
    }
    document.getElementById("obliqua-b").oninput = function(){
        obliquab = this.value;
        mModelView = mat4(
                 1,0, -obliqual*Math.cos(radians(obliquab)),0,
                 0,1, -obliqual*Math.sin(radians(obliquab)),0,
                 0,0,1,0, 
                 0,0,0,1);
    }
    
   reset_program(program1);
    
    render();
}


function toDegrees(radian){	
	return radian * 180 / Math.PI;
}

function resize(aspect){
    if(aspect >= 1){
        mProjection = ortho(-1*aspect, 1*aspect, -1, 1, -1, 1);
    }
    else{
        mProjection = ortho(-1, 1, -1/aspect, 1/aspect, -1, 1);
    }
}

function drawObject(gl, program) 
{
    if(fill == 1){
        if(polygonType == 0){
            sphereDrawFilled(gl, program);
        }
        else if(polygonType == 1){
            cubeDrawFilled(gl, program);
        }
        else if(polygonType == 2){
            pyramidDrawFilled(gl, program);
        }
        else if(polygonType == 3){
            torusDrawFilled(gl, program);
        }
    }
    else if(fill == 0){
        if(polygonType == 0){
            sphereDrawWireFrame(gl, program);
        }
        else if(polygonType == 1){
            cubeDrawWireFrame(gl, program);
        }
        else if(polygonType == 2){
            pyramidDrawWireFrame(gl, program);
        }
        else if(polygonType == 3){
            torusDrawWireFrame(gl, program);
        }
    }
}

function render() 
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 
    
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));
    
    
    
    // Front view
    gl.viewport(0,canvas.height/2, canvas.width/2,  canvas.height/2);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mat4()));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mat4()));
    drawObject(gl, program);
    
    
    // Side view
    gl.viewport(canvas.width/2,canvas.height/2,canvas.width/2,  canvas.height/2);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(rotateY(90)));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(transpose(inverse(rotateY(90)))));
    drawObject(gl, program);
    

    // Top view
    gl.viewport(0,0,canvas.width/2,  canvas.height/2);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(rotateX(90)));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(transpose(inverse(rotateX(90)))));
    drawObject(gl, program);

    
    // Other view
    gl.viewport(canvas.width/2,0,canvas.width/2, canvas.height/2);
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    if(projection == "Axonometrica"){
        gl.uniformMatrix4fv(mNormalsLoc, false, flatten(transpose(inverse(mModelView))));
    }
    else{
        gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mat4()));
    }
    
    drawObject(gl, program);
    

    window.requestAnimationFrame(render);
}
