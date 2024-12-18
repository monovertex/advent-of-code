import { findIndexOfPoint, Matrix, Point2D, stringToPoint2D } from '../../common';
import '../../prototype-extensions';

function getShortestDistance(map: Matrix<number>, obstaclePoints: Point2D[] = []): number | null {
    return map.shortestDistance(
        new Point2D(0, 0),
        new Point2D(map.width - 1, map.height - 1),
        (point: Point2D, value: number) =>
            value === 0 && findIndexOfPoint(obstaclePoints, point) === -1
    );
}

function parseInput(input: string): [Matrix<number>, Point2D[]]{
    const obstaclePoints = input.splitByNewLine().map(stringToPoint2D);
    const isLargeMap = obstaclePoints.length >= 1024;
    const size = isLargeMap ? 71 : 7;
    const initialObstacleCount = isLargeMap ? 1024 : 12;

    const map = Matrix.initializeMatrix(size, size, 0);
    obstaclePoints.slice(0, initialObstacleCount).forEach((point) => map.setValue(point, 1));

    const remainingObstaclePoints = obstaclePoints.slice(initialObstacleCount);
    return [map, remainingObstaclePoints];
}

export function solvePart1(input: string): number {
    const [map] = parseInput(input);
    return getShortestDistance(map)!;
}

export function solvePart2(input: string): string {
    const [map, obstaclePoints] = parseInput(input);

    let lowerIndex = 0;
    let upperIndex = obstaclePoints.length - 1;
    while (lowerIndex !== upperIndex) {
        const middleIndex = Math.floor((lowerIndex + upperIndex) / 2);
        const result = getShortestDistance(map, obstaclePoints.slice(0, middleIndex));
        if (result === null) upperIndex = middleIndex - 1;
        else lowerIndex = middleIndex + 1;
    }

    const blockingPoint = obstaclePoints[lowerIndex];
    return `${blockingPoint.x},${blockingPoint.y}`;
}
