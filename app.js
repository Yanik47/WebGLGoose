let gl;
let vertexShader;
let triangleVertexCounts = [];
let displayMode = 'points'; 

function hexToRGBA(hex) {
    const r = parseInt(hex.slice(2, 4), 16) / 255;
    const g = parseInt(hex.slice(4, 6), 16) / 255;
    const b = parseInt(hex.slice(6, 8), 16) / 255;
    return [r, g, b, 1.0]; 
}
document.addEventListener('DOMContentLoaded', (event) => {
    displayMode = 'points'; 

    document.getElementById('showTrianglesButton').addEventListener('click', () => {
        displayMode = 'triangles';
        startWebGL();
    });

    document.getElementById('showLinesButton').addEventListener('click', () => {
        displayMode = 'lines';
        startWebGL();
    });

    document.getElementById('showPointsButton').addEventListener('click', () => {
        displayMode = 'points';

        startWebGL();
    });

});

async function loadTriangleData() {
    try {
        const response = await fetch('triangles.json');
        if (!response.ok) {
            throw new Error('Failed to load triangle data: ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

async function loadLineData() {
    try {
        const response = await fetch('lines.json'); 
        if (!response.ok) {
            throw new Error('Failed to load triangle data: ' + response.statusText);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

async function loadPointData() {

    try {
        const response = await fetch('points.json'); 
        if (!response.ok) {
            throw new Error('Failed to load triangle data: ' + response.statusText);
        }
        const data = await response.json();

        return data;
    } catch (error) {
        console.error(error);
    }
}

async function initWebGL() {
    const canvas = document.getElementById('glcanvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL не поддерживается вашим браузером.');
        return;
    }
    vertexShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertexShader, `
    attribute vec3 coordinates;
    void main(void) {
        gl_Position = vec4(coordinates, 1.0);
        gl_PointSize = 1.3;
    }`);
    const color = [1.0, 1.0, 1.0, 1.0];

    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }


    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, `
    precision mediump float;
    uniform vec4 uColor;
    void main(void) {
        gl_FragColor = uColor;
    }`);


    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }


    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(shaderProgram));
        return;
    }


    gl.useProgram(shaderProgram);


    const coord = gl.getAttribLocation(shaderProgram, "coordinates");
    


    const colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
    gl.uniform4fv(colorUniform, color);

    const triangles = await loadTriangleData();
    let triangleColors = [];


    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const lines = await loadLineData();
    const lineVertexCounts = [];

    const points = await loadPointData();
    const pointsVertexCount = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);



    const triangleBuffers = triangles.map(triangle => {
        const vertices = new Float32Array(triangle.vertices.flatMap(v => [v.x, v.y, 0]));
    

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        triangleVertexCounts.push(vertices.length / 3); 
        triangleColors.push(triangle.color);

        return buffer;
    });
    triangleColors = triangleColors.map(color => hexToRGBA(color));
    console.log('Data from color(initWebGL):', triangleColors);

    const lineBuffers = lines.map(line => {
        const vertices = new Float32Array([
            line.start.x, line.start.y, 0,
            line.end.x, line.end.y, 0
        ]);


        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        lineVertexCounts.push(vertices.length / 3);

        return buffer;
    });

    const pointBuffers = points.map(point => {
        const vertices = new Float32Array([
            point.x, point.y, 0
        ]);


        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        pointsVertexCount.push(1); 


        return buffer;
    });


    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);


    return { gl, shaderProgram, triangleVertexCounts, lineVertexCounts, pointsVertexCount, lineBuffers, triangleBuffers, pointBuffers, triangleColors };
}

function drawScene({ gl, shaderProgram, triangleVertexCounts, lineVertexCounts, pointsVertexCount, lineBuffers, triangleBuffers, pointBuffers, triangleColors }) {

    gl.clear(gl.COLOR_BUFFER_BIT);
    console.log('Data from color(drawScene):', triangleColors);

    if (displayMode === 'triangles') {

        triangleVertexCounts.forEach((count, index) => {
            drawPrimitive(gl, shaderProgram, triangleBuffers[index], count, gl.TRIANGLES, triangleColors[index]);
        });
    } else if (displayMode === 'lines') {

        lineVertexCounts.forEach((count, index) => {
            drawPrimitive(gl, shaderProgram, lineBuffers[index], count, gl.LINES);
        });
    } else if(displayMode === 'points') {

        pointsVertexCount.forEach((count, index) => {
            drawPrimitive(gl, shaderProgram, pointBuffers[index], count, gl.POINTS);
        });
    }
}

function drawPrimitive(gl, shaderProgram, buffer, count, primitiveType, triangleColors) {
    if(primitiveType === '4') {
    console.log('Data from color(drawPrimitive):', triangleColors);
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const position = gl.getAttribLocation(shaderProgram, 'coordinates');

    if (triangleColors) {
        console.log('Color is defined');
        const colorLocation = gl.getUniformLocation(shaderProgram, 'uColor');
        gl.uniform4fv(colorLocation, triangleColors);
    }

    if (position !== -1) {
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
        
        gl.drawArrays(primitiveType, 0, count);
    } else {
        console.error('Attribute not found in the shader');
    }
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

async function startWebGL() {
    const { gl, shaderProgram, triangleVertexCounts, lineVertexCounts, pointsVertexCount, lineBuffers, triangleBuffers, pointBuffers, triangleColors } = await initWebGL();
    console.log('Data from color(startWebGL1):', triangleColors);
    if (gl && shaderProgram && triangleVertexCounts && triangleColors && triangleBuffers && lineVertexCounts && lineBuffers && pointsVertexCount && pointBuffers)  {
        drawScene({ gl, shaderProgram, triangleVertexCounts, lineVertexCounts, pointsVertexCount, lineBuffers, triangleBuffers, pointBuffers, triangleColors });
        console.log('Data from color(startWebGL2):', triangleColors);
        window.addEventListener('resize', () => drawScene({ gl, shaderProgram, triangleVertexCounts, lineVertexCounts, pointsVertexCount, lineBuffers, triangleBuffers, pointBuffers, triangleColors }));
    }
    else{
        console.log('pointsVertexCount:', pointsVertexCount);
        console.log('pointBuffers:', pointBuffers);
    }
}

startWebGL();
