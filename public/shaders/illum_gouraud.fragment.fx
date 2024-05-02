#version 300 es
precision mediump float;

// Input
in vec2 model_uv;
in vec3 diffuse_illum;
in vec3 specular_illum;

// Uniforms
// material
uniform vec3 mat_color; // Kd = Ka for our purposes
uniform vec3 mat_specular; // Ks    
uniform sampler2D mat_texture;
// light from environment
uniform vec3 ambient; // Ia * Ka

// Output
out vec4 FragColor;

void main() {
    vec3 model_color = mat_color * texture(mat_texture, model_uv).rgb;

    // Ambient
    model_color += mat_color * ambient;

    // Diffuse
    model_color += mat_color * diffuse_illum;

    // Specular
    model_color += mat_specular * specular_illum;

    // Color, fully opaque
    FragColor = vec4(model_color, 1.0);
}
