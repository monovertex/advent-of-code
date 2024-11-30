import { memoize } from 'years/common';
import '../../prototype-extensions';
import util from 'util';

const AVAILABLE_MINUTES_PART_1 = 24;
const AVAILABLE_MINUTES_PART_2 = 32;

enum RESOURCE_TYPE {
    ORE = 'ore',
    CLAY = 'clay',
    OBSIDIAN = 'obsidian',
    GEODE = 'geode',
};

const RESOURCE_TYPES_BY_PRIORITY = Object.freeze([
    RESOURCE_TYPE.GEODE,
    RESOURCE_TYPE.OBSIDIAN,
    RESOURCE_TYPE.CLAY,
    RESOURCE_TYPE.ORE,
]);

type ResourceCount = {
    [RESOURCE_TYPE.ORE]: number,
    [RESOURCE_TYPE.CLAY]: number,
    [RESOURCE_TYPE.OBSIDIAN]: number,
    [RESOURCE_TYPE.GEODE]: number,
}

function resourceCountToString(resourceCount: ResourceCount): string {
    return resourceCount.mapEntries(([resourceType, amount]: [RESOURCE_TYPE, number]) =>
        `${resourceType}=${amount}`).join(',');
}

class Robot {
    resourceType: RESOURCE_TYPE;
    costs: ResourceCount = {
        [RESOURCE_TYPE.ORE]: 0,
        [RESOURCE_TYPE.CLAY]: 0,
        [RESOURCE_TYPE.OBSIDIAN]: 0,
        [RESOURCE_TYPE.GEODE]: 0,
    };

    constructor(input: string) {
        const [, resourceTypeInput, costsInput] = input.match(/^Each (\w+) robot costs (.+)/i)!;

        this.resourceType = this.#resolveResourceType(resourceTypeInput);

        costsInput.match(/(\d+ \w+)/gi)!
            .map((requirement) => requirement.splitByWhitespace())
            .forEach(([amount, resourceType]) =>
                this.costs[this.#resolveResourceType(resourceType)] = Number(amount));
    }

    toString(): string {
        return `Robot mines ${this.resourceType}, costs ${resourceCountToString(this.costs)}`;
    }

    [util.inspect.custom]() {
        return this.toString();
    }

    #resolveResourceType(rawType: string): RESOURCE_TYPE {
        for (const resourceType of RESOURCE_TYPES_BY_PRIORITY) {
            if (rawType.includes(resourceType)) {
                return resourceType;
            }
        }
        throw new Error('Invalid resource type');
    }
}

class Blueprint {
    robots: Robot[];
    maxCosts: ResourceCount;

    constructor(input: string) {
        const [, robotInputs] = input.split(': ');
        this.robots = robotInputs.split('. ').map((robotInput) => new Robot(robotInput));
        this.maxCosts = {
            [RESOURCE_TYPE.ORE]: this.#computeMaxCostsForResourceType(RESOURCE_TYPE.ORE),
            [RESOURCE_TYPE.CLAY]: this.#computeMaxCostsForResourceType(RESOURCE_TYPE.CLAY),
            [RESOURCE_TYPE.OBSIDIAN]: this.#computeMaxCostsForResourceType(RESOURCE_TYPE.OBSIDIAN),
            [RESOURCE_TYPE.GEODE]: Infinity,
        };
    }

    getRobotCost(robotResourceType: RESOURCE_TYPE, costResourceType: RESOURCE_TYPE): number {
        return this.robots.find((robot) => robot.resourceType === robotResourceType)!.costs[costResourceType];
    }

    getBestGeodeCount(availableMinutes: number): number {
        const simulation = new Simulation(this, availableMinutes);
        return simulation.getBestGeodeCount();
    }

    toString(): string {
        return `Blueprint: \n${this.robots.map((robot) => robot.toString()).join('\n')}`;
    }

    [util.inspect.custom]() {
        return this.toString();
    }

    #computeMaxCostsForResourceType(resourceType: RESOURCE_TYPE) {
        return this.robots.map((robot) => robot.costs[resourceType]).max();
    }
}

class Simulation {
    #blueprint: Blueprint;
    #availableMinutes: number;
    #bestGeodeCount: number = 0;

    constructor(blueprint: Blueprint, availableMinutes: number) {
        this.#blueprint = blueprint;
        this.#availableMinutes = availableMinutes;
    }

    getBestGeodeCount() {
        const robotCount: ResourceCount = {
            [RESOURCE_TYPE.ORE]: 1,
            [RESOURCE_TYPE.CLAY]: 0,
            [RESOURCE_TYPE.OBSIDIAN]: 0,
            [RESOURCE_TYPE.GEODE]: 0,
        };
        const resourceCount: ResourceCount = {
            [RESOURCE_TYPE.ORE]: 0,
            [RESOURCE_TYPE.CLAY]: 0,
            [RESOURCE_TYPE.OBSIDIAN]: 0,
            [RESOURCE_TYPE.GEODE]: 0,
        };
        this.#runIteration(this.#availableMinutes, robotCount, resourceCount);
        return this.#bestGeodeCount;
    }

    #runIteration(remainingMinutes: number, robotCount: ResourceCount, resourceCount: ResourceCount) {
        // Determine how many geodes we can mine without building new robots.
        const geodeCountIfIdle = resourceCount[RESOURCE_TYPE.GEODE] + remainingMinutes * robotCount[RESOURCE_TYPE.GEODE];
        if (geodeCountIfIdle > this.#bestGeodeCount) this.#bestGeodeCount = geodeCountIfIdle;

        // The perfect scenario allows us to build a new geode robot each turn. If it is smaller
        // than the current best score, we can stop.
        const geodeCountIfPerfect = geodeCountIfIdle + (remainingMinutes * (remainingMinutes - 1)) / 2;
        if (geodeCountIfPerfect <= this.#bestGeodeCount) return;

        return RESOURCE_TYPES_BY_PRIORITY.forEach((newRobotResourceType) => {
            this.#runIterationForType(newRobotResourceType, remainingMinutes, robotCount, resourceCount);
        });
    }

    #runIterationForType(
        newRobotResourceType: RESOURCE_TYPE,
        remainingMinutes: number,
        robotCount: ResourceCount,
        resourceCount: ResourceCount,
    ) {
        // If we already have enough robots mining this kind of resource to match the
        // biggest cost, there's no use in building anymore robots to mine it.
        if (robotCount[newRobotResourceType] >= this.#blueprint.maxCosts[newRobotResourceType]) return;
        const timeToBuild = this.#computeTimeToBuildRobot(newRobotResourceType, robotCount, resourceCount);

        // If we can't build the robot in time, there's no use in trying to build it.
        // If the robot is ready only on the last minute, there's no time to mine the resource.
        if (timeToBuild >= remainingMinutes) return;

        const timeSpent = timeToBuild + 1;
        const newRobotCount = { ...robotCount, [newRobotResourceType]: robotCount[newRobotResourceType] + 1 } as ResourceCount;
        const newResourceCount = resourceCount.mapValues((resourceAmount: number, resourceType: RESOURCE_TYPE) => {
            const resourceCost = this.#blueprint.getRobotCost(newRobotResourceType, resourceType);
            return resourceAmount - resourceCost + timeSpent * robotCount[resourceType];
        }) as ResourceCount;

        this.#runIteration(remainingMinutes - timeSpent, newRobotCount, newResourceCount);
    }

    #computeTimeToBuildRobot(
        newRobotResourceType: RESOURCE_TYPE,
        robotCount: ResourceCount,
        resourceCount: ResourceCount
    ): number{
        return RESOURCE_TYPES_BY_PRIORITY.map((costResourceType) => {
            const cost = this.#blueprint.getRobotCost(newRobotResourceType, costResourceType);

            // If the robot doesn't require this resource, it's free.
            if (cost === 0) return 0;

            const robotsMiningResourceType = robotCount[costResourceType];
            // If there's no robot mining this resource, we can't build the new robot.
            if (robotsMiningResourceType === 0) return Infinity;

            const resolvedCost = cost - resourceCount[costResourceType];
            // If we have enough resources to build the robot, it's free.
            if (resolvedCost <= 0) return 0;

            // The time necessary is the ratio between the cost and the number of robots mining.
            return Math.ceil(resolvedCost / robotsMiningResourceType);
        }).max();
    }
}

function parseInput(input: string): Blueprint[] {
    return input.splitByNewLine().map((line) => new Blueprint(line));
}

export function solvePart1(input: string): number {
    const blueprints = parseInput(input);
    return blueprints
        .map((blueprint, index) => (index + 1) * blueprint.getBestGeodeCount(AVAILABLE_MINUTES_PART_1))
        .sum();
}

export function solvePart2(input: string): number {
    const blueprints = parseInput(input);
    const relevantBlueprints = [blueprints[0], blueprints[1], blueprints[2]];
    return relevantBlueprints
        .map((blueprint) => blueprint.getBestGeodeCount(AVAILABLE_MINUTES_PART_2))
        .multiply();
}
