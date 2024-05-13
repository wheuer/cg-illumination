import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { PointLight, HemisphericLight } from '@babylonjs/core/Lights';
import { CreateSphere } from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import { CreateBox } from '@babylonjs/core/Meshes/Builders/boxBuilder';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { CubeTexture, SceneLoader } from '@babylonjs/core';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector2, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Mesh, MeshBuilder, StandardMaterial } from '@babylonjs/core';
import { VertexData } from '@babylonjs/core/Meshes/mesh.vertexData';
import { KeyboardEventTypes } from '@babylonjs/core';

import "@babylonjs/core/Loading/loadingScreen";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Materials/Textures/Loaders/envTextureLoader";
import "@babylonjs/core/Animations/animatable"

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
                background_color: new Color4(0.103, 0.004, 0.127, 1.0),
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
                background_color: new Color4(0.103, 0.004, 0.127, 1.0),
                materials: null,
                ground_subdivisions: [0, 0],
                ground_mesh: null,
                camera: null,
                ambient: new Color3(1.0, 1.0, 1.0),
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
        let light0 = new PointLight('light0', new Vector3(1.0, 0.1, 5.0), scene);
        light0.diffuse = new Color3(0.0, 0.0, 1.0);
        light0.specular = new Color3(1.0, 0.0, 1.0);
        current_scene.lights.push(light0);

        // let light1 = new PointLight('light1', new Vector3(0.0, 3.0, 0.0), scene);
        // light1.diffuse = new Color3(1.0, 1.0, 1.0);
        // light1.specular = new Color3(1.0, 1.0, 1.0);
        // current_scene.lights.push(light1);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.metadata = {
            // mat_color: new Color3(0.1, 0.65, 0.15),
            mat_color: new Color3(0.5, 0.5, 0.5),
            mat_texture: white_texture,
            mat_specular: new Color3(0.8, 0.8, 0.8),
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

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
              case KeyboardEventTypes.KEYDOWN:
                let light = this.scenes[this.active_scene].lights[this.active_light];  
                let lightStepSize = 0.25;
                switch (kbInfo.event.key) {
                    case "w":
                    case "W":
                        light.position = new Vector3(light.position.x, light.position.y, light.position.z - lightStepSize);
                        break;
                    case "a":
                    case "A":
                        light.position = new Vector3(light.position.x - lightStepSize, light.position.y, light.position.z);
                        break;
                    case "s":
                    case "S":
                        light.position = new Vector3(light.position.x, light.position.y, light.position.z + lightStepSize);
                        break;
                    case "d":
                    case "D":
                        light.position = new Vector3(light.position.x + lightStepSize, light.position.y, light.position.z);
                        break;
                    case "f":
                    case "F":
                        light.position = new Vector3(light.position.x, light.position.y - lightStepSize, light.position.z);
                        break;
                    case "r":
                    case "R":
                        light.position = new Vector3(light.position.x, light.position.y + lightStepSize, light.position.z);
                        break;
                }
                // console.log(light.position);
            }
        });

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
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 5, 40.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 5.0, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 500.0;

        // Create point light sources
        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        // Create ground mesh
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/moon.jpg', scene);
        ground_mesh.scaling = new Vector3(60.0, 10.0, 60.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.406, 0.406, 0.344),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Spherical model: MARS
        let mars = CreateSphere('sphere', {diameter: 10.0, segments: 32}, scene);
        mars.position = new Vector3(-26.0, 17.0, -20.0);
        mars.metadata = {
            mat_color: new Color3(0.9, 0.9, 0.9),
            mat_texture: new Texture(BASE_URL + 'textures/mars.jpg', scene),
            mat_specular: new Color3(0.1, 0.1, 0.1),
            mat_shininess: 10,
            texture_scale: new Vector2(1.0, 1.0)
        }
        mars.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(mars);

        // Spherical model: JUPITER
        let jupiter = CreateSphere('sphere', {diameter: 20.0, segments: 32}, scene);
        jupiter.position = new Vector3(20.0, 12.0, -20.0);
        jupiter.metadata = {
            mat_color: new Color3(0.9, 0.9, 0.9),
            mat_texture: new Texture(BASE_URL + 'textures/jupiter.jpg', scene),
            mat_specular: new Color3(0.2, 0.2, 0.2),
            mat_shininess: 16,
            texture_scale: new Vector2(1.0, 1.0)
        }
        jupiter.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(jupiter);

        // Spherical model: NEPTUNE
        let neptune = CreateSphere('sphere', {diameter: 7.0, segments: 32}, scene);
        neptune.position = new Vector3(-16.0, 7.0, -20.0);
        neptune.metadata = {
            mat_color: new Color3(0.9, 0.9, 0.9),
            mat_texture: new Texture(BASE_URL + 'textures/neptune.jpg', scene),
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 20,
            texture_scale: new Vector2(1.0, 1.0)
        }
        neptune.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(neptune);
        
        // Create custom model: STAR
        var star = new Mesh("custom", scene);

        // generate ten points, 5 along the outer radius, 5 along the inner radius
        var positions = [];
        var idx_cnt = 0;
        var count = 0;
        var indices = [];
        var out_rad = 5.0; // outer radius
        var in_rad = 2.5;  // inner radius
        // out x, out y, out z, in x, in y, in z, center x, center y, center z
        for (let i = 0; i < 5; i++) {
            if (i > 0) {
                positions.push( out_rad * Math.cos(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) ); // x
                positions.push( out_rad * Math.sin(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) + 5.0 ); // y
                positions.push( 0.0 ); // z
                indices.push(idx_cnt);

                if (i == 1) {
                    indices.push(idx_cnt-2);
                } else {
                    indices.push(idx_cnt-1);
                }
               
                indices.push(2);
            } 

            if (i == 0) {
                positions.push( out_rad * Math.cos(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) ); // x
                positions.push( out_rad * Math.sin(Math.PI/2.0 + (2.0*i*Math.PI)/5.0) + 5.0 ); // y
                positions.push( 0.0 ); // z
            }
            indices.push(idx_cnt);
            idx_cnt++;
            
            positions.push( in_rad * Math.cos((2.0*Math.PI)/10.0 + Math.PI/2.0 + (2.0*i*Math.PI)/5.0) ); // x
            positions.push( in_rad * Math.sin((2.0*Math.PI)/10.0 + Math.PI/2.0 + (2.0*i*Math.PI)/5.0) + 5.0 ); // y
            positions.push( 0.0 ); // z
            indices.push(idx_cnt);
            idx_cnt++;

            if (i == 0) { // if it's the first time through the loop
                positions.push( 0.0 ); // x
                positions.push( 5.0 ); // y
                positions.push( 2.0 ); // z
                idx_cnt++;
            }
            indices.push(2);

            if (i == 4) { //if it's the last time, we have to add the last triangle
                indices.push(0);  // first outer point
                indices.push(10); // last inner
                indices.push(2);  // center 
            }
        }

        // add back point to positions
        positions.push( 0.0 );
        positions.push( 5.0 );
        positions.push( -2.0 );

        // add all of the back points to indices
        var len = indices.length;
        for (let i = 0; i < len; i++) {
            if (indices[i] == 2) {
                indices.push(11);
            } else {
                indices.push(indices[i]);
            }
        }

        var normals = [];
        var vertexData = new VertexData();
        VertexData.ComputeNormals(positions, indices, normals);

        vertexData.positions = positions;
        vertexData.indices = indices; 
        vertexData.normals = normals;

        vertexData.applyToMesh(star, true);

        star.metadata = {
            mat_color: new Color3(0.761, 0.796, 0.269),
            mat_texture: white_texture,
            mat_specular: new Color3(0.6, 0.6, 0.6),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0)
        }
        star.material = materials['illum_' + this.shading_alg];
        current_scene.models.push(star);

        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
              case KeyboardEventTypes.KEYDOWN:
                let light = this.scenes[this.active_scene].lights[this.active_light];  
                let lightStepSize = 0.1;
                switch (kbInfo.event.key) {
                    case "w":
                    case "W":
                        light.position = new Vector3(light.position.x, light.position.y, light.position.z - lightStepSize);
                        break;
                    case "a":
                    case "A":
                        light.position = new Vector3(light.position.x - lightStepSize, light.position.y, light.position.z);
                        break;
                    case "s":
                    case "S":
                        light.position = new Vector3(light.position.x, light.position.y, light.position.z + lightStepSize);
                        break;
                    case "d":
                    case "D":
                        light.position = new Vector3(light.position.x + lightStepSize, light.position.y, light.position.z);
                        break;
                    case "f":
                    case "F":
                        light.position = new Vector3(light.position.x, light.position.y - lightStepSize, light.position.z);
                        break;
                    case "r":
                    case "R":
                        light.position = new Vector3(light.position.x, light.position.y + lightStepSize, light.position.z);
                        break;
                }
            //     console.log(light.position);
            }
        });

        // Animation function - called before each frame gets rendered
        scene.onBeforeRenderObservable.add(() => {
            // update models and lights here (if needed)
            // ...
            star.addRotation(0, Math.PI/80, 0);
            // update uniforms in shader programs
            this.updateShaderUniforms(scene_idx, materials['illum_' + this.shading_alg]);
            this.updateShaderUniforms(scene_idx, materials['ground_' + this.shading_alg]);
        });

    }

    createScene2(scene_idx) {
        let current_scene = this.scenes[scene_idx];
        let scene = current_scene.scene;
        let materials = current_scene.materials;
        let ground_mesh = current_scene.ground_mesh;

        // Set scene-wide / environment values
        scene.clearColor = current_scene.background_color;
        scene.ambientColor = current_scene.ambient;
        scene.useRightHandedSystem = true;

        // Create camera
        current_scene.camera = new UniversalCamera('camera', new Vector3(0.0, 25.0, 50.0), scene);
        current_scene.camera.setTarget(new Vector3(0.0, 5.0, 0.0));
        current_scene.camera.upVector = new Vector3(0.0, 1.0, 0.0);
        current_scene.camera.attachControl(this.canvas, true);
        current_scene.camera.fov = 35.0 * (Math.PI / 180);
        current_scene.camera.minZ = 0.1;
        current_scene.camera.maxZ = 1000.0;

        // Need to always create the ground mesh, but just have it be [0, 0] in size
        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);
        let ground_heightmap = new Texture(BASE_URL + 'heightmaps/moon.jpg', scene);
        ground_mesh.scaling = new Vector3(60.0, 10.0, 60.0);
        ground_mesh.metadata = {
            mat_color: new Color3(0.0, 0.0, 0.0),
            mat_texture: white_texture,
            mat_specular: new Color3(0.0, 0.0, 0.0),
            mat_shininess: 1,
            texture_scale: new Vector2(1.0, 1.0),
            height_scalar: 1.0,
            heightmap: ground_heightmap
        }
        ground_mesh.material = materials['ground_' + this.shading_alg];

        // Create hemisphereic light, its the only working light source that I found works for the imported meshes
        let light = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);

        let light0 = new PointLight('light0', new Vector3(1.0, 1.0, 5.0), scene);
        light0.diffuse = new Color3(1.0, 1.0, 1.0);
        light0.specular = new Color3(1.0, 1.0, 1.0);
        current_scene.lights.push(light0);

        // Clouds skybox
        let skybox = MeshBuilder.CreateBox("skyBox",  {size:1, height:500, width:500, depth:500}, scene);
        let skyboxMaterial = new StandardMaterial("skyBox", scene);
        skybox.position = new Vector3(0.0, 3.0, 0.0);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture("textures/skybox/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;	

        // Plane
        SceneLoader.ImportMesh("", "./meshes/", "aerobatic_plane.glb", scene, (meshes) => {
            for (var i = 0; i < meshes.length; i++){
                meshes[i].scaling = new Vector3(10, 10, 10);
            }; 
        });
            
        scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                let light = this.scenes[this.active_scene].lights[this.active_light];  
                let lightStepSize = 0.25;
                switch (kbInfo.event.key) {
                    case "w":
                    case "W":
                        light.position = new Vector3(light.position.x, light.position.y, light.position.z - lightStepSize);
                        break;
                    case "a":
                    case "A":
                        light.position = new Vector3(light.position.x - lightStepSize, light.position.y, light.position.z);
                        break;
                    case "s":
                    case "S":
                        light.position = new Vector3(light.position.x, light.position.y, light.position.z + lightStepSize);
                        break;
                    case "d":
                    case "D":
                        light.position = new Vector3(light.position.x + lightStepSize, light.position.y, light.position.z);
                        break;
                    case "f":
                    case "F":
                        light.position = new Vector3(light.position.x, light.position.y - lightStepSize, light.position.z);
                        break;
                    case "r":
                    case "R":
                        light.position = new Vector3(light.position.x, light.position.y + lightStepSize, light.position.z);
                        break;
                }
                // console.log(light.position);
            }
        });

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
