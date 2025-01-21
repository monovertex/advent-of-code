import '@prototype-extensions';

const ITERATION_COUNT = 2000;

const mix = (secret: bigint, value: bigint): bigint => value ^ secret;
const prune = (secret: bigint): bigint => secret % 16777216n;
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

function computePrices(secret: bigint): Map<string, number> {
    const priceMap = new Map<string, number>();

    for (
        let iteration = 0,
            currentSecret = secret,
            previousPrice = null,
            changeSequence = [];
        iteration < ITERATION_COUNT;
        iteration++, currentSecret = computeNextRandom(currentSecret)
    ) {
        const currentPrice = Number(currentSecret.toString().toArray().last());
        const currentChange = previousPrice === null ? null : currentPrice - previousPrice;
        changeSequence.push(currentChange);

        if (iteration >= 4) {
            changeSequence.shift();
            const identifier = changeSequence.join(',');
            if (!priceMap.has(identifier)) {
                priceMap.set(identifier, currentPrice);
            }
        }

        previousPrice = currentPrice;
    }

    return priceMap;
}

export function solvePart2(input: string): number {
    const totalPriceMap = new Map<string, number>();
    let bestPrice = 0;
    input.splitByNewLine().toBigInts()
        // Represents a list (for each input line) of maps where the last 4 changes for a price are
        // serialized and represent the key. Then the values of those maps are all the prices for that key.
        .map(computePrices)
        // Iterate over all the price keys and sum the prices every time one is encountered.
        // Keep track of the best price in the same iteration for optimization.
        .forEach((priceMap) => {
            priceMap.forEach((price, key) => {
                const totalPrice = (totalPriceMap.get(key) ?? 0) + price;
                totalPriceMap.set(key, totalPrice);
                if (totalPrice > bestPrice) bestPrice = totalPrice;
            });
        });

    return bestPrice;
}
