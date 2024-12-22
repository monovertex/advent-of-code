import { memoize } from '../../common';
import '../../prototype-extensions';

const ITERATION_COUNT = 2000;

const mix = memoize(
    (secret: bigint, value: bigint): bigint => value ^ secret,
    (secret: bigint, value: bigint) => `${secret}-${value}`
);
const prune = memoize(
    (secret: bigint): bigint => secret % 16777216n,
    (secret: bigint) => secret.toString()
);

function computeNextRandom(secret: bigint): bigint {
    const step1 = prune(mix(secret, secret * 64n));
    const step2 = prune(mix(step1, BigInt(Math.floor(Number(step1 / 32n)))));
    return prune(mix(step2, step2 * 2048n));
}

function computeRandomFromSeed(secret: bigint): bigint {
    let currentSecret = secret;
    for (let iteration = 0; iteration < ITERATION_COUNT; iteration++) {
        currentSecret = computeNextRandom(currentSecret);
    }
    return currentSecret;
}

export function solvePart1(input: string): bigint {
    return input
        .splitByNewLine()
        .toBigInts()
        .map(computeRandomFromSeed)
        .sum()
}

function computeBestPricesPerChange(secret: bigint): Map<string, number> {
    let prices: number[] = [];
    let currentSecret: bigint = secret;
    for (let iteration = 0; iteration < ITERATION_COUNT; iteration++) {
        prices.push(Number(currentSecret.toString().toArray().last()));
        currentSecret = computeNextRandom(currentSecret);
    }
    const changes: (number | null)[] = prices.map((price, index) => index > 0 ? price - prices[index - 1] : null);
    const changesAndPrices: [number, string | null][] = prices.map((price, index) => [
        price,
        index >= 4 ? changes.slice(index - 3, index + 1).join(',') : null
    ]);
    const changesAndFirstPrice = changesAndPrices
        .groupBy(([_, identifier]) => identifier)
        .mapValues((_identifier, pricesAndChanges) =>
            pricesAndChanges.map(([price]) => price).first());
    changesAndFirstPrice.delete(null);
    return changesAndFirstPrice;
}

export function solvePart2(input: string): number {
    // Represents a list (for each input line) of maps where the last 4 changes for a price are
    // serialized and represent the key. Then the values of those maps are all the prices for that key.
    const changesAndFirstPricePerSecret: Map<string, number>[] = input
        .splitByNewLine()
        .toBigInts()
        .map(computeBestPricesPerChange);

    // Unique list of identifiers (serialized sets of 4 changes).
    const allIdentifiers = new Set(changesAndFirstPricePerSecret
        .flatMap((pricesAndChanges) => pricesAndChanges.keysArray()));

    // For each identifier, sum the best prices.
    const bestPriceForIdentifiers = allIdentifiers
        .valuesArray()
        .map((identifier) => changesAndFirstPricePerSecret
            .map((changesAndFirstPrice) => changesAndFirstPrice.get(identifier) ?? 0)
            .sum());

    // We can now determine the best price we can obtain.
    return bestPriceForIdentifiers.max();
}
