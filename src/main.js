import { createApp } from 'vue'
import App from './App.vue'

let initial_scene = {
    background: [0.8, 0.8, 0.8, 1.0], // red, green, blue, alpha
    camera: {
        position: [0.0, 1.8, 3.0], // (x, y, z) location of camera
        target: [0.0, 1.8, 0.0], // (x, y, z) location of object camera is looking at
        up: [0.0, 1.0, 0.0], // vector pointing in camera's up direction
        near_clip: 0.1,
        far_clip: 100.0
    },
    ground: {
        shader: 'color',
        material: {
            color: [0.10, 0.65, 0.15], // red, green, blue
            specular: [0.0, 0.0, 0.0], // red, green, blue
            shininess: 1
        },
        center: [0.0, -0.5, 0.0], // (x, y, z)
        size: [20.0, 1.0, 20.0],
        subdivisions: [50, 50],
        heightmap: '/heightmaps/default.png'
    },
    models: [
        {
            type: 'sphere',
            shader: 'color',
            material: {
                color: [0.15, 0.35, 0.88], // red, green, blue
                specular: [0.8, 0.8, 0.8], // red, green, blue
                shininess: 48
            },
            center: [0.5, 1.0, -6.0], // (x, y, z)
            size: [2.0, 2.0, 2.0],
            rotation: [0, 0, 0]
        },
        {
            type: 'custom',
            shader: 'color',
            material: {
                color: [0.88, 0.35, 0.15], // red, green, blue
                specular: [0.5, 0.5, 0.5], // red, green, blue
                shininess: 8
            },
            center: [-1.5, 1.5, -8.0], // (x, y, z)
            size: [3.0, 3.0, 3.0],
            rotation: [0, 0, 0]
        }
    ],
    light: {
        ambient: [0.2, 0.2, 0.2], // red, green, blue
        point_lights: [
            {
                position: [1.5, 3.0, -4.5], // (x, y, z)
                color: [1.0, 1.0, 0.8] // red, green, blue
            }
        ]
    }
};

window.app = createApp(App, {scene_desc: initial_scene}).mount('#app');
