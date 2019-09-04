import {GuitarInput} from './guitarInput.js';
import {scene} from './main.js';
import {createNote} from './entities.js';

const PLAYER_HEIGHT = 300 - 40;

export class Player {

    constructor(scaleDegree) {
        this.defeated = false;
        this.scaleDegree = scaleDegree;
        this.sprite = scene.add.sprite(400 / 10 * scaleDegree + 20, PLAYER_HEIGHT, 'player');
        this.guitarInput = {
            inputs: [
                // the "Metallica" scale, or the locrian/aeolian mixed scale
                new GuitarInput('Q', 0, 0),
                new GuitarInput('W', 1, 1),
                new GuitarInput('E', 2, 2),
                new GuitarInput('R', 3, 3),
                new GuitarInput('T', 5, 4),
                new GuitarInput('Y', 6, 5),
                new GuitarInput('U', 7, 6),
                new GuitarInput('I', 8, 7),
                new GuitarInput('O', 10, 8),
                new GuitarInput('P', 12, 9),
            ],

            getChromDegree: function() {
                for (let i of this.inputs) {
                    if (i.onUpdate() === true) {
                        return i.chromaticDegree;
                    }
                }
                return undefined;
            },

            getScaleDegree: function() {
                for (let i of this.inputs) {
                    if (i.onUpdate() === true) {
                        return i.scaleDegree;
                    }
                }
                return undefined;
            }
        }
    }

    onUpdate() {
        if (!this.defeated) {
            this.chromaticDegree = this.guitarInput.getChromDegree();
            this.scaleDegree = this.guitarInput.getScaleDegree();
            if (this.chromaticDegree === undefined) {
                this.sprite.setTexture("player");
            } else {

                // the player is tapping on the keyboard
                this.sprite.setTexture("playerPlaying");

                this.sprite.setPosition(400 / 10 * this.scaleDegree + 20, PLAYER_HEIGHT);
            }
        } else {
            this.sprite.setTexture("playerDefeated");
        }
    }

    createNote(isAccented) {
        createNote(this.sprite.x, this.sprite.y, isAccented); // have the player create a note
    }
}