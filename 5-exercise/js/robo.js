//
// Hierarchical object using a matrix stack.
//

// A very basic stack class.
function Stack() {
    this.elements = [];
    this.t = 0;
}

Stack.prototype.push = function (m) {
    this.elements[this.t++] = m;
};

Stack.prototype.top = function () {
    if (this.t <= 0) {
        console.log("top = ", this.t);
        console.log("Warning: stack underflow");
    } else {
        return this.elements[this.t - 1];
    }
};

Stack.prototype.pop = function () {
    if (this.t <= 0) {
        console.log("Warning: stack underflow");
    }
    else {
        this.t--;
        var temp = this.elements[this.t];
        this.elements[this.t] = undefined;
        return temp;
    }
};

Stack.prototype.isEmpty = function () {
    return this.t <= 0;
};


// Creates data for vertices, colors, and normal vectors for
// a unit cube.  Return value is an object with three attributes
// vertices, colors, and normals, each referring to a Float32Array.
// (Note this is a "self-invoking" anonymous function.)
var cube = function makeCube() {
    // vertices of cube
    var rawVertices = new Float32Array([
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5]);

    var rawColors = new Float32Array([
        1.0, 0.0, 0.0, 1.0,  // red
        0.0, 1.0, 0.0, 1.0,  // green
        0.0, 0.0, 1.0, 1.0,  // blue
        1.0, 1.0, 0.0, 1.0,  // yellow
        1.0, 0.0, 1.0, 1.0,  // magenta
        0.0, 1.0, 1.0, 1.0,  // cyan
    ]);

    var rawNormals = new Float32Array([
        0, 0, 1,
        1, 0, 0,
        0, 0, -1,
        -1, 0, 0,
        0, 1, 0,
        0, -1, 0]);


    var indices = new Uint16Array([
        0, 1, 2, 0, 2, 3,  // z face
        1, 5, 6, 1, 6, 2,  // +x face
        5, 4, 7, 5, 7, 6,  // -z face
        4, 0, 3, 4, 3, 7,  // -x face
        3, 2, 6, 3, 6, 7,  // + y face
        4, 5, 1, 4, 1, 0   // -y face
    ]);

    var verticesArray = [];
    var colorsArray = [];
    var normalsArray = [];
    for (var i = 0; i < 36; ++i) {
        // for each of the 36 vertices...
        var face = Math.floor(i / 6);
        var index = indices[i];

        // (x, y, z): three numbers for each point
        for (var j = 0; j < 3; ++j) {
            verticesArray.push(rawVertices[3 * index + j]);
        }

        // (r, g, b, a): four numbers for each point
        for (var j = 0; j < 4; ++j) {
            colorsArray.push(rawColors[4 * face + j]);
        }

        // three numbers for each point
        for (var j = 0; j < 3; ++j) {
            normalsArray.push(rawNormals[3 * face + j]);
        }
    }

    return {
        numVertices: 36,
        vertices: new Float32Array(verticesArray),
        colors: new Float32Array(colorsArray),
        normals: new Float32Array(normalsArray)
    };
}();


function makeNormalMatrixElements(model, view) {
    var n = new Matrix4(view).multiply(model);
    n.transpose();
    n.invert();
    n = n.elements;
    return new Float32Array([
        n[0], n[1], n[2],
        n[4], n[5], n[6],
        n[8], n[9], n[10]]);
}


// A few global variables...

// the OpenGL context
var gl;

// handle to a buffer on the GPU
var vertexBuffer;
var vertexNormalBuffer;
var vertexColorBuffer;

// handle to the compiled shader program on the GPU
var lightingShader;

// transformation matrices defining 5 objects in the scene
var torsoMatrix = new Matrix4().setTranslate(0, 8, 0);

var leftShoulderMatrix = new Matrix4().setTranslate(-6.5, 2, 0);
var leftArmMatrix = new Matrix4().setTranslate(0, -5, 0);
var leftHandMatrix = new Matrix4().setTranslate(0, -4, 0);

var rightShoulderMatrix = new Matrix4().setTranslate(6.5, 2, 0);
var rightArmMatrix = new Matrix4().setTranslate(0, -5, 0);
var rightHandMatrix = new Matrix4().setTranslate(0, -4, 0);

var headMatrix = new Matrix4().setTranslate(0, 7, 0);
var legMatrix = new Matrix4().setTranslate(0, 2, 0);
var footMatrix = new Matrix4().setTranslate(0, -8, 0);

var red = [1.0,0.0,0.0,1.0];
var green = [0.0,1.0,0.0,1.0];
var blue = [0.0,0.0,1.0,1.0];

var footAngle = 0.0;

var leftShoulderAngle = 0.0;
var leftArmAngle = 0.0;
var leftHandAngle = 0.0;

var rightShoulderAngle = 0.0;
var rightArmAngle = 0.0;
var rightHandAngle = 0.0;

var headAngle = 0.0;

var torsoAngle = 0.0;


var torsoMatrixLocal = new Matrix4().setScale(10, 10, 5);

var shoulderMatrixLocal = new Matrix4().setScale(3, 5, 2);
var armMatrixLocal = new Matrix4().setScale(3, 5, 2);
var handMatrixLocal = new Matrix4().setScale(1, 3, 3);
var headMatrixLocal = new Matrix4().setScale(4, 4, 4);
var legMatrixLocal = new Matrix4().setScale(2, 6, 2);
var footMatrixLocal = new Matrix4().setScale(7, 2, 7);


var anguloRotacaoCameraEixoY = 0.0;
var anguloRotacaoCameraEixoX = 0.0;

var lightPosition = new Vector4( [5.0, 10.0, 5.0, 0.0]);
var lightAmbient = new Vector4( [0.5, 0.5, 0.5, 1.0 ]);
var lightDiffuse = new Vector4(  [ 0.5, 0.5, 0.5, 1.0 ]);
var lightSpecular =new Vector4(  [ 0.6, 0.6, 0.6, 1.0 ]);

var materialAmbient = new Vector4(  [ 1.0, 0.0, 1.0, 1.0 ]);
var materialDiffuse =new Vector4(  [ 1.0, 0.8, 0.0, 1.0 ]);
var materialSpecular = new Vector4( [ 1.0, 1.0, 1.0, 1.0 ]);
var materialShininess = 75.0;




//var radius = 30;
//var view = new Matrix4().rotate(anguloRotacaoCameraEixoY, 0,1,0).translate(0,0, radius*1.5).invert();




//var cameraMatrix = m4.yRotation(cameraAngleRadians);
//cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 1.5);

// view matrix
//  var view = new Matrix4().setLookAt(
//      20, -5, 20,   // eye
//      0, 0, 0,      // at - looking at the origin
//      0, 1, 0);     // up vector - y axis

// Here use aspect ratio 3/2 corresponding to canvas size 600 x 400
var projection = new Matrix4().setPerspective(45, 1.5, 0.1, 1000);

// translate keypress events to strings
// from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
    if (event.which == null) {
        return String.fromCharCode(event.keyCode); // IE
    } else if (event.which != 0 && event.charCode != 0) {
        return String.fromCharCode(event.which);   // the rest
    } else {
        return null; // special key
    }
}

// handler for key down events adjusts camera position
function handleKeyDown(event) {
    switch (event.which){
        case 37:

            anguloRotacaoCameraEixoY -= 1;
            if(anguloRotacaoCameraEixoY <= -180){
                anguloRotacaoCameraEixoY = 180;
            }

            break;
        case 39:
            anguloRotacaoCameraEixoY += 1;
            if(anguloRotacaoCameraEixoY >= 180){
                anguloRotacaoCameraEixoY = -180;
            }
            break;

        case 38:
            anguloRotacaoCameraEixoX += 1;
            if(anguloRotacaoCameraEixoX >= 75){
                anguloRotacaoCameraEixoX = 75;
            }
            break;
        case 40:
            anguloRotacaoCameraEixoX -= 1;
            if(anguloRotacaoCameraEixoX <= -75){
                anguloRotacaoCameraEixoX = -75;
            }
            break;
        default:
            return;

    }
}

// handler for key press events adjusts object rotations
function handleKeyPress(event) {
    var charCode = event.keyCode || event.which;
    var charStr = String.fromCharCode(charCode);
    var currentShoulderRot, currentArm, currentTorso, currentTorsoRot;

    switch (charStr) {
    	case 't':
            torsoAngle += 15;
            currentTorsoRot = new Matrix4().setTranslate(0, 8, 0).rotate(torsoAngle, 0, 1, 0).translate(0, -8, 0);
            torsoMatrix.setTranslate(0, 8, 0).multiply(currentTorsoRot);
            break;
        case 'T':
            torsoAngle -= 15;     
            currentTorsoRot = new Matrix4().setTranslate(0, 8, 0).rotate(torsoAngle, 0, 1, 0).translate(0, -8, 0);
            torsoMatrix.setTranslate(0, 8, 0).multiply(currentTorsoRot);
            break;
    
        case 'b':
            footAngle += 15;
            footMatrix.setTranslate(0, -8, 0).rotate(footAngle, 0, 1, 0);

         
            break;
        case 'B':
            footAngle -= 15;
            footMatrix.setTranslate(0, -8, 0).rotate(footAngle, 0, 1, 0);

            break;
        case 'j':
            leftShoulderAngle += 15;
            if(leftShoulderAngle>=180){
                leftShoulderAngle = 180;
            }
            // rotate shoulder clockwise about a point 2 units above its center
            currentShoulderRot = new Matrix4().setTranslate(0, 2, 0).rotate(-leftShoulderAngle, 1, 0, 0).translate(0, -2, 0);
            leftShoulderMatrix.setTranslate(-6.5, 2, 0).multiply(currentShoulderRot);
            break;
        case 'J':
            leftShoulderAngle -= 15;
            if(leftShoulderAngle<=-90){
                leftShoulderAngle = -90;
            }
            currentShoulderRot = new Matrix4().setTranslate(0, 2, 0).rotate(-leftShoulderAngle, 1, 0, 0).translate(0, -2, 0);
            leftShoulderMatrix.setTranslate(-6.5, 2, 0).multiply(currentShoulderRot);
            break;
        case 'e':
            leftArmAngle += 15;
            if(leftArmAngle>=150){
                leftArmAngle = 150;
            }
            // rotate arm clockwise about its top front corner
            currentArm = new Matrix4().setTranslate(0, 2.5, 1.0).rotate(-leftArmAngle, 1, 0, 0).translate(0, -2.5, -1.0);
            leftArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
            break;
        case 'E':
            leftArmAngle -= 15;
            if(leftArmAngle<=0){
                leftArmAngle = 0;
            }
            currentArm = new Matrix4().setTranslate(0, 2.5, 1.0).rotate(-leftArmAngle, 1, 0, 0).translate(0, -2.5, -1.0);
            leftArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
            break;
        case 'c':
            leftHandAngle += 15;
            leftHandMatrix.setTranslate(0, -4, 0).rotate(leftHandAngle, 0, 1, 0);
            break;
        case 'C':
            leftHandAngle -= 15;
            leftHandMatrix.setTranslate(0, -4, 0).rotate(leftHandAngle, 0, 1, 0);
            break;

        case 'g':
            rightShoulderAngle += 15;
            if(rightShoulderAngle>=180){
                rightShoulderAngle = 180;
            }
            // rotate shoulder clockwise about a point 2 units above its center
            currentShoulderRot = new Matrix4().setTranslate(0, 2, 0).rotate(-rightShoulderAngle, 1, 0, 0).translate(0, -2, 0);
            rightShoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
            break;
        case 'G':
            rightShoulderAngle -= 15;
            if(rightShoulderAngle<=-90){
                rightShoulderAngle = -90;
            }
            currentShoulderRot = new Matrix4().setTranslate(0, 2, 0).rotate(-rightShoulderAngle, 1, 0, 0).translate(0, -2, 0);
            rightShoulderMatrix.setTranslate(6.5, 2, 0).multiply(currentShoulderRot);
            break;
        case 'q':
            rightArmAngle += 15;
            if(rightArmAngle>=150){
                rightArmAngle = 150;
            }
            // rotate arm clockwise about its top front corner
            currentArm = new Matrix4().setTranslate(0, 2.5, 1.0).rotate(-rightArmAngle, 1, 0, 0).translate(0, -2.5, -1.0);
            rightArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
            break;
        case 'Q':
            rightArmAngle -= 15;
            if(rightArmAngle<=0){
                rightArmAngle = 0;
            }
            currentArm = new Matrix4().setTranslate(0, 2.5, 1.0).rotate(-rightArmAngle, 1, 0, 0).translate(0, -2.5, -1.0);
            rightArmMatrix.setTranslate(0, -5, 0).multiply(currentArm);
            break;
        case 'z':
            rightHandAngle += 15;
            rightHandMatrix.setTranslate(0, -4, 0).rotate(rightHandAngle, 0, 1, 0);
            break;
        case 'Z':
            rightHandAngle -= 15;
            rightHandMatrix.setTranslate(0, -4, 0).rotate(rightHandAngle, 0, 1, 0);
            break;

        case 'h':
            headAngle += 15;
            headMatrix.setTranslate(0, 7, 0).rotate(headAngle, 0, 1, 0);
            break;
        case 'H':
            headAngle -= 15;
            headMatrix.setTranslate(0, 7, 0).rotate(headAngle, 0, 1, 0);
            break;

        default:
            return;
    }


}

// helper function renders the cube based on the model transformation
// on top of the stack and the given local transformation
function renderCube(matrixStack, matrixLocal) {
    // bind the shader
    gl.useProgram(lightingShader);

    // get the index for the a_Position attribute defined in the vertex shader
    var positionIndex = gl.getAttribLocation(lightingShader, 'a_Position');
    if (positionIndex < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    var normalIndex = gl.getAttribLocation(lightingShader, 'a_Normal');
    if (normalIndex < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    var colorIndex = gl.getAttribLocation(lightingShader, 'a_Color');
    if (colorIndex < 0) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    // "enable" the a_position attribute
    gl.enableVertexAttribArray(positionIndex);
    gl.enableVertexAttribArray(normalIndex);
    gl.enableVertexAttribArray(colorIndex);

    // bind data for points and normals
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionIndex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(normalIndex, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(colorIndex, 4, gl.FLOAT, false, 0, 0);

    var radius = 25;
    var view = new Matrix4().rotate(anguloRotacaoCameraEixoY, 0,1,0).rotate(anguloRotacaoCameraEixoX, 1,0,0).translate(0,0, radius*1.5).invert();

    //var view = new Matrix4().setLookAt(camEye[0],camEye[1],camEye[2],camAt[0],camAt[1],camAt[2], camUp[0], camUp[1], camUp[2]);
    var loc = gl.getUniformLocation(lightingShader, "view");
    gl.uniformMatrix4fv(loc, false, view.elements);
    loc = gl.getUniformLocation(lightingShader, "projection");
    gl.uniformMatrix4fv(loc, false, projection.elements);
    //loc = gl.getUniformLocation(lightingShader, "u_Color");
    //gl.uniform4f(loc, u_color[0], u_color[1], u_color[2], u_color[3]);

    var loc = gl.getUniformLocation(lightingShader, "lightPosition");
    gl.uniform4f(loc, lightPosition.elements[0], lightPosition.elements[1], lightPosition.elements[2], lightPosition.elements[3]);

    var loc = gl.getUniformLocation(lightingShader, "lightAmbient");
    gl.uniform4f(loc, lightAmbient.elements[0], lightAmbient.elements[1], lightAmbient.elements[2], lightAmbient.elements[3]);

    var loc = gl.getUniformLocation(lightingShader, "lightDiffuse");
    gl.uniform4f(loc, lightDiffuse.elements[0], lightDiffuse.elements[1], lightDiffuse.elements[2], lightDiffuse.elements[3]);
    var loc = gl.getUniformLocation(lightingShader, "lightSpecular");
    gl.uniform4f(loc, lightSpecular.elements[0], lightSpecular.elements[1], lightSpecular.elements[2], lightSpecular.elements[3]);

    var loc = gl.getUniformLocation(lightingShader, "materialAmbient");
    gl.uniform4f(loc, materialAmbient.elements[0], materialAmbient.elements[1], materialAmbient.elements[2], materialAmbient.elements[3]);

    var loc = gl.getUniformLocation(lightingShader, "materialDiffuse");
    gl.uniform4f(loc, materialDiffuse.elements[0], materialDiffuse.elements[1], materialDiffuse.elements[2], materialDiffuse.elements[3]);

    var loc = gl.getUniformLocation(lightingShader, "materialSpecular");
    gl.uniform4f(loc, materialSpecular.elements[0], materialSpecular.elements[1], materialSpecular.elements[2], materialSpecular.elements[3]);

    var loc = gl.getUniformLocation(lightingShader, "materialShininess");
    gl.uniform1f(loc,materialShininess);

    var modelMatrixloc = gl.getUniformLocation(lightingShader, "model");
    var normalMatrixLoc = gl.getUniformLocation(lightingShader, "normalMatrix");

    // transform using current model matrix on top of stack
    var current = new Matrix4(matrixStack.top()).multiply(matrixLocal);
    gl.uniformMatrix4fv(modelMatrixloc, false, current.elements);
    gl.uniformMatrix3fv(normalMatrixLoc, false, makeNormalMatrixElements(current, view));


    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // on safari 10, buffer cannot be disposed before drawing...	
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.useProgram(null);
}

// code to actually render our geometry
function draw() {
    // clear the framebuffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BIT);

    // set up the matrix stack
    var s = new Stack();

    // foot
    s.push(footMatrix);
    renderCube(s, footMatrixLocal);

    // leg relative to foot
    s.push(new Matrix4(s.top()).multiply(legMatrix));
    renderCube(s, legMatrixLocal);

    // torso relative to leg
    s.push(new Matrix4(s.top()).multiply(torsoMatrix));
    renderCube(s, torsoMatrixLocal);

    // shoulder relative to torso
    s.push(new Matrix4(s.top()).multiply(rightShoulderMatrix));
    renderCube(s, shoulderMatrixLocal);

    // arm relative to shoulder
    s.push(new Matrix4(s.top()).multiply(rightArmMatrix));
    renderCube(s, armMatrixLocal);

    // hand relative to arm
    s.push(new Matrix4(s.top()).multiply(rightHandMatrix));
    renderCube(s, handMatrixLocal);

    s.pop();
    s.pop();
    s.pop();

    // shoulder relative to torso
    s.push(new Matrix4(s.top()).multiply(leftShoulderMatrix));
    renderCube(s, shoulderMatrixLocal);

    // arm relative to shoulder
    s.push(new Matrix4(s.top()).multiply(leftArmMatrix));
    renderCube(s, armMatrixLocal);

    // hand relative to arm
    s.push(new Matrix4(s.top()).multiply(leftHandMatrix));
    renderCube(s, handMatrixLocal);

    s.pop();
    s.pop();
    s.pop();

    // head relative to torso
    s.push(new Matrix4(s.top()).multiply(headMatrix));
    renderCube(s, headMatrixLocal);

    s.pop();
    s.pop();
    s.pop();
    s.pop();

    if (!s.isEmpty()) {
        console.log("Warning: pops do not match pushes");
    }

}

// entry point when page is loaded
function main() {

    // basically this function does setup that "should" only have to be done once,
    // while draw() does things that have to be repeated each time the canvas is 
    // redrawn

    // retrieve <canvas> element
    var canvas = document.getElementById('theCanvas');

    // key handler
    window.onkeypress = handleKeyPress;
    window.onkeydown = handleKeyDown;

    // get the rendering context for WebGL, using the utility from the teal book
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // load and compile the shader pair, using utility from the teal book
    var vshaderSource = document.getElementById('vertexLightingShader').textContent;
    var fshaderSource = document.getElementById('fragmentLightingShader').textContent;
    if (!initShaders(gl, vshaderSource, fshaderSource)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    lightingShader = gl.program;
    gl.useProgram(null);

    // buffer for vertex positions for triangles
    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.vertices, gl.STATIC_DRAW);

    // buffer for colors of cube faces
    vertexColorBuffer = gl.createBuffer();
    if (!vertexColorBuffer) {
        console.log('Failed to create the buffer object');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.colors, gl.STATIC_DRAW);

    // buffer for vertex normals
    vertexNormalBuffer = gl.createBuffer();
    if (!vertexNormalBuffer) {
        console.log('Failed to create the buffer object');
        return;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cube.normals, gl.STATIC_DRAW);

    // buffer is not needed anymore (not necessary, really)
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // specify a fill color for clearing the framebuffer
    gl.clearColor(0.9, 0.9, 0.9, 1.0);

    gl.enable(gl.DEPTH_TEST);

    // define an animation loop
    var animate = function () {
        draw();
        requestAnimationFrame(animate, canvas);
    };

    // start drawing!
    animate();
}
