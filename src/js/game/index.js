
const {section} = require('../util/vdom');

module.exports = state => section('#game', [
	section('#player', {
		style: {
			left: state.player.position.x,
			bottom: (128 + state.player.position.y)
		},
		class: {
			left: state.player.direction === 'left'
		}
	}),
	section('#ground')
]);
