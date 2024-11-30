import '../../prototype-extensions';

function parseInput(input: string): [Array<Array<string>>, Array<Array<number>>] {
    const [inputStacks, rawMoves] = input.splitByDoubleNewLine();

    const stacks = inputStacks
        .splitByNewLine()
        .reverse()
        .slice(1)
        .map((line) => line
            .match(/.{1,4}/g)!
            .map((string) => string.trim().replace('[', '').replace(']', ''))
        )
        .reduce((stacks: Array<Array<string>>, stackRow: Array<string>) => {
            stackRow.forEach((stack, index) => {
                if (!stack) return;
                stacks[index] = stacks[index] || [];
                stacks[index].push(stack)
            });
            return stacks;
        }, []);

    const moves = rawMoves
        .splitByNewLine()
        .map((move) => /move (\d+) from (\d+) to (\d+)/.exec(move)!.slice(1).toNumbers())
        .map(([count, from, to]) => [count, from - 1, to - 1]);

    return [stacks, moves];
}

function simulateCrane(
    stacks: Array<Array<string>>,
    moves: Array<Array<number>>,
    oneByOne: boolean = true
): Array<Array<string>> {
    moves.forEach(([count, from, to]) => {
        const movedCrates = stacks[from].splice(-count);
        if (oneByOne) movedCrates.reverse();
        stacks[to] = stacks[to].concat(movedCrates);
    });
    return stacks;
}

function extractTopCrates(stacks: Array<Array<string>>): string {
    return stacks.map((stack) => stack.pop()).join('');
}

export function solvePart1(input: string): any {
    return extractTopCrates(simulateCrane(...parseInput(input), true));
}

export function solvePart2(input: string): any {
    return extractTopCrates(simulateCrane(...parseInput(input), false));
}
