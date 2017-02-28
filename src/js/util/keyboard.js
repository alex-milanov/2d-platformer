'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const obj = require('../util/obj');

const keyDown$ = $.fromEvent(document, 'keydown');
const keyUp$ = $.fromEvent(document, 'keyup');
const keyAction$ = $.merge(keyDown$, keyUp$).map(ev => (console.log(ev), ev));

const keyAliases = {
	'ArrowUp': 'up',
	'ArrowDown': 'down',
	'ArrowLeft': 'left',
	'ArrowRight': 'right',
	' ': 'space',
	'Shift': 'shift'
};

const charCodes = {

};

const parseKey = ev => keyAliases[ev.key] || charCodes[ev.keyCode] || ev.key;

const watch = keyList => keyAction$
	.distinctUntilChanged(ev => ev.type + (ev.key || ev.which))
	.map(ev => ({type: ev.type, key: parseKey(ev)}))
	.filter(ev => keyList.indexOf(ev.key) > -1)
	.scan((keys, ev) => obj.patch(keys, ev.key, (ev.type === 'keydown')), {})
	.share();

const on = key => keyDown$.filter(ev => parseKey(ev) === key);

module.exports = {
	watch,
	on
};
