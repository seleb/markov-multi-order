# `markov-multi-order`

Simple markov chain implementation supporting multiple orders of ngrams

```sh
npm i markov-multi-order
```

```ts
import { Markov } from 'markov-multi-order';

const markov = new Markov({
	delimeter: '', // how to split up strings for ngrams (e.g. '' for letters, ' ' for words)
	minOrder: 1, // minimum ngram order
	maxOrder: 2, // maximum ngram order
	source: ['123','abc'], // source used to generate ngrams
});

markov.randomSequence('a', 3); // generate string of length 3, starting with 'a'
markov.randomSequence('1', '3'); // generate string until the string '3' is reached, starting with '1'
markov.randomSequence(); // generate string until a natural end is reached, using a random start
```
