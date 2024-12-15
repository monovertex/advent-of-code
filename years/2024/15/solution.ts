import { Matrix, ORTHOGONAL_DIRECTIONS, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

enum MAP_SYMBOL {
    EMPTY = '.',
    WALL = '#',
    START = '@',
    BOX = 'O',
    LARGE_BOX_START = '[',
    LARGE_BOX_END = ']',
}

const MAP_SYMBOL_TRANSFORM = new Map([
    [MAP_SYMBOL.EMPTY, [MAP_SYMBOL.EMPTY, MAP_SYMBOL.EMPTY]],
    [MAP_SYMBOL.WALL, [MAP_SYMBOL.WALL, MAP_SYMBOL.WALL]],
    [MAP_SYMBOL.START, [MAP_SYMBOL.START, MAP_SYMBOL.EMPTY]],
    [MAP_SYMBOL.BOX, [MAP_SYMBOL.LARGE_BOX_START, MAP_SYMBOL.LARGE_BOX_END]],
]);

const MOVE_SYMBOL_DIRECTION_MAP = new Map([
    ['^', ORTHOGONAL_DIRECTIONS.Y_POSITIVE],
    ['v', ORTHOGONAL_DIRECTIONS.Y_NEGATIVE],
    ['<', ORTHOGONAL_DIRECTIONS.X_NEGATIVE],
    ['>', ORTHOGONAL_DIRECTIONS.X_POSITIVE],
]);

function symbolIsBox(symbol: string): boolean {
    return symbol === MAP_SYMBOL.BOX || symbol === MAP_SYMBOL.LARGE_BOX_START || symbol === MAP_SYMBOL.LARGE_BOX_END;
}

function solve(input: string, parseMapSymbol: (input: MAP_SYMBOL) => MAP_SYMBOL[]): number {
    const [mapInput, movesInput] = input.splitByDoubleNewLine();
    const transformedMapInput = mapInput
        .splitByNewLine()
        .map((line) => line.toArray().flatMap((symbol) => parseMapSymbol(symbol as MAP_SYMBOL)).join(''))
        .join('\n');

    const map = stringToStringMatrix(transformedMapInput);
    const moves = movesInput.splitByNewLine().join('').toArray();
    let currentPoint = map.findPoint((_point, value) => value === MAP_SYMBOL.START)!;
    map.setValue(currentPoint, MAP_SYMBOL.EMPTY);

    for (const move of moves) {
        const direction = MOVE_SYMBOL_DIRECTION_MAP.get(move)!;
        currentPoint = executeMove(map, currentPoint, direction);
    }

    return map
        .filterPoints((_point, value) =>
            value === MAP_SYMBOL.LARGE_BOX_START || value === MAP_SYMBOL.BOX)
        // Reverse the y coords because we need the distance from the top of the map.
        .map((point) => point.x + (map.height - point.y - 1) * 100)
        .sum();
}

function executeMove(map: Matrix<string>, currentPoint: Point2D, direction: ORTHOGONAL_DIRECTIONS) {
    const nextPoint = currentPoint.getOrthogonalNeighbor(direction);
    const boxPoints: Point2D[] = [];

    let nextEvaluatedPoints = [nextPoint];
    while (true) {
        const maybeNewBoxPoints = evaluateMovePushingBoxes(map, nextEvaluatedPoints, direction);
        if (maybeNewBoxPoints === false) return currentPoint;
        if (maybeNewBoxPoints === true) break;
        // Update the list of box points and prepare the next row of points to evaluate.
        const newBoxPoints = maybeNewBoxPoints as Point2D[];
        boxPoints.push(...newBoxPoints);
        nextEvaluatedPoints = newBoxPoints.map((point) => point.getOrthogonalNeighbor(direction));
    }

    // Starting with the latest boxes added in the queue, translate them in the move direction.
    boxPoints.reverse().forEach((point) => {
        const currentValue = map.getValue(point);
        map.setValue(point.getOrthogonalNeighbor(direction), currentValue);
        map.setValue(point, MAP_SYMBOL.EMPTY);
    });
    return nextPoint;
}

function evaluateMovePushingBoxes(map: Matrix<string>, evaluatedPoints: Point2D[], direction: ORTHOGONAL_DIRECTIONS): boolean | Point2D[] {
    const nextEvaluatedValues = evaluatedPoints.map((point) => map.getValue(point));

    // If we hit a wall, the current move is not possible.
    if (nextEvaluatedValues.some((value) => value === MAP_SYMBOL.WALL)) return false;

    // If all next points are empty, then the move is possible.
    if (nextEvaluatedValues.every((value) => value === MAP_SYMBOL.WALL)) return true;

    // Gather up all the box points on the current row.
    const newBoxPoints: Point2D[] = [];
    for (const [nextPoint, nextValue] of evaluatedPoints.zip(nextEvaluatedValues)) {
        if (symbolIsBox(nextValue)) newBoxPoints.push(nextPoint);

        // Skip adding sibling points if we're moving horizontally
        if (direction === ORTHOGONAL_DIRECTIONS.X_POSITIVE || direction === ORTHOGONAL_DIRECTIONS.X_NEGATIVE) continue;

        if (nextValue === MAP_SYMBOL.LARGE_BOX_START)
            newBoxPoints.push(nextPoint.getOrthogonalNeighbor(ORTHOGONAL_DIRECTIONS.X_POSITIVE));
        if (nextValue === MAP_SYMBOL.LARGE_BOX_END)
            newBoxPoints.push(nextPoint.getOrthogonalNeighbor(ORTHOGONAL_DIRECTIONS.X_NEGATIVE));
    }

    return newBoxPoints.uniqueBy((point) => point.getUniqueKey());
}

export function solvePart1(input: string): number {
    return solve(input, (symbol) => [symbol]);
}

export function solvePart2(input: string): number {
    return solve(input, (symbol: MAP_SYMBOL) => MAP_SYMBOL_TRANSFORM.get(symbol)!);
}
