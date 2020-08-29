type Next = {
	next: Ngram;
	occurrences: number;
};

class Ngram {
	string: string[];
	order: number;
	occurrences: number = 0;
	next: Record<string, Next> = {};
	thresholds: {
		next: Next;
		p: number;
	}[] = [];
	start = false;

	constructor(string: string[], order: number) {
		this.string = string;
		this.order = order;
	}

	getNext() {
		const r = Math.random();
		let t;
		for (let i = 0; i < this.thresholds.length; ++i) {
			t = this.thresholds[i];
			if (r <= t.p) {
				return t.next.next.string[t.next.next.string.length - 1];
			}
		}
		return '';
	}
}

function sort({ p: a }: { p: number }, { p: b }: { p: number }) {
	return a - b;
}

export class Markov {
	delimiter: string;
	source: string[];
	ngrams: Record<string, Ngram>;
	minOrder: number;
	maxOrder: number;
	keys: string[];
	startKeys: string[];
	constructor(options: {
		delimiter: string;
		source: string | string[];
		minOrder: number;
		maxOrder: number;
	}) {
		this.delimiter = options.delimiter || '';
		this.source = Array.isArray(options.source)
			? options.source
			: [options.source];
		this.ngrams = {};
		this.minOrder = isNaN(options.minOrder) ? 2 : options.minOrder;
		this.maxOrder = isNaN(options.maxOrder) ? 4 : options.maxOrder;

		for (let source = 0; source < this.source.length; ++source) {
			const s = this.source[source].split(this.delimiter);
			for (let o = this.minOrder; o <= this.maxOrder; ++o) {
				let prev;
				for (let i = 0; i < s.length - o + 1; ++i) {
					const w = s.slice(i, i + o);
					const hash = w.join(this.delimiter);
					const ngram = (this.ngrams[hash] =
						this.ngrams[hash] || new Ngram(w, o));
					ngram.occurrences += 1;
					if (i === 0) {
						ngram.start = true;
					}

					if (prev) {
						const c = ngram.string[ngram.string.length - 1];
						const next = (prev.next[c] = prev.next[c] || {
							next: ngram,
							occurrences: 0
						});
						next.occurrences += 1;
					}

					prev = ngram;
				}
			}
		}

		for (const n in this.ngrams) {
			if (this.ngrams.hasOwnProperty(n)) {
				const ngram = this.ngrams[n];
				ngram.thresholds = [];
				for (const i in ngram.next) {
					if (ngram.next.hasOwnProperty(i)) {
						const next = ngram.next[i];
						ngram.thresholds.push({
							next: next,
							p: next.occurrences / ngram.occurrences
						});
					}
				}
				ngram.thresholds.sort(sort);
				let t = 0;
				for (let i = 0; i < ngram.thresholds.length; ++i) {
					t += ngram.thresholds[i].p;
					ngram.thresholds[i].p = t;
				}
			}
		}
		this.keys = Object.keys(this.ngrams);
		this.startKeys = [];
		for (let i = 0; i < this.keys.length; ++i) {
			const k = this.keys[i];
			if (this.ngrams[k].start === true) {
				this.startKeys.push(k);
			}
		}
	}

	randomNgram() {
		return this.ngrams[this.keys[Math.floor(Math.random() * this.keys.length)]];
	}

	randomStartNgram() {
		return this.ngrams[
			this.startKeys[Math.floor(Math.random() * this.startKeys.length)]
		];
	}

	randomSequence(start: string, until :(() => boolean) | number | string = '\0') {
		let s = start
			? start.split(this.delimiter)
			: this.randomStartNgram().string;
		let n;
		let o;
		const orders = [];
		let hash;

		let wrappedUntil;
		if (typeof until === 'string') {
			wrappedUntil = Markov.until.bind(undefined, until);
		} else if (typeof until === 'number') {
			wrappedUntil = Markov.untilMaxLength.bind(
				undefined,
				this.delimiter,
				until
			);
		} else {
			wrappedUntil = until;
		}

		for (let i = this.minOrder; i <= this.maxOrder; ++i) {
			orders.push(i);
		}
		while (!wrappedUntil(s)) {
			const orderAttempts = orders.slice();
			do {
				o = Math.floor(Math.random() * orderAttempts.length);
				o = orderAttempts.splice(o, 1)[0];
				hash = s.slice(-o);
				n = this.ngrams[hash.join(this.delimiter)];
			} while (!n && orderAttempts.length > 0);

			if (!n) {
				console.warn('No ngram for', s.slice(-this.maxOrder));
				n = this.randomNgram();
			}

			let next = n.getNext();
			if (!next) {
				console.warn('No next for ', n);
				next = '\0';
			}
			s = s.concat(next);
		}
		return s.join(this.delimiter);
	}

	static untilMaxLength(
		delimiter: string,
		maxLength: number,
		string: string[]
	) {
		return string.join(delimiter).length >= maxLength;
	}

	static until(searchString: string, string: string[]) {
		const s = string[string.length - 1];
		const i = s.indexOf(searchString);
		if (i > -1) {
			string[string.length - 1] = s.substr(0, i + searchString.length);
			return true;
		}
		return false;
	}
}
