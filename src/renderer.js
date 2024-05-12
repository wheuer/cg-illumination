import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh, MeshBuilder } from '@babylonjs/core';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';

const BASE_URL = import.meta.env.BASE_URL || '/';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.1, 0.1, 0.1, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            },
            {
                scene: new Scene(this.engine),
                background_color: new Color4(0.173, 0.004, 0.258, 1.0),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(0.2, 0.2, 0.2),
                lights: [],
                models: []
            }
        ];
        this.active_scene = 0;
        this.active_light = 0;
        this.shading_alg = 'gouraud';

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](idx);
        });
    }

    createScene0(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(0.1, 1.0, 0.1);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        light1.diffuse = new Color3(1.0, 1.0, 1.0);
        light1.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.10, 0.65, 0.15),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create other models
        let sphere = CreateSphere('sphere', {segments: 32}, scene);
        sphere.position = new Vector3(1.0, 0.5, 3.0);
        sphere.metadata = {
            mat_color: new Color3(0.10, 0.35, 0.88),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        sphere.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(sphere);

        let box = CreateBox('box', {width: 2, height: 1, depth: 1}, scene);
        box.position = new Vector3(-1.0, 0.5, 2.0);
        box.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 4,
            texture_scale: new Vector2(1.0, 1.0)
        }
        box.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(box);

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    createScene1(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 10.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 5.0, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 100.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(0.977, 0.469, 0.996);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.173, 0.004, 0.258),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];
        
        // Create custom model: STAR
        var star = new Mesh("custom", scene);

        // generate ten points, 5 along the outer radius, 5 along the inner radius
        var positions = [];
        var idx_cnt = 0;
        var indices = [];
        var out_rad = 5.0; // outer radius
        var in_rad = 3.0;  // inner radius
        // out x, out y, out z, in x, in y, in z, center x, center y, center z
        for (let i = 0; i < 2; i++) {
            if (i > 0) {
                positions.push( out_rad * Math.cos(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) ); // x
                positions.push( out_rad * Math.sin(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) + 5.0 ); // y
                positions.push( -2.0 ); // z
                indices.push(idx_cnt);

                positions.push( positions[9*i-6] ); // x
                positions.push( positions[9*i-5] ); // y
                positions.push( positions[9*i-4] ); // z
                if (i == 1) {
                    indices.push(idx_cnt-2);
                } else {
                    indices.push(idx_cnt-1);
                }
               
                positions.push( 0.0 ); // x
                positions.push( 5.0 ); // y
                positions.push( 0.0 ); // z
                indices.push(2);
            } 

            positions.push( out_rad * Math.cos(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) ); // x
            positions.push( out_rad * Math.sin(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) + 5.0 ); // y
            positions.push( -2.0 ); // z
            indices.push(idx_cnt);
            idx_cnt++;
            
            positions.push( in_rad * Math.cos((2.0*Math.PI)/10.0 + Math.PI/2.0 + (2.0*i*Math.PI)/5.0) ); // x
            positions.push( in_rad * Math.sin((2.0*Math.PI)/10.0 + Math.PI/2.0 + (2.0*i*Math.PI)/5.0) + 5.0 ); // y
            positions.push( -2.0 ); // z
            indices.push(idx_cnt);
            idx_cnt++;

            positions.push( 0.0 ); // x
            positions.push( 5.0 ); // y
            positions.push( 0.0 ); // z
            indices.push(2);
            if (i == 0) { // if it's the first time through the loop
                idx_cnt++;
            }
        }

        indices = [0, 1, 2, 4, 5, 6, 7, 8, 9];

        console.log(positions);
        console.log(indices);

        // front center point is (0.0, 5.0, 1.0), index 0
        // back center point is (0.0, 5.0, 3.0),  index 11

        // create triangles from generated points starting from the top left triangle
        // var positions = [ outer[0],  outer[1],  outer[2],  inner[9], inner[10], inner[11], 0.0, 5.0, 1.0, // 1 trangle
        //                   outer[3],  outer[4],  outer[5],  inner[9], inner[10], inner[11], 0.0, 5.0, 1.0, // 2
        //                   outer[3],  outer[4],  outer[5], inner[12], inner[13], inner[14], 0.0, 5.0, 1.0, // 3
        //                   outer[6],  outer[7],  outer[8], inner[12], inner[13], inner[14], 0.0, 5.0, 1.0, // 4
        //                   outer[6],  outer[7],  outer[8],  inner[0],  inner[1],  inner[2], 0.0, 5.0, 1.0, // 5
        //                   outer[9], outer[10], outer[11],  inner[0],  inner[1],  inner[2], 0.0, 5.0, 1.0, // 6
        //                   outer[9], outer[10], outer[11],  inner[3],  inner[4],  inner[5], 0.0, 5.0, 1.0, // 7
        //                  outer[12], outer[13], outer[14],  inner[3],  inner[4],  inner[5], 0.0, 5.0, 1.0, // 8
        //                  outer[12], outer[13], outer[14],  inner[6],  inner[7],  inner[8], 0.0, 5.0, 1.0, // 9
        //                   outer[0],  outer[1],  outer[2],  inner[6],  inner[7],  inner[8], 0.0, 5.0, 1.0, // 10
        //                   outer[0],  outer[1],  outer[2],  inner[9], inner[10], inner[11], 0.0, 5.0, 3.0, // 11
        //                   outer[3],  outer[4],  outer[5],  inner[9], inner[10], inner[11], 0.0, 5.0, 3.0, // 12
        //                   outer[3],  outer[4],  outer[5], inner[12], inner[13], inner[14], 0.0, 5.0, 3.0, // 13
        //                   outer[6],  outer[7],  outer[8], inner[12], inner[13], inner[14], 0.0, 5.0, 3.0, // 14
        //                   outer[6],  outer[7],  outer[8],  inner[0],  inner[1],  inner[2], 0.0, 5.0, 3.0, // 15
        //                   outer[9], outer[10], outer[11],  inner[0],  inner[1],  inner[2], 0.0, 5.0, 3.0, // 16
        //                   outer[9], outer[10], outer[11],  inner[3],  inner[4],  inner[5], 0.0, 5.0, 3.0, // 17
        //                  outer[12], outer[13], outer[14],  inner[3],  inner[4],  inner[5], 0.0, 5.0, 3.0, // 18
        //                  outer[12], outer[13], outer[14],  inner[6],  inner[7],  inner[8], 0.0, 5.0, 3.0, // 19
        //                   outer[0],  outer[1],  outer[2],  inner[6],  inner[7],  inner[8], 0.0, 5.0, 3.0,];
        // var indices = [1,  2, 0,  // 1 triangle
        //                3,  2, 0,  // 2
        //                3,  4, 0,  // 3
        //                5,  4, 0,  // 4
        //                5,  6, 0,  // 5
        //                7,  6, 0,  // 6
        //                7,  8, 0,  // 7
        //                9,  8, 0,  // 8
        //                9, 10, 0,  // 9
        //                1, 10, 0,  // 10
        //                1,  2, 11, // 11
        //                3,  2, 11, // 12
        //                3,  4, 11, // 13
        //                5,  4, 11, // 14
        //                5,  6, 11, // 15
        //                7,  6, 11, // 16
        //                7,  8, 11, // 17
        //                9,  8, 11, // 18
        //                9, 10, 11, // 19
        //                1, 10, 11]; 

        var vertexData = new VertexData();
        //var vertexBuffer = new VertexBuffer(AbstractEngine, vertexData, "PositionKind", true, size=180);

        vertexData.positions = positions;
        vertexData.indices = indices; 
        
        console.log(vertexData);

        vertexData.applyToMesh(star, true);

        star.metadata = {
            mat_color: new Color3(0.75, 0.15, 0.05),
            mat_texture: white_texture,
            mat_specular: new Color3(0.4, 0.4, 0.4),
            mat_shininess: 5,
            texture_scale: new Vector2(1.0, 1.0)
        }
        star.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(star);

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...

            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });
    }

    updateShaderUniforms(scene_idx, shader) {
        let current_scene = this.scenes[scene_idx];
        shader.setVector3('camera_position', current_scene.camera.position);
        shader.setColor3('ambient', current_scene.scene.ambientColor);
        shader.setInt('num_lights', current_scene.lights.length);
        let light_positions = [];
        let light_colors = [];
        current_scene.lights.forEach((light) => {
            light_positions.push(light.position.x, light.position.y, light.position.z);
            light_colors.push(light.diffuse);
        });
        shader.setArray3('light_positions', light_positions);
        shader.setColor3Array('light_colors', light_colors);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
    
    setActiveScene(idx) {
        this.active_scene = idx;
    }

    setShadingAlgorithm(algorithm) {
        this.shading_alg = algorithm;

        this.scenes.forEach((scene) => {
            let materials = scene.materials;
            let ground_mesh = scene.ground_mesh;

            ground_mesh.material = materials['ground_' + this.shading_alg];
            scene.models.forEach((model) => {
                model.material = materials['illum_' + this.shading_alg];
            });
        });
    }

    setHeightScale(scale) {
        this.scenes.forEach((scene) => {
            let ground_mesh = scene.ground_mesh;
            ground_mesh.metadata.height_scalar = scale;
        });
    }

    setActiveLight(idx) {
        console.log(idx);
        this.active_light = idx;
    }
}

export { Renderer }
