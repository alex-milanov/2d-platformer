'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const RxNode = require('rx-node');

const raf = require('raf-stream');

const keyDowns$ = $.fromEvent(document, 'keydown');
const keyUps$ = $.fromEvent(document, 'keyup');
const keyActions$ = $.merge(keyDowns$, keyUps$)
	.distinctUntilChanged(e => e.type + (e.key || e.which))
	.map(data => (console.log(data), data))
	.map(data => state =>
		Object.assign({}, state, {
			keys: (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(data.key) > -1)
				? (data.type === 'keyup')
					? state.keys.filter(key => key !== data.key)
					: state.keys.concat([data.key])
				: state.keys
		})
	);

const initialState$ = $.just(state => ({
	keys: []
}));

const state$ = $.merge(initialState$, keyActions$)
	.scan((state, reducer) => reducer(state), {})
	.map(state => (console.log(state), state));

const raf$ = RxNode.fromStream(raf())
	.filter(dt => dt !== 0);

const gameLoop$ = raf$.withLatestFrom(state$, (dt, state) => {
	let player = document.getElementById('player');
	if (state.keys.indexOf('ArrowLeft') > -1)
		player.style.left = (parseInt(player.style.left.replace('px', ''), 10) - 10) || 0;
	if (state.keys.indexOf('ArrowRight') > -1)
		player.style.left = (parseInt(player.style.left.replace('px', ''), 10) + 10) || 0;

	// console.log(player.style.left);
}).subscribe();

// raf().on('data', dt => console.log('difference in time is ' + dt + 'ms'));

// raf$.subscribe(dt => console.log('difference in time is ' + dt + 'ms'));
