import '../../prototype-extensions';

const CARD_STRENGTH = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'T', 'J', 'Q', 'K', 'A'];
const CARD_STRENGTH_WITH_JOKER = ['J', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'T', 'Q', 'K', 'A'];

enum HAND_TYPE {
    FIVE_OF_A_KIND,
    FOUR_OF_A_KIND,
    FULL_HOUSE,
    THREE_OF_A_KIND,
    TWO_PAIR,
    ONE_PAIR,
    HIGH_CARD,
};

const HAND_STRENGTH = [HAND_TYPE.HIGH_CARD, HAND_TYPE.ONE_PAIR, HAND_TYPE.TWO_PAIR, HAND_TYPE.THREE_OF_A_KIND, HAND_TYPE.FULL_HOUSE, HAND_TYPE.FOUR_OF_A_KIND, HAND_TYPE.FIVE_OF_A_KIND];

const countPairs = (cardCounts: number[]) => cardCounts.filter((count) => count === 2).length

const CARD_IDENTIFICATORS: [HAND_TYPE, (cardCounts: number[], jokerCount: number) => boolean][] = [
    [
        HAND_TYPE.FIVE_OF_A_KIND,
        (cardCounts: number[], jokerCount: number) =>
            jokerCount === 5 || jokerCount === 4 || cardCounts.includes(5 - jokerCount)
    ],
    [
        HAND_TYPE.FOUR_OF_A_KIND,
        (cardCounts: number[], jokerCount: number) =>
            jokerCount === 3 || cardCounts.includes(4 - jokerCount)
    ],
    [
        HAND_TYPE.FULL_HOUSE,
        // More than 1 joker results in a different combo in any setup
        // 2 jokers + 3 of a kind = five of a kind
        // 2 jokers + 2 of a kind = four of a kind
        // 2 jokers + 3 different cards = three of a kind
        (cardCounts: number[], jokerCount: number) =>
            (jokerCount === 1 && countPairs(cardCounts) === 2) ||
            (cardCounts.includes(3) && cardCounts.includes(2))
    ],
    [
        HAND_TYPE.THREE_OF_A_KIND,
        (cardCounts: number[], jokerCount: number) =>
            jokerCount === 2 || cardCounts.includes(3 - jokerCount)
    ],
    [
        HAND_TYPE.TWO_PAIR,
        (cardCounts: number[], jokerCount: number) =>
            countPairs(cardCounts) >= (2 - jokerCount)
    ],
    [
        HAND_TYPE.ONE_PAIR,
        (cardCounts: number[], jokerCount: number) =>
            cardCounts.includes(2 - jokerCount)
    ]
];

function getCardStrength(card: string, useJoker: boolean): number {
    return useJoker ? CARD_STRENGTH_WITH_JOKER.indexOf(card) : CARD_STRENGTH.indexOf(card);
}

function identifyHand(hand: string[], useJoker: boolean): HAND_TYPE {
    const uniqueCounts = hand.countUniques();
    const jokerCount = useJoker ? uniqueCounts.get('J') || 0 : 0;
    if (useJoker) uniqueCounts.delete('J');
    const cardCounts = [...uniqueCounts.values()];

    for (const [handType, identificator] of CARD_IDENTIFICATORS) {
        if (identificator(cardCounts, jokerCount)) return handType;
    }
    return HAND_TYPE.HIGH_CARD;
}

function handsComparator(handA: string[], handB: string[], useJoker: boolean): number {
    const handTypeA = identifyHand(handA, useJoker);
    const handTypeB = identifyHand(handB, useJoker);

    if (handTypeA !== handTypeB)
        return HAND_STRENGTH.indexOf(handTypeA) - HAND_STRENGTH.indexOf(handTypeB);

    for (let index = 0; index < handA.length; index++) {
        if (handA[index] !== handB[index])
            return getCardStrength(handA[index], useJoker) - getCardStrength(handB[index], useJoker);
    }
    return 0;
}

function solve(input: string, useJoker: boolean): number {
    return input
        .splitByNewLine()
        .map((line) => line.splitByWhitespace())
        .map(([hand, bid]) => [hand.toArray(), Number(bid)])
        .sort(([handA], [handB]) => handsComparator(handA as string[], handB as string[], useJoker))
        .map(([, bid], index) => (index + 1) * (bid as number))
        .sum();
}

export function solvePart1(input: string): any {
    return solve(input, false);
}

export function solvePart2(input: string): any {
    return solve(input, true);
}
