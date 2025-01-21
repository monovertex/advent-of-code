import { GraphNode, Graph } from '@common';
import '@prototype-extensions';

function tryPartition(graph: Graph): [number, number] | null {
    const startNode = graph.nodeList.randomItem();
    const endNode = graph.nodeList.randomItem();
    if (startNode.equals(endNode)) return null;
    if (!tryPathCut(graph, startNode, endNode)) return null;
    return [findPartitionSize(graph, startNode), findPartitionSize(graph, endNode)];
}

function tryPathCut(graph: Graph, startNode: GraphNode, endNode: GraphNode, cutCount: number = 0): boolean {
    const searchResult = graph.breadthFirstSearch(startNode, (node) => node.equals(endNode));
    if (cutCount === 3) return searchResult === null;

    const path = searchResult!.path;
    for (let index = 0; index < path.length - 1; index++) {
        const nodeA = path[index];
        const nodeB = path[index + 1];
        graph.removeEdge(nodeA, nodeB);
        if (tryPathCut(graph, startNode, endNode, cutCount + 1)) return true;
        graph.addEdge(nodeA, nodeB);
    }
    return false;
}

function findPartitionSize(graph: Graph, startNode: GraphNode): number {
    let count = 0;
    graph.breadthFirstSearch(startNode, (_node) => {
        count++;
        return false;
    });
    return count;
}

export function solvePart1(input: string): number {
    const graph = new Graph(GraphNode);
    input.splitByNewLine().forEach((line) => {
        const [nodeName, neighborNamesInput] = line.splitByColon();
        const neighborNames = neighborNamesInput.splitByWhitespace();
        const node = graph.findOrCreateNode(nodeName);
        const neighbors = neighborNames.map((neighborName) => graph.findOrCreateNode(neighborName));
        neighbors.forEach((neighbor) => graph.addEdge(node, neighbor));
    });

    while (true) {
        const segmentation = tryPartition(graph);
        if (segmentation !== null) return segmentation[0] * segmentation[1];
    }
}
