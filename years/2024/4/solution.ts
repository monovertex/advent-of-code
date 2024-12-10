import { ALL_DIRECTION_VECTORS_2D, DIAGONAL_DIRECTION_VECTORS_2D_MAP, DIAGONAL_DIRECTIONS, IMatrix, Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

type Pattern = {
    letters: string[],
    coordinates: Point2D[],
}

function matchPattern(pattern: Pattern, startingPoint: Point2D, matrix: IMatrix<string>) {
    return pattern.coordinates.every((vector: Point2D, index: number) => {
        const point = startingPoint.add(vector);
        if (!matrix.isPointInBounds(point)) return false;
        return matrix.getValue(point) === pattern.letters[index]
    })
}

const LETTER_SEQUENCE_PART2 = ['M', 'A', 'S'];
const LETTER_SEQUENCE_PART1 = ['X', ...LETTER_SEQUENCE_PART2];

function solve(input: string, targetLetter: string, patterns: Pattern[]) {
    const matrix = stringToStringMatrix(input);
    return matrix
        .filterPoints((_point: Point2D, value: string) => value === targetLetter)
        .map((point: Point2D): number => patterns.countBy((pattern) => matchPattern(pattern, point, matrix)))
        .sum();
}

export function solvePart1(input: string): number {
    const patterns: Pattern[] = ALL_DIRECTION_VECTORS_2D.map((vector: Point2D) => ({
        letters: [...LETTER_SEQUENCE_PART1],
        coordinates: LETTER_SEQUENCE_PART1.map((_letter: string, index: number) => vector.multiply(index))
    }));
    return solve(input, LETTER_SEQUENCE_PART1[0], patterns);
}

export function solvePart2(input: string): number {
    // Generate possible patterns for each diagonal.
    const diagonalDirections = [
        [DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_POSITIVE, DIAGONAL_DIRECTIONS.X_POSITIVE_Y_NEGATIVE],
        [DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_NEGATIVE, DIAGONAL_DIRECTIONS.X_POSITIVE_Y_POSITIVE],
    ];
    const patternLetters = [LETTER_SEQUENCE_PART2[0], LETTER_SEQUENCE_PART2[2]];
    const diagonalPatterns = diagonalDirections.map((directions) =>
        [patternLetters, [...patternLetters].reverse()].map((letters): Pattern => ({
            letters,
            coordinates: directions.map((direction) => DIAGONAL_DIRECTION_VECTORS_2D_MAP.get(direction)!)
        } as Pattern))
    );

    // Combine every option for one diagonal with every option for the other diagonal.
    const patterns = diagonalPatterns[0].flatMap((firstDiagonalPattern) => {
        return diagonalPatterns[1].map((secondDiagonalPatterns) => {
            return {
                letters: [...firstDiagonalPattern.letters, ...secondDiagonalPatterns.letters],
                coordinates: [...firstDiagonalPattern.coordinates, ...secondDiagonalPatterns.coordinates],
            };
        });
    });

    return solve(input, LETTER_SEQUENCE_PART2[1], patterns);
}
