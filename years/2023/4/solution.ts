import '@prototype-extensions';

function parseInput(input: string) {
    return input.splitByNewLine().map((line) => {
        const [, numbers] = line.split(': ');
        const [winningNumbersFragment, cardNumbersFragment] = numbers.split(' | ');
        const winningNumbers = winningNumbersFragment.splitByWhitespace().toNumbers();
        const cardNumbers = cardNumbersFragment.splitByWhitespace().toNumbers();
        return { winningNumbers, cardNumbers };
    });
};

export function solvePart1(input: string): any {
    const tickets = parseInput(input);
    return tickets.map(({ winningNumbers, cardNumbers }) => {
        let score = 0;
        const matches = [];
        for (const cardNumber of cardNumbers) {
            if (!winningNumbers.includes(cardNumber)) continue;
            matches.push(cardNumber);
            if (score === 0) score = 1;
            else score = score * 2;
        }
        return score;
    }).sum();
}

export function solvePart2(input: string): any {
    const matchCounts = parseInput(input).map(({ winningNumbers, cardNumbers }) =>
        cardNumbers.filter((cardNumber) => winningNumbers.includes(cardNumber)).length);
    const cardCounts = new Array(matchCounts.length).fill(1);
    matchCounts.forEach((matchCount, index) => {
        for (let i = 1; i <= matchCount; i++) {
            cardCounts[index + i] += cardCounts[index];
        }
    });
    return cardCounts.sum();
}
