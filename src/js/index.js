'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const vdom = require('./util/vdom');

const keyboard = require('./util/keyboard');
const gamepad = require('./util/gamepad');
const time = require('./util/time');
const obj = require('./util/obj');

const actions = require('./actions');
const game = require('./game');

const switchFn = (value, options) => options[value] || options['default'] || false;

const pressedKeys$ = keyboard.watch(['left', 'right', 'up', 'down', 'shift']);

const getDirection = keys => keys.left && 'left' || keys.right && 'right' || false;
const getForce = keys => (keys.shift && 10 || 5) * ((keys.left || keys.right) ? 1 : 0);

const position$ = pressedKeys$
	// .filter(keys => keys.up || keys.down || keys.left || keys.right)
	.map(keys => (console.log('keys', keys), keys))
	.subscribe(keys => actions.move(getDirection(keys), getForce(keys)));

const jump$ = keyboard.on('space')
	.map(ev => (console.log(ev), ev))
	.subscribe(() => actions.jump());

// move
gamepad.changes()
	.map(pads => (console.log({pads}), pads))
	// .withLatestFrom(pressedKeys$, (pads, keys) => ({pads, keys}))
	.subscribe(pads => actions.move(
		pads[0].axes[0] < 0 && 'left' || pads[0].axes[0] > 0 && 'right' || false,
		pads[0].axes[0] !== 0 && 5 || 0
	));

const state$ = actions.stream
	.scan((state, reducer) => reducer(state), {})
	.distinctUntilChanged(state => state)
	.map(state => (console.log(state), state))
	.share();

const game$ = state$.map(game);

// game loop tick
time.frame().subscribe(actions.tick);

vdom.patchStream(game$, '#game');

window.actions = actions;
