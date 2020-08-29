const assert = require('assert');
const { Markov } = require('../dist');

function eq(a, b) {
	assert(a === b, `${a} !== ${b}`);
}

let m = new Markov({
	delimiter: '',
	minOrder: 1,
	maxOrder: 1,
	source: 'abcd',
});
eq(m.randomSequence('a', 1), 'a');
eq(m.randomSequence('a', 2), 'ab');
eq(m.randomSequence('c', 2), 'cd');

m = new Markov({
	delimiter: ' ',
	minOrder: 1,
	maxOrder: 1,
	source: 'a b c d',
});
eq(m.randomSequence('a', 1), 'a');
eq(m.randomSequence('a', 2), 'a b');
eq(m.randomSequence('c', 2), 'c d');

m = new Markov({
	delimiter: '',
	minOrder: 1,
	maxOrder: 1,
	source: ['a1', 'a2', 'a3'],
});
eq(m.randomSequence('a', 1), 'a');
Math.random = () => 0;
eq(m.randomSequence('a', 2), 'a1');
Math.random = () => 0.34;
eq(m.randomSequence('a', 2), 'a2');
Math.random = () => 0.67;
eq(m.randomSequence('a', 2), 'a3');
