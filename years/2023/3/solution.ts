import { IMatrix, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const isDigit = (char: string) => /\d/.test(char);

const isLeftCharacterDigit = (matrix: IMatrix<string>, point: Point2D) => {
    const leftPoint = point.add(ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_NEGATIVE)!);
    if (!matrix.isPointInBounds(leftPoint)) return false;
    const leftValue = matrix.getValue(leftPoint);
    return isDigit(leftValue);
}

const extractNumbers = (matrix: IMatrix<string>) => {
    return matrix.reducePoints((accumulator, point, value) => {
        // If the current point doesn't contain a digit, or if the point on the left is a digit
        // (meaning the number is already started), skip it.
        if (!isDigit(value) || isLeftCharacterDigit(matrix, point)) return accumulator;

        const numberPoints: Point2D[] = [];
        let numberAsString = '';
        let currentPoint = point;

        while (true) {
            if (!matrix.isPointInBounds(currentPoint)) break;
            const currentValue = matrix.getValue(currentPoint);
            if (!isDigit(currentValue)) break;
            numberAsString += currentValue;
            numberPoints.push(currentPoint);
            currentPoint = currentPoint.add(ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_POSITIVE)!);
        }

        accumulator.push([numberPoints, Number(numberAsString)]);
        return accumulator;
    }, [] as [Point2D[], number][]);
};

const filterNumbersByAdjacentPoints = (matrix: IMatrix<string>, list: [Point2D[], number][], test: (point: Point2D, value: string) => Boolean) => {
    return list.filter(([numberPoints]) => numberPoints.some((point) => {
        for (const adjacentPoint of point.allNeighbors()) {
            if (!matrix.isPointInBounds(adjacentPoint)) continue;
            const adjacentValue = matrix.getValue(adjacentPoint);
            if (test(adjacentPoint, adjacentValue)) return true;
        }
    }));
};

export function solvePart1(input: string): any {
    const matrix = stringToStringMatrix(input);
    return filterNumbersByAdjacentPoints(
        matrix,
        extractNumbers(matrix),
        (point, value) => !isDigit(value) && value !== '.'
    ).map(([, number]) => number).sum();
}

export function solvePart2(input: string): any {
    const matrix = stringToStringMatrix(input);
    const possibleGearNumbers = filterNumbersByAdjacentPoints(
        matrix,
        extractNumbers(matrix),
        (point, value) => value === '*'
    );
    const possibleGearGroups = possibleGearNumbers.reduce((result, [numberPoints], numberIndex) => {
        numberPoints.forEach((point) => {
            for (const adjacentPoint of point.allNeighbors()) {
                if (!matrix.isPointInBounds(adjacentPoint)) continue;
                const adjacentValue = matrix.getValue(adjacentPoint);
                if (adjacentValue !== '*') continue;

                const gearKey = adjacentPoint.getUniqueKey();
                if (!result.has(gearKey)) result.set(gearKey, new Set());
                result.get(gearKey)!.add(numberIndex);
            }
        });
        return result;
    }, new Map());

    return [...possibleGearGroups.values()]
        .map((numberIndexes) => [...numberIndexes])
        .filter((numberIndexes) => numberIndexes.length === 2)
        .map((numberIndexes) => {
            const firstValue = possibleGearNumbers[numberIndexes[0]][1];
            const secondValue = possibleGearNumbers[numberIndexes[1]][1];
            return firstValue * secondValue;
        }).sum();
}
