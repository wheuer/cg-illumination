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
uniform float mat_shininess;
uniform vec2 texture_scale;
// camera
uniform vec3 camera_position;
// lights
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec2 model_uv;
out vec3 diffuse_illum;
out vec3 specular_illum;

void main() {
    // Get initial position of vertex (prior to height displacement)
    vec4 world_pos = world * vec4(position, 1.0);

    // Calculate the ground texture coordinate 
    vec2 ground_uv = world_pos.xz / ground_size;

    // Using the ground "texture" modify the vertexs height
    float d = 2.0 * height_scalar * (texture(heightmap, ground_uv).r - 0.5);
    world_pos.y += d;

    // Compute the new normal of the vertex, use 0.1 as "close"? Idk
    //  The magnitudes of the distances don't affect the normal but might effect
    //  the value returned by the ground map
    vec3 neighborRight_position = vec3(world_pos.x + 0.2, world_pos.y, world_pos.z);
    vec2 neighborRight_uv = neighborRight_position.xz / ground_size;
    d = 2.0 * height_scalar * (texture(heightmap, neighborRight_uv).r - 0.5);
    neighborRight_position.y += d;

    vec3 neighborAbove_position = vec3(world_pos.x, world_pos.y, world_pos.z + 0.2);
    vec2 neighborAbove_uv = neighborAbove_position.xz / ground_size;
    d = 2.0 * height_scalar * (texture(heightmap, neighborAbove_uv).r - 0.5);
    neighborAbove_position.y += d;

    vec3 tangent = neighborRight_position - world_pos.xyz;
    vec3 bitangent = neighborAbove_position - world_pos.xyz;
    vec3 normal = normalize(cross(tangent, bitangent));

    // Calculate diffuse light
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < num_lights; i++)
    {
        vec3 lightVector = normalize(light_positions[i] - world_pos.xyz); // L
        diffuse_illum += light_colors[i] * clamp(dot(lightVector, normal), 0.0, 1.0); // remove any negative light
    }

    // Calculate specular light
    specular_illum = vec3(0.0, 0.0, 0.0);
    vec3 viewVector = normalize(camera_position - world_pos.xyz);
    for (int i = 0; i < num_lights; i++) {
        vec3 lightVector = normalize(light_positions[i] - world_pos.xyz); // L
        vec3 refLightVector = normalize((2.0 * dot(lightVector, normal) * normal) - lightVector); // R
        specular_illum += light_colors[i] * pow( clamp(dot(refLightVector, viewVector), 0.0, 1.0), mat_shininess); // remove any negative light
    }

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world_pos;
}
