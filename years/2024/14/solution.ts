import { clearOutput, Point2D, wait } from '@common';
import '@prototype-extensions';

enum QUADRANT {
    TOP_LEFT = '0',
    TOP_RIGHT = '1',
    BOTTOM_LEFT = '2',
    BOTTOM_RIGHT = '3'
}

const MAP_WIDTH_EXAMPLE = 11;
const MAP_HEIGHT_EXAMPLE = 7;
const MAP_WIDTH = 101;
const MAP_HEIGHT = 103;

function getQuadrant(point: Point2D, width: number, height: number): QUADRANT | null {
    const halfX = Math.floor(width / 2);
    const halfY = Math.floor(height / 2);

    if (point.x < halfX && point.y < halfY) return QUADRANT.BOTTOM_LEFT;
    if (point.x > halfX && point.y < halfY) return QUADRANT.BOTTOM_RIGHT;
    if (point.x < halfX && point.y > halfY) return QUADRANT.TOP_LEFT;
    if (point.x > halfX && point.y > halfY) return QUADRANT.TOP_RIGHT;
    return null;
}

function parseInput(input: string): [Point2D, Point2D][] {
    return input.splitByNewLine().map((line) => {
        const [px, py, vx, vy] = line.match(/^p=(\d+),(\d+) v=(-?\d+),(-?\d+)$/)?.slice(1).toNumbers() as [number, number, number, number];
        return [new Point2D(px, py), new Point2D(vx, vy)];
    });
}

export function solvePart1(input: string): number {
    const points = parseInput(input);
    const width = points.length === 12 ? MAP_WIDTH_EXAMPLE : MAP_WIDTH;
    const height = points.length === 12 ? MAP_HEIGHT_EXAMPLE : MAP_HEIGHT;

    const translatedPoints = points.map(([point, vector]) => {
        const translatedPoint = point.add(vector.multiply(100));
        return new Point2D(translatedPoint.x.wrap(width), translatedPoint.y.wrap(height));
    });

    return Object.values(translatedPoints.reduce((result, point) => {
        const quadrant = getQuadrant(point, width, height);
        if (quadrant) result[quadrant]++;
        return result;
    }, {
        [QUADRANT.TOP_LEFT]: 0,
        [QUADRANT.TOP_RIGHT]: 0,
        [QUADRANT.BOTTOM_LEFT]: 0,
        [QUADRANT.BOTTOM_RIGHT]: 0
    })).multiply();
}

export function solvePart2(input: string): number {
    const pointsAndVectors = parseInput(input).unzip();
    let points = pointsAndVectors[0];
    const vectors = pointsAndVectors[1];
    let iterationCount = 0;

    while (true) {
        const uniquePoints = points.uniqueBy((point) => point.getUniqueKey());
        if (points.length === uniquePoints.length) return iterationCount;

        points = points.map((point, index) => {
            const translatedPoint = point.add(vectors[index]);
            return new Point2D(translatedPoint.x.wrap(MAP_WIDTH), translatedPoint.y.wrap(MAP_HEIGHT));
        });
        iterationCount++;
    }
}
