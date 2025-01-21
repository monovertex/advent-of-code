import '@prototype-extensions';
import util from 'util';

class PartInterval {
    values: [number, number][];
    result: string;

    constructor(values: [number, number][], result: string) {
        this.values = values;
        this.result = result;
    }

    isValid(): boolean {
        return this.values.every((interval) => interval[0] <= interval[1]);
    }

    [util.inspect.custom]() {
        return `${this.values.join(';')} => ${this.result}`;
    }
}

class Part {
    values: number[];

    get sum() {
        return this.values.sum();
    }

    constructor(input: string) {
        this.values = input
            .substring(1, input.length - 1)
            .splitByComma()
            .map((propertyInput) => propertyInput.split('=')[1])
            .toNumbers();
    }
}

class Rule {
    conditionInput: string;
    condition: Function;
    result: string;

    constructor(input: string) {
        const [conditionOrResult, result] = input.split(':');
        if (!result) {
            this.conditionInput = '';
            this.condition = () => true;
            this.result = conditionOrResult;
        } else {
            this.conditionInput = conditionOrResult.replace('x', '[0]').replace('m', '[1]').replace('a', '[2]').replace('s', '[3]');
            this.condition = new Function('part', `return part.values${this.conditionInput}`);
            this.result = result;
        }
    }

    execute(part: Part): string | null {
        if (this.condition(part)) return this.result;
        return null;
    }

    splitInterval(part: PartInterval): PartInterval[] {
        if (this.conditionInput === '') return [new PartInterval(part.values, this.result)];

        const intervalIndex = Number(this.conditionInput.substring(1, 2));
        const results = this.conditionInput.includes('<') ? [this.result, part.result] : [part.result, this.result];
        const splitBoundary = Number(this.conditionInput.substring(4)) + (this.conditionInput.includes('>') ? 1 : 0);
        const interval = part.values[intervalIndex];
        return [
            new PartInterval([...part.values].replaceAt(intervalIndex, [interval[0], splitBoundary]), results[0]),
            new PartInterval([...part.values].replaceAt(intervalIndex, [splitBoundary, interval[1]]), results[1])
        ].filter((part) => part.isValid());
    }

    [util.inspect.custom]() {
        return `${this.condition.toString()} => ${this.result}`;
    }
}

class Workflow {
    name: string;
    rules: Rule[];

    constructor(input: string) {
        const [name, rulesInput] = input.substring(0, input.length - 1).split('{');
        this.name = name;
        this.rules = rulesInput.splitByComma().map(ruleInput => new Rule(ruleInput));
    }

    execute(part: Part): string {
        for (const rule of this.rules) {
            const result: string | null = rule.execute(part);
            if (result) return result!;
        }
        throw new Error('No rule matched');
    }

    splitInterval(part: PartInterval): PartInterval[] {
        let result: PartInterval[] = [part];
        for (const rule of this.rules) {
            result = result.flatMap((part) =>
                part.result === this.name ? rule.splitInterval(part) : [part]);
        }
        return result;
    }
}

function parseInput(input: string): [Workflow[], Part[]] {
    const [workflowsInput, partsInput] = input.splitByDoubleNewLine();
    const workflows = workflowsInput.splitByNewLine().map(workflowInput => new Workflow(workflowInput));
    const parts = partsInput.splitByNewLine().map(partInput => new Part(partInput));
    return [workflows, parts];
}

export function solvePart1(input: string): any {
    const [workflows, parts] = parseInput(input);
    const firstWorkflow = workflows.find((workflow) => workflow.name === 'in')!;

    return parts.map((part) => {
        let workflow = firstWorkflow;
        while (true) {
            const result = workflow.execute(part);
            if (result === 'A') return part.sum;
            if (result === 'R') return 0;
            workflow = workflows.find((workflow) => workflow.name === result)!;
        }
    }).sum();
}

export function solvePart2(input: string): any {
    const [workflows] = parseInput(input);
    const parts = [new PartInterval([[1, 4001], [1, 4001], [1, 4001], [1, 4001]], 'in')];
    const acceptedParts: PartInterval[] = [];

    while (parts.length > 0) {
        const part = parts.pop()!;
        if (part.result === 'A') {
            acceptedParts.push(part);
            continue;
        }
        if (part.result === 'R') continue;

        const workflow = workflows.find((workflow) => workflow.name === part!.result)!;
        parts.push(...workflow.splitInterval(part));
    }

    return acceptedParts
        .map((part) => part.values.map(([start, end]) => end - start).multiply())
        .sum();
}
