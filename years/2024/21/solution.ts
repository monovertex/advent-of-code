import { Matrix, memoize, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTIONS_2D_LIST, Point2D } from '../../common';
import '../../prototype-extensions';

type PathsMap = Map<string, Map<string, string[][]>>;

const DIRECTION_SYMBOL_MAP = new Map<ORTHOGONAL_DIRECTIONS, string>([
    [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, '^'],
    [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, 'v'],
    [ORTHOGONAL_DIRECTIONS.X_NEGATIVE, '<'],
    [ORTHOGONAL_DIRECTIONS.X_POSITIVE, '>']
]);

function filterShortestItems(input: any[]): any[] {
    const shortestLength = input.map((item) => item.length).uniqueBy((length) => length).min();
    return input.filter((item) => item.length === shortestLength);
}

//#region Precompute paths

function getShortestPaths(keypad: Matrix<string>, startPoint: Point2D, endPoint: Point2D): string[][] {
    if (startPoint.equals(endPoint)) return [['A']];

    const results: ORTHOGONAL_DIRECTIONS[][] = [];
    const queue: { point: Point2D, directions: ORTHOGONAL_DIRECTIONS[] }[] = [{ point: startPoint, directions: [] }];
    let bestDistance = Infinity;

    while (queue.isNotEmpty()) {
        const { point, directions } = queue.shift()!;

        // The search frontier is now beyond our optimal path distance.
        if (bestDistance < directions.length) break;

        if (point.equals(endPoint)) {
            bestDistance = directions.length;
            results.push(directions);
            continue;
        }

        for (const direction of ORTHOGONAL_DIRECTIONS_2D_LIST) {
            const neighborPoint = point.getOrthogonalNeighbor(direction);
            if (!keypad.isPointInBounds(neighborPoint)) continue;
            const neighborValue = keypad.getValue(neighborPoint);
            if (neighborValue === ' ') continue;
            const newDirections = [...directions, direction];
            queue.push({ point: neighborPoint, directions: newDirections });
        }
    }

    return filterShortestItems(results).map((path) =>
        [...path.map((direction: ORTHOGONAL_DIRECTIONS) => DIRECTION_SYMBOL_MAP.get(direction)!), 'A']);
}

function computeKeypadPaths(keypad: Matrix<string>): PathsMap {
    const paths: PathsMap = new Map();

    keypad.forEachPoint((startPoint, startValue) => {
        if (startValue === ' ') return;
        const shortestPathsTo = new Map<string, string[][]>();

        keypad.forEachPoint((endPoint, endValue) => {
            if (endValue === ' ') return;
            shortestPathsTo.set(endValue, getShortestPaths(keypad, startPoint, endPoint));
        });

        paths.set(startValue, shortestPathsTo);
    });

    return paths;
}

const NUMERIC_PATHS = computeKeypadPaths(new Matrix<string>([
    [' ', '1', '4', '7'],
    ['0', '2', '5', '8'],
    ['A', '3', '6', '9']
]));

const ARROW_PATHS = computeKeypadPaths(new Matrix<string>([
    ['<', ' '],
    ['v', '^'],
    ['>', 'A']
]));

//#endregion

//#region Solution

function getCodeSymbolPairs(code: string[]): [string, string][] {
    const pairs: [string, string][] = [['A', code.first()]];
    for (let i = 0; i < code.length - 1; i++) {
        pairs.push([code[i], code[i + 1]]);
    }
    return pairs;
}

const computeCodeBestSequenceLength = memoize(
    (code: string[], maxRobotDepth: number, robotDepth = 0): number => {
        const pathsMap = robotDepth === 0 ? NUMERIC_PATHS : ARROW_PATHS;

        return getCodeSymbolPairs(code).map(([startSymbol, endSymbol]) => {
            const symbolPairPaths = pathsMap.get(startSymbol)!.get(endSymbol)!;

            // If we reached the top robot, that we control directly; the shortest paths are the precomputed ones.
            if (robotDepth === maxRobotDepth) return symbolPairPaths.first().length;

            // Otherwise, transform the current symbol pair in a list of possible paths and use those as sequences,
            // recursively. The minimum of these results is the best result.
            return symbolPairPaths.map((path) => computeCodeBestSequenceLength(path, maxRobotDepth, robotDepth + 1)).min()!;
        }).sum();
    },
    (code: string[], maxRobotDepth: number, robotDepth: number) =>
        `${maxRobotDepth}-${robotDepth}-${code.join('')}`
);

function getCodeComplexity(code: string[], robotCount: number): number {
    return computeCodeBestSequenceLength(code, robotCount) * parseInt(code.join(''));
}

function solve(input: string, robotCount: number): number {
    return input
        .splitByNewLine()
        .map((line) => line.toArray())
        .map((code) => getCodeComplexity(code, robotCount))
        .sum();
}

export function solvePart1(input: string): number {
    return solve(input, 2);
}

export function solvePart2(input: string): number {
    return solve(input, 25);
}

//#endregion
