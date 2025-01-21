import { breadthFirstSearch, findIndexOfPoint, IGraphNode, ORTHOGONAL_DIRECTION_VECTORS_3D, Point3D, stringToPoint3DArray } from '@common';
import '@prototype-extensions';

function parseInput(input: string): Point3D[] {
    return stringToPoint3DArray(input, '\n');
}

export function solvePart1(input: string): number {
    const points = parseInput(input);
    const adjacentSidesCount = points.reduce((result: number, point: Point3D) => {
        const coveredSidesCount = ORTHOGONAL_DIRECTION_VECTORS_3D
            .map((vector) => point.add(vector))
            .filter((adjacentPoint) => findIndexOfPoint(points, adjacentPoint) !== -1)
            .length;
        return result + coveredSidesCount;
    }, 0);
    return points.length * 6 - adjacentSidesCount;
}

export function solvePart2(input: string): number {
    const points = parseInput(input);
    const xCoordinates = points.map((points) => points.x);
    const yCoordinates = points.map((points) => points.y);
    const zCoordinates = points.map((points) => points.z);
    const minPoint = new Point3D(
        xCoordinates.min() - 1,
        yCoordinates.min() - 1,
        zCoordinates.min() - 1
    );
    const maxPoint = new Point3D(
        xCoordinates.max() + 1,
        yCoordinates.max() + 1,
        zCoordinates.max() + 1
    );

    let totalSurfaceArea = 0;
    function generateAndEvaluateNeighbors(node: IGraphNode): IGraphNode[] {
        const point = node as Point3D;
        const validNeighbors = ORTHOGONAL_DIRECTION_VECTORS_3D
            .map((vector) => point.add(vector))
            .filter((neighbor) => neighbor.isBetween(minPoint, maxPoint));
        const validNeighborsNotInShape = validNeighbors.filter((neighbor) => findIndexOfPoint(points, neighbor) === -1);

        totalSurfaceArea += (validNeighbors.length - validNeighborsNotInShape.length);
        return validNeighborsNotInShape;
    }

    breadthFirstSearch(minPoint, () => false, generateAndEvaluateNeighbors);
    return totalSurfaceArea;
}
