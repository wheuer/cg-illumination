import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

class Renderer {
    constructor(canvas, engine, material_callback, ground_mesh_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                materials: null,
                ground_subdivisions: [50, 50],
                ground_mesh: null
            }
        ];
        this.active_scene = 0;

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            scene.ground_mesh = ground_mesh_callback(scene.scene, scene.ground_subdivisions);
            this['createScene'+ idx](scene.scene, scene.materials, scene.ground_mesh);
        })
    }

    createScene0(scene, materials, ground_mesh) {
        let camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 3.0), scene);
        camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        camera.upVector = new Vector3(0.0, 1.0, 0.0);
        camera.attachControl(this.canvas, true);
        camera.minZ = 0.1;
        camera.maxZ = 100.0;

        let white_texture = RawTexture.CreateRGBTexture(new Uint8Array([255, 255, 255]), 1, 1, scene);

        let ground_heightmap = new Texture('/heightmaps/default.png', scene);
        ground_mesh.scaling = new Vector3(20.0, 1.0, 20.0);
        ground_mesh.material = materials['ground_gauroud'];
        materials['ground_gauroud'].setVector3('mat_color', new Vector3(0.10, 0.65, 0.15));
        materials['ground_gauroud'].setVector3('mat_specular', new Vector3(0.0, 0.0, 0.0));
        materials['ground_gauroud'].setFloat('mat_shininess', 1.0);
        materials['ground_gauroud'].setFloat('height_scalar', 1.0); 
        materials['ground_gauroud'].setTexture('heightmap', ground_heightmap);
        materials['ground_gauroud'].setTexture('image', white_texture);
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
}

export { Renderer }