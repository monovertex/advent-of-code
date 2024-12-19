import { memoize } from '../../common';
import '../../prototype-extensions';

const iterate = memoize(
    (patterns: string[], design: string): number => {
        return patterns.map((pattern) => {
            if (!design.startsWith(pattern)) return 0;
            const rest = design.slice(pattern.length);
            if (rest.length === 0) return 1;
            return iterate(patterns, rest);
        }).sum();
    },
    (_patterns: string[], design: string) => design
);

function parse(input: string) {
    const [patternsInput, designsInput] = input.splitByDoubleNewLine();
    return [patternsInput.splitByComma(), designsInput.splitByNewLine()];
}

export function solvePart1(input: string): number {
    const [patterns, designs] = parse(input);
    return designs.filter((design) => iterate(patterns, design) > 0).length;
}

export function solvePart2(input: string): number {
    const [patterns, designs] = parse(input);
    return designs.map((design) => iterate(patterns, design)).sum();
}
