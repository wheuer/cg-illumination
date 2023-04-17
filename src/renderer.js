import { Scene } from '@babylonjs/core/scene';
import { UniversalCamera } from '@babylonjs/core/Cameras/universalCamera';
import { Vector3 } from '@babylonjs/core';

class Renderer {
    constructor(canvas, engine, material_callback) {
        this.canvas = canvas;
        this.engine = engine;
        this.scenes = [
            {
                scene: new Scene(this.engine),
                materials: null
            }
        ];
        this.active_scene = 0;

        this.scenes.forEach((scene, idx) => {
            scene.materials = material_callback(scene.scene);
            this['createScene'+ idx](scene.scene, scene.materials);
        })
    }

    createScene0(scene, materials) {
        const camera = new UniversalCamera('camera', new Vector3(0.0, 1.8, 3.0), scene);
        camera.setTarget(new Vector3(0.0, 1.8, 0.0));
        camera.upVector = new Vector3(0.0, 1.0, 0.0);
        camera.attachControl(this.canvas, true);
        camera.minZ = 0.1;
        camera.maxZ = 100.0;
    }

    getActiveScene() {
        return this.scenes[this.active_scene].scene;
    }
}

export { Renderer }