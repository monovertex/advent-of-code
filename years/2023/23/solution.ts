import { GraphNode, Matrix, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, WeightedDirectedGraph, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const TILE_TYPE = Object.freeze({
    PATH: '.',
    TREE: '#',
    SLOPE_RIGHT: '>',
    SLOPE_LEFT: '<',
    SLOPE_UP: '^',
    SLOPE_DOWN: 'v',
});

function getValidNeighbors(matrix: Matrix<string>, point: Point2D, getNeighbors: (point: Point2D, value: string) => Point2D[], visitedPointKeys: Set<string> = new Set()) {
    return getNeighbors(point, matrix.getValue(point)).filter((neighborPoint: Point2D) => {
        if (!matrix.isPointInBounds(neighborPoint)) return false;
        const neighborValue = matrix.getValue(neighborPoint);
        if (neighborValue === TILE_TYPE.TREE) return false;
        if (visitedPointKeys.has(neighborPoint.getUniqueKey())) return false;
        return true;
    });
}

function traverseEdge(
    matrix: Matrix<string>,
    originPoint: Point2D,
    firstEdgePoint: Point2D,
    junctionPointKeys: string[],
    getNeighbors: (point: Point2D, value: string) => Point2D[]
) {
    const visitedPointKeys = new Set<string>([originPoint.getUniqueKey()]);
    let traversalPoint = firstEdgePoint;
    let distance = 1;
    while (true) {
        const traversalPointKey = traversalPoint.getUniqueKey();
        if (junctionPointKeys.includes(traversalPointKey)) return [originPoint, traversalPoint, distance];
        const validNeighbors = getValidNeighbors(matrix, traversalPoint, getNeighbors, visitedPointKeys);
        if (validNeighbors.length === 0) return null;
        if (validNeighbors.length > 1) throw new Error('Unexpected junction point');
        traversalPoint = validNeighbors[0];
        visitedPointKeys.add(traversalPointKey);
        distance++;
    }
}

function buildGraph(matrix: Matrix<string>, getNeighbors: (point: Point2D, value: string) => Point2D[]): [WeightedDirectedGraph, GraphNode, GraphNode] {
    const topRowIndex = matrix.height - 1;
    const startPoint = matrix.findPoint((point: Point2D, value: string) => point.y === topRowIndex && value === TILE_TYPE.PATH)!;
    const destinationPoint = matrix.findPoint((point: Point2D, value: string) => point.y === 0 && value === TILE_TYPE.PATH)!;
    const junctionPoints = matrix.filterPoints((point: Point2D, value: string) => {
        if (value !== TILE_TYPE.PATH) return false;
        if (point.equals(startPoint)) return true;
        if (point.equals(destinationPoint)) return true;
        return getValidNeighbors(matrix, point, getNeighbors).length > 2;
    });
    const nodes = new Map(junctionPoints.map((point: Point2D) => {
        const uniqueKey = point.getUniqueKey();
        return [uniqueKey, new GraphNode(uniqueKey)];
    }));
    const graph = new WeightedDirectedGraph(GraphNode, nodes.valuesArray());
    const junctionPointKeys = nodes.keysArray();
    junctionPoints
        .flatMap((junctionPoint: Point2D) =>
            getValidNeighbors(matrix, junctionPoint, getNeighbors)
                .map((neighborPoint: Point2D) =>
                    traverseEdge(matrix, junctionPoint, neighborPoint, junctionPointKeys, getNeighbors))
                .filter(Boolean) as [Point2D, Point2D, number][]
        )
        .forEach(([originPoint, destinationPoint, distance]: [Point2D, Point2D, number]) =>
            graph.addWeightedEdge(
                nodes.get(originPoint.getUniqueKey())!,
                nodes.get(destinationPoint.getUniqueKey())!,
                distance
            )
        );

    return [
        graph,
        nodes.get(startPoint.getUniqueKey())!,
        nodes.get(destinationPoint.getUniqueKey())!,
    ];
}

function traverseGraph(
    graph: WeightedDirectedGraph,
    currentNode: GraphNode,
    endNode: GraphNode,
    visitedNodes: GraphNode[] = [],
    distance: number = 0,
): number {
    if (currentNode === endNode) return distance;
    const edges = graph.getNodeNeighborsAndWeights(currentNode);
    return edges.map(([neighborNode, weight]) => {
        if (visitedNodes.includes(neighborNode)) return 0;
        return traverseGraph(graph, neighborNode, endNode, [...visitedNodes, currentNode], distance + weight);
    }).max();
}

function solve(input: string, getNeighbors: (point: Point2D, value: string) => Point2D[]): number {
    const matrix = stringToStringMatrix(input);
    const [graph, startNode, destinationNode] = buildGraph(matrix, getNeighbors);
    // Simple optimization to avoid traversing the extra edges. Especially useful for the end node,
    // where there can be a junction and we always need to take the destionation path.
    const [resolvedStartNode, offsetStartDistance] = graph.getNodeNeighborsAndWeights(startNode).first();
    const [resolvedEndNode, offsetEndDistance] = graph.getNodeNeighborsAndWeights(destinationNode).first() ?? [destinationNode, 0];
    return traverseGraph(graph, resolvedStartNode, resolvedEndNode)! + offsetStartDistance + offsetEndDistance;
}

export function solvePart1(input: string): number {
    function getNeighbors(point: Point2D, value: string): Point2D[] {
        if (value === TILE_TYPE.PATH) return point.orthogonalNeighbors();
        if (value === TILE_TYPE.SLOPE_RIGHT)
            return [point.getOrthogonalNeighbor(ORTHOGONAL_DIRECTIONS.X_POSITIVE)];
        if (value === TILE_TYPE.SLOPE_LEFT)
            return [point.getOrthogonalNeighbor(ORTHOGONAL_DIRECTIONS.X_NEGATIVE)];
        if (value === TILE_TYPE.SLOPE_UP)
            return [point.getOrthogonalNeighbor(ORTHOGONAL_DIRECTIONS.Y_POSITIVE)];
        if (value === TILE_TYPE.SLOPE_DOWN)
            return [point.getOrthogonalNeighbor(ORTHOGONAL_DIRECTIONS.Y_NEGATIVE)];
        throw new Error(`Unexpected tile: ${value}`);
    };

    return solve(input, getNeighbors);
}

export function solvePart2(input: string): number {
    function getNeighbors(point: Point2D, value: string): Point2D[] {
        return point.orthogonalNeighbors();
    };

    return solve(input, getNeighbors);
}
