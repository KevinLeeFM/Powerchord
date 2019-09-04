import {createBug} from './entities.js';
import {scene} from './main.js';

const BUG_SPAWNER_HEIGHT = -40;

export class BugSpawner {
    constructor(initFreq, freqGrowth, deviation, startDeg, largeChance, pedalChance, maxStep) {
        this.frequency = initFreq;
        this.freqGrowth = freqGrowth;
        this.deviation = deviation;
        this.scaleDegree = startDeg;
        this.largeChance = largeChance;
        this.pedalChance = pedalChance;
        this.maxStep = maxStep;
        this.paused = false;
        this.x = 400 / 10 * this.scaleDegree + 20;
        this.y = BUG_SPAWNER_HEIGHT;
        this.timer = scene.time.addEvent({
            delay: 1000 / this.frequency,
            callback: () => {this.onUpdate()},
            loop: true
        });
    }

    setPaused(isPaused) {
        this.paused = isPaused;
        this.timer.paused = isPaused;
    }

    onUpdate() {
        
        if (Math.random() < this.pedalChance) {
            this.scaleDegree = Math.floor(Math.random() * 10);
        } else if (Math.random() < this.deviation) {
            let step = Math.floor(Math.random() * this.maxStep + 1);
            // if deviating from current position
            if (this.scaleDegree - step < 0) {
                // if cannot leap right
                this.scaleDegree += step;
            } else if (this.scaleDegree + step > 9) {
                // if cannot leap left
                this.scaleDegree -= step;
            } else if (Math.random() >= 0.5) {
                // pick a random direction if can do both
                this.scaleDegree += step;
            } else {
                this.scaleDegree -= step;
            }
        }

        this.frequency += this.freqGrowth;
        this.timer.reset({
            delay: 1000 / this.frequency,
            callback: () => {this.onUpdate()},
            loop: true
        });

        this.x = 400 / 10 * this.scaleDegree + 20;

        createBug(this.x, this.y, Math.random() < this.largeChance);

    }

    
}