import { init as initZ3 } from 'z3-solver';
import { Point2D, Point3D } from '@common';
import '@prototype-extensions';

function isPointInBounds(point: Point2D<bigint>, boundary: [bigint, bigint]): boolean {
    if (point.x < boundary[0] || point.x > boundary[1]) return false;
    if (point.y < boundary[0] || point.y > boundary[1]) return false;
    return true;
}

function isPointForwardOnLine(point: Point2D<bigint>, linePoint: Point2D<bigint>, lineVector: Point2D<bigint>): boolean {
    const pointVector = point.subtract(linePoint);
    if (Math.sign(pointVector.x) !== Math.sign(lineVector.x)) return false;
    if (Math.sign(pointVector.y) !== Math.sign(lineVector.y)) return false;
    return true;
}

function get2DLineFormula(pointA: Point2D<bigint>, pointB: Point2D<bigint>): [bigint, bigint, bigint] {
    const a = pointA.y - pointB.y;
    const b = pointB.x - pointA.x;
    const c = pointA.x * pointB.y - pointB.x * pointA.y;
    return [a, b, c];
}

export function get2DLinesIntersection(lineA: [bigint, bigint, bigint], lineB: [bigint, bigint, bigint]): Point2D<bigint> | null {
    const [a1, b1, c1] = lineA;
    const [a2, b2, c2] = lineB;
    const denominator = a1 * b2 - a2 * b1;
    if (denominator === 0n) return null;
    const x = (b1 * c2 - b2 * c1) / denominator;
    const y = (a2 * c1 - a1 * c2) / denominator;
    return new Point2D<bigint>(x, y);
}

export function solvePart1(input: string): number {
    const hailstones: [Point2D<bigint>, Point2D<bigint>, Point2D<bigint>, [bigint, bigint, bigint]][] = input
        .splitByNewLine()
        .map((line) => {
            const [[px, py, pz], [vx, vy, vz]] = line.split(' @ ').map((part) => part.splitByComma().toBigInts());
            const pointA = new Point2D<bigint>(px, py);
            const velocity = new Point2D<bigint>(vx, vy);
            const pointB = pointA.add(velocity);
            return [pointA, pointB, velocity, get2DLineFormula(pointA, pointB)];
        });

    const isExampleInput = hailstones.length === 5;
    const boundary: [bigint, bigint] = [isExampleInput ? 7n : 200_000_000_000_000n, isExampleInput ? 27n : 400_000_000_000_000n];

    return hailstones.map(([pointA1, pointA2, velocityA, lineA], indexA) => {
        let validIntersections = 0;
        for (let index = indexA + 1; index < hailstones.length; index++) {
            const [pointB1, pointB2, velocityB, lineB] = hailstones[index];
            const intersection = get2DLinesIntersection(lineA, lineB);
            if (intersection === null) continue;
            if (!isPointInBounds(intersection, boundary)) continue;
            if (!isPointForwardOnLine(intersection, pointA1, velocityA)) continue;
            if (!isPointForwardOnLine(intersection, pointB1, velocityB)) continue;
            validIntersections++;
        }
        return validIntersections;
    }).sum();
}

export async function solvePart2(input: string): Promise<number> {
    const hailstones = input
        .splitByNewLine()
        .map((line) => line
            .split(' @ ')
            .map((part) => part.splitByComma().toBigInts() as [bigint, bigint, bigint])
            .map((coords) => new Point3D<bigint>(...coords))) as [Point3D<bigint>, Point3D<bigint>][];

    const { Context } = await initZ3();
    const { Real, Solver } = Context('main');

    const solver = new Solver();
    const rx = Real.const('rx');
    const ry = Real.const('ry');
    const rz = Real.const('rz');
    const rvx = Real.const('rvx');
    const rvy = Real.const('rvy');
    const rvz = Real.const('rvz');

    hailstones.slice(0, 3).forEach(([point, velocity], index) => {
        const t = Real.const(`t${index}`);

        solver.add(t.ge(0));
        solver.add(rx.add(rvx.mul(t)).eq(t.mul(velocity.x).add(point.x)));
        solver.add(ry.add(rvy.mul(t)).eq(t.mul(velocity.y).add(point.y)));
        solver.add(rz.add(rvz.mul(t)).eq(t.mul(velocity.z).add(point.z)));
    });

    const satisfied = await solver.check();
    if (satisfied !== 'sat') throw new Error('No solution found');
    const model = solver.model();
    return [rx, ry, rz].map((symbol) => model.eval(symbol)).toNumbers().sum();
}
