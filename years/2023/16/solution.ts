import { IMatrix, ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const TILE_TYPE = {
    EMPTY: '.',
    MIRROR_UP: '/',
    MIRROR_DOWN: '\\',
    SPLITTER_VERTICAL: '|',
    SPLITTER_HORIZONTAL: '-',
}

function getNewBeamDirections(beamDirection: ORTHOGONAL_DIRECTIONS, tileType: string): ORTHOGONAL_DIRECTIONS[] {
    if (tileType === TILE_TYPE.EMPTY) return [beamDirection];

    if (tileType === TILE_TYPE.MIRROR_UP) {
        switch(beamDirection) {
            case ORTHOGONAL_DIRECTIONS.X_POSITIVE: return [ORTHOGONAL_DIRECTIONS.Y_POSITIVE];
            case ORTHOGONAL_DIRECTIONS.X_NEGATIVE: return [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];
            case ORTHOGONAL_DIRECTIONS.Y_POSITIVE: return [ORTHOGONAL_DIRECTIONS.X_POSITIVE];
            case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE: return [ORTHOGONAL_DIRECTIONS.X_NEGATIVE];
        }
    }

    if (tileType === TILE_TYPE.MIRROR_DOWN) {
        switch(beamDirection) {
            case ORTHOGONAL_DIRECTIONS.X_POSITIVE: return [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];
            case ORTHOGONAL_DIRECTIONS.X_NEGATIVE: return [ORTHOGONAL_DIRECTIONS.Y_POSITIVE];
            case ORTHOGONAL_DIRECTIONS.Y_POSITIVE: return [ORTHOGONAL_DIRECTIONS.X_NEGATIVE];
            case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE: return [ORTHOGONAL_DIRECTIONS.X_POSITIVE];
        }
    }

    if (tileType === TILE_TYPE.SPLITTER_VERTICAL) {
        switch(beamDirection) {
            case ORTHOGONAL_DIRECTIONS.X_POSITIVE:
            case ORTHOGONAL_DIRECTIONS.X_NEGATIVE:
                return [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, ORTHOGONAL_DIRECTIONS.Y_POSITIVE];
            case ORTHOGONAL_DIRECTIONS.Y_POSITIVE: return [ORTHOGONAL_DIRECTIONS.Y_POSITIVE];
            case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE: return [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE];
        }
    }

    if (tileType === TILE_TYPE.SPLITTER_HORIZONTAL) {
        switch(beamDirection) {
            case ORTHOGONAL_DIRECTIONS.X_POSITIVE: return [ORTHOGONAL_DIRECTIONS.X_POSITIVE];
            case ORTHOGONAL_DIRECTIONS.X_NEGATIVE: return [ORTHOGONAL_DIRECTIONS.X_NEGATIVE];
            case ORTHOGONAL_DIRECTIONS.Y_POSITIVE:
            case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE:
                return [ORTHOGONAL_DIRECTIONS.X_NEGATIVE, ORTHOGONAL_DIRECTIONS.X_POSITIVE];
        }
    }

    return [];
}

export function simulateBeam(matrix: IMatrix<string>, startingPoint: Point2D, startingDirection: ORTHOGONAL_DIRECTIONS): number {
    const beams: [Point2D, ORTHOGONAL_DIRECTIONS][] = [[startingPoint, startingDirection]];
    const beamCache = new Set<string>();

    while (beams.length > 0) {
        const [beamLocation, beamDirection]: [Point2D, ORTHOGONAL_DIRECTIONS] | undefined = beams.shift()!;
        if (!matrix.isPointInBounds(beamLocation)) continue;

        const serializedBeamLocation = beamLocation.toString();
        const serializedBeam = `${serializedBeamLocation}-${beamDirection}`;
        if (beamCache.has(serializedBeam)) continue;
        beamCache.add(serializedBeam);
        for (const newDirection of getNewBeamDirections(beamDirection, matrix.getValue(beamLocation))) {
            const beamDirectionVector = ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(newDirection)!;
            beams.push([beamLocation.add(beamDirectionVector), newDirection]);
        }
    }

    return beamCache
        .valuesArray()
        .map((serializedBeam) => serializedBeam.split('-')[0])
        .unique()
        .sort()
        .length;
}

export function solvePart1(input: string): any {
    const matrix = stringToStringMatrix(input);
    return simulateBeam(matrix, new Point2D(0, matrix.height - 1), ORTHOGONAL_DIRECTIONS.X_POSITIVE);
}

export function solvePart2(input: string): any {
    const matrix = stringToStringMatrix(input);
    const energizedTileCounts = [];

    // Simulate beams from top and bottom.
    for (let x = 0; x < matrix.width; x++) {
        energizedTileCounts.push(simulateBeam(matrix, new Point2D(x, 0), ORTHOGONAL_DIRECTIONS.Y_POSITIVE));
        energizedTileCounts.push(simulateBeam(matrix, new Point2D(x, matrix.height - 1), ORTHOGONAL_DIRECTIONS.Y_NEGATIVE));
    }

    // Simulate beams from left and right.
    for (let y = 0; y < matrix.width; y++) {
        energizedTileCounts.push(simulateBeam(matrix, new Point2D(0, y), ORTHOGONAL_DIRECTIONS.X_POSITIVE));
        energizedTileCounts.push(simulateBeam(matrix, new Point2D(matrix.width - 1, y), ORTHOGONAL_DIRECTIONS.X_NEGATIVE));
    }

    return energizedTileCounts.max();
}
