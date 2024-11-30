interface Array<T> {
    findLastIndex(predicate: Function): number;
    reject(predicate: Function): Array<T>;
    without(...items: Array<T>): Array<T>;
    countBy(predicate: (item: T, index: number) => boolean): number;
    sum(): number;
    multiply(): number;
    max(): number;
    min(): number;
    toNumbers(): Array<number>;
    toBigInts(): Array<bigint>;
    toStrings(): Array<string>;
    zip(...arrays: any[]): Array<any>;
    unzip(): Array<Array<any>>;
    unique(): Array<T>;
    uniqueBy(predicate: (item: T) => any): Array<T>;
    countUniques(): Map<T, number>;
    groupBy(predicate: (item: T) => any): Map<any, Array<T>>;
    replaceAt(index: number, newItem: T): Array<T>;
    onlyNumbers(): Array<number>;
    first(): T;
    last(): T;
    rest(): Array<T>;
}

Array.prototype.findLastIndex = function (predicate) {
    for (let i = this.length - 1; i >= 0; i--) {
        if (predicate(this[i])) return i;
    }
    return -1;
}

Array.prototype.reject = function (predicate) {
    return this.filter((item) => !predicate(item));
}

Array.prototype.without = function (...items) {
    return this.filter((item) => !items.includes(item));
}

Array.prototype.countBy = function (predicate) {
    return this.filter(predicate).length;
}

Array.prototype.sum = function () {
    const usesBigInt = this.some((item) => typeof item === 'bigint');
    return this.reduce((total, item) => total + item, usesBigInt ? BigInt(0) : 0);
}

Array.prototype.multiply = function () {
    return this.reduce((total, item) => total * item, 1);
}

Array.prototype.max = function () {
    return Math.max(...this);
}

Array.prototype.min = function () {
    return Math.min(...this);
}

Array.prototype.toNumbers = function () {
    return this.map((item) => Number(item));
}

Array.prototype.toBigInts = function () {
    return this.map((item) => BigInt(item));
}

Array.prototype.toStrings = function () {
    return this.map((item) => String(item));
}

Array.prototype.zip = function (...arrays) {
    return this.map((item, index) => [item, ...arrays.map((array) => array[index])]);
}

Array.prototype.unzip = function () {
    return this.reduce((unzipped, item) => {
        item.forEach((value: any, index: number) => {
            if (!unzipped[index]) unzipped[index] = [];
            unzipped[index].push(value);
        });
        return unzipped;
    }, []);
}

Array.prototype.unique = function () {
    return [...new Set(this)];
}

Array.prototype.replaceAt = function (index, newItem) {
    this.splice(index, 1, newItem);
    return this;
}

Array.prototype.uniqueBy = function (predicate = (item) => item) {
    const uniqueRepresentations = new Set();
    return this.filter((item) => {
        const representation = predicate(item);
        if (uniqueRepresentations.has(representation)) return false;
        uniqueRepresentations.add(representation);
        return true;
    });
}

Array.prototype.countUniques = function () {
    return this.reduce((counts, item) => {
        counts.set(item, (counts.get(item) || 0) + 1);
        return counts;
    }, new Map());
}

Array.prototype.groupBy = function (predicate) {
    return this.reduce((accumulator, item) => {
        const key = predicate(item);
        if (!accumulator.has(key)) accumulator.set(key, []);
        accumulator.get(key)!.push(item);
    }, new Map());
}

Array.prototype.onlyNumbers = function () {
    return this.filter((item) => typeof item === 'number');
}

Array.prototype.first = function () {
    return this[0];
}

Array.prototype.last = function () {
    return this[this.length - 1];
}

Array.prototype.rest = function () {
    return this.slice(1);
}

interface String {
    splitByNewLine(): string[];
    splitByDoubleNewLine(): string[];
    splitByComma(): string[];
    splitByWhitespace(): string[];
    toArray(): string[];
    toNumbers(): number[];
    getMatches(regex: RegExp): string[];
    reverse(): string;
    replaceAt(index: number, newItem: string): string;
}

String.prototype.splitByNewLine = function () {
    return this.split(/\n/);
}

String.prototype.splitByDoubleNewLine = function () {
    return this.split(/\n\n/);
}

String.prototype.splitByComma = function () {
    return this.split(/, ?/);
}

String.prototype.splitByWhitespace = function () {
    return this.trim().split(/\s+/);
}

String.prototype.toArray = function () {
    return this.split('');
}

String.prototype.toNumbers = function () {
    return this.toArray().toNumbers();
}

String.prototype.getMatches = function (regex: RegExp): string[] {
    return this.match(regex)!.slice(1);
}

String.prototype.reverse = function () {
    return this.split('').reverse().join('');
}

String.prototype.replaceAt = function (index, newItem) {
    return this.toArray().replaceAt(index, newItem).join('');
}

interface Map<K, V> {
    filter(predicate: (key: K, value: V) => boolean): Map<K, V>;
    valuesArray(): V[];
    keysArray(): K[];
    entriesArray(): [K, V][];
}

Map.prototype.filter = function (predicate) {
    return new Map([...this.entries()].filter(([key, value]) => predicate(key, value)));
}

Map.prototype.valuesArray = function () {
    return [...this.values()];
}

Map.prototype.keysArray = function () {
    return [...this.keys()];
}

Map.prototype.entriesArray = function () {
    return [...this.entries()];
}

interface Set<T> {
    valuesArray(): T[];
}

Set.prototype.valuesArray = function () {
    return [...this.values()];
}

interface Number {
    isEven(): boolean;
}

Number.prototype.isEven = function () {
    return (this as number) % 2 === 0;
}

interface Math {
    sign(value: number | bigint): number;
}

Math.sign = function (value: number | bigint) {
    return value > 0n ? 1 : value < 0n ? -1 : 0;
}

interface Object {
    mapValues(callback: Function): Object;
    mapEntries<T>(callback: Function): Array<T>;
}

Object.prototype.mapValues = function (callback) {
    return Object.fromEntries(Object.entries(this).map(([key, value]) => [key, callback(value, key)]));
}

Object.prototype.mapEntries = function<T> (callback: (entry: [string, any]) => T) {
    return Object.entries(this).map(callback) as Array<T>;
}