import '../../prototype-extensions';

const SCORE_MAP: Map<string, number> = new Map([
    ['A', 1],
    ['X', 1],
    ['B', 2],
    ['Y', 2],
    ['C', 3],
    ['Z', 3],
]);

function losingMove(move: number): number {
    switch(move) {
        case 1: return 3;
        case 2: return 1;
        case 3: return 2;
    }
    throw new Error('Invalid move');
}

function winningMove (move: number): number {
    switch(move) {
        case 1: return 2;
        case 2: return 3;
        case 3: return 1;
    }
    throw new Error('Invalid move');
}

function roundOutcomeFromMoves(opponentMove: number, myMove: number): number {
    if (opponentMove === myMove) return 3 + myMove;
    if (opponentMove === losingMove(myMove)) return 6 + myMove;
    return myMove;
}

function roundOutcomeFromExpectedResult(opponentMove: number, output: number): number {
    switch(output) {
        case 1: return losingMove(opponentMove);
        case 2: return 3 + opponentMove;
        case 3: return 6 + winningMove(opponentMove);
    }
    throw new Error('Invalid move');
}

function computeScore(input: string, computeRoundScore: Function): number {
    return input
        .splitByNewLine()
        .map((round) => round.split(' ').map((symbol) => SCORE_MAP.get(symbol)))
        .map(([opponentMove, myMove]) => computeRoundScore(opponentMove, myMove))
        .sum();
}

export function solvePart1(input: string): any {
    return computeScore(input, roundOutcomeFromMoves);
}

export function solvePart2(input: string): any {
    return computeScore(input, roundOutcomeFromExpectedResult);
}
