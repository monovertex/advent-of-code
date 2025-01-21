import { Point3D, stringToPoint3D, stringToPoint3DArray } from '@common';
import '@prototype-extensions';

function parseBricks(input: string): Point3D[][] {
    return input.splitByNewLine().map((line) => {
        const [startPoint, endPoint] = stringToPoint3DArray(line, '~');
        const points = [];
        for (let x = startPoint.x; x <= endPoint.x; x++) {
            for (let y = startPoint.y; y <= endPoint.y; y++) {
                for (let z = startPoint.z; z <= endPoint.z; z++) {
                    points.push(new Point3D(x, y, z));
                }
            }
        }
        return points.sort((pointA, pointB) => pointA.z - pointB.z);
    });
}

function xyKey(point: Point3D) {
    return `${point.x},${point.y}`;
}

function shiftBricks(bricks: Point3D[][]): [number, Point3D[][]] {
    const sortedBricks = bricks.sort((brickA, brickB) => brickA[0].z - brickB[0].z);
    const heightMap = new Map<string, number>();
    let movedBricksCount = 0;
    const updatedBricks = sortedBricks.map((brick) => {
        const newZ = brick.map((point) => heightMap.get(xyKey(point)) ?? 0).max() + 1;
        const diffZ = brick[0].z - newZ;
        if (diffZ > 0) movedBricksCount++;
        const newBrick = brick.map((point) => new Point3D(point.x, point.y, point.z - diffZ));
        newBrick.forEach((point) => heightMap.set(xyKey(point), point.z));
        return newBrick;
    });
    return [movedBricksCount, updatedBricks];
}

export function solvePart1(input: string): any {
    const [, bricks] = shiftBricks(parseBricks(input));
    return bricks.countBy((brick) => {
        // In order to be able to disintegrate the brick, none of the other bricks must move after doing so.
        const [movedBricksCount] = shiftBricks(bricks.without(brick));
        return movedBricksCount === 0;
    });
}

export function solvePart2(input: string): any {
    const [, bricks] = shiftBricks(parseBricks(input));
    return bricks.map((brick) => {
        const [movedBricksCount] = shiftBricks(bricks.without(brick));
        return movedBricksCount;
    }).sum();
}
