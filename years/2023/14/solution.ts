import { Matrix, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const TILE_TYPE = {
    ROUND_ROCK: 'O',
    SQUARE_ROCK: '#',
    EMPTY: '.',
};

const SHIFT_CYCLE_DIRECTIONS = [
    ORTHOGONAL_DIRECTIONS.Y_POSITIVE,
    ORTHOGONAL_DIRECTIONS.X_NEGATIVE,
    ORTHOGONAL_DIRECTIONS.Y_NEGATIVE,
    ORTHOGONAL_DIRECTIONS.X_POSITIVE,
];

const PART_2_CYCLE_COUNT = 1_000_000_000;

function shiftRocks(matrix: Matrix<string>, direction: ORTHOGONAL_DIRECTIONS): void {
    while (true) {
        let rocksShifted = false;
        matrix.forEachNode((point: Point2D, value: string) => {
            if (value !== TILE_TYPE.ROUND_ROCK) return;
            const neighbourPoint = point.getOrthogonalNeighbor(direction);
            if (!matrix.isPointInBounds(neighbourPoint)) return;
            if (matrix.getValue(neighbourPoint) !== TILE_TYPE.EMPTY) return;
            matrix.setValue(neighbourPoint, TILE_TYPE.ROUND_ROCK);
            matrix.setValue(point, TILE_TYPE.EMPTY);
            rocksShifted = true;
        });
        if (!rocksShifted) break;
    }
}

function cycleShiftRocks(matrix: Matrix<string>): void {
    for (const direction of SHIFT_CYCLE_DIRECTIONS) shiftRocks(matrix, direction);
}

function calculateLoad(matrix: Matrix<string>): number {
    return matrix.mapPoints<number>((point: Point2D, value: string) => {
        if (value === TILE_TYPE.ROUND_ROCK) return point.y + 1;
        return 0;
    }).sum();
}

export function solvePart1(input: string): any {
    const matrix = stringToStringMatrix(input);
    shiftRocks(matrix, ORTHOGONAL_DIRECTIONS.Y_POSITIVE);
    return calculateLoad(matrix);
}

export function solvePart2(input: string): any {
    const matrix = stringToStringMatrix(input);
    const loopSnapshots = new Set();
    for (let cycleIndex = 0; cycleIndex < PART_2_CYCLE_COUNT; cycleIndex++) {
        cycleShiftRocks(matrix);

        const key = matrix.toString();
        if (!loopSnapshots.has(key)) {
            loopSnapshots.add(key);
            continue;
        }

        const loopEnd = cycleIndex - 1;
        const loopStart = [...loopSnapshots].indexOf(key);
        const loopLength = loopEnd - loopStart + 1;
        // Subtract 1 from the remaining cycle because we already did one cycle when detecting the loop.
        const remainingCycles = (PART_2_CYCLE_COUNT - loopStart) % loopLength - 1;
        for (let index = 0; index < remainingCycles; index++) cycleShiftRocks(matrix);
        break;
    }
    return calculateLoad(matrix);
}
