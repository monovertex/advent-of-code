import { ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, ORTHOGONAL_DIRECTIONS, Point2D, rotateDirectionClockwise, rotateDirectionCounterClockwise, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

type Region = {
    identifier: string;
    area: number;
    perimeter: number;
    sides: number;
}

class Side {
    facingDirection: ORTHOGONAL_DIRECTIONS;
    points: Point2D[] = [];
    #edgeDirections;

    constructor(facingDirection: ORTHOGONAL_DIRECTIONS) {
        this.facingDirection = facingDirection;
        this.#edgeDirections = [
            rotateDirectionClockwise(this.facingDirection),
            rotateDirectionCounterClockwise(this.facingDirection)
        ];
    }

    addPoint(point: Point2D) {
        this.points.push(point);
    }

    isPointOnSide(facingDirection: ORTHOGONAL_DIRECTIONS, point: Point2D) {
        if (this.facingDirection !== facingDirection) return false;
        return this.points.some((sidePoint) => this.#edgeDirections
            .map((direction) => point.getOrthogonalNeighbor(direction))
            .some((neighborPoint) => neighborPoint.equals(sidePoint)));
    }

    toString() {
        return `${this.facingDirection} - ${this.#edgeDirections} - ${this.points.map((point) => point.toString()).join('; ')}`;
    }
}

export function analyzeRegions(input: string): Region[] {
    const matrix = stringToStringMatrix(input);
    const startPoint = new Point2D(0, 0);

    let potentialRegionsQueue: Point2D[] = [startPoint];
    const pointQueue: Point2D[] = [];
    const visited: Set<string> = new Set();
    const result: Region[] = [];

    while (potentialRegionsQueue.isNotEmpty()) {
        let regionArea = 0;
        let regionPerimeter = 0;
        const sides: Side[] = [];

        const regionStartPoint = potentialRegionsQueue.shift()!;
        pointQueue.push(regionStartPoint);
        visited.add(regionStartPoint.getUniqueKey());

        while (pointQueue.isNotEmpty()) {
            const currentPoint = pointQueue.shift()!;
            const currentRegion = matrix.getValue(currentPoint);
            regionArea += 1;
            // Ensure that the current region is not going to be visited again in the future.
            potentialRegionsQueue = potentialRegionsQueue.reject((point: Point2D) => point.equals(currentPoint));

            for (const direction of ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.keysArray()) {
                const neighborPoint = currentPoint.getOrthogonalNeighbor(direction);
                const isPointInBounds = matrix.isPointInBounds(neighborPoint);
                const neighborRegion = isPointInBounds ? matrix.getValue(neighborPoint) : undefined;
                const isNeighborInSameRegion = neighborRegion === currentRegion;

                // If the neighbor is not in the same region (out of bounds or different region),
                // increase the perimeter and analyze the side.
                if (!isNeighborInSameRegion) {
                    regionPerimeter += 1;
                    let side = sides.find((side) => side.isPointOnSide(direction, currentPoint));
                    if (!side) {
                        side = new Side(direction);
                        sides.push(side);
                    }
                    side.addPoint(currentPoint);
                }

                if (!isPointInBounds) continue; // Skip out of bounds points.

                const neighborUniqueKey = neighborPoint.getUniqueKey();
                const hasVisitedNeighbor = visited.has(neighborUniqueKey);
                if (hasVisitedNeighbor) continue; // Skip visited points.

                // For nodes in the same region, add them to the queue to be visited; otherwise,
                // add them as a potential new region to be visited in the outer loop.
                if (isNeighborInSameRegion) {
                    visited.add(neighborUniqueKey);
                    pointQueue.push(neighborPoint);
                } else {
                    potentialRegionsQueue.push(neighborPoint);
                }
            }
        }

        // We have to merge sides, in case they didn't touch during the analysis.
        const mergedSides = sides.reduce((result: Side[], side: Side) => {
            const matchingSide = result.find((resultSide) => side.points.some((point) =>
                resultSide.isPointOnSide(side.facingDirection, point)));
            if (matchingSide) {
                matchingSide.points.push(...side.points);
            } else {
                result.push(side);
            }
            return result;
        }, [] as Side[]);

        result.push({
            identifier: matrix.getValue(regionStartPoint),
            area: regionArea,
            perimeter: regionPerimeter,
            sides: mergedSides.length
        });
    }

    return result;
}

export function solvePart1(input: string): number {
    const regions = analyzeRegions(input);
    return regions.map((region) => region.area * region.perimeter).sum();
}

export function solvePart2(input: string): number {
    const regions = analyzeRegions(input);
    return regions.map((region) => region.area * region.sides).sum();
}
