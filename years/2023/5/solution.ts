import '../../prototype-extensions';

interface Range {
    start: number,
    end: number
}

function isRangeValid(range: Range): boolean {
    return range.start < range.end;
}

function processSeedRange(seed: Range, [destinationRange, sourceRange]: [Range, Range]) {
    if (seed.end <= sourceRange.start || seed.start >= sourceRange.end)
        return { updatedRanges: [], pristineRanges: [seed] };

    const pristineRanges: Range[] = [
        { start: seed.start, end: sourceRange.start },
        { start: sourceRange.end, end: seed.end }
    ].filter(isRangeValid);

    const shift = destinationRange.start - sourceRange.start;
    const updatedRanges: Range[] = [
        { start: Math.max(sourceRange.start, seed.start) + shift, end: Math.min(sourceRange.end, seed.end) + shift }
    ].filter(isRangeValid);

    return { updatedRanges, pristineRanges };
}

function parseSeeds(input: string, individualSeeds: boolean): Range[] {
    const seeds = input.split(': ')[1].split(' ').toNumbers();

    if (individualSeeds) {
        return seeds.map((seed) => ({ start: seed, end: seed + 1 }) as Range);
    }

    return seeds.reduce((result, seed, seedIndex) => {
        if (seedIndex % 2 === 0) result.push({ start: seed, end: seed + seeds[seedIndex + 1] });
        return result;
    }, [] as Range[]);
}

function parseInput(input: string, individualSeeds: boolean) {
    const [seedsInput, ...mapsInput] = input.splitByDoubleNewLine();
    const seeds: Range[] = parseSeeds(seedsInput, individualSeeds);
    const maps: [Range, Range][][] = mapsInput.map((mapInput) => {
        const [, ...mappings] = mapInput.splitByNewLine();
        return mappings
            .map((mapping) => mapping.split(' ').toNumbers())
            .map(([destinationRangeStart, sourceRangeStart, rangeLength]) => [
                { start: destinationRangeStart, end: destinationRangeStart + rangeLength },
                { start: sourceRangeStart, end: sourceRangeStart + rangeLength }
            ]) as [Range, Range][];
    });
    return { seeds, maps };
}

function applyMapToSeeds(seeds: Range[], map: [Range, Range][]) {
    let rangesToProcess = seeds;
    const resultRanges = [];

    while (rangesToProcess.length > 0) {
        const rangeToProcess = rangesToProcess.shift()!;
        let mappingFound = false;

        for (const mapping of map) {
            const { updatedRanges, pristineRanges } = processSeedRange(rangeToProcess, mapping);
            if (updatedRanges.length === 0) continue;

            rangesToProcess.push(...pristineRanges);
            resultRanges.push(...updatedRanges);
            mappingFound = true;
            break;
        }

        if (!mappingFound) resultRanges.push(rangeToProcess);
    }

    return resultRanges;
}

function solve(seeds: Range[], maps: [Range, Range][][]) {
    let currentRanges = seeds;
    for (const map of maps) {
        currentRanges = applyMapToSeeds(currentRanges, map);
    }
    return currentRanges.map(({ start }) => start).min();
}

export function solvePart1(input: string): any {
    const { seeds, maps } = parseInput(input, true);
    return solve(seeds, maps);
}

export function solvePart2(input: string): any {
    const { seeds, maps } = parseInput(input, false);
    return solve(seeds, maps);
}
