import { GraphNode, findLeastCommonMultipleOfList } from '@common';
import '@prototype-extensions';

class Node extends GraphNode {
    neighbors: Node[] = [];

    toString() {
        return `${this.identifier} -> ${this.neighbors.map((neighbor) => (neighbor as Node).identifier).join(',')}`;
    }
}

function parseInput(input: string): [number[], Map<string, Node>] {
    const [directionsInput, nodesInput] = input.splitByDoubleNewLine();
    const directions = directionsInput.toArray().map((char) => char === 'R' ? 1 : 0);
    const rawNodes = nodesInput.splitByNewLine().map((line) => line.split(' = '));
    const nodes: Map<string, Node> = new Map(rawNodes.map(([id]) => [id, new Node(id)]));
    rawNodes.forEach(([id, neighbors]) => {
        nodes.get(id)!.neighbors = neighbors.replace('(', '').replace(')', '').splitByComma().map((neighborId) => nodes.get(neighborId)!);
    });
    return [directions, nodes];
}

function solve(
    input: string,
    startingNodeGetter: (nodes: Map<string, Node>) => Node[],
    endingNodeGetter: (nodes: Map<string, Node>) => Node[]
): bigint {
    const [directions, nodes] = parseInput(input);
    let currentNodes = startingNodeGetter(nodes);
    const endingNodes = endingNodeGetter(nodes);
    const loopLengths: bigint[] = [];

    let steps: bigint = 0n;
    let directionIndex = 0;
    while (currentNodes.length > 0) {
        currentNodes.forEach((node, nodeIndex) => currentNodes[nodeIndex] = node.neighbors[directions[directionIndex]]! as Node);
        const finishedNodes = currentNodes.filter((node) => endingNodes.includes(node));
        if (finishedNodes.length > 0) {
            loopLengths.push(steps + 1n);
            currentNodes = currentNodes.without(...finishedNodes);
        }
        directionIndex = (directionIndex + 1) % directions.length;
        steps++
    }

    if (loopLengths.length === 1) return loopLengths[0];
    // The loop start seems to be equal to the loop length, so we can just find the LCM of the lengths.
    return findLeastCommonMultipleOfList(loopLengths);
}

export function solvePart1(input: string): any {
    return solve(
        input,
        (nodes: Map<string, Node>) => [nodes.get('AAA')!],
        (nodes: Map<string, Node>) => [nodes.get('ZZZ')!]
    );
}

export function solvePart2(input: string): any {
    return solve(
        input,
        (nodes: Map<string, Node>) => nodes.filter((identifier, node) => node.identifier.endsWith('A')).valuesArray(),
        (nodes: Map<string, Node>) => nodes.filter((identifier, node) => node.identifier.endsWith('Z')).valuesArray(),
    );
}
