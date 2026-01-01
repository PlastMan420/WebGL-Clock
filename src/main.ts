/**
 * main.ts
 * Entry point for the WebGL clock application.
 *
 * PlastMan420
 * 31/12/2025
 */

import "./style.css";

const canvas = document.getElementById("app") as HTMLCanvasElement;
const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

const fragmentShaderSource = await fetch("/shaders/circle.frag").then((res) =>
  res.text()
);
const vertexShaderSource = await fetch("/shaders/vertex.glsl").then((res) =>
  res.text()
);

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string
) {
  const shader = gl.createShader(type);
  if (!shader) {
    console.error("Unable to create shader");
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

// Create shaders and program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(
  gl,
  gl.FRAGMENT_SHADER,
  fragmentShaderSource
);

if (!vertexShader || !fragmentShader) {
  throw new Error("Shader creation failed");
}

const program = createProgram(gl, vertexShader, fragmentShader);

if (!program) {
  throw new Error("Program creation failed");
}

// Set up a full-screen quad
const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const resolutionUniformLocation = gl.getUniformLocation(
  program,
  "u_resolution"
);
const timeUniformLocation = gl.getUniformLocation(program, "u_timeInput");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1];

gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

// Render
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0, 0, 0, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);
gl.bindVertexArray(vao);
gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);

//gl.drawArrays(gl.TRIANGLES, 0, 6);

function animate() {
  const now = new Date();
  const hours = now.getHours() % 12;
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  //gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform3f(timeUniformLocation, hours, minutes, seconds);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(animate);
}

setInterval(() => {
  animate();
}, 1000);
