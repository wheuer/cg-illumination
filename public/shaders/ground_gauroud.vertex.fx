#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// height displacement
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;

// Output
out vec3 model_color;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);


    // Pass vertex color onto the fragment shader
    //model_color = ;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
