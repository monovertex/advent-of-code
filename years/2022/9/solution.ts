import '@prototype-extensions';
import { ORTHOGONAL_DIRECTIONS, ORTHOGONAL_DIRECTION_VECTORS_2D_MAP, Point2D } from '@common';

const DIRECTION_DECODE_MAP = new Map([
    ['U', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_POSITIVE)],
    ['D', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.Y_NEGATIVE)],
    ['L', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_NEGATIVE)],
    ['R', ORTHOGONAL_DIRECTION_VECTORS_2D_MAP.get(ORTHOGONAL_DIRECTIONS.X_POSITIVE)],
]);

class RopeNode extends Point2D {
    headNode: RopeNode | null;

    constructor(headNode: RopeNode | null = null) {
        super(0, 0);
        this.headNode = headNode;
    }

    moveTowardsHead() {
        if (!this.headNode) return;
        if (this.isAdjacentToHead()) return;
        this.move(new Point2D(
            this.x === this.headNode.x ? 0 : (this.x > this.headNode.x ? -1 : 1),
            this.y === this.headNode.y ? 0 : (this.y > this.headNode.y ? -1 : 1)
        ));
    }

    isAdjacentToHead() {
        if (!this.headNode) return true;
        return this.isAdjacentTo(this.headNode);
    }
}

function buildRope(length: number): RopeNode[] {
    const headNode = new RopeNode();
    const rope = [headNode];
    for (let i = 1; i < length; i++) {
        const node = new RopeNode(rope[i - 1]);
        rope.push(node);
    }
    return rope;
}

function moveRopeAndRecordTailPositions(rope: RopeNode[], directions: Point2D[]): Set<string> {
    const [headNode, ...restNodes] = rope;
    const tailNode = rope[rope.length - 1];
    return new Set(directions.map((vector) => {
        headNode.move(vector);
        restNodes.forEach((node) => node.moveTowardsHead());
        return tailNode.toString();
    }));
};

function decodeDirections(input: string): Point2D[] {
    return input
        .splitByNewLine()
        .map((row: string) => row.split(' '))
        .flatMap(([direction, length]: string[]): Point2D[] =>
            new Array(Number(length)).fill(DIRECTION_DECODE_MAP.get(direction)));
}

export function solve(input: string, ropeLength: number) {
    const directions = decodeDirections(input);
    const rope = buildRope(ropeLength);
    const uniquePositions = moveRopeAndRecordTailPositions(rope, directions);
    return uniquePositions.size;
}

export function solvePart1(input: string): any {
    return solve(input, 2);
}

export function solvePart2(input: string): any {
    return solve(input, 10);
}
