import { IGraphNode, IMatrix, Point2D, stringToNumberMatrix } from '../../common';
import '../../prototype-extensions';

function isNeighborValid(_point: Point2D, value: number, _neighborPoint: Point2D, neighborValue: number) {
    return neighborValue === value + 1;
}

function computeTrailScore(matrix: IMatrix<number>, startPoint: Point2D): number {
    const uniqeEndingPoints = new Set<string>();
    const matcher = (point: Point2D, value: number) => {
        if (value === 9) uniqeEndingPoints.add(point.toString());
        return false;
    };
    // BFS because we don't need to re-visit points.
    matrix.breadthFirstSearch(startPoint, matcher, isNeighborValid);
    return uniqeEndingPoints.size;
}

export function solvePart1(input: string): number {
    const matrix = stringToNumberMatrix(input);
    return matrix
        .filterPoints((point: Point2D, value: number) => value === 0)
        .map((point) => computeTrailScore(matrix, point))
        .sum();
}

function computeTrailRating(matrix: IMatrix<number>, startPoint: Point2D): number {
    let rating = 0;
    const walkNode = (node: IGraphNode) => {
        if (matrix.getValue(node as Point2D) === 9) rating++;
    };
    matrix.walk(startPoint, walkNode, isNeighborValid);
    return rating;
}

export function solvePart2(input: string): number {
    const matrix = stringToNumberMatrix(input);
    return matrix
        .filterPoints((point: Point2D, value: number) => value === 0)
        .map((point) => computeTrailRating(matrix, point))
        .sum();
}
