import { Scene } from '@babylonjs/core/scene';

class Renderer {
    constructor(engine) {
        this.engine = engine;
        this.scenes = [
            this.createScene0()
        ];
    }

    createScene0() {

    }
}

export { Renderer }