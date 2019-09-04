import {Player} from './player.js';
import {MusicManager} from './music/musicManager.js';
import {createNote} from './entities.js';
import {BugSpawner} from './bugSpawner.js';
import {setupMenu, destroyMenu} from './mainMenu.js';
import {writeJSON} from './music/writeJSON.js';
import {writeMIDI} from './music/writeMIDI.js';

export let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    title: 'Powerchord',
    parent: 'powerchord',
    version: '0.0',
    backgroundColor: 0x24142C,
    pixelArt: true,
    antialias: false,
    scene: {
        init: init,
        preload: preload,
        create: create,
        update: update
    },
    input: {
        keyboard: true,
        mouse: true,
        touch: true,
        gamepad: true,
        activePointers: 1
    },
    disableContextMenu: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
};

setupMenu();

export let powerchordConfig;
export let scene;

document.getElementById("start-game").onclick = function() {
    let bpm = document.getElementById('bpm').value;
    if (bpm < 80 || bpm > 220) {
        document.getElementById('notice').innerHTML = 'Please set a tempo between 80-220 BPM!';
    } else {
        powerchordConfig = destroyMenu();
        let game = new Phaser.Game(config);
    }
}

function init() {

    console.log('Initialized!');
}

function preload() {
    scene = this;

    console.log('Loading textures...');
    this.load.image('logo', '../assets/textures/branding/icon_20.png');
    this.load.image('player', '../assets/textures/game/player.png');
    this.load.image('playerPlaying', '../assets/textures/game/player_playing.png');
    this.load.image('playerDefeated', '../assets/textures/game/player_defeated.png');
    this.load.image('stage', '../assets/textures/game/stage.png');
    this.load.image('background', '../assets/textures/game/background.png');
    this.load.image('noteSmall', '../assets/textures/game/note_small.png');
    this.load.image('noteLarge', '../assets/textures/game/note_large.png');
    this.load.image('bugSmall', '../assets/textures/game/bug_small.png');
    this.load.image('bugLarge', '../assets/textures/game/bug_large.png');
    this.load.image('tape', '../assets/textures/game/tape.png');
    console.log('Loading in-game audios...');
    this.load.audio('gameOver', '../assets/audio/game_over.wav');
    console.log('Preloaded!');
}

function create() {

    this.bpm = powerchordConfig.bpm;
    this.key = powerchordConfig.key;
    this.rhythm = powerchordConfig.rhythm;

    this.cameras.main.setZoom(2);

    // avoid tabbing, which apparently breaks Phaser, as well as other annoying keys
    this.input.keyboard.addKey('TAB');
    this.input.keyboard.addKey('SPACE');
    this.input.keyboard.addKey('UP');
    this.input.keyboard.addKey('DOWN');

    // set the camera such that the origin is located at the top left corner of the camera (divide by 4 because the camera is zoomed in by a factor of 2)
    this.cameras.main.centerOn(config.width / 4, config.height / 4);

    // by my game dev convention, use a manifest of all entities to invoke listener functions on update
    this.manifest = {
        entities: [],
        addEntity: function(entity) {
            this.entities.push(entity);
        },
        updateAll: function() {
            for (let e of this.entities) {
                e.onUpdate();
            }
        }
    };

    // set up static sprites for the scene
    this.staticSprites = {
        background: scene.add.sprite(0, 0, 'background').setDisplayOrigin(0, 0),
        stage: scene.add.sprite(0, 300, 'stage').setDisplayOrigin(0, 50)
    };

    this.soundFX = {
        gameOver: scene.sound.add('gameOver')
    };

    this.texts = {};

    // set up groups
    this.groups = {
        note: this.physics.add.group(),
        bug: this.physics.add.group()
    };

    this.groups.note.speed = -5;
    this.groups.note.onUpdate = function() {
        let children = this.getChildren();
        for (let c of children) {
            c.y += this.speed;
        }
    };

    this.groups.bug.speed = 0.3;
    this.groups.bug.onUpdate = function() {
        let children = this.getChildren();
        for (let c of children) {
            c.y += this.speed;
            if (c.y >= 250) gameOver();
        }
    };

    this.player = new Player(0);
    this.manifest.addEntity(this.player);

    // add the groups to the manifest as well
    for (let k in this.groups) {
        this.manifest.addEntity(this.groups[k]);
    }

    this.musicManager = new MusicManager(this.bpm, this.key, this.rhythm);

    this.bugSpawner = new BugSpawner(this.bpm / 60 / 2, 0.005, 0.8, 0, 0.16, 0.2, 3);

    // collision listener
    this.physics.add.overlap(this.groups.note, this.groups.bug, onNoteHit);

    console.log('Created!');
}

function update() {
    this.manifest.updateAll();
}

function onNoteHit(note, bug) {
    bug.health -= note.damage;

    note.destroy();

    if (bug.health <= 0) {
        bug.destroy();
    }
}

function gameOver() {
    scene.groups.note.clear(true, true);
    scene.groups.bug.clear(true, true);
    scene.bugSpawner.setPaused(true);
    scene.musicManager.setPaused(true);
    scene.player.defeated = true;
    scene.soundFX.gameOver.play();
    gameOverScreen();
}

function gameOverScreen() {
    scene.texts.gameOver = scene.add.text(200, 30, 'Game Over!', { font: '42px Eneminds Bold' }).setAlign("center").setOrigin(0.5).setColor("#faffff");

    scene.staticSprites.tape = scene.add.sprite(200, 100, 'tape');

    scene.texts.listenOver = scene.add.text(200, 150, 'Listen to Recording', { font: '9px Eneminds Bold' }).setAlign("center").setOrigin(0.5).setColor("#faffff").setBackgroundColor("#ff417d").setPadding(4, 4, 4, 4).setInteractive(
        {
            useHandCursor: true
        }
    );
    scene.texts.listenOver.playing = false;

    scene.texts.listenOver.on('pointerup', function (pointer) {
        if (!this.playing) {
            this.playing = true;
            this.setText('Stop');
            scene.musicManager.setPausePlayback(false);
        } else {
            this.playing = false;
            this.setText('Listen to Recording');
            scene.musicManager.setPausePlayback(true);
        }
    });

    scene.texts.listenOver = scene.add.text(200, 180, 'Download Recording As MIDI (still buggy)', { font: '9px Eneminds Bold' }).setAlign("center").setOrigin(0.5).setColor("#faffff").setBackgroundColor("#ff417d").setPadding(4, 4, 4, 4).setInteractive(
        {
            useHandCursor: true
        }
    );

    scene.texts.listenOver.playing = false;

    scene.texts.listenOver.on('pointerup', function (pointer) {
        writeMIDI();
    });

    scene.texts.listenOver = scene.add.text(200, 210, 'Download Recording As JSON', { font: '9px Eneminds Bold' }).setAlign("center").setOrigin(0.5).setColor("#faffff").setBackgroundColor("#ff417d").setPadding(4, 4, 4, 4).setInteractive(
        {
            useHandCursor: true
        }
    );

    scene.texts.listenOver.playing = false;

    scene.texts.listenOver.on('pointerup', function (pointer) {
        writeJSON();
    });

    scene.texts.listenOver = scene.add.text(200, 240, 'Restart', { font: '9px Eneminds Bold' }).setAlign("center").setOrigin(0.5).setColor("#faffff").setBackgroundColor("#ff417d").setPadding(4, 4, 4, 4).setInteractive(
        {
            useHandCursor: true
        }
    );

    scene.texts.listenOver.playing = false;

    scene.texts.listenOver.on('pointerup', function (pointer) {
        location.reload();
    });
}