import './prototype-extensions';
import fs from 'fs';
import util from 'util';

export function readFile(path: string): string {
    return fs.readFileSync(path, 'utf8');
}

export enum ORTHOGONAL_DIRECTIONS {
    X_POSITIVE = 'x-pos',
    X_NEGATIVE = 'x-neg',
    Y_POSITIVE = 'y-pos',
    Y_NEGATIVE = 'y-neg',
    Z_POSITIVE = 'z-pos',
    Z_NEGATIVE = 'z-neg',
}

export const ORTHOGONAL_DIRECTIONS_2D_LIST: ORTHOGONAL_DIRECTIONS[] = [
    ORTHOGONAL_DIRECTIONS.X_POSITIVE,
    ORTHOGONAL_DIRECTIONS.X_NEGATIVE,
    ORTHOGONAL_DIRECTIONS.Y_POSITIVE,
    ORTHOGONAL_DIRECTIONS.Y_NEGATIVE,
];

export enum DIAGONAL_DIRECTIONS {
    X_POSITIVE_Y_POSITIVE = 'x-pos-y-pos',
    X_POSITIVE_Y_NEGATIVE = 'x-pos-y-neg',
    X_NEGATIVE_Y_POSITIVE = 'x-neg-y-pos',
    X_NEGATIVE_Y_NEGATIVE = 'x-neg-y-neg',
}

export const DIAGONAL_DIRECTIONS_2D_LIST: DIAGONAL_DIRECTIONS[] = Object.values(DIAGONAL_DIRECTIONS);

export interface IGraphNode {
    getUniqueKey(): any;
    toString(): string;
    equals(node: IGraphNode): boolean;
}

export interface IGraph {
    forEachNode: (callback: (node: IGraphNode) => void) => void;
    walk: Function;
    breadthFirstSearch: Function;
    shortestDistance: Function;
    aStar: Function;
    [util.inspect.custom]: () => string;
}

export function walkGraph<NodeType extends IGraphNode>(
    startNode: NodeType,
    walkNode: (node: NodeType, distance: number) => any,
    getNeighbors: (node: NodeType, distance: number) => NodeType[],
): any {
    const queue = [{ node: startNode, distance: 0 }];

    while (queue.isNotEmpty()) {
        const { node, distance } = queue.shift()!;
        const walkResult = walkNode(node, distance);
        if (walkResult !== undefined) return walkResult;
        getNeighbors(node, distance).forEach((neighbor) =>
            queue.push({ node: neighbor, distance: distance + 1 }));
    }

    return undefined;
}

export function breadthFirstSearch<NodeType extends IGraphNode>(
    startNode: NodeType,
    matcher: (node: NodeType, distance: number) => boolean,
    getNeighbors: (node: NodeType, distance: number) => NodeType[],
    isNeighborValid?: (node: NodeType, neighbor: NodeType, distance: number) => boolean,
): { node: NodeType, distance: number, path: NodeType[] } | null {
    const visited = new Set([startNode.getUniqueKey()]);
    const prevNodesCache = new WeakMap<NodeType, NodeType>();

    const walkNode = (node: NodeType, distance: number) => {
        if (!matcher(node, distance)) return undefined;
        let currentNode = node;
        const reversePath = [currentNode];
        while (prevNodesCache.has(currentNode)) {
            currentNode = prevNodesCache.get(currentNode)!;
            reversePath.push(currentNode);
        }
        return { node, distance, path: reversePath.reverse() };
    };

    const walkGetNeighbors = (node: NodeType, distance: number) => {
        const neighbors = getNeighbors(node, distance).filter((neighbor) => {
            if (visited.has(neighbor.getUniqueKey())) return false;
            return !isNeighborValid || isNeighborValid(node, neighbor, distance);
        });
        neighbors.forEach((neighbor) => {
            visited.add(neighbor.getUniqueKey());
            prevNodesCache.set(neighbor, node);
        });
        return neighbors;
    }

    const result = walkGraph(startNode, walkNode, walkGetNeighbors);
    return result === undefined ? null : result;
}

export function aStar(
    startNode: IGraphNode,
    matcher: (node: IGraphNode) => boolean,
    calculateCost: (node: IGraphNode, neighbor: IGraphNode) => number,
    calculateHeuristic: (node: IGraphNode, neighbor: IGraphNode) => number,
    getNeighbors: (node: IGraphNode) => IGraphNode[],
    isNeighborValid?: (node: IGraphNode, neighbor: IGraphNode) => boolean,
): number | null {
    const queue = new PriorityQueue<IGraphNode>([[startNode, 0]]);
    const costSoFar: Map<any, number> = new Map([[startNode.getUniqueKey(), 0]]);

    while (queue.length > 0) {
        const currentNode = queue.dequeue()!;
        const currentNodeCost = costSoFar.get(currentNode.getUniqueKey())!
        if (matcher(currentNode)) return currentNodeCost;

        for (const neighborNode of getNeighbors(currentNode)) {
            if (isNeighborValid && !isNeighborValid(currentNode, neighborNode)) continue;
            const neighborNodeKey = neighborNode.getUniqueKey();

            const newCost = currentNodeCost + calculateCost(currentNode, neighborNode);
            const previousCost = costSoFar.get(neighborNodeKey);
            if (previousCost !== undefined && newCost >= previousCost) continue;

            costSoFar.set(neighborNodeKey, newCost);
            queue.enqueue(neighborNode, newCost + calculateHeuristic(currentNode, neighborNode));
        }
    }

    return null;
}

export class GraphNode implements IGraphNode {
    identifier: string;

    constructor(identifier: string) {
        this.identifier = identifier;
    }

    toString(): string {
        return this.identifier;
    }

    getUniqueKey(): any {
        return this.identifier;
    }

    equals(node: IGraphNode): boolean {
        return this.getUniqueKey() === node.getUniqueKey();
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}

export class Graph<NodeType extends IGraphNode = GraphNode> implements IGraph {
    nodes: Map<string, NodeType> = new Map();
    edges: Map<NodeType, Set<NodeType>> = new Map();
    #nodeConstructor;

    get nodeList() {
        return this.nodes.valuesArray();
    }

    constructor(nodeConstructor: { new (...args : any[]): NodeType }, nodes: NodeType[] = []) {
        this.#nodeConstructor = nodeConstructor;
        nodes.forEach((node) => this.addNode(node));
    }

    addNode(node: NodeType) {
        this.nodes.set(node.getUniqueKey(), node);
    }

    getNode(identifier: string): NodeType | null {
        if (!this.nodes.has(identifier)) return null;
        return this.nodes.get(identifier)!;
    }

    findOrCreateNode(identifier: string): NodeType {
        if (this.nodes.has(identifier)) return this.nodes.get(identifier)!;
        const node = new this.#nodeConstructor(identifier);
        this.addNode(node);
        return node;
    }

    addEdge(nodeA: NodeType, nodeB: NodeType) {
        if (!this.edges.has(nodeA)) this.edges.set(nodeA, new Set());
        if (!this.edges.has(nodeB)) this.edges.set(nodeB, new Set());
        this.edges.get(nodeA)!.add(nodeB);
        this.edges.get(nodeB)!.add(nodeA);
    }

    hasEdge(nodeA: NodeType, nodeB: NodeType): boolean {
        return this.edges.get(nodeA)?.has(nodeB) ?? false;
    }

    removeEdge(nodeA: NodeType, nodeB: NodeType) {
        this.edges.get(nodeA)?.delete(nodeB);
        this.edges.get(nodeB)?.delete(nodeA);
    }

    getNodeNeighbors(node: NodeType): NodeType[] {
        return this.edges.get(node)?.valuesArray() ?? [];
    }

    forEachNode(callback: (node: NodeType) => void): void {
        this.nodes.valuesArray().forEach(callback);
    }

    toString(): string {
        return this.nodes.valuesArray().map((node) => {
            const neighbors = this.getNodeNeighbors(node);
            return `${node} -> ${neighbors.join(', ')}`;
        }).join('\n');
    }

    [util.inspect.custom]() {
        return this.toString();
    }

    walk(
        startNode: NodeType,
        walkNode: (node: NodeType, distance: number) => any,
    ): any {
        const getNeighbors = (node: NodeType) => this.getNodeNeighbors(node);
        return walkGraph<NodeType>(startNode, walkNode, getNeighbors);
    }

    breadthFirstSearch(
        startNode: NodeType,
        matcher: (node: NodeType, distance: number) => boolean,
        isNeighborValid?: (node: NodeType, neighbor: NodeType) => boolean,
    ): { node: NodeType, distance: number, path: NodeType[] } | null {
        const getNeighbors = (node: NodeType) => this.getNodeNeighbors(node);
        return breadthFirstSearch<NodeType>(startNode, matcher, getNeighbors, isNeighborValid);
    }

    shortestDistance(
        startNode: NodeType, endNode: NodeType,
        isNeighborValid?: (node: NodeType, neighbor: NodeType) => boolean
    ): number | null {
        const result = this.breadthFirstSearch(startNode, (node) => node.getUniqueKey() === endNode.getUniqueKey(), isNeighborValid);
        return result === null ? null : result.distance;
    }

    aStar(
        startNode: NodeType,
        matcher: (node: NodeType) => boolean,
        calculateCost: (node: NodeType, neighbor: NodeType) => number,
        calculateHeuristic: (node: NodeType, neighbor: NodeType) => number,
        isNeighborValid?: (node: NodeType, neighbor: NodeType) => boolean
    ): number | null {
        const getNeighbors = (node: NodeType) => this.getNodeNeighbors(node) as IGraphNode[];
        return aStar(
            startNode,
            matcher as (node: IGraphNode) => boolean,
            calculateCost as (node: IGraphNode, neighbor: IGraphNode) => number,
            calculateHeuristic as (node: IGraphNode, neighbor: IGraphNode) => number,
            getNeighbors as (node: IGraphNode) => IGraphNode[],
            isNeighborValid as (node: IGraphNode, neighbor: IGraphNode) => boolean
        ) as number | null;
    }
}

export class DirectedGraph<NodeType extends IGraphNode = GraphNode> extends Graph<NodeType> {
    addEdge(from: NodeType, to: NodeType): void {
        if (!this.edges.has(from)) this.edges.set(from, new Set());
        this.edges.get(from)!.add(to);
    }

    removeEdge(from: NodeType, to: NodeType) {
        this.edges.get(from)?.delete(to);
    }
}

export class WeightedDirectedGraph<NodeType extends IGraphNode = GraphNode> extends DirectedGraph<NodeType> {
    weightedEdges = new Map<NodeType, Map<NodeType, number>>();

    constructor(nodeConstructor: { new (...args : any[]): NodeType }, nodes: NodeType[] = [], edges: [NodeType, NodeType, number][] = []) {
        super(nodeConstructor, nodes);
        edges.forEach(([from, to, weight]) => this.addWeightedEdge(from, to, weight));
    }

    addWeightedEdge(from: NodeType, to: NodeType, weight: number) {
        super.addEdge(from, to);
        if (!this.weightedEdges.has(from)) this.weightedEdges.set(from, new Map());
        this.weightedEdges.get(from)!.set(to, weight);
    }

    getNodeNeighborsAndWeights(node: NodeType): [NodeType, number][] {
        return this.weightedEdges.get(node)?.entriesArray() ?? [];
    }
}

export class Point2D<T extends number | bigint = number> implements IGraphNode {
    x: T;
    y: T;

    constructor(x: T, y: T) {
        this.x = x;
        this.y = y;
    }

    static fromCoordsString(coordsString: string): Point2D {
        const [x, y] = coordsString.slice(1, -1).splitByComma().toNumbers();
        return new Point2D(x, y);
    }

    getUniqueKey() {
        return this.toString();
    }

    coordsToString(): string {
        return `(${this.x},${this.y})`;
    }

    toString(): string {
        return this.coordsToString();
    }

    [util.inspect.custom]() {
        return this.toString();
    }

    add(point: Point2D<T>): Point2D<T> {
        if (typeof this.x === 'bigint' && typeof point.x === 'bigint' && typeof this.y === 'bigint' && typeof point.y === 'bigint') {
            return new Point2D<bigint>(
                (this.x + point.x) as bigint,
                (this.y + point.y) as bigint
            ) as Point2D<T>;
        }

        if (typeof this.x === 'number' && typeof point.x === 'number' && typeof this.y === 'number' && typeof point.y === 'number') {
            return new Point2D<number>(
                (this.x + point.x) as number,
                (this.y + point.y) as number
            ) as Point2D<T>;
        }

        throw new Error('Cannot add points of different types.');
    }

    subtract(point: Point2D<T>): Point2D<T> {
        if (typeof this.x === 'bigint' && typeof point.x === 'bigint' && typeof this.y === 'bigint' && typeof point.y === 'bigint') {
            return new Point2D<bigint>(
                (this.x - point.x) as bigint,
                (this.y - point.y) as bigint
            ) as Point2D<T>;
        }

        if (typeof this.x === 'number' && typeof point.x === 'number' && typeof this.y === 'number' && typeof point.y === 'number') {
            return new Point2D<number>(
                (this.x - point.x) as number,
                (this.y - point.y) as number
            ) as Point2D<T>;
        }

        throw new Error('Cannot subtract points of different types.');
    }

    multiply(factor: T): Point2D<T> {
        if (typeof this.x === 'bigint' && typeof this.y === 'bigint' && typeof factor === 'bigint') {
            return new Point2D<bigint>(
                (this.x * factor) as bigint,
                (this.y * factor) as bigint
            ) as Point2D<T>;
        }

        if (typeof this.x === 'number' && typeof this.y === 'number' && typeof factor === 'number') {
            return new Point2D<number>(
                (this.x * factor) as number,
                (this.y * factor) as number
            ) as Point2D<T>;
        }

        throw new Error('Cannot multiply points of different types.');
    }

    move(vector: Point2D<T>): void {
        const newPoint = this.add(vector);
        this.x = newPoint.x;
        this.y = newPoint.y;
    }

    getNeighbor(direction: ORTHOGONAL_DIRECTIONS | DIAGONAL_DIRECTIONS): Point2D<T> {
        if (Object.values(ORTHOGONAL_DIRECTIONS).includes(direction as ORTHOGONAL_DIRECTIONS))
            return this.getOrthogonalNeighbor(direction as ORTHOGONAL_DIRECTIONS);
        return this.getDiagonalNeighbor(direction as DIAGONAL_DIRECTIONS);
    }

    getDiagonalNeighbor(direction: DIAGONAL_DIRECTIONS): Point2D<T> {
        if (typeof this.x === 'bigint' && typeof this.y === 'bigint') {
            return this.add(DIAGONAL_DIRECTION_VECTORS_2D_MAP_BIGINT.get(direction) as Point2D<T>);
        }

        if (typeof this.x === 'number' && typeof this.y === 'number') {
            return this.add(DIAGONAL_DIRECTION_VECTORS_2D_MAP.get(direction) as Point2D<T>);
        }

        throw new Error('Unexpected error.');
    }

    getOrthogonalNeighbor(direction: ORTHOGONAL_DIRECTIONS): Point2D<T> {
        if (typeof this.x === 'bigint' && typeof this.y === 'bigint') {
            return this.add(ORTHOGONAL_DIRECTION_VECTORS_2D_MAP_BIGINT.get(direction) as Point2D<T>);
        }

        if (typeof this.x === 'number' && typeof this.y === 'number') {
            return this.add(ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(direction) as Point2D<T>);
        }

        throw new Error('Unexpected error.');
    }

    orthogonalNeighbors(): Point2D<T>[] {
        if (typeof this.x === 'bigint' && typeof this.y === 'bigint') {
            return ORTHOGONAL_DIRECTION_VECTORS_2D_BIGINT.map((vector) => this.add(vector as Point2D<T>));
        }

        if (typeof this.x === 'number' && typeof this.y === 'number') {
            return ORTHOGONAL_DIRECTION_VECTORS_2D.map((vector) => this.add(vector as Point2D<T>));
        }

        throw new Error('Unexpected error.');
    }

    allNeighbors(): Point2D<T>[] {
        if (typeof this.x === 'bigint' && typeof this.y === 'bigint') {
            return ALL_DIRECTION_VECTORS_2D_BIGINT.map((vector) => this.add(vector as Point2D<T>));
        }

        if (typeof this.x === 'number' && typeof this.y === 'number') {
            return ALL_DIRECTION_VECTORS_2D.map((vector) => this.add(vector as Point2D<T>));
        }

        throw new Error('Unexpected error.');
    }

    isAdjacentTo(point: Point2D<T>): boolean {
        return Math.abs(this.x - point.x) <= 1 && Math.abs(this.y - point.y) <= 1;
    }

    equals(point: Point2D<T>): boolean {
        return this.x === point.x && this.y === point.y;
    }

    greaterThanOrEquals(point: Point2D<T>): boolean {
        return this.x >= point.x || this.y >= point.y;
    }

    lessThanOrEquals(point: Point2D<T>): boolean {
        return this.x <= point.x || this.y <= point.y;
    }

    isBetween(pointA: Point2D<T>, pointB: Point2D<T>): boolean {
        return this.greaterThanOrEquals(pointA) && this.lessThanOrEquals(pointB);
    }

    getVectorTowards(point: Point2D<T>): Point2D<T> {
        if (typeof this.x === 'bigint' && typeof point.x === 'bigint' && typeof this.y === 'bigint' && typeof point.y === 'bigint') {
            return new Point2D<bigint>(
                this.x === point.x ? 0n : this.x < point.x ? 1n : -1n,
                this.y === point.y ? 0n : this.y < point.y ? 1n : -1n
            ) as Point2D<T>;
        }

        if (typeof this.x === 'number' && typeof point.x === 'number' && typeof this.y === 'number' && typeof point.y === 'number') {
            return new Point2D<number>(
                this.x === point.x ? 0 : this.x < point.x ? 1 : -1,
                this.y === point.y ? 0 : this.y < point.y ? 1 : -1
            ) as Point2D<T>;
        }

        throw new Error('Cannot get vector between points of different types.');
    }

    getManhattanDistanceTo(point: Point2D<T>): number {
        return Math.abs(this.x - point.x) + Math.abs(this.y - point.y);
    }

    getDistanceTo(point: Point2D<T>): T {
        return Math.sqrt((point.x - this.x) * (point.x - this.x) + (point.y - this.y) * (point.y - this.y)) as T;
    }

    getSlopeTo(point: Point2D<T>): T {
        return ((point.y - this.y) / (point.x - this.x)) as T;
    }
}

export class Point3D<T extends number | bigint = number> extends Point2D<T> {
    z: T;

    constructor(x: T, y: T, z: T) {
        super(x, y);
        this.z = z;
    }

    toString(): string {
        return `(${this.x},${this.y},${this.z})`;
    }

    add(point: Point3D<T>): Point3D<T> {
        if (typeof this.x === 'bigint' && typeof point.x === 'bigint' && typeof this.y === 'bigint' && typeof point.y === 'bigint' && typeof this.z === 'bigint' && typeof point.z === 'bigint') {
            return new Point3D<bigint>(
                (this.x + point.x) as bigint,
                (this.y + point.y) as bigint,
                (this.z + point.z) as bigint
            ) as Point3D<T>;
        }

        if (typeof this.x === 'number' && typeof point.x === 'number' && typeof this.y === 'number' && typeof point.y === 'number' && typeof this.z === 'number' && typeof point.z === 'number') {
            return new Point3D<number>(
                (this.x + point.x) as number,
                (this.y + point.y) as number,
                (this.z + point.z) as number
            ) as Point3D<T>;
        }

        throw new Error('Cannot add points of different types.');
    }

    equals(point: Point3D<T>): boolean {
        return this.x === point.x && this.y === point.y && this.z === point.z;
    }

    greaterThanOrEquals(point: Point3D<T>): boolean {
        return this.x >= point.x && this.y >= point.y && this.z >= point.z;
    }

    lessThanOrEquals(point: Point3D<T>): boolean {
        return this.x <= point.x && this.y <= point.y && this.z <= point.z;
    }

    isBetween(pointA: Point3D<T>, pointB: Point3D<T>): boolean {
        return this.greaterThanOrEquals(pointA) && this.lessThanOrEquals(pointB);
    }
}

export const ORTHOGONAL_DIRECTION_VECTORS_2D_MAP: Map<ORTHOGONAL_DIRECTIONS, Point2D<number>> = new Map([
    [ORTHOGONAL_DIRECTIONS.X_POSITIVE, new Point2D<number>(1, 0)],
    [ORTHOGONAL_DIRECTIONS.X_NEGATIVE, new Point2D<number>(-1, 0)],
    [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, new Point2D<number>(0, 1)],
    [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, new Point2D<number>(0, -1)],
]);

export const ORTHOGONAL_DIRECTION_VECTORS_2D_MAP_BIGINT: Map<ORTHOGONAL_DIRECTIONS, Point2D<bigint>> = new Map([
    [ORTHOGONAL_DIRECTIONS.X_POSITIVE, new Point2D<bigint>(1n, 0n)],
    [ORTHOGONAL_DIRECTIONS.X_NEGATIVE, new Point2D<bigint>(-1n, 0n)],
    [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, new Point2D<bigint>(0n, 1n)],
    [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, new Point2D<bigint>(0n, -1n)],
]);

export const ORTHOGONAL_DIRECTION_VECTORS_2D = [...ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.values()] as Point2D<number>[];

export const ORTHOGONAL_DIRECTION_VECTORS_2D_BIGINT = [...ORTHOGONAL_DIRECTION_VECTORS_2D_MAP_BIGINT.values()] as Point2D<bigint>[];

export const DIAGONAL_DIRECTION_VECTORS_2D_MAP: Map<DIAGONAL_DIRECTIONS, Point2D<number>> = new Map([
    [DIAGONAL_DIRECTIONS.X_POSITIVE_Y_POSITIVE, new Point2D<number>(1, 1)],
    [DIAGONAL_DIRECTIONS.X_POSITIVE_Y_NEGATIVE, new Point2D<number>(1, -1)],
    [DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_POSITIVE, new Point2D<number>(-1, 1)],
    [DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_NEGATIVE, new Point2D<number>(-1, -1)],
]);

export const DIAGONAL_DIRECTION_VECTORS_2D_MAP_BIGINT: Map<DIAGONAL_DIRECTIONS, Point2D<bigint>> = new Map([
    [DIAGONAL_DIRECTIONS.X_POSITIVE_Y_POSITIVE, new Point2D<bigint>(1n, 1n)],
    [DIAGONAL_DIRECTIONS.X_POSITIVE_Y_NEGATIVE, new Point2D<bigint>(1n, -1n)],
    [DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_POSITIVE, new Point2D<bigint>(-1n, 1n)],
    [DIAGONAL_DIRECTIONS.X_NEGATIVE_Y_NEGATIVE, new Point2D<bigint>(-1n, -1n)],
]);

export const DIAGONAL_DIRECTION_VECTORS_2D = [...DIAGONAL_DIRECTION_VECTORS_2D_MAP.values()] as Point2D<number>[];

export const DIAGONAL_DIRECTION_VECTORS_2D_BIGINT = [...DIAGONAL_DIRECTION_VECTORS_2D_MAP_BIGINT.values()] as Point2D<bigint>[];

export const ALL_DIRECTION_VECTORS_2D: Point2D<number>[] = [
    ...ORTHOGONAL_DIRECTION_VECTORS_2D,
    ...DIAGONAL_DIRECTION_VECTORS_2D
];

export const ALL_DIRECTION_VECTORS_2D_BIGINT: Point2D<bigint>[] = [
    ...ORTHOGONAL_DIRECTION_VECTORS_2D_BIGINT,
    ...DIAGONAL_DIRECTION_VECTORS_2D_BIGINT
];

export const ORTHOGONAL_DIRECTION_VECTORS_3D_MAP: Map<ORTHOGONAL_DIRECTIONS, Point3D<number>> = new Map([
    [ORTHOGONAL_DIRECTIONS.X_POSITIVE, new Point3D<number>(1, 0, 0)],
    [ORTHOGONAL_DIRECTIONS.X_NEGATIVE, new Point3D<number>(-1, 0, 0)],
    [ORTHOGONAL_DIRECTIONS.Y_POSITIVE, new Point3D<number>(0, 1, 0)],
    [ORTHOGONAL_DIRECTIONS.Y_NEGATIVE, new Point3D<number>(0, -1, 0)],
    [ORTHOGONAL_DIRECTIONS.Z_POSITIVE, new Point3D<number>(0, 0, 1)],
    [ORTHOGONAL_DIRECTIONS.Z_NEGATIVE, new Point3D<number>(0, 0, -1)],
]);

export const ORTHOGONAL_DIRECTION_VECTORS_3D: Point3D<number>[] = ORTHOGONAL_DIRECTION_VECTORS_3D_MAP.valuesArray();

export class Matrix<T> implements IGraph {
    data: T[][];

    constructor(data: T[][]) {
        this.data = data;
    }

    static initializeMatrix<T>(width: number, height: number, defaultValue: T): Matrix<T> {
        const data = Array(width).fill(null).map(() => Array(height).fill(defaultValue));
        return new Matrix<T>(data);
    }

    get width() {
        return this.data.length;
    }

    get height() {
        return this.data[0].length;
    }

    clone() {
        return new Matrix(this.data.map(column => column.slice()));
    }

    toString() {
        return this.data.first()
            .zip(...this.data.rest())
            .map(row => row.join(''))
            .reverse()
            .join('\n');
    }

    [util.inspect.custom]() {
        return this.toString();
    }

    getColumn(x: number): T[] {
        return this.data[x];
    }

    getRow(y: number): T[] {
        return this.data.map(row => row[y]);
    }

    getValue(point: Point2D): T {
        return this.data[point.x][point.y];
    }

    setValue(point: Point2D, value: T) {
        this.data[point.x][point.y] = value;
    }

    isPointInBounds(point: Point2D) {
        return point.x >= 0 && point.x < this.width && point.y >= 0 && point.y < this.height;
    }

    forEachNode(callback: (point: Point2D, value: T) => void) {
        this.data.forEach((column, x) => {
            column.forEach((value, y) => {
                callback(new Point2D(x, y), value);
            });
        });
    }

    mapColumns<T2>(callback: (column: T[], x: number) => T2): T2[] {
        return this.data.map(callback);
    }

    mapPoints<T2>(callback: (point: Point2D, value: T) => T2): Matrix<T2> {
        return new Matrix(this.data
            .map((column, x) => column
                .map((value, y) => callback(new Point2D(x, y), value))));
    }

    reducePoints<TAccumulator>(callback: (accumulator: TAccumulator, point: Point2D, value: T) => TAccumulator, accumulator: TAccumulator) {
        this.data.forEach((column, x) => {
            column.forEach((value, y) => {
                accumulator = callback(accumulator, new Point2D(x, y), value);
            });
        });
        return accumulator;
    }

    findPoint(callback: (point: Point2D, value: T) => boolean): Point2D | null {
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                const point = new Point2D(x, y);
                if (callback(point, this.getValue(point))) {
                    return point;
                }
            }
        }
        return null;
    }

    findPointOfValue(value: T): Point2D | null {
        return this.findPoint((_, pointValue) => pointValue === value);
    }

    filterPoints(callback: (point: Point2D, value: T) => boolean): Point2D[] {
        return this.reducePoints((points, point, value) => {
            if (callback(point, value)) points.push(point);
            return points;
        }, [] as Point2D[]);
    }

    getPointOrthogonalNeighbors(point: Point2D): Point2D[] {
        return point.orthogonalNeighbors().filter(this.isPointInBounds.bind(this));
    }

    sum(): number {
        return this.reducePoints((sum, _, value) => sum + Number(value), 0);
    }

    walk(
        startPoint: Point2D,
        walkPoint: (point: Point2D, value: T, distance: number) => any,
        isNeighborValid?: (point: Point2D, value: T, neighborPoint: Point2D, neighborValue: T, distance: number) => boolean,
        getNeighbors?: (point: Point2D, value: T, distance: number) => Point2D[]
    ): any {
        const walkNode = (point: Point2D, distance: number) => walkPoint(point, this.getValue(point), distance);
        return walkGraph<Point2D>(startPoint, walkNode, this.#resolveWalkGetNeighbors(isNeighborValid, getNeighbors));
    }

    breadthFirstSearch(
        startPoint: Point2D,
        matcher: (point: Point2D, value: T, distance: number) => boolean,
        isNeighborValid?: (point: Point2D, value: T, neighborPoint: Point2D, neighborValue: T, distance: number) => boolean,
        getNeighbors?: (point: Point2D, value: T, distance: number) => Point2D[]
    ): { point: Point2D, distance: number, path: Point2D[] } | null {
        const result = breadthFirstSearch<Point2D>(
            startPoint,
            (point, distance) => matcher(point, this.getValue(point), distance),
            this.#resolveWalkGetNeighbors(isNeighborValid, getNeighbors)
        );
        return result === null ? null : { point: result.node, distance: result.distance, path: result.path };
    }

    aStar(
        startPoint: Point2D,
        endPoint: Point2D,
        calculateCost: (point: Point2D, neighbor: Point2D) => number,
        calculateHeuristic?: (point: Point2D, neighbor: Point2D) => number,
        isNeighborValid?: (point: Point2D, value: T, neighborPoint: Point2D, neighborValue: T) => boolean,
        getNeighbors?: (point: Point2D, value: T) => Point2D[],
    ): number | null {
        const resolvedGetNeighbors = (point: Point2D) => {
            const value = this.getValue(point);
            const neighbors = getNeighbors ? getNeighbors(point, value) : point.orthogonalNeighbors();
            return neighbors.filter(neighbor =>
                this.isPointInBounds(neighbor) && (!isNeighborValid || isNeighborValid(point, value, neighbor, this.getValue(neighbor)))) as IGraphNode[];
        };

        const resolvedCalculateHeuristic = calculateHeuristic || ((point, neighbor) => point.getManhattanDistanceTo(neighbor));

        const matcher = (point: Point2D) => point.equals(endPoint);

        return aStar(
            startPoint,
            matcher as (node: IGraphNode) => boolean,
            calculateCost as (node: IGraphNode, neighbor: IGraphNode) => number,
            resolvedCalculateHeuristic as (node: IGraphNode, neighbor: IGraphNode) => number,
            resolvedGetNeighbors as (node: IGraphNode) => IGraphNode[],
        ) as number | null;
    }

    shortestDistance(
        startPoint: Point2D, endPoint: Point2D,
        isNeighborValid?: (point: Point2D, value: T, neighborPoint: Point2D, neighborValue: T) => boolean,
        getNeighbors?: (point: Point2D, value: T) => Point2D[]
    ): number | null {
        return this.aStar(
            startPoint,
            endPoint,
            (_point, _neighbor) => 1,
            undefined,
            isNeighborValid,
            getNeighbors,
        );
    }

    #resolveWalkGetNeighbors(
        isNeighborValid?: (point: Point2D, value: T, neighborPoint: Point2D, neighborValue: T, distance: number) => boolean,
        getNeighbors?: (point: Point2D, value: T, distance: number) => Point2D[]
    ): (point: Point2D, distance: number) => Point2D[] {
        return (point: Point2D, distance: number) => {
            const value = this.getValue(point);
            const neighbors = getNeighbors ? getNeighbors(point, value, distance) : point.orthogonalNeighbors();
            return neighbors.filter((neighbor) => this.isPointInBounds(neighbor) &&
                (!isNeighborValid || isNeighborValid(point, value, neighbor, this.getValue(neighbor), distance))
            );
        };
    }
}

export class PriorityQueue<T> {
    data: [T, number][];

    get length(): number {
        return this.data.length;
    }

    constructor(data: [T, number][] = []) {
        this.data = data;
    }

    enqueue(item: T, priority: number) {
        const index = this.data.findIndex(([, itemPriority]) => itemPriority < priority);
        this.data.splice(index === -1 ? this.data.length : index, 0, [item, priority]);
    }

    dequeue(): T {
        return this.data.pop()![0];
    }

    toString() {
        return this.data.map(([item, priority]) => `${item} (${priority})`).join('; ');
    }

    [util.inspect.custom]() {
        return this.toString();
    }
}

export function stringToStringMatrix(input: string): Matrix<string> {
    // Matrices are read from top to bottom, but they are stored in an XY axis system,
    // which is bottom to top. Thus, we reverse the list of rows before zipping them.
    const [firstRow, ...restRows] = input.splitByNewLine().reverse().map((row) => row.toArray());
    return new Matrix<string>(firstRow.zip(...restRows));
}

export function stringToNumberMatrix(input: string): Matrix<number> {
    return stringToStringMatrix(input).mapPoints((_, value) => Number(value));
}

export function stringToPoint2D(input: string): Point2D {
    const coords: [number, number] = input.splitByComma().map(Number) as [number, number];
    return new Point2D(...coords);
}

export function stringToPoint2DArray(input: string, separator: string): Point2D[] {
    return input.split(separator).map(stringToPoint2D);
}

export function stringToPoint3D(input: string): Point3D {
    const coords: [number, number, number] = input.splitByComma().map(Number) as [number, number, number];
    return new Point3D(...coords);
}

export function stringToPoint3DArray(input: string, separator: string): Point3D[] {
    return input.split(separator).map(stringToPoint3D);
}

export function findIndexOfPoint(list: Point2D[], searchedPoint: Point2D): number {
    return list.findIndex((point) => point.equals(searchedPoint));
}

export function mergeIntervals(intervals: [number,number][]): [number,number][] {
    const sortedIntervals = intervals.sort(([a], [b]) => a - b);
    const mergedIntervals = [];
    let currentInterval = sortedIntervals[0];
    for (let i = 1; i < sortedIntervals.length; i++) {
        const [start, end] = sortedIntervals[i];
        if (start <= currentInterval[1]) {
            currentInterval[1] = Math.max(currentInterval[1], end);
        } else {
            mergedIntervals.push(currentInterval);
            currentInterval = [start, end];
        }
    }
    mergedIntervals.push(currentInterval);
    return mergedIntervals;
};

export function getQuadraticCriticalPoints(a: number, b: number, c: number): [number, number] | null {
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const denominator = 2 * a;
    const firstRoot = (-b + sqrtDiscriminant) / denominator;
    const secondRoot = (-b - sqrtDiscriminant) / denominator;
    return [firstRoot, secondRoot];
}

export function findGreatestCommonDenominator(a: bigint, b: bigint): bigint {
    let x: bigint = a;
    let y: bigint = b;
    while (y !== 0n) {
        const temp: bigint = y;
        y = x % y;
        x = temp;
    }
    return x;
}

export function findGreatestCommonDenominatorOfList(list: bigint[]): bigint {
    if (list.length < 2) throw new Error('At least two numbers are required to find the GCD.');
    return list.reduce((result, number) => findGreatestCommonDenominator(result, number), list[0]);
}

export function findLeastCommonMultiple(a: bigint, b: bigint): bigint {
    return (a * b) / findGreatestCommonDenominator(a, b);
}

export function findLeastCommonMultipleOfList(list: bigint[]): bigint {
    if (list.length < 2) throw new Error('At least two numbers are required to find the LCM.');
    return list.reduce((result, number) => findLeastCommonMultiple(result, number), list[0]);
}

export function memoize(func: Function, keyGetter: Function): Function {
    const cache = new Map();
    return (...args: any[]) => {
        const cacheKey = keyGetter(...args);
        if (cache.has(cacheKey)) return cache.get(cacheKey);
        const result = func(...args);
        cache.set(cacheKey, result);
        return result;
    };
}

export function shoelaceArea(polygon: Point2D[]) {
    const area = polygon.reduce((result, startPoint, index) => {
        const endPoint = polygon[index + 1] || polygon.first();
        return result + (startPoint.x * endPoint.y) - (endPoint.x * startPoint.y);
    }, 0);
    return Math.abs(area) / 2;
}

export function rotateDirectionClockwise(direction: ORTHOGONAL_DIRECTIONS) {
    switch (direction) {
        case ORTHOGONAL_DIRECTIONS.X_POSITIVE:
            return ORTHOGONAL_DIRECTIONS.Y_NEGATIVE;
        case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE:
            return ORTHOGONAL_DIRECTIONS.X_NEGATIVE;
        case ORTHOGONAL_DIRECTIONS.X_NEGATIVE:
            return ORTHOGONAL_DIRECTIONS.Y_POSITIVE;
        case ORTHOGONAL_DIRECTIONS.Y_POSITIVE:
            return ORTHOGONAL_DIRECTIONS.X_POSITIVE;
    }
    throw new Error('Invalid direction');
}

export function rotateDirectionCounterClockwise(direction: ORTHOGONAL_DIRECTIONS) {
    switch (direction) {
        case ORTHOGONAL_DIRECTIONS.X_POSITIVE:
            return ORTHOGONAL_DIRECTIONS.Y_POSITIVE;
        case ORTHOGONAL_DIRECTIONS.Y_POSITIVE:
            return ORTHOGONAL_DIRECTIONS.X_NEGATIVE;
        case ORTHOGONAL_DIRECTIONS.X_NEGATIVE:
            return ORTHOGONAL_DIRECTIONS.Y_NEGATIVE;
        case ORTHOGONAL_DIRECTIONS.Y_NEGATIVE:
            return ORTHOGONAL_DIRECTIONS.X_POSITIVE;
    }
    throw new Error('Invalid direction');
}

export function wait(duration: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
}

export function clearOutput() {
    process.stdout.write('\x1Bc');
}
