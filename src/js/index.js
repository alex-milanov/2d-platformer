'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

const keyboard = require('./util/keyboard');
const gamepad = require('./util/gamepad');
const time = require('./util/time');

// app
const app = require('./util/app');
let actions = app.adapt(require('./actions'));
let game = require('./game');
let actions$;
const state$ = new Rx.BehaviorSubject();

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(require('./actions'));
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./game", function() {
		game = require('./game');
		actions.stream.onNext(state => state);
	});
} else {
	actions$ = actions.stream;
}

// actions -> state
actions$
	// .map(action => (
	// 	action.path && console.log(action.path.join('.'), action.payload),
	// 	console.log(action),
	// 	action
	// ))
	.startWith(() => actions.initial)
	.scan((state, change) => change(state), {})
	.distinctUntilChanged(state => state)
	.map(state => (console.log(state), state))
	.subscribe(state => state$.onNext(state));

const pressedKeys$ = keyboard.watch(['left', 'right', 'up', 'down', 'shift']);

const getDirection = keys => keys.left && 'left' || keys.right && 'right' || false;
const getForce = keys => (keys.shift && 4 || 3) * ((keys.left || keys.right) ? 1 : 0);

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
		pads[0] && (pads[0].axes[0] < 0 && 'left' || pads[0].axes[0] > 0 && 'right') || false,
		pads[0] && pads[0].axes[0] !== 0 && 5 || 0
	));

const game$ = state$.map(state => game({actions, state}));

// game loop tick
time.frame().subscribe(actions.tick);

vdom.patchStream(game$, '#game');

// livereload impl.
if (module.hot) {
	document.write(`<script src="http://${(location.host || 'localhost').split(':')[0]}` +
	`:35729/livereload.js?snipver=1"></script>`);
}

// window.actions = actions;
