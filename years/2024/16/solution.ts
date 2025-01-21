import { aStar, IGraphNode, Matrix, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTIONS_2D_LIST, Point2D, PriorityQueue, stringToStringMatrix } from '@common';
import '@prototype-extensions';

enum MAP_SYMBOLS {
    WALL = '#',
    EMPTY = '.',
    START = 'S',
    END = 'E',
};

class PathPoint extends Point2D {
    direction: ORTHOGONAL_DIRECTIONS;

    constructor(point: Point2D, direction: ORTHOGONAL_DIRECTIONS) {
        super(point.x, point.y);
        this.direction = direction;
    }

    toString() {
        return `${super.toString()}-${this.direction}`;
    }
}

class PathPointWithMemory extends PathPoint {
    previous: PathPointWithMemory | null;

    constructor(point: Point2D, direction: ORTHOGONAL_DIRECTIONS, previous: PathPointWithMemory | null = null) {
        super(point, direction);
        this.previous = previous;
    }

    getPath() {
        const pathPoints: PathPointWithMemory[] = [];
        let currentPoint: PathPointWithMemory | null = this;
        while (currentPoint !== null) {
            pathPoints.push(currentPoint);
            currentPoint = currentPoint.previous;
        }
        return pathPoints;
    }
}

function parseInput<PointT extends PathPoint>(
    input: string,
    pointConstructor: { new (...args : any[]): PointT }
): [Matrix<string>, PointT, Point2D] {
    const map = stringToStringMatrix(input);
    const endPoint = map.findPointOfValue(MAP_SYMBOLS.END)!;

    const startPoint = new pointConstructor(
        map.findPointOfValue(MAP_SYMBOLS.START)!,
        ORTHOGONAL_DIRECTIONS.X_POSITIVE
    );

    return [map, startPoint, endPoint];
}

function getBestPathCost(map: Matrix<string>, startPoint: PathPoint, endPoint: Point2D) {
    const matcher = (node: IGraphNode) => (node as PathPoint).equals(endPoint);

    const calculateHeuristic = (_node: IGraphNode, neighborNode: IGraphNode) =>
        (neighborNode as PathPoint).getManhattanDistanceTo(endPoint);

    const getNeighbors = (node: IGraphNode) => {
        const point = (node as PathPoint);
        return ORTHOGONAL_DIRECTIONS_2D_LIST
            .map((direction) => new PathPoint(point.getOrthogonalNeighbor(direction), direction))
            .reject((neighbor: PathPoint) => map.getValue(neighbor) === MAP_SYMBOLS.WALL);
    };

    return aStar(startPoint, matcher, calculateCost, calculateHeuristic, getNeighbors)!;
}

function calculateCost(node: IGraphNode, neighborNode: IGraphNode) {
    const point = node as PathPoint;
    const neighborPoint = neighborNode as PathPoint;
    if (point.direction === neighborPoint.direction) return 1;
    // A direction change costs 1000, but this is while generating neighbors,
    // so it's also a move foreward, that costs 1.
    return 1001;
}

export function solvePart1(input: string): number {
    const [map, startPoint, endPoint] = parseInput(input, PathPoint);
    return getBestPathCost(map, startPoint, endPoint);
}

export function solvePart2(input: string): number {
    const [map, startPoint, endPoint] = parseInput(input, PathPointWithMemory);
    const bestCost = getBestPathCost(map, startPoint, endPoint);
    const pathPoints: Point2D[] = [];

    // Custom Dijsktra implementation instead of using the aStar function because we need all possible paths.
    const queue = new PriorityQueue<PathPointWithMemory>([[startPoint, 0]]);
    const costSoFar: Map<string, number> = new Map([[startPoint.getUniqueKey(), 0]]);

    while (queue.length > 0) {
        const currentPoint = queue.dequeue()!;
        const currentPointKey = currentPoint.getUniqueKey();
        const currentPointCost = costSoFar.get(currentPointKey)!

        // Drop paths that are already worse than the best one.
        if (currentPointCost > bestCost) continue;
        if (currentPoint.equals(endPoint) && currentPointCost === bestCost) pathPoints.push(...currentPoint.getPath());

        for (const direction of ORTHOGONAL_DIRECTIONS_2D_LIST) {
            const neighborPoint = new PathPointWithMemory(currentPoint.getOrthogonalNeighbor(direction), direction, currentPoint);

            // Drop paths that hit walls, or return to the previous point.
            if (map.getValue(neighborPoint) === MAP_SYMBOLS.WALL) continue;
            if (currentPoint.previous && currentPoint.previous.equals(neighborPoint)) continue;

            const neighborPointKey = neighborPoint.getUniqueKey();
            const newCost = currentPointCost + calculateCost(currentPoint, neighborPoint);
            const previousCost = costSoFar.get(neighborPointKey);

            // Only skip paths if the new cost is worse. If equal, we still need to follow this path.
            if (previousCost !== undefined && newCost > previousCost) continue;

            costSoFar.set(neighborPointKey, newCost);
            queue.enqueue(neighborPoint, newCost);
        }
    }

    return pathPoints.uniqueBy((point) => point.coordsToString()).length;
}
