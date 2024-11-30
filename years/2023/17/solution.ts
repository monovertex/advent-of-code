import { GraphNode, IGraphNode, Matrix, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, aStar, stringToNumberMatrix } from '../../common';
import '../../prototype-extensions';

class TileNode extends GraphNode {
    point: Point2D;
    heat: number;
    fromVertical: boolean | null;

    constructor(point: Point2D, heat: number, fromVertical: boolean | null) {
        super(`${point.getUniqueKey()}-${fromVertical}`);
        this.point = point;
        this.heat = heat;
        this.fromVertical = fromVertical;
    }
}

function getNewDirections(fromVertical: boolean | null): ORTHOGONAL_DIRECTIONS[] {
    if (fromVertical === true) return [ORTHOGONAL_DIRECTIONS.X_POSITIVE, ORTHOGONAL_DIRECTIONS.X_NEGATIVE];
    if (fromVertical === false) return [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];
    return [ORTHOGONAL_DIRECTIONS.X_POSITIVE, ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];
}

function solve(input: string, minNeighborDistance: number, maxNeighborDistance: number): number {
    const matrix = stringToNumberMatrix(input);
    const startPoint = new Point2D(0, matrix.height - 1);
    const startNode = new TileNode(startPoint, matrix.getValue(startPoint), null);
    const endPoint = new Point2D(matrix.width - 1, 0);

    const matcher = (node: TileNode) => node.point.equals(endPoint);

    const calculateCost = (node: TileNode, neighbor: TileNode) => neighbor.heat;

    const calculateHeuristic = (node: TileNode, neighbor: TileNode) => neighbor.point.getManhattanDistanceTo(endPoint);

    const getNeighbors = (node: TileNode) => {
        const neighborTiles: TileNode[] = [];

        for (const direction of getNewDirections(node.fromVertical)) {
            const directionVector = ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(direction)!;
            let neighborVector = directionVector;
            let heat = 0;
            for (let count = 0; count < maxNeighborDistance; count++) {
                const neighborPoint = node.point.add(neighborVector);
                neighborVector = neighborVector.add(directionVector);
                // Once one step is out of bounds, the rest are as well.
                if (!matrix.isPointInBounds(neighborPoint)) break;

                heat = heat + matrix.getValue(neighborPoint);
                // We need to keep calculating the heat, but can't consider these as neighbors.
                if (count < minNeighborDistance - 1) continue;

                const fromVertical = direction === ORTHOGONAL_DIRECTIONS.Y_POSITIVE || direction === ORTHOGONAL_DIRECTIONS.Y_NEGATIVE ? true : false;
                neighborTiles.push(new TileNode(neighborPoint, heat, fromVertical));
            }
        }

        return neighborTiles as IGraphNode[];
    };

    return aStar(
        startNode,
        matcher as (node: IGraphNode) => boolean,
        calculateCost as (node: IGraphNode, neighbor: IGraphNode) => number,
        calculateHeuristic as (node: IGraphNode, neighbor: IGraphNode) => number,
        getNeighbors as (node: IGraphNode) => IGraphNode[]
    )!;
}

export function solvePart1(input: string): any {
    return solve(input, 0, 3);
}

export function solvePart2(input: string): any {
    return solve(input, 4, 10);
}
