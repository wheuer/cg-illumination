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
uniform float mat_shininess;
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
    // Pass diffuse and specular illumination onto the fragment shader

    // Calculate diffuse light
    diffuse_illum = vec3(0.0, 0.0, 0.0);
    for (int i = 0; i < num_lights; i++)
    {
        vec3 lightVector = normalize(light_positions[i] - position); // L
        diffuse_illum += light_colors[i] * dot(lightVector, normal);
    }


    
    specular_illum = vec3(0.0, 0.0, 0.0);

    // Pass vertex texcoord onto the fragment shader
    model_uv = uv;

    // Transform and project vertex from 3D world-space to 2D screen-space
    gl_Position = projection * view * world * vec4(position, 1.0);
}
