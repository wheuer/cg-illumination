#version 300 es
precision mediump float;

// Input
in vec3 model_position;
in vec3 model_normal;
in vec2 model_uv;

// Uniforms
// material
uniform vec3 mat_color;
uniform vec3 mat_specular;
uniform float mat_shininess;
uniform sampler2D mat_texture;
// camera
uniform vec3 camera_position;
// lights
uniform vec3 ambient; // Ia
uniform int num_lights;
uniform vec3 light_positions[8];
uniform vec3 light_colors[8]; // Ip

// Output
out vec4 FragColor;

void main() {
    // Color
    // FragColor = vec4(mat_color * texture(mat_texture, model_uv).rgb, 1.0);

    vec3 model_color = mat_color * texture(mat_texture, model_uv).rgb;

    // Calculate and add ambient light
    model_color += mat_color * ambient;

    // Calculate and add difuse light
    for (int i = 0; i < num_lights; i++)
    {
        vec3 lightVector = normalize(light_positions[i] - model_position); // L
        model_color += mat_color * light_colors[i] * clamp(dot(lightVector, model_normal), 0.0, 1.0);
    }

    // Calculate and add specular light
    vec3 viewVector = normalize(camera_position - model_position);
    for (int i = 0; i < num_lights; i++) {
        vec3 lightVector = normalize(light_positions[i] - model_position); // L
        vec3 refLightVector = normalize((2.0 * dot(lightVector, model_normal) * model_normal) - lightVector); // R
        model_color += mat_specular * light_colors[i] * pow( clamp(dot(refLightVector, viewVector), 0.0, 1.0), mat_shininess);
    } 

    // Color
    FragColor = vec4(model_color, 1.0);    
}
