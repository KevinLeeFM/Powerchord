import {scene} from '../main.js';

function download(filename, text) {
    console.log('hi');
  var element = document.createElement('a');
  element.setAttribute('href', 'data:audio/midi;base64,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// according to http://www.ccarh.org/courses/253/handout/gminstruments/
const GUITAR_CHANNEL = 0;
const GUITAR_MIDI_INDEX = 29;
const DRUM_CHANNEL = 9;
const DRUM_PITCH_INDEX = {
    kick: 'C2',
    snare: 'D2',
    hiHat: 'F#2',
};
const TICKS_PER_EIGHTH = 64;

export function writeMIDI() {

    let musicManager = scene.musicManager;
    let recording = musicManager.recording;
    let rhythm = musicManager.rhythm;
    let length = recording.length;
    let bpm = musicManager.bpm;
    let meter = musicManager.meter;

    var file = new Midi.File();

    //guitar
    var guitar = new Midi.Track().setInstrument(GUITAR_CHANNEL, GUITAR_MIDI_INDEX).setTempo(bpm);
    file.addTrack(guitar);

    let rest = 0;
    for (let eighth = 0; eighth < length; eighth++) {
        let chord = recording[eighth];
        if (chord === null) {
            console.log(chord);
            rest += 1;
        } else {
            guitar.addNote(GUITAR_CHANNEL, '', rest * TICKS_PER_EIGHTH)
            guitar.addChord(GUITAR_CHANNEL, chord, TICKS_PER_EIGHTH);
            rest = 0;
        }
    }

    // //drum
    // var drum = new Midi.Track().setInstrument(DRUM_CHANNEL, 0).setTempo(bpm);
    // file.addTrack(guitar);

    // for (let i = 0; i < length; i++) {
    //     let beat = i % meter;
    //     let chord = []; // "chord," not really chord
    //     for (let k in rhythm) {
    //         if (rhythm[k][beat]) { // if true, ie playing
    //             chord.push(DRUM_PITCH_INDEX[k]);
    //         }
    //     }

    //     drum.addChord(GUITAR_CHANNEL, chord);
    // }

    console.log(file.toBytes());

    download("powerchord_recording.midi", btoa(file.toBytes())); // this will start a download of the midi file
}