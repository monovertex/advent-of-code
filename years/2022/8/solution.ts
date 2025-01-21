import '@prototype-extensions';
import { Matrix, ORTHOGONAL_DIRECTION_VECTORS_2D, Point2D, stringToNumberMatrix } from '@common';

function isTreeVisible(treeLines: number[][], treeHeight: number) {
    return treeLines.some((line: number[]) => line.max() < treeHeight);
}

function getScenicScore(treeLines: number[][], treeHeight: number) {
    return treeLines.reduce((score: number, line: number[]) => {
        const firstBlockingTree: number = line.findIndex((height) => height >= treeHeight);
        return score * (firstBlockingTree === -1 ? line.length : firstBlockingTree + 1);
    }, 1);
}

function getTreeLines(matrix: Matrix<number>, point: Point2D): number[][] {
    return ORTHOGONAL_DIRECTION_VECTORS_2D.map((vector) => {
        const line: number[] = [];
        for (let newPoint = point.add(vector); ; newPoint = newPoint.add(vector)) {
            if (!matrix.isPointInBounds(newPoint)) break;
            line.push(matrix.getValue(newPoint));
        }
        return line;
    });
}

function reduceTrees<T>(input: string, callback: (accumulator: T, treeLines: number[][], treeHeight: number) => T, accumulator: T) {
    const matrix = stringToNumberMatrix(input);
    return matrix.reducePoints((result: T, point: Point2D, treeHeight: number) => {
        const treeLines: number[][] = getTreeLines(matrix, point);
        return callback(result, treeLines, treeHeight);
    }, accumulator);
}

export function solvePart1(input: string): any {
    return reduceTrees<number>(input, (visibleTreesCount: number, treeLines: number[][], treeHeight: number) => {
        if (isTreeVisible(treeLines, treeHeight)) return visibleTreesCount + 1;
        return visibleTreesCount;
    }, 0);
}

export function solvePart2(input: string): any {
    return reduceTrees(input, (scenicScores: number[], treeLines: number[][], treeHeight: number) => {
        scenicScores.push(getScenicScore(treeLines, treeHeight));
        return scenicScores;
    }, []).max()
}
