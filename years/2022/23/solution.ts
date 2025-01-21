import { DIAGONAL_DIRECTIONS, DIAGONAL_DIRECTIONS_2D_LIST, findIndexOfPoint, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTIONS_2D_LIST, Point2D, stringToStringMatrix } from '@common';
import '@prototype-extensions';

type Decision = [ORTHOGONAL_DIRECTIONS, (ORTHOGONAL_DIRECTIONS | DIAGONAL_DIRECTIONS)[]];

const DECISION_LIST: Decision[] = [
    [
        ORTHOGONAL_DIRECTIONS.Y_POSITIVE, // Direction to move towards.
        [ // Directions to check.
            ORTHOGONAL_DIRECTIONS.Y_POSITIVE,
            DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_POSITIVE,
            DIAGONAL_DIRECTIONS.X_POSITIVE_Y_POSITIVE
        ],
    ],
    [
        ORTHOGONAL_DIRECTIONS.Y_NEGATIVE,
        [
            ORTHOGONAL_DIRECTIONS.Y_NEGATIVE,
            DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_NEGATIVE,
            DIAGONAL_DIRECTIONS.X_POSITIVE_Y_NEGATIVE
        ],
    ],
    [
        ORTHOGONAL_DIRECTIONS.X_NEGATIVE,
        [
            ORTHOGONAL_DIRECTIONS.X_NEGATIVE,
            DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_NEGATIVE,
            DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_POSITIVE
        ],
    ],
    [
        ORTHOGONAL_DIRECTIONS.X_POSITIVE,
        [
            ORTHOGONAL_DIRECTIONS.X_POSITIVE,
            DIAGONAL_DIRECTIONS.X_POSITIVE_Y_NEGATIVE,
            DIAGONAL_DIRECTIONS.X_POSITIVE_Y_POSITIVE
        ],
    ],
];

function parseInput(input: string): Point2D[] {
    return stringToStringMatrix(input).filterPoints((_point: Point2D, value: string) => value === '#');
}

function executeRound(points: Point2D[], decisionList: Decision[]): [number, Point2D][] {
    const pointProposals: Map<string, [number, Point2D][]> = new Map();
    points.forEach((point, index) => {
        // TODO: find a way to improve this search; this is the biggest performance drawback.
        const neighborPoints = points.filter((neighborPoint) => point.isAdjacentTo(neighborPoint));

        if (neighborPoints.length === 1 || neighborPoints.length === 9) return;

        const occuppiedDirections = [...ORTHOGONAL_DIRECTIONS_2D_LIST, ...DIAGONAL_DIRECTIONS_2D_LIST]
            .filter((direction) => findIndexOfPoint(neighborPoints, point.getNeighbor(direction)) !== -1);
        const possibleDirections = decisionList
            .reject(([, directionsToCheck]: Decision) =>
                directionsToCheck.some((direction) => occuppiedDirections.includes(direction)))
            .map(([direction]) => direction);

        if (possibleDirections.length === 0) return;

        const newPointKey = point.getNeighbor(possibleDirections[0]).coordsToString();
        if (!pointProposals.has(newPointKey)) pointProposals.set(newPointKey, []);
        pointProposals.get(newPointKey)?.push([index, point]);
    });

    const validPointProposals: [number, Point2D][] = pointProposals
        .entriesArray()
        .filter(([, proposals]) => proposals.length === 1)
        .map(([key, [[index]]]) => [index, Point2D.fromCoordsString(key)]);

    return validPointProposals;
}

export function solvePart1(input: string): number {
    const points = parseInput(input);
    const decisionList = [...DECISION_LIST];

    for (let roundIndex = 0; roundIndex < 10; roundIndex++) {
        executeRound(points, decisionList).forEach(([index, updatedPoint]) => points.replaceAt(index, updatedPoint));
        decisionList.push(decisionList.shift() as Decision);
    }

    const [minX, maxX] = points.map((point) => point.x).minAndMax();
    const [minY, maxY] = points.map((point) => point.y).minAndMax();
    return (maxX - minX + 1) * (maxY - minY + 1) - points.length;
}

export function solvePart2(input: string): number {
    const points = parseInput(input);
    const decisionList = [...DECISION_LIST];

    for (let roundIndex = 1; true; roundIndex++) {
        const pointUpdates = executeRound(points, decisionList);
        if (pointUpdates.length === 0) return roundIndex;
        pointUpdates.forEach(([index, updatedPoint]) => points.replaceAt(index, updatedPoint));
        decisionList.push(decisionList.shift() as Decision);
    }
}
