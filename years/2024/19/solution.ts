import { memoize } from '../../common';
import '../../prototype-extensions';

function iterate(patterns: string[], design: string): bigint {
    const iterateWithMemoization = memoize(
        (patterns: string[], design: string): bigint => {
            return patterns.map((pattern) => {
                if (!design.startsWith(pattern)) return 0n;
                const rest = design.slice(pattern.length);
                if (rest.length === 0) return 1n;
                return iterateWithMemoization(patterns, rest);
            }).sum();
        },
        (_patterns: string[], design: string) => design
    );
    return iterateWithMemoization(patterns, design);
}

function parse(input: string) {
    const [patternsInput, designsInput] = input.splitByDoubleNewLine();
    return [patternsInput.splitByComma(), designsInput.splitByNewLine()];
}

export function solvePart1(input: string): number {
    const [patterns, designs] = parse(input);
    return designs.filter((design) => iterate(patterns, design) > 0).length;
}

export function solvePart2(input: string): bigint {
    const [patterns, designs] = parse(input);
    return designs.map((design) => iterate(patterns, design)).sum();
}
