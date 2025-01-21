import { Graph, GraphNode } from '@common';
import '@prototype-extensions';

type Clique = GraphNode[];

function getCliqueKey(clique: Clique): string {
    return clique.map((node) => node.getUniqueKey()).sort().join(',');
}

function parseInput(input: string): Graph<GraphNode> {
    const graph = new Graph<GraphNode>(GraphNode);
    input.splitByNewLine().forEach((line) => {
        const [from, to] = line.splitByDash().map((identifier) => graph.findOrCreateNode(identifier));
        graph.addEdge(from, to);
    });
    return graph;
}

function isCliqueValid(graph: Graph, clique: Clique): boolean {
    for (let i = 0; i < clique.length; i++) {
        for (let j = i + 1; j < clique.length; j++) {
            if (!graph.hasEdge(clique[i], clique[j])) return false;
        }
    }
    return true;
}

export function solvePart1(input: string): number {
    const graph = parseInput(input);
    const nodes = graph.nodeList;
    const cliques: Clique[] = [];
    const cliqueKeys = new Set<string>();

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            for (let k = j + 1; k < nodes.length; k++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];
                const nodeC = nodes[k];

                const clique = [nodeA, nodeB, nodeC];
                if (!isCliqueValid(graph, clique)) continue;

                const cliqueKey = getCliqueKey(clique);
                if (cliqueKeys.has(cliqueKey)) continue;

                cliques.push(clique);
                cliqueKeys.add(cliqueKey);
            }
        }
    }

    return cliques.filter((nodes) => nodes.some((node) => node.identifier.startsWith('t'))).length;
}

function findMaxClique(graph: Graph): Clique {
    let clique: Clique = [];
    graph.forEachNode((nodeA) => {
        const newClique = [nodeA];
        graph.forEachNode((nodeB) => {
            if (!graph.hasEdge(nodeA, nodeB)) return;
            if (isCliqueValid(graph, [...newClique, nodeB])) newClique.push(nodeB);
        });
        if (newClique.length > clique.length) clique = newClique;
    });
    return clique;
}

export function solvePart2(input: string): string {
    const graph = parseInput(input);
    const maxClique = findMaxClique(graph);
    return getCliqueKey(maxClique);
}
