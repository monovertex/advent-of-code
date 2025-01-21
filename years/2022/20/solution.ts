import '@prototype-extensions';
import util from 'util';

class Node {
    value: bigint;

    constructor(value: bigint) {
        this.value = value;
    }
}

class List {
    nodes: Node[];
    #sequence: Node[];

    get nodeCount() {
        return this.nodes.length;
    }

    constructor(values: bigint[]) {
        this.nodes = values.map((value) => new Node(value));
        this.#sequence = [...this.nodes];
    }

    getZeroIndex(): number {
        return this.#sequence.findIndex((node) => node.value === 0n)!;
    }

    translateNode(node: Node, steps: bigint) {
        const currentIndex = this.#sequence.indexOf(node)!;
        const newIndex = this.#resolveIndexAfterSteps(currentIndex, steps);
        this.#sequence.splice(currentIndex, 1);
        this.#sequence.splice(newIndex, 0, node);
    }

    getValueAtIndex(indexOffset: number) {
        const targetIndex = (this.getZeroIndex() + indexOffset) % this.nodeCount;
        return this.#sequence[targetIndex].value;
    }

    toString(): string {
        return this.#sequence.map((node) => node.value).join(', ');
    }

    [util.inspect.custom]() {
        return this.toString();
    }

    #resolveIndexAfterSteps(currentIndex: number, steps: bigint): number {
        // Account for taking the item out of the sequence.
        const wrappedSteps = Number(steps % BigInt(this.nodeCount - 1));
        const newIndex = currentIndex + wrappedSteps;

        if (newIndex <= 0) return newIndex + this.nodeCount - 1;
        if (newIndex >= this.nodeCount) return newIndex - this.nodeCount + 1;
        return newIndex;
    }
}

function solve(input: string, encryptionKey: bigint = 1n, mixingRounds: number = 1): bigint {
    const values = input.splitByNewLine().toBigInts().map((value) => value * encryptionKey);
    const list = new List(values);
    for (let round = 0; round < mixingRounds; round++)
        list.nodes.forEach((node) => list.translateNode(node, node.value));

    return [
        list.getValueAtIndex(1000),
        list.getValueAtIndex(2000),
        list.getValueAtIndex(3000),
    ].sum();
}

export function solvePart1(input: string): bigint {
    return solve(input);
}

export function solvePart2(input: string): bigint {
    return solve(input, 811589153n, 10);
}
