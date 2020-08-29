(function (factory) {return factory(undefined, window);
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Markov = void 0;
    var Ngram = /** @class */ (function () {
        function Ngram(string, order) {
            this.occurrences = 0;
            this.next = {};
            this.thresholds = [];
            this.start = false;
            this.string = string;
            this.order = order;
        }
        Ngram.prototype.getNext = function () {
            var r = Math.random();
            var t;
            for (var i = 0; i < this.thresholds.length; ++i) {
                t = this.thresholds[i];
                if (r <= t.p) {
                    return t.next.next.string[t.next.next.string.length - 1];
                }
            }
            return '';
        };
        return Ngram;
    }());
    function sort(_a, _b) {
        var a = _a.p;
        var b = _b.p;
        return a - b;
    }
    var Markov = /** @class */ (function () {
        function Markov(options) {
            this.delimiter = options.delimiter || '';
            this.source = Array.isArray(options.source) ? options.source : [options.source];
            this.ngrams = {};
            this.minOrder = isNaN(options.minOrder) ? 2 : options.minOrder;
            this.maxOrder = isNaN(options.maxOrder) ? 4 : options.maxOrder;
            for (var source = 0; source < this.source.length; ++source) {
                var s = this.source[source].split(this.delimiter);
                for (var o = this.minOrder; o <= this.maxOrder; ++o) {
                    var prev = void 0;
                    for (var i = 0; i < s.length - o + 1; ++i) {
                        var w = s.slice(i, i + o);
                        var hash = w.join(this.delimiter);
                        var ngram = (this.ngrams[hash] = this.ngrams[hash] || new Ngram(w, o));
                        ngram.occurrences += 1;
                        if (i === 0) {
                            ngram.start = true;
                        }
                        if (prev) {
                            var c = ngram.string[ngram.string.length - 1];
                            var next = (prev.next[c] = prev.next[c] || {
                                next: ngram,
                                occurrences: 0,
                            });
                            next.occurrences += 1;
                        }
                        prev = ngram;
                    }
                }
            }
            for (var n in this.ngrams) {
                if (this.ngrams.hasOwnProperty(n)) {
                    var ngram = this.ngrams[n];
                    ngram.thresholds = [];
                    for (var i in ngram.next) {
                        if (ngram.next.hasOwnProperty(i)) {
                            var next = ngram.next[i];
                            ngram.thresholds.push({
                                next: next,
                                p: next.occurrences / ngram.occurrences,
                            });
                        }
                    }
                    ngram.thresholds.sort(sort);
                    var t = 0;
                    for (var i = 0; i < ngram.thresholds.length; ++i) {
                        t += ngram.thresholds[i].p;
                        ngram.thresholds[i].p = t;
                    }
                }
            }
            this.keys = Object.keys(this.ngrams);
            this.startKeys = [];
            for (var i = 0; i < this.keys.length; ++i) {
                var k = this.keys[i];
                if (this.ngrams[k].start === true) {
                    this.startKeys.push(k);
                }
            }
        }
        Markov.prototype.randomNgram = function () {
            return this.ngrams[this.keys[Math.floor(Math.random() * this.keys.length)]];
        };
        Markov.prototype.randomStartNgram = function () {
            return this.ngrams[this.startKeys[Math.floor(Math.random() * this.startKeys.length)]];
        };
        Markov.prototype.randomSequence = function (start, until) {
            if (until === void 0) { until = '\0'; }
            var s = start ? start.split(this.delimiter) : this.randomStartNgram().string;
            var n;
            var o;
            var orders = [];
            var hash;
            var wrappedUntil;
            if (typeof until === 'string') {
                wrappedUntil = Markov.until.bind(undefined, until);
            }
            else if (typeof until === 'number') {
                wrappedUntil = Markov.untilMaxLength.bind(undefined, this.delimiter, until);
            }
            else {
                wrappedUntil = until;
            }
            for (var i = this.minOrder; i <= this.maxOrder; ++i) {
                orders.push(i);
            }
            while (!wrappedUntil(s)) {
                var orderAttempts = orders.slice();
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
                var next = n.getNext();
                if (!next) {
                    console.warn('No next for ', n);
                    next = '\0';
                }
                s = s.concat(next);
            }
            return s.join(this.delimiter);
        };
        Markov.untilMaxLength = function (delimiter, maxLength, string) {
            return string.join(delimiter).length >= maxLength;
        };
        Markov.until = function (searchString, string) {
            var s = string[string.length - 1];
            var i = s.indexOf(searchString);
            if (i > -1) {
                string[string.length - 1] = s.substr(0, i + searchString.length);
                return true;
            }
            return false;
        };
        return Markov;
    }());
    exports.Markov = Markov;
});
//# sourceMappingURL=index.js.map