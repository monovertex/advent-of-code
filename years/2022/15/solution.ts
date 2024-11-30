import { mergeIntervals, Point2D } from '../../common';
import '../../prototype-extensions';

const PART_1_ROW_Y = 2_000_000;
const PART_1_ROW_Y_EXAMPLE = 10;
const PART_2_MIN_COORD = 0;
const PART_2_MAX_COORD = 4_000_000;
const PART_2_MAX_COORD_EXAMPLE = 4_000_000;
const INPUT_LINE_REGEX = /^Sensor at x=([0-9\-]+), y=([0-9\-]+): closest beacon is at x=([0-9\-]+), y=([0-9\-]+)$/;

function isExample(beacons: Point2D[]): boolean {
    return Math.max(...beacons.map((beacon: Point2D) => beacon.y)) <= 100;
}

function getRowCollissionIntervals(sensorsAndDistanceToClosestBeacon: [Point2D, number][], row: number): [number,number][] {
    const intervals: [number,number][] = sensorsAndDistanceToClosestBeacon.map(([sensor, distanceToClosestBeacon]) => {
        const verticalDistance = Math.abs(sensor.y - row);
        if (verticalDistance > distanceToClosestBeacon) return;
        const horizontalDistance = distanceToClosestBeacon - verticalDistance;
        return [sensor.x - horizontalDistance, sensor.x + horizontalDistance];
    }).filter(Boolean) as [number,number][];
    return mergeIntervals(intervals);
};


function parseInput(input: string): [Point2D[], [Point2D, number][]] {
    const beacons: Point2D[] = [];
    const sensorsAndDistanceToClosestBeacon: [Point2D, number][] = input.splitByNewLine().map((line) => {
        const [sensorX, sensorY, beaconX, beaconY] = line.getMatches(INPUT_LINE_REGEX).toNumbers();
        const beacon = new Point2D(beaconX, beaconY);
        beacons.push(beacon);
        const sensor = new Point2D(sensorX, sensorY);
        return [sensor, sensor.getManhattanDistanceTo(beacon)];
    });
    return [beacons, sensorsAndDistanceToClosestBeacon];
}

export function solvePart1(input: string): any {
    const [beacons, sensorsAndDistanceToClosestBeacon] = parseInput(input);
    const targetRowY = isExample(beacons) ? PART_1_ROW_Y_EXAMPLE : PART_1_ROW_Y;
    const mergedIntervals = getRowCollissionIntervals(sensorsAndDistanceToClosestBeacon, targetRowY);
    const coveredPositionsCount = mergedIntervals.reduce((total, [start, end]) => total + (end - start + 1), 0);
    const beaconsInRow = new Set(beacons.filter((beacon) => beacon.y === targetRowY).map((point) => point.x));
    return coveredPositionsCount - beaconsInRow.size;
}

export function solvePart2(input: string): any {
    const [beacons, sensorsAndDistanceToClosestBeacon] = parseInput(input);
    const maxY = isExample(beacons) ? PART_2_MAX_COORD_EXAMPLE : PART_2_MAX_COORD;

    for (let y = PART_2_MIN_COORD; y < maxY; y++) {
        const intervals = getRowCollissionIntervals(sensorsAndDistanceToClosestBeacon, y);
        if (intervals.length === 1) continue;
        const distressBeaconX = intervals[0][1] + 1;
        return distressBeaconX * PART_2_MAX_COORD + y;
    }
}
