'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const obj = require('../util/obj');

const switchFn = (value, options) => options[value] || options['default'] || false;

const stream = new Rx.Subject();

const init = () => stream.onNext(
	state => ({
		player: {
			position: {
				x: 0,
				y: 0
			},
			direction: 'right',
			status: 'idle',
			frame: 0,
			force: 0
		}
	})
);

const move = (direction, force) => stream.onNext(
	state => obj.patch(state, 'player', {
		force,
		direction: direction || state.player.direction
	})
);

const jump = () => stream.onNext(state => obj.patch(state, ['player', 'status'], 'jumping'));

const tick = () => stream.onNext(
	state => obj.patch(state, 'player', {
		position: {
			x: state.player.position.x + state.player.force *
				((state.player.direction === 'right') ? 1 : -1),
			y: state.player.position.y + ((state.player.status === 'jumping')
				? (state.player.frame < 10)
					? 10
					: -10
				: 0)
		},
		status: switchFn(state.player.status, {
			'jumping': (state.player.frame === 19) ? 'idle' : 'jumping',
			'default': 'idle'
		}),
		frame: (state.player.status === 'jumping' && state.player.frame < 19)
			? state.player.frame + 1
			: 0
	})
);

module.exports = {
	stream,
	init,
	move,
	jump,
	tick
};
