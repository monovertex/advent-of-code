import { Matrix, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const TILE_TYPE = {
    EMPTY: '.',
    GALAXY: '#',
};

function extractEmptyIndexes(matrix: string[][]): number[] {
    return matrix
        .map((list, index) => [list, index] as [string[], number])
        .filter(([list]) => list.every(value => value === TILE_TYPE.EMPTY))
        .map(([, index]) => index);
}

function getGalaxyPoints(input: string, emptyOffset: number): Point2D[] {
    const matrix = stringToStringMatrix(input);
    const galaxyPoints = matrix.filterPoints((point, value) => value === TILE_TYPE.GALAXY);
    const emptyColumnsIndexes = extractEmptyIndexes(matrix.data);
    const [firstColumn, ...restColumns] = matrix.data;
    const emptyRowsIndexes = extractEmptyIndexes(firstColumn.zip(...restColumns));

    return galaxyPoints.map((point) => new Point2D(
        point.x + emptyColumnsIndexes.countBy(index => point.x > index) * emptyOffset,
        point.y + emptyRowsIndexes.countBy(index => point.y > index) * emptyOffset,
    ));
}

function solve(galaxyPoints: Point2D[]): number {
    const distances = [];
    for (let startIndex = 0; startIndex < galaxyPoints.length; startIndex++) {
        const startPoint = galaxyPoints[startIndex];
        for (let endIndex = startIndex + 1; endIndex < galaxyPoints.length; endIndex++) {
            const endPoint = galaxyPoints[endIndex];
            distances.push(startPoint.getManhattanDistanceTo(endPoint));
        }
    }
    return distances.sum();
}

export function solvePart1(input: string): any {
    return solve(getGalaxyPoints(input, 1));
}

export function solvePart2(input: string): any {
    // Second part says "replace", not "add", so we have to account for the original row/column.
    return solve(getGalaxyPoints(input, 1_000_000 - 1));
}
