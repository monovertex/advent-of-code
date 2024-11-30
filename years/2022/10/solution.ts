import '../../prototype-extensions';

const QUERY_TIMER_START = 20;
const QUERY_TIMER_INTERVAL = 40;
const CRT_ROW_LENGTH = 40;
const SPRITE_SPREAD = 1;

function isSpriteAtLocation(targetLocation: number, spriteCenterLocation: number): boolean {
    return spriteCenterLocation - SPRITE_SPREAD <= targetLocation &&
    targetLocation <= spriteCenterLocation + SPRITE_SPREAD;
}

function isClockCycleAtQueryInterval(clockCycle: number): boolean {
    return (clockCycle - QUERY_TIMER_START) % QUERY_TIMER_INTERVAL === 0;
}

function simulateCLock(input: string, callback: (clockCycle: number, register: number) => void) {
    const commandStack = input.splitByNewLine().reverse();
    let clockCycle = 1;
    let pendingRegisterAdd;
    let register = 1;

    while (true) {
        callback(clockCycle, register);

        if (pendingRegisterAdd) {
            register += pendingRegisterAdd;
            pendingRegisterAdd = undefined;
        } else {
            const [command, value] = commandStack.pop()!.split(' ');
            if (command === 'addx') pendingRegisterAdd = parseInt(value);
        }

        clockCycle++;

        if (commandStack.length === 0) break;
    }
}

export function solvePart1(input: string): any {
    let totalStrength = 0;
    simulateCLock(input, (clockCycle, register) => {
        if (isClockCycleAtQueryInterval(clockCycle))
            totalStrength += register * clockCycle;
    });
    return totalStrength;
}

export function solvePart2(input: string): any {
    let result = '';
    simulateCLock(input, (clockCycle, register) => {
        const drawLocation = (clockCycle - 1) % CRT_ROW_LENGTH;
        if (isSpriteAtLocation(drawLocation, register)) result += '#';
        else result += '.';
        if (drawLocation === CRT_ROW_LENGTH - 1) result += '\n';
    });
    return result.trim();
}
