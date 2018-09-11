'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const {obj, fn} = require('iblokz-data');

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
	},
	boxes: [
		{
			left: 512,
			bottom: 64
		},
		{
			left: 576,
			bottom: 128
		},
		{
			left: 640,
			bottom: 192
		},
		{
			left: 768,
			bottom: 192
		},
		{
			left: 896,
			bottom: 192
		}
	]
};

const move = (direction, force) =>
	state => obj.patch(state, 'player', {
		force,
		direction: direction || state.player.direction
	});

const jump = () => state => obj.patch(state, ['player', 'status'], 'jumping');

const collides = (oldPos, newPos, obstacles) =>
	obstacles.reduce(
		(isColliding, obst) => ({
			x: isColliding.x
				|| (!((oldPos.y + 64) <= obst.bottom || oldPos.y >= (obst.bottom + 64))
					&& (
						!((newPos.x + 64) <= obst.left) && oldPos.x <= (obst.left - 64) && (obst.left - 65)
						|| !(newPos.x >= (obst.left + 64)) && oldPos.x >= (obst.left + 64) && obst.left + 65
					)
				),
			y: isColliding.y
				|| (!((oldPos.x + 64) <= obst.left || oldPos.x >= (obst.left + 64))
					&& (
						!((newPos.y + 64) <= obst.bottom) && oldPos.y <= (obst.bottom - 64) && (obst.bottom - 65)
						|| !(newPos.y >= (obst.bottom + 64)) && oldPos.y >= (obst.bottom + 64) && (obst.bottom + 65)
					)
				)
		}),
		{x: false, y: false}
	);

const calculatePos = player => ({
	x: player.position.x + player.force *
		((player.direction === 'right') ? 1 : -1),
	y: player.position.y + ((player.status === 'jumping')
		? 14
		: player.position.y - 16 > 0 ? -16 : -player.position.y)
});

const tick = () =>
	state => obj.patch(state, 'player', {
		position: fn.pipe(
			() => calculatePos(state.player),
			newPos => ({
				newPos,
				collides: collides(state.player.position, newPos, state.boxes)
			}),
			// data => ((data.collides.x || data.collides.y) && console.log(data), data),
			({newPos, collides}) => ({
				x: collides.x || newPos.x,
				y: collides.y || newPos.y
			})
		)(),
		status: obj.switch(state.player.status, {
			'jumping': (state.player.frame === 14) ? 'idle' : 'jumping',
			'default':
				state.player.force === 4
					? 'running'
					: state.player.force === 3
						? 'walking'
						: 'idle'
		}),
		frame: (state.player.status === 'jumping' && state.player.frame < 14)
			? state.player.frame + 1
			: 0
	});

module.exports = {
	initial,
	move,
	jump,
	tick
};
