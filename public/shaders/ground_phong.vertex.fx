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
uniform vec2 ground_size;
uniform float height_scalar;
uniform sampler2D heightmap;
// material
uniform vec2 texture_scale;

// Output
out vec3 model_position;
out vec3 model_normal;
out vec2 model_uv;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);
    
    // Calculate the three new world positions:
    //  The new "real" position that the vertex will be placed at
    //  and the two just to the right and just above vertices
    vec3 neighborRight_position = vec3(world_pos.x + 0.01, world_pos.y, world_pos.z);
    vec2 neighborRight_uv = neighborRight_position.xz / ground_size;
    float d = 2.0 * height_scalar * (texture(heightmap, neighborRight_uv).r - 0.5);
    neighborRight_position.y += d;

    vec3 neighborAbove_position = vec3(world_pos.x, world_pos.y, world_pos.z - 0.01);
    vec2 neighborAbove_uv = neighborAbove_position.xz / ground_size;
    d = 2.0 * height_scalar * (texture(heightmap, neighborAbove_uv).r - 0.5);
    neighborAbove_position.y += d;

    // Calculate the new ground position 
    vec2 ground_uv = world_pos.xz / ground_size;
    d = 2.0 * height_scalar * (texture(heightmap, ground_uv).r - 0.5);
    world_pos.y += d;

    // Find the new normal for the ground vertex
    vec3 tangent = neighborRight_position - world_pos.xyz;
    vec3 bitangent = neighborAbove_position - world_pos.xyz;
    vec3 normal = normalize(cross(tangent, bitangent));

    // Pass vertex position onto the fragment shader
    model_position = world_pos.xyz;
    // Pass vertex normal onto the fragment shader
    model_normal = normal;
    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
