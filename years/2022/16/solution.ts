import '@prototype-extensions';
import { Graph, GraphNode } from '@common';

const INPUT_LINE_REGEX = /^Valve (\w+) has flow rate=(\d+); tunnels? leads? to valves? (.*)$/;

class Valve extends GraphNode {
    flow: number;

    constructor(identifier: string, flow: number) {
        super(identifier);
        this.flow = flow;
    }

    toString(): string {
        return `${super.toString()} (${this.flow})`;
    }
};

function parseInput(input: string): [Graph, Valve, Valve[]] {
    const valveAndNeighborNames: [Valve, string[]][] = input
        .splitByNewLine()
        .map(line => line.getMatches(INPUT_LINE_REGEX))
        .map(([name, flow, neighborNames]) => [
            new Valve(name, Number(flow)),
            neighborNames.splitByComma()
        ]);
    const valves = valveAndNeighborNames.map(([valve]) => valve);
    const graph = new Graph(Valve, valves);

    for (const [valve, neighborNames] of valveAndNeighborNames) {
        neighborNames
            .map((name) => valves.find(valve => valve.getUniqueKey() === name)!)
            .forEach((neighbor) => graph.addEdge(valve, neighbor));
    }

    const startValve = valves.find(valve => valve.identifier === 'AA')!;
    const nonZeroValves = valves.filter(valve => valve.flow > 0);
    return [graph, startValve, nonZeroValves];
}

function buildDistanceGetter(graph: Graph, valves: Valve[]) {
    const distanceTable = new Map();
    for (const valve of valves) {
        distanceTable.set(valve, new Map());
        for (const otherValve of valves) {
            if (valve === otherValve) continue;
            const reverseDistance = distanceTable.get(otherValve)?.get(valve);
            distanceTable.get(valve).set(otherValve, reverseDistance ? reverseDistance : graph.shortestDistance(valve, otherValve));
        }
    }

    return (valve1: Valve, valve2: Valve) => distanceTable.get(valve1).get(valve2);
}

function backtrackSolutions(
    unopenedValves: Valve[],
    visitedValves: Valve[][],
    travelerIndex: number,
    travelerCount: number,
    getDistance: (valve1: Valve, valve2: Valve) => number,
    moveCounts: number[],
    score = 0
): number {
    if (unopenedValves.length === 0) return score;
    if (travelerIndex >= travelerCount) return backtrackSolutions(unopenedValves, visitedValves, 0, travelerCount, getDistance, moveCounts, score);

    const visitedValvesForTraveler = visitedValves[travelerIndex];
    const currentValve = visitedValvesForTraveler[visitedValvesForTraveler.length - 1];
    const validValvesAndData = unopenedValves.map((valve) => {
        const distance = getDistance(currentValve, valve);
        const remainingMoves = moveCounts[travelerIndex] - distance - 1;
        if (distance === null || remainingMoves <= 0) return null;
        return { valve, distance, remainingMoves, score: score + valve.flow * remainingMoves };
    }).filter(Boolean) as { valve: Valve, distance: number, remainingMoves: number, score: number }[];

    if (validValvesAndData.length === 0) {
        if (travelerIndex === travelerCount - 1) return score;
        return backtrackSolutions(unopenedValves, visitedValves, travelerIndex + 1, travelerCount, getDistance, moveCounts, score);
    }

    return validValvesAndData.map(({ valve: targetValve, remainingMoves, score: newScore }) => {
        const newUnopenedValves = unopenedValves.without(targetValve);
        const newVisitedValves = [...visitedValves].replaceAt(travelerIndex, [...visitedValvesForTraveler, targetValve]);
        const newMoveCounts = [...moveCounts].replaceAt(travelerIndex, remainingMoves);
        return backtrackSolutions(newUnopenedValves, newVisitedValves, travelerIndex + 1, travelerCount, getDistance, newMoveCounts, newScore);
    }).onlyNumbers().max();
};

function getBestScore(startValve: Valve, valves: Valve[], getDistance: (valve1: Valve, valve2: Valve) => number, moves: number, travelerCount = 1): number {
    const visitedValves = Array(travelerCount).fill(null).map(() => [startValve]);
    const moveCounts = Array(travelerCount).fill(moves);
    return backtrackSolutions(valves, visitedValves, 0, travelerCount, getDistance, moveCounts);
};

export function solvePart1(input: string): any {
    const [graph, startValve, relevantValves] = parseInput(input);
    const distanceGetter = buildDistanceGetter(graph, [startValve, ...relevantValves]);
    return getBestScore(startValve, relevantValves, distanceGetter, 30, 1)
}

export function solvePart2(input: string): any {
    const [graph, startValve, relevantValves] = parseInput(input);
    const distanceGetter = buildDistanceGetter(graph, [startValve, ...relevantValves]);
    return getBestScore(startValve, relevantValves, distanceGetter, 26, 2)
}
