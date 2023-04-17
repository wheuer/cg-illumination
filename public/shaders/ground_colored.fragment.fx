#version 300 es
precision mediump float;

// Input
in vec4 model_normal;

// Uniforms
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;

// Output
out vec4 FragColor;

void main() {
    // Color
    FragColor = vec4(mat_color, 1.0);
}
