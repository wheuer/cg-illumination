#version 300 es
precision highp float;

// Attributes
in vec3 position;
in vec3 normal;
in vec2 uv;

// Uniforms
// projection 3D to 2D
uniform mat4 world;
uniform mat4 view;
uniform mat4 projection;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_position;
out vec3 model_normal;
out vec2 model_uv;

void main() {
    vec4 worldPosition = world * vec4(position, 1.0);

    // Pass vertex position onto the fragment shader
    model_position = worldPosition.xyz / worldPosition.w;

    // Pass vertex normal onto the fragment shader
    model_normal = normalize(inverse(transpose(mat3(world))) * normal);
    
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * worldPosition;
}
