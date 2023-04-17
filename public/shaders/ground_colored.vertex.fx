#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
uniform float height_scalar;
uniform sampler2D heightmap;

// Output
out vec3 model_normal;

void main() {
    // Pass vertex normal onto the fragment shader
    model_normal = vec3(0.0, 1.0, 0.0);
    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
