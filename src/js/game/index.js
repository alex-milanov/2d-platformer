
const {section} = require('iblokz-snabbdom-helpers');

module.exports = ({actions, state}) => section('#game', [].concat(
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
	section('#ground'),
	state.boxes.map(({left, bottom}) =>
		section('.box', {
			style: {
				left,
				bottom: bottom + 128
			}
		})
	)
));
