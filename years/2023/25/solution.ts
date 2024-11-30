import { GraphNode, Graph } from '../../common';
import '../../prototype-extensions';

export function solvePart1(input: string): number {
    const graph = new Graph(GraphNode);
    input.splitByNewLine().forEach((line) => {
        const [nodeName, neighborNamesInput] = line.split(': ');
        const neighborNames = neighborNamesInput.splitByWhitespace();
        const node = graph.findOrCreateNode(nodeName);
        const neighbors = neighborNames.map((neighborName) => graph.findOrCreateNode(neighborName));
        neighbors.forEach((neighbor) => graph.addEdge(node, neighbor));
    });
    console.log(graph);
    return 0;
}

export function solvePart2(input: string): number {
    return 0;
}
