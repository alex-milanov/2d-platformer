'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const {obj} = require('iblokz-data');

// const switchFn = (value, options) => options[value] || options['default'] || false;

const initial = {
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
};

const move = (direction, force) =>
	state => obj.patch(state, 'player', {
		force,
		direction: direction || state.player.direction
	});

const jump = () => state => obj.patch(state, ['player', 'status'], 'jumping');

const tick = () =>
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
		status: obj.switch(state.player.status, {
			'jumping': (state.player.frame === 19) ? 'idle' : 'jumping',
			'default':
				state.player.force === 3
					? 'running'
					: state.player.force === 2
						? 'walking'
						: 'idle'
		}),
		frame: (state.player.status === 'jumping' && state.player.frame < 19)
			? state.player.frame + 1
			: 0
	});

module.exports = {
	initial,
	move,
	jump,
	tick
};
