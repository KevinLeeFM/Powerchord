import {scene} from '../main.js';

export class MusicManager {
    constructor(bpm, tonic, rhythm) {
        
        this.bpm = bpm;
        this.eighthLength = 1 / bpm * 60 * 1000 / 2;

        this.eighthMetronome = scene.time.addEvent({
            delay: this.eighthLength, // period, in miliseconds, of each eighth beat
            callback: () => {this.onBeat()},
            loop: true
        });

        // get the meter of the drumbeat, if the drum kits have conflicting amount of beats, throw error
        this.meter = rhythm['snare'].length;
        for (let k in rhythm) {
            if (this.meter !== rhythm[k].length) {
                throw new MismatchedMeterException();
                this.meter = undefined;
            }
        }
        this.rhythm = rhythm;
        
        // what beat is the drummer currently on?
        this.beat = 0;

        //playback setup
        this.playbackMetronome = scene.time.addEvent({
            delay: this.eighthLength, // period, in miliseconds, of each eighth beat
            callback: () => {this.onPlaybackBeat()},
            paused: true,
            loop: true
        });

        this.playbackBeat = 0;
        this.recording = [];

        //music set up
        this.tonic = tonic;
        this.drumSound = {
            snare: new Tone.Player("../../assets/audio/snare.wav").toMaster(),
            kick: new Tone.Player("../../assets/audio/kick.wav").toMaster(),
            hiHat: new Tone.Player("../../assets/audio/hi_hat.wav").toMaster()
        }

        // Tone.js and guitar setup
        this.guitarSound = new Tone.Sampler(
            {
                "C2": "../../assets/audio/guitar_C2.wav",
                "G2": "../../assets/audio/guitar_G2.wav",
                "C3": "../../assets/audio/guitar_C3.wav",
                "G3": "../../assets/audio/guitar_G3.wav",
                "C4": "../../assets/audio/guitar_C4.wav",
            },
            function() {
                console.log("guitar samples loaded");
            }
        );



        this.guitarSound.toMaster();
    }

    onBeat() {
        this.beat += 1;
        this.beat %= this.meter;

        this.guitar();
        this.drum();
    }

    drum() {
        // is ... of the drum kit playing?
        for (let k in this.rhythm) {
            if (this.rhythm[k][this.beat] == true) /*note that 1, 0 are coersed into true/false, so don't use ===*/ {
                this.drumSound[k].start();
            }
        }
    }

    guitar() {
        let currentDegree = scene.player.chromaticDegree;
        if (currentDegree != undefined) {
            let note = chromDegToNote(this.tonic, currentDegree, 3);
            let powerFive = chromDegToNote(this.tonic, currentDegree + 7, 2);
            this.guitarSound.triggerAttackRelease(note, this.eighthLength / 800);
            this.guitarSound.triggerAttackRelease(powerFive, this.eighthLength / 800);

            // have player create a note
            scene.player.createNote(this.isAccented());

            // record to recording
            this.recording.push([note, powerFive]);
        } else {
            // record silence
            this.recording.push(null);
        }
    }

    isAccented() {
        return this.rhythm.snare[this.beat] == 1 ? true : false;
    }

    setPaused(isPaused) {
        this.isPaused = isPaused;
        this.eighthMetronome.paused = isPaused;
    }

    onPlaybackBeat() {
        // very messy and bad programming practice, but I'm rushing a code jam so shut up

        // copied from drum function
        // is ... of the drum kit playing?
        for (let k in this.rhythm) {
            if (this.rhythm[k][this.playbackBeat % this.meter] == true) /*note that 1, 0 are coersed into true/false, so don't use ===*/ {
                this.drumSound[k].start();
            }
        }
        
        // ignore silences
        if (this.recording[this.playbackBeat] !== null) {
            // note that this.recording is a 2D array
            for (let note of this.recording[this.playbackBeat]) {
                this.guitarSound.triggerAttackRelease(note, this.eighthLength / 800);
            }
        }

        this.playbackBeat += 1;

        // reaching end of the tape
        if (this.playbackBeat > this.recording.length - 1) {
            this.setPausePlayback(true);
        }
    }

    setPausePlayback(isPaused) {
        
        this.playbackMetronome.paused = isPaused;

        if (isPaused) {
            this.resetPlayback();
        }
    }

    resetPlayback() {
        console.log('resetted playback');
        this.playbackBeat = 0;
    }
}

function MismatchedMeterException() {
   this.message = 'The amount of beats defined for some/all of the drum kits are not the same.';
   this.toString = function() {
      return this.message;
   };
}

export const cChromDeg = {
        0: "C",
        1: "C#",
        2: "D",
        3: "D#",
        4: "E",
        5: "F",
        6: "F#",
        7: "G",
        8: "G#",
        9: "A",
        10: "A#",
        11: "B"
    }

function chromDegToNote(tonic, deg, octv) {

    let degZero;
    for (let k in cChromDeg) {
        if (cChromDeg[k] === tonic) {
            degZero = k;
        }
    }

    if (degZero + deg > 12) {
        octv += 1;
    }

    let relativeDeg = (degZero + deg) % 12;

    return cChromDeg[relativeDeg] + octv.toString();
}