import { Matrix, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const START_POINT_VALUE = 'S';
const DEST_POINT_VALUE = 'E';

function inputToMap(input: string): [Matrix<number>, Point2D, Point2D] {
    const matrix = stringToStringMatrix(input);
    const startPoint = matrix.findPointOfValue(START_POINT_VALUE);
    const destPoint = matrix.findPointOfValue(DEST_POINT_VALUE);
    const heightMatrix = matrix.mapPoints((point, value) => {
        if (value === START_POINT_VALUE) return 0;
        if (value === DEST_POINT_VALUE) return 25;
        return value.charCodeAt(0) - 97;
    });
    return [heightMatrix, startPoint!, destPoint!];
}

export function solvePart1(input: string): any {
    const [heightMatrix, startPoint, destPoint] = inputToMap(input);
    return heightMatrix.shortestDistance(
        startPoint, destPoint,
        (point, height, neighborPoint, neighborHeight) => neighborHeight - height <= 1
    );
}

export function solvePart2(input: string): any {
    const [heightMatrix, , destPoint] = inputToMap(input);
    const { distance }= heightMatrix.breadthFirstSearch(
        destPoint,
        (point, height) => height === 0,
        (point, height, neighborPoint, neighborHeight) => height - neighborHeight <= 1
    )!;
    return distance;
}
