import {scene} from './main.js';

export function createNote(x, y, isLarge) {
    let sprite;
    if (!isLarge) {
        sprite = scene.groups.note.create(x, y, 'noteSmall');
        sprite.damage = 1;
    } else {
        sprite = scene.groups.note.create(x, y, 'noteLarge');
        sprite.damage = 5;
    }
}

export function createBug(x, y, isLarge) {
    let sprite;
    if (!isLarge) {
        sprite = scene.groups.bug.create(x, y, 'bugSmall');
        sprite.health = 1;
    } else {
        sprite = scene.groups.bug.create(x, y, 'bugLarge');
        sprite.health = 10;
    }
}