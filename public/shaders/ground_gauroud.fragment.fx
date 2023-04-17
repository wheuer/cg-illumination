#version 300 es
precision mediump float;

// Input
in vec3 model_color;

// Output
out vec4 FragColor;

void main() {
    // Color
    FragColor = vec4(model_color, 1.0);
}
