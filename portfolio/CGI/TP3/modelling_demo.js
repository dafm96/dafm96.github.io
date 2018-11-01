/*
*45088 Andre Vale
*45235 David Moura
*/

var gl;

var canvas;

// GLSL programs
var program;

// Render Mode
var WIREFRAME=1;
var FILLED=2;
var renderMode = WIREFRAME;

var projection;
var modelView;
var view;

matrixStack = [];

var axisZ, axisX;
var baseRot;
var inferiorArmRot, superiorArmRot;
var fingers;
var arrayRot;

var theta;
var gamma;

function pushMatrix()
{
    matrixStack.push(mat4(modelView[0], modelView[1], modelView[2], modelView[3]));
}

function popMatrix() 
{
    modelView = matrixStack.pop();
}

function multTranslation(t) {
    modelView = mult(modelView, translate(t));
}

function multRotX(angle) {
    modelView = mult(modelView, rotateX(angle));
}

function multRotY(angle) {
    modelView = mult(modelView, rotateY(angle));
}

function multRotZ(angle) {
    modelView = mult(modelView, rotateZ(angle));
}

function multMatrix(m) {
    modelView = mult(modelView, m);
}
function multScale(s) {
    modelView = mult(modelView, scalem(s));
}

function initialize() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.viewport(0,0,canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    
    program = initShaders(gl, "vertex-shader-2", "fragment-shader-2");
    
    cubeInit(gl);
    sphereInit(gl);
    cylinderInit(gl);
    
    setupProjection();
    setupView();
}

function setupProjection() {
    projection = ortho(-3,3,-3,3,-3,3);
    
}

function setupView() {

    view = mult(rotateX(gamma), rotateY(theta));
    modelView = mat4(view[0], view[1], view[2], view[3]);
}

function setMaterialColor(color) {
    var uColor = gl.getUniformLocation(program, "color");
    gl.uniform3fv(uColor, color);
}

function sendMatrices()
{
    // Send the current model view matrix
    var mView = gl.getUniformLocation(program, "mView");
    gl.uniformMatrix4fv(mView, false, flatten(view));
    
    // Send the normals transformation matrix
    var mViewVectors = gl.getUniformLocation(program, "mViewVectors");
    gl.uniformMatrix4fv(mViewVectors, false, flatten(normalMatrix(view, false)));  

    // Send the current model view matrix
    var mModelView = gl.getUniformLocation(program, "mModelView");
    gl.uniformMatrix4fv(mModelView, false, flatten(modelView));
    
    // Send the normals transformation matrix
    var mNormals = gl.getUniformLocation(program, "mNormals");
    gl.uniformMatrix4fv(mNormals, false, flatten(normalMatrix(modelView, false)));  
}

function draw_sphere(color)
{
    setMaterialColor(color);
    sendMatrices();
    sphereDrawFilled(gl, program);
}

function draw_cube(color)
{
    setMaterialColor(color);
    sendMatrices();
    cubeDrawFilled(gl, program);
}

function draw_cylinder(color)
{
    setMaterialColor(color);
    sendMatrices();
    cylinderDrawFilled(gl, program);
}

function draw_scene()
{
    //floor
    pushMatrix();
        multTranslation([0,-5,0]);
        multScale([5, 5, 5]);
        draw_cube([0.3, 0.3, 0.3]);
    popMatrix();
   
    
    pushMatrix();
        multTranslation([axisX,-2.395,axisZ]);
        //robot base
        pushMatrix();
            multScale([1.5, 0.2, 1.5]);
            draw_cube([1,0,0]);
        popMatrix();
        pushMatrix();
            
            multRotY(baseRot); //rodar cubo verde
    
            pushMatrix();
                multTranslation([0,0.2,0]);
                //cilindro base
                pushMatrix();
                    multScale([0.6, 0.5, 0.6]);
                    draw_cylinder([0.0, 1.0, 0.0]);
                popMatrix();
                multTranslation([0, 0.5,0]);
                //primeiro braco
                pushMatrix();
                    multScale([0.2, 1, 0.2]);
                    draw_cube([1.0, 0.0, 0.0]);
                popMatrix();
    
                multTranslation([0, 0.55,0]);
                //primeira esfera
                pushMatrix();
                    multRotX(inferiorArmRot);//mexer braco inferior
                    pushMatrix();
                        multScale([0.23, 0.2, 0.2]);
                        multRotZ(90);
                        draw_cylinder([1.0, 1.0, 0.0]);
                    popMatrix();
                    //segundo braco
                    pushMatrix();
                        multTranslation([0, 0.55, 0]);
                        multScale([0.2, 1, 0.2]);
                        draw_cube([1.0, 0.0, 0.0]);
                    popMatrix();
                    //segunda esfera
                    multTranslation([0, 1, 0]);
                    pushMatrix();
                        multRotX(superiorArmRot); //mexer braco superior
                        pushMatrix();
                            multScale([0.23, 0.2, 0.2]);
                            multRotZ(90);
                            draw_cylinder([1.0, 1.0, 0.0]);
                        popMatrix();
                        //segundo braco
                        multTranslation([0, 0.55, 0]);
                        pushMatrix();
                            multScale([0.2, 1, 0.2]);
                            draw_cube([1.0, 0.0, 0.0]);
                            //array dish
                            pushMatrix();
                                multRotY(arrayRot); // roda o disco
                                multTranslation([0, 0.5, 0]);
                                multScale([4, 0.2, 4]);
                                draw_cylinder([0.0, 1.0, 1.0]);
                                //french frie 1
                                pushMatrix();
                                    multScale([0.15, 3, 0.15]);
                                    multTranslation([fingers, 0.5, 0]);//mexer os imans na posicao x
                                    draw_cube([1.0, 1.0, 0.0]);
                                popMatrix();
                                //french frie 2
                                pushMatrix();
                                    multScale([0.15, 3, 0.15]);
                                    multTranslation([-fingers, 0.5, 0]);//mexer os imans na posicao x
                                    draw_cube([1.0, 1.0, 0.0]);
                                popMatrix();
                            popMatrix()
                        popMatrix();
                    popMatrix();
                popMatrix();
            popMatrix();
        popMatrix();
    popMatrix();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    
    setupView();
    
    // Send the current projection matrix
    var mProjection = gl.getUniformLocation(program, "mProjection");
    gl.uniformMatrix4fv(mProjection, false, flatten(projection));
        
    draw_scene();
    
    requestAnimFrame(render);
}


window.onload = function init()
{
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }
    
    //input variables
    axisX = 0;
    axisZ = -0.2;
    baseRot = 45;
    inferiorArmRot = 20;
    superiorArmRot = -20;
    fingers = 1;
    arrayRot = 0;
    
    //projection variables
    theta = Math.atan(Math.sqrt(Math.tan(radians(42))/Math.tan(radians(7)))) - Math.PI/2;
	document.getElementById("axo-theta").value = theta;
	gamma = Math.asin(Math.sqrt(Math.tan(radians(42))*Math.tan(radians(7))));
	document.getElementById("axo-gamma").value = gamma;

	document.getElementById("axo-theta").oninput = function(){
        theta = this.value;
    }
    
    document.getElementById("axo-gamma").oninput = function(){
        gamma = this.value;
    }

    initialize();
    
    window.onkeydown = function(event){
        switch(event.keyCode){
            case 37: //left arrow
                axisX -= 0.1;
                if(axisX < -1.7)
                    axisX = -1.7;
            break;
            case 38: //up arrow
                axisZ -= 0.1;
                if(axisZ < -1.7)
                    axisZ = -1.7
            break;
            case 39: //right arrow
                axisX += 0.1;
                if(axisX > 1.7)
                    axisX = 1.7;
            break;
            case 40: //down arrow
                axisZ += 0.1;
                if(axisZ > 1.7)
                    axisZ = 1.7
            break;
            case 65: //"A"
                superiorArmRot -= 5;
                if(superiorArmRot < -45)
                    superiorArmRot = -45;
            break;
            case 75: //"K"
                arrayRot -= 5;
            break;
            case 76: //"L"
                arrayRot += 5;
            break;
            case 79: //"O"
                fingers += 0.1;
                if(fingers > 2.7)
                    fingers = 2.7;
            break;
            case 80: //"P"
                fingers -= 0.1;
                if(fingers < 0.7)
                    fingers = 0.7;
            break;
            case 81: //"Q"
                baseRot -= 5;
            break;
            case 83: //"S"
                superiorArmRot += 5;
                if(superiorArmRot > 45)
                    superiorArmRot = 45;
            break;
            case 87: //"W"
                baseRot += 5;
            break;
            case 88: //"X"
                inferiorArmRot += 5;
                if(inferiorArmRot > 45)
                    inferiorArmRot = 45;
            break;
            case 90: //"Z"
                inferiorArmRot -= 5;
                if(inferiorArmRot < -45)
                    inferiorArmRot = -45;
            break;
        }
    }

    render();
}
