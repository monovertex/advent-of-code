import '@prototype-extensions';

function priorityForCharacter(input: string): number {
    const code = input.charCodeAt(0);
    if (code >= 97) return code - 96;
    return code - 38;
}

export function solvePart1(input: string): any {
    return input
        .splitByNewLine()
        .map((rucksack) => [
            [...rucksack.slice(0, rucksack.length / 2)],
            [...rucksack.slice(rucksack.length / 2, rucksack.length)]
        ])
        .flatMap(([firstHalf, secondHalf]) => [...new Set(firstHalf.filter((character) => secondHalf.includes(character)))])
        .map(priorityForCharacter)
        .sum();
}

export function solvePart2(input: string): any {
    return input
        .splitByNewLine()
        .reduce((result: Array<Array<Array<string>>>, line: string, index: number) => {
            const groupIndex = Math.floor(index / 3);
            result[groupIndex] = result[groupIndex] || [];
            result[groupIndex].push([...line]);
            return result;
        }, [])
        .map(([firstSequence, ...otherSequences]) =>
            firstSequence.filter((character) =>
                otherSequences.every((sequence) => sequence.includes(character))))
        .flatMap((characters) => [...new Set(characters)])
        .map(priorityForCharacter)
        .sum();
}
