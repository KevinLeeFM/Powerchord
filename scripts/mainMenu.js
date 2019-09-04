import {cChromDeg} from './music/musicManager.js';

const defaultConfig = Object.freeze({
    bpm: 180,
    key: "E",
    rhythm: {
        kick: [1, 0, 1, 0, 1, 0, 1, 0],
        snare: [0, 0, 1, 0, 0, 0, 1, 0],
        hiHat: [1, 1, 1, 1, 1, 1, 1, 1],
    },
});

let kickCheckbox = [];
let snareCheckbox = [];
let hiHatCheckbox = [];

let checkboxRow = {
    newRow: function (key, defaultArr, parentId) {
        this[key] = [];
        for (let b of defaultArr) {
            let box = document.createElement('input')
            box.setAttribute('type', 'checkbox');
            box.checked = b;
            document.getElementById(parentId).appendChild(box);
            this[key].push(box);
        }
    },
    getRow: function (key) {
        let arr = [];
        for (let box of this[key]) {
            arr.push(box.checked);
        }
        return arr;
    }
}

export function setupMenu() {
    document.getElementById('bpm').setAttribute('value', defaultConfig.bpm);

    for (let k in cChromDeg) {
        let key = document.createElement('option')
        key.setAttribute('value', cChromDeg[k])
        key.innerHTML = cChromDeg[k];
        document.getElementById('key').appendChild(key);
    }

    checkboxRow.newRow('kick', defaultConfig.rhythm['kick'], 'kick');
    checkboxRow.newRow('snare', defaultConfig.rhythm['snare'], 'snare');
    checkboxRow.newRow('hiHat', defaultConfig.rhythm['hiHat'], 'hiHat');
}

export function destroyMenu() {

    let powerchordConfig = {
        bpm: document.getElementById('bpm').value,
        key: document.getElementById('key').value,
        rhythm: {
            kick: checkboxRow.getRow('kick'),
            snare: checkboxRow.getRow('snare'),
            hiHat: checkboxRow.getRow('hiHat'),
        }
    }

    document.getElementById('start-menu').remove();
    document.getElementById('powerchord').style.height = '600px';

    return powerchordConfig
}