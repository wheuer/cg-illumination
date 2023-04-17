<script>
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { ShaderMaterial } from '@babylonjs/core/Materials/shaderMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
//import { CreatePlane } from '@babylonjs/core/Meshes/Builders/planeBuilder';

import { Renderer } from './renderer'

export default {
    props: ['scene_desc'],
    data() {
        return {
            gl: null,
            scene_data: null,
            scene: null,
            camera: null,
            ground_material: {
                color: null,
                texture: null
            }

        }
    },
    methods: {
        arrayToVector3(arr) {
            return new Vector3(arr[0], arr[1], arr[2]);
        },

        arrayToColor3(arr) {
            return new Color3(arr[0], arr[1], arr[2]);
        },

        arrayToColor4(arr) {
            return new Color4(arr[0], arr[1], arr[2], arr[3]);
        },

        color3ToVector3(color) {
            return new Vector3(color.r, color.g, color.b);
        },

        processScene(scene_desc) {
            this.scene_data = {
                background: this.arrayToColor4(scene_desc.background),
                camera: {
                    position: this.arrayToVector3(scene_desc.camera.position),
                    target:  this.arrayToVector3(scene_desc.camera.target),
                    up:  this.arrayToVector3(scene_desc.camera.up),
                    near_clip: scene_desc.camera.near_clip,
                    far_clip: scene_desc.camera.far_clip
                },
                ground: {
                    shader: scene_desc.ground.shader,
                    material: {
                        color: this.arrayToColor3(scene_desc.ground.material.color),
                        specular: this.arrayToColor3(scene_desc.ground.material.specular),
                        shininess: scene_desc.ground.material.shininess
                    },
                    center: this.arrayToVector3(scene_desc.ground.center),
                    size: this.arrayToVector3(scene_desc.ground.size),
                    subdivisions: [scene_desc.ground.subdivisions[0], scene_desc.ground.subdivisions[1]],
                    heightmap: scene_desc.ground.heightmap
                },
                models: [],
                light: {
                    ambient: this.arrayToColor3(scene_desc.light.ambient),
                    point_lights: []
                }
            };
            scene_desc.models.forEach((model_desc) => {
                let model = {
                    type: model_desc.type,
                    shader: model_desc.shader,
                    material: {
                        color: this.arrayToColor3(model_desc.material.color),
                        specular: this.arrayToColor3(model_desc.material.specular),
                        shininess: model_desc.material.shininess
                    },
                    center: this.arrayToVector3(model_desc.center),
                    size: this.arrayToVector3(model_desc.size),
                    rotation: this.arrayToVector3(model_desc.rotation)
                };
                this.scene_data.models.push(model);
            });
            scene_desc.light.point_lights.forEach((light_desc) => {
                let light = {
                    position: this.arrayToVector3(light_desc.position),
                    color: this.arrayToColor3(light_desc.color)
                }
                this.scene_data.light.point_lights.push(light);
            });
        },

        loadNewScene(event) {

        },

        createGroundModel(name, subdivisions, scene) {
            let ground = new Mesh(name, scene);
            let vertex_positions = [];
            let vertex_texcoords = [];
            let triangle_indices = [];
            for (let j = 0; j <= subdivisions[1]; j++) {
                let v = j / subdivisions[1];
                let curr_row = j * (subdivisions[0] + 1);
                let next_row = (j + 1) * (subdivisions[0] + 1);
                for (let i = 0; i <= subdivisions[0]; i++) {
                    let u = i / subdivisions[0];
                    vertex_positions.push(u - 0.5, 0.0, v - 0.5);
                    vertex_texcoords.push(u, v);
                    if (j < subdivisions[1] && i < subdivisions[0]) {
                        triangle_indices.push(curr_row + i, curr_row + i + 1, next_row + i);
                        triangle_indices.push(next_row + i, curr_row + i + 1, next_row + i + 1);
                    }
                }
            }

            let vertex_data = new VertexData();
            vertex_data.positions = vertex_positions;
            vertex_data.uvs = vertex_texcoords;
            vertex_data.indices = triangle_indices;
            vertex_data.applyToMesh(ground);

            return ground;
        },

        selectShadingAlgorithm(event) {

        }
    },
    mounted() {
        // Get the canvas element from the DOM
        const canvas = document.getElementById('renderCanvas');
        canvas.width = 992;
        canvas.height = 558;

        // Create a WebGL 2 rendering context
        let gl = canvas.getContext('webgl2');
        if (!gl) {
            alert('Error: Browser does not support WebGL2 Canvas');
            return;
        }

        // Associate a Babylon Render Engine to it.
        const engine = new Engine(gl);

        // Create our Renderer
        const renderer = new Renderer(canvas, engine, (scene) => {
            let ground_gauroud = new ShaderMaterial('ground_gauroud', scene, '/shaders/ground_gauroud', {
                attributes: ['position', 'uv'],
                uniforms: ['world', 'view', 'projection'],
                samplers: ['heightmap', 'image']
            });
            ground_gauroud.backFaceCulling = false;
            let ground_phong = new ShaderMaterial('ground_phong', scene, '/shaders/ground_phong', {
                attributes: ['position', 'uv'],
                uniforms: ['world', 'view', 'projection'],
                samplers: ['heightmap', 'image']
            });
            ground_phong.backFaceCulling = false;
            let illum_gauroud = new ShaderMaterial('illum_gauroud', scene, '/shaders/illum_gauroud', {
                attributes: ['position', 'uv'],
                uniforms: ['worldViewProjection'],
                samplers: ['image']
            });
            illum_gauroud.backFaceCulling = true;
            let illum_phong = new ShaderMaterial('illum_phong', scene, '/shaders/illum_phong', {
                attributes: ['position', 'uv'],
                uniforms: ['worldViewProjection'],
                samplers: ['image']
            });
            illum_phong.backFaceCulling = true;

            return {
                ground_gauroud: ground_gauroud,
                ground_phong: ground_phong,
                illum_gauroud: illum_gauroud,
                illum_phong: illum_phong
            };
        }, (scene, subdivisions) => {
            return this.createGroundModel('ground', subdivisions, scene);
        });

        /*
        // Process scene description
        this.processScene(this.scene_desc);
        console.log(this.scene_data);

        // Create our first scene.
        this.scene = new Scene(engine);
        this.scene.clearColor = this.scene_data.background;
        this.scene.ambientColor = this.scene_data.light.ambient;

        // Add a camera to the scene - UniversalCamera good for first-person
        this.camera = new UniversalCamera('camera', this.scene_data.camera.position, this.scene);
        this.camera.setTarget(this.scene_data.camera.target);
        this.camera.upVector = this.scene_data.camera.up;
        this.camera.attachControl(canvas, true);
        this.camera.minZ = this.scene_data.camera.near_clip;
        this.camera.maxZ = this.scene_data.camera.far_clip;


        // Create custom materials for colored and textured ground models
        this.ground_material.color = new ShaderMaterial('ground_colored', this.scene, '/shaders/ground_colored', {
            attributes: ['position', 'uv'],
            uniforms: ['world', 'view', 'projection'],
            samplers: ['heightmap']
        });
        this.ground_material.color.backFaceCulling = false;
        this.ground_material.texture = new ShaderMaterial('ground_textured', this.scene, '/shaders/ground_textured', {
            attributes: ['position', 'uv'],
            uniforms: ['world', 'view', 'projection'],
            samplers: ['heightmap', 'image']
        });
        this.ground_material.texture.backFaceCulling = false;

        let ground_heightmap = new Texture(this.scene_data.ground.heightmap, this.scene);

        let ground = this.createGroundModel('ground', this.scene_data.ground.subdivisions, this.scene);
        ground.scaling = this.scene_data.ground.size;
        ground.material =  this.ground_material[this.scene_data.ground.shader];
        ground.material.setVector3('mat_color', this.color3ToVector3(this.scene_data.ground.material.color));
        ground.material.setVector3('mat_specular', this.color3ToVector3(this.scene_data.ground.material.specular));
        ground.material.setFloat('mat_shininess', this.scene_data.ground.material.shininess);
        ground.material.setFloat('height_scalar', 1.0); 
        ground.material.setTexture('heightmap', ground_heightmap);
        
        /*
        // Add light to the scene
        let light = new PointLight('light0', new Vector3(1, 1, -5), scene);
        light.diffuse = new Color3(1, 1, 1);
        light.specular = new Color3(1, 1, 1);
        
        // Create a basic material
        let mat = new StandardMaterial('mat');
        mat.ambientColor = new Color4(0.2, 0.2, 0.2, 1.0);
        mat.diffuseTexture = new Texture('/images/webglbook.png');
        mat.specularColor = new Color4(0.1, 0.1, 0.1, 1.0);
        
        // Create a plane model
        let plane = CreatePlane('plane', {width: 3.8, height: 5.0});
        plane.material = mat;
        */

        // Render every frame
        engine.runRenderLoop(() => {
            renderer.getActiveScene().render();
        });
    }
}
</script>

<template>
    <div id="userInterface">
        <label for="sceneFile">Scene: </label>
        <input id="sceneFile" type="file" @change="loadNewScene" />
        <label for="shadingAlg">Shading Algorithm: </label>
        <select id="shadingAlg" @change="selectShadingAlgorithm">
            <option value="gouraud">Gouraud</option>
            <option value="phong">Phong</option>
        </select>
    </div>
    <canvas id="renderCanvas" touch-action="none"></canvas>
</template>

<style scoped>
#userInterface {
    width: 100%;
    background-color: #FFFFFF;
}
</style>
