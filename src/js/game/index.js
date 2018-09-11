
const {section} = require('iblokz-snabbdom-helpers');

module.exports = ({actions, state}) => section('#game', [
	section('#player', {
		style: {
			left: state.player.position.x,
			bottom: (128 + state.player.position.y)
		},
		class: {
			left: state.player.direction === 'left',
			[state.player.status]: state.player.status
		}
	}),
	section('#ground')
]);
