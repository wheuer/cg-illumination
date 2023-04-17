#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec4 color;

// Uniforms
uniform mat4 worldViewProjection;

// Output
out vec4 model_color;

void main() {
    // Pass vertex color onto the fragment shader
    model_color = color;
    // Transform and project vertex from 3D world-space to 2D screen-space 
    gl_Position = worldViewProjection * vec4(position, 1.0);
}
