import '@prototype-extensions';

const SNAFU_DIGITS = Object.freeze(['=', '-', '0', '1', '2']);

function decimalToSnafu(input: number): string {
    let digits = [];
    let remainder = input;

    while (remainder !== 0) {
        const base5Digit = remainder % 5;
        if (base5Digit <= 2) digits.push(base5Digit);
        else {
            const difference = 5 - base5Digit;
            remainder += difference;
            digits.push(-difference);
        }
        remainder = Math.floor(remainder / 5);
    }

    return digits.reverse().map(digit => SNAFU_DIGITS[digit + 2]).join('');
}

function snafuToDecimal(input: string): number {
    const digits = input.split('').reverse();
    return digits.reduce((result, digit, index) => {
        const base = Math.pow(5, index);
        if (digit === '-') return result - base;
        if (digit === '=') return result - base - base;
        return result + base * Number(digit);
    }, 0);
}

export function solvePart1(input: string): string {
    return decimalToSnafu(input.splitByNewLine().map(snafuToDecimal).sum());
}
