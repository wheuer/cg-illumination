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
uniform float mat_shininess; // n
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
    // Transform model position into world space
    vec4 worldPositionFull = projection * view * world * vec4(position, 1.0);
    vec3 worldPosition = worldPositionFull.xyz / worldPositionFull.w; // w probably = 1, but doesn't hurt
    vec3 worldNormal = normalize(inverse(transpose(mat3(world))) * normal);

    // Calculate diffuse light
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < num_lights; i++)
    {
        vec3 lightVector = normalize(light_positions[i] - worldPosition); // L
        diffuse_illum += light_colors[i] * max(dot(lightVector, worldNormal), 0.0); // remove any negative light
    }

    // Calculate specular light
    vec3 viewVector = normalize(camera_position - worldPosition);
    specular_illum = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < num_lights; i++) {
        vec3 lightVector = normalize(light_positions[i] - worldPosition); // L
        vec3 refLightVector = normalize((2.0 * dot(lightVector, worldNormal) * worldNormal) - lightVector); // R
        specular_illum += light_colors[i] * pow(max(dot(refLightVector, viewVector), 0.0), mat_shininess); // remove any negative light
    }

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = worldPositionFull;
}
