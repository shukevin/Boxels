import { VertexArray } from './VertexArray';
import { VertexAttributes } from './VertexAttributes';
import { ShaderProgram } from './ShaderProgram';
import { Matrix4 } from './Matrix4';
const canvas = document.getElementById('canvas');
window.gl = canvas.getContext('webgl2');

let vertexArray;
let shaderProgram;
let modelToWorld;
let worldToClip;
let points;

/**
 * Render function for WebGL
 */
function render() {
  gl.clearColor(1, 1, 1, 1);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('modelToWorld', modelToWorld);
  shaderProgram.setUniformMatrix4('worldToClip', worldToClip);

  for (let i = 0; i <= points.length - 9; i += 9) {
    let attributes = boxels(points[i], points[i + 1], points[i + 2], points[i + 3], points[i + 4], points[i + 5]);
    // Assignment of colors
    let colors = [...Array(24)].map((_, j) => [points[i + 6], points[i + 7], points[i + 8]]).flat();
    attributes.addAttribute('color', colors.length / 3, 3, colors);
    // End of color assignment
    vertexArray = new VertexArray(shaderProgram, attributes);
    vertexArray.bind();
    vertexArray.drawIndexed(gl.TRIANGLES);
    vertexArray.unbind();
  }
  shaderProgram.unbind();
}

function onSizeChanged() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const aspectRatio = canvas.width / canvas.height;

  let right;
  let top;

  if (aspectRatio < 1) {
    right = 3;
    top = right / aspectRatio;
  } else {
    top = 3;
    right = top * aspectRatio;
  }

  worldToClip = Matrix4.ortho(-right, right, -top, top, -10, 10);
  render();
}

function boxels(x, y, z, width, height, depth) {
  // Note: x,y,z are CENTER positions
  // Calculate front/back face vertices with given parameters
  x = Number(x);
  y = Number(y);
  z = Number(z);
  var zero = [x - width / 2, y - height / 2, z + depth / 2];
  var one = [x + width / 2, y - height / 2, z + depth / 2];
  var two = [x - width / 2, y + height / 2, z + depth / 2];
  var three = [x + width / 2, y + height / 2, z + depth / 2];
  var four = [x - width / 2, y - height / 2, z - depth / 2];
  var five = [x + width / 2, y - height / 2, z - depth / 2];
  var six = [x - width / 2, y + height / 2, z - depth / 2];
  var seven = [x + width / 2, y + height / 2, z - depth / 2];

  // Assign vertices in relation to faces
  var positions = [].concat(zero, one, two, three, four, five, six, seven, zero, four, two, six, one, five, three, seven, two, three, six, seven, zero, one, four, five);

  // Normals
  const normals = [
    // front
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,

    // back
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,
    0, 0, -1,

    // left
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,
    -1, 0, 0,

    // right
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    // top
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,
    0, 1, 0,

    // bottom
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
    0, -1, 0,
  ];
  // faces
  const faces = [
    // front
    0, 1, 2,
    1, 3, 2,

    // back
    4, 6, 5,
    5, 6, 7,

    // left
    8, 10, 9,
    9, 10, 11,

    // right
    12, 13, 14,
    13, 15, 14,

    // top
    16, 17, 18,
    17, 19, 18,

    // bottom
    20, 22, 21,
    21, 22, 23,
  ];

  const attributes = new VertexAttributes();
  attributes.addAttribute('position', positions.length / 3, 3, positions);
  //attributes.addAttribute('color', colors.length / 3, 3, colors);
  attributes.addAttribute('normal', normals.length / 3, 3, normals);
  attributes.addIndices(faces);

  return attributes;
}

async function initialize() {

  const vertexSource = `
  uniform mat4 modelToWorld;
  uniform mat4 worldToClip;
  in vec3 position;
  in vec3 color;
  in vec3 normal;
  out vec3 fnormal;
  out vec3 fcolor;
  void main() {
    gl_Position = worldToClip * modelToWorld * vec4(position, 1.0);
    gl_PointSize = 2.0; 
    fnormal = (modelToWorld * vec4(normal,0)).xyz;
    fcolor = color;
  }
  `;

  const fragmentSource = `
  const vec3 light_direction = normalize(vec3(0.0,0.2,0.9));
  in vec3 fnormal;
  in vec3 fcolor;
  out vec4 fragmentColor;
  
  void main() {
    vec3 normal = normalize(fnormal);
    float litness = max(0.0, dot(normal, light_direction));
    fragmentColor = vec4(fcolor * litness, 1.0);
  }
  `;
  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);

  modelToWorld = Matrix4.scale(0.35, 0.35, 0.35);

  await fetch('test.txt')
    .then(response => response.text())
    .then(text => {
      points = text.match(/[^\s]+/g);
    });

  // Event listeners
  window.addEventListener('resize', onSizeChanged);
  window.addEventListener('keydown', event => {
    let rotationAmount = 1.02;
    if (event.key === 'ArrowRight' || event.key === 'd') {
      modelToWorld = Matrix4.rotateY(-rotationAmount).multiplyMatrix4(modelToWorld);
    }
    if (event.key === 'ArrowLeft' || event.key === 'a') {
      modelToWorld = Matrix4.rotateY(rotationAmount).multiplyMatrix4(modelToWorld);
    }
    if (event.key === 'ArrowUp' || event.key === 'w') {
      modelToWorld = Matrix4.rotateX(-rotationAmount).multiplyMatrix4(modelToWorld);
    }
    if (event.key === 'ArrowDown' || event.key === 's') {
      modelToWorld = Matrix4.rotateX(rotationAmount).multiplyMatrix4(modelToWorld);
    }
    render();
  });

  onSizeChanged();
}

initialize();