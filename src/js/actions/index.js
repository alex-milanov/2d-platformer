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
		},
		{
			left: 1024,
			bottom: 320
		}
	]
};

const move = (direction, force) =>
	state => obj.patch(state, 'player', {
		force,
		direction: direction || state.player.direction
	});

const jump = () => state => obj.patch(state, ['player', 'status'],
	['jumping', 'falling'].indexOf(state.player.status) === -1
		? 'jumping'
		: state.player.status
);

const collides = (oldPos, newPos, obstacles) =>
	obstacles.reduce(
		(isColliding, obst) => ({
			x: isColliding.x
				|| (!((oldPos.y + 64) <= obst.bottom || oldPos.y >= (obst.bottom + 64))
					&& (
						!((newPos.x + 64) <= obst.left) && oldPos.x <= (obst.left - 63) && (obst.left - 64)
						|| !(newPos.x >= (obst.left + 64)) && oldPos.x >= (obst.left + 63) && obst.left + 64
					)
				),
			y: isColliding.y
				|| (!((oldPos.x + 64) <= obst.left || oldPos.x >= (obst.left + 64))
					&& (
						!((newPos.y + 64) <= obst.bottom) && oldPos.y <= (obst.bottom - 63) && (obst.bottom - 64)
						|| !(newPos.y >= (obst.bottom + 64)) && oldPos.y >= (obst.bottom + 63) && (obst.bottom + 64)
					)
				)
		}),
		{x: false, y: false}
	);

const calculatePos = player => ({
	x: player.position.x + player.force *
		((player.direction === 'right') ? 1 : -1),
	y: player.position.y + ((player.status === 'jumping')
		? 12
		: player.status === 'falling' || player.position.y - 16 > 0
			? -16
			: -player.position.y
		)
});

const tick = () =>
	state => obj.patch(state, 'player',
		fn.pipe(
			() => calculatePos(state.player),
			newPos => ({
				newPos,
				collides: collides(state.player.position, newPos, state.boxes)
			}),
			// data => ((data.collides.x || data.collides.y) && console.log(data), data),
			({newPos, collides}) => ({
				position: {
					x: collides.x || newPos.x,
					y: collides.y || newPos.y
				},
				status: obj.switch(state.player.status, {
					'jumping': (collides.y || state.player.frame === 16 || newPos.y < state.player.position.y)
						? collides.y && collides.y < state.player.position.y
							? 'idle'
							: 'falling'
						: 'jumping',
					'falling': collides.y || newPos.y <= 0 ? 'idle' : 'falling',
					'default':
						state.player.force === 4
							? 'running'
							: state.player.force === 3
								? 'walking'
								: 'idle'
				}),
				frame: (state.player.status === 'jumping' && state.player.frame < 16 && !(collides.y))
					? state.player.frame + 1
					: 0
			})
		)()
	);

module.exports = {
	initial,
	move,
	jump,
	tick
};
