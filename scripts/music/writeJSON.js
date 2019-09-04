import {scene} from '../main.js';

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}


export function writeJSON() {

    let musicManager = scene.musicManager;
    let recording = musicManager.recording;
    let rhythm = musicManager.rhythm;
    let length = recording.length;
    let bpm = musicManager.bpm;
    let meter = musicManager.meter;

    let obj = {
        bpm: bpm,
        guitar: recording,
    };

    for (let k in rhythm) {
        obj[k] = [];
    }

    for (let i = 0; i < length; i++) {
        for (let k in rhythm) {
            obj[k].push(rhythm[k][i % meter]);
        }
    }

    download("powerchord_recording.json", JSON.stringify(obj)); // this will start a download of the plain text file

}
