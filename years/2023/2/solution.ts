import '@prototype-extensions';

interface GameRoundData {
    red: number | undefined;
    blue: number | undefined;
    green: number | undefined;
}

class GameRound {
    red: number;
    blue: number;
    green: number;

    constructor(counts: GameRoundData) {
        this.red = counts.red || 0;
        this.blue = counts.blue || 0;
        this.green = counts.green || 0;
    }

    fitsConstraints(counts: { red: number, blue: number, green: number }): boolean {
        return this.red <= counts.red && this.blue <= counts.blue && this.green <= counts.green;
    }
}

class Game {
    id: number;
    rounds: GameRound[];

    constructor(id: number, rounds: GameRound[]) {
        this.id = id;
        this.rounds = rounds;
    }

    fitsConstraints(counts: { red: number, blue: number, green: number }): boolean {
        return this.rounds.every((round) => round.fitsConstraints(counts));
    }

    computeMinimumCounts(): GameRoundData {
        return this.rounds.reduce((result, round) => {
            return {
                red: Math.max(result.red || 0, round.red),
                blue: Math.max(result.blue || 0, round.blue),
                green: Math.max(result.green || 0, round.green)
            };
        }, {} as GameRoundData);
    }
}

function parseInput(input: string): Game[] {
    return input.splitByNewLine().map((line) => {
        const [gameIdFragment, gameInfoFragment] = line.split(': ');
        const gameId = Number(gameIdFragment.split(' ')[1]);
        const rounds = gameInfoFragment.split('; ').map((round) => {
            const roundCounts = round.splitByComma().reduce((result, fragment) => {
                const [count, color] = fragment.split(' ');
                return Object.assign(result, { [color]: Number(count) });
            }, {} as GameRoundData);
            return new GameRound(roundCounts);
        });
        return new Game(gameId, rounds);
    });
}

export function solvePart1(input: string): any {
    return parseInput(input)
        .filter((game) => game.fitsConstraints({ red: 12, green: 13, blue: 14 }))
        .map((game) => game.id)
        .sum();
}

export function solvePart2(input: string): any {
    return parseInput(input)
        .map((game) => game.computeMinimumCounts())
        .map((data: GameRoundData) => (data.blue || 0) * (data.green || 0) * (data.red || 0))
        .sum();
}
