import { ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D, findIndexOfPoint } from '../../common';
import '../../prototype-extensions';

const MAX_WIDTH = 6;
const PIECES = [
    [
        // Horizontal Bar
        new Point2D(0, 0),
        new Point2D(1, 0),
        new Point2D(2, 0),
        new Point2D(3, 0),
    ],
    [
        // Plus
        new Point2D(1, 0),
        new Point2D(0, 1),
        new Point2D(1, 1),
        new Point2D(2, 1),
        new Point2D(1, 2),
    ],
    [
        // L
        new Point2D(0, 0),
        new Point2D(1, 0),
        new Point2D(2, 0),
        new Point2D(2, 1),
        new Point2D(2, 2),
    ],
    [
        // Vertical Bar
        new Point2D(0, 0),
        new Point2D(0, 1),
        new Point2D(0, 2),
        new Point2D(0, 3),
    ],
    [
        // Square
        new Point2D(0, 0),
        new Point2D(0, 1),
        new Point2D(1, 0),
        new Point2D(1, 1),
    ]
]
const FALLING_DIRECTION_VECTOR = ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_NEGATIVE)!;

function movePiece(piece: Point2D[], move: Point2D): Point2D[] {
    return piece.map((point) => point.add(move));
}

function isPieceLocationValid(piece: Point2D[], staticPieces: Point2D[][]): boolean {
    if (piece.some((point) => point.x < 0 || point.x > MAX_WIDTH || point.y === 0)) return false;
    const staticPiecePoints = staticPieces.flat();
    return piece.every((piecePoint) => findIndexOfPoint(staticPiecePoints, piecePoint) === -1);
}

function getMovesFromInput(input: string): Point2D[] {
    return input.toArray().map((char) => char === '>'
        ? ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_POSITIVE)!
        : ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_NEGATIVE)!
    );
}

function serializeState(pieceIndex: number, moveIndex: number, maxHeightPerColumn: number[]): string {
    const maxHeight = maxHeightPerColumn.max();
    const normalizedmaxHeightPerColumn = maxHeightPerColumn.map((row) => maxHeight - row);
    return `${pieceIndex}-${moveIndex}-${normalizedmaxHeightPerColumn.join('-')}`;
}

function simulatePieces(moves: Point2D[], targetPieceCount: number): number {
    let currentMoveIndex = 0;
    let currentPieceIndex = 0;
    const maxHeightPerColumn = Array(MAX_WIDTH + 1).fill(0);
    const staticPieces: Point2D[][] = [];
    const stateKeys: string[] = [];
    const cycleHeights: number[] = [];
    let cycledHeight: number = 0;
    let remainingPieces = null;

    for (let pieceCount = 0; true; pieceCount++) {
        const maxHeight = maxHeightPerColumn.max();
        if (pieceCount === targetPieceCount) return maxHeight;

        const currentStateKey = serializeState(currentPieceIndex, currentMoveIndex, maxHeightPerColumn);
        if (remainingPieces === 0) return cycledHeight + maxHeight;
        else if (remainingPieces !== null) remainingPieces--;
        else if (stateKeys.includes(currentStateKey)) {
            const currentStateKeyIndex = stateKeys.indexOf(currentStateKey);
            const cyclePieceCount = pieceCount - currentStateKeyIndex;
            const cycleHeight = maxHeight - cycleHeights[currentStateKeyIndex];
            remainingPieces = (targetPieceCount - pieceCount) % cyclePieceCount - 1;
            cycledHeight = cycleHeight * Math.floor((targetPieceCount - pieceCount) / cyclePieceCount);
        } else {
            stateKeys.push(currentStateKey);
            cycleHeights.push(maxHeight);
        }

        let piece = movePiece(PIECES[currentPieceIndex], new Point2D(2, maxHeight + 4));

        while (true) {
            const pieceMovedHorizontally = movePiece(piece, moves[currentMoveIndex]);
            if (isPieceLocationValid(pieceMovedHorizontally, staticPieces)) piece = pieceMovedHorizontally;
            currentMoveIndex = (currentMoveIndex + 1) % moves.length;

            const pieceMovedDown = movePiece(piece, FALLING_DIRECTION_VECTOR);

            if (isPieceLocationValid(pieceMovedDown, staticPieces)) {
                piece = pieceMovedDown;
                continue;
            }

            if (staticPieces.length > 100) staticPieces.shift();
            staticPieces.push(piece);
            piece.forEach((piecePoint) => maxHeightPerColumn[piecePoint.x] = Math.max(maxHeightPerColumn[piecePoint.x], piecePoint.y));
            break;
        }

        currentPieceIndex = (currentPieceIndex + 1) % PIECES.length;
    }
}

export function solvePart1(input: string): any {
    return simulatePieces(getMovesFromInput(input), 2_022);
}

export function solvePart2(input: string): any {
    return simulatePieces(getMovesFromInput(input), 1_000_000_000_000);
}
