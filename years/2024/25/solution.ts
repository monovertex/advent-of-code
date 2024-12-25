import { Point2D, stringToStringMatrix } from '../../common';
import '../../prototype-extensions';

const PIN_SYMBOL = '#';

function parseLockOrKey(input: string): [boolean, number[]] {
    const matrix = stringToStringMatrix(input);
    const pins = matrix.mapColumns((column) => column.countBy((value) => value === PIN_SYMBOL) - 1);
    const isLock = matrix.getValue(new Point2D(0, 0)) === PIN_SYMBOL;
    return [isLock, pins];
}

function keyMatchesLock(key: number[], lock: number[]): boolean {
    return key.zip(lock).every(([keyPin, lockPin]) => keyPin + lockPin <= 5);
}

export function solvePart1(input: string): number {
    const [locks, keys] = input
        .splitByDoubleNewLine()
        .map(parseLockOrKey)
        .groupBy(([isLock]) => isLock)
        .valuesArray()
        .map((group) => group.map(([, pins]) => pins));

    return locks.reduce((locksResult, lock) => {
        return locksResult + keys.countBy((key) => keyMatchesLock(key, lock));
    }, 0);
}
