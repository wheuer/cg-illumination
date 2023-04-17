#version 300 es
precision mediump float;

// Input
in vec4 model_color;

// Uniforms

// Output
out vec4 FragColor;

void main() {
    // Color
    FragColor = model_color;
}
