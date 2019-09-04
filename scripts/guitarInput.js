import {scene} from './main.js';

export class GuitarInput {
    constructor (key, chromaticDegree, scaleDegree) {
        this.listener = scene.input.keyboard.addKey(key);
        this.chromaticDegree = chromaticDegree;
        this.scaleDegree = scaleDegree;
    }

    onUpdate() {
        if (this.listener.isDown) {
            return true;
        }
    }
}