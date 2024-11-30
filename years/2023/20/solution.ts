import '../../prototype-extensions';
import { findLeastCommonMultipleOfList } from '../../common';

interface Module {
    name: string,
    type: string,
    inputs: string[],
    outputs: string[],
    state: boolean,
}

const MODULE_TYPE = {
    FLIP_FLOP: '%',
    CONJUNCTION: '&',
    BROADCAST: 'broadcaster',
    NULL: 'null',
};

function getModuleType(moduleDefinition: string) {
    if (moduleDefinition.startsWith(MODULE_TYPE.FLIP_FLOP)) return MODULE_TYPE.FLIP_FLOP;
    if (moduleDefinition.startsWith(MODULE_TYPE.CONJUNCTION)) return MODULE_TYPE.CONJUNCTION;
    if (moduleDefinition.startsWith(MODULE_TYPE.BROADCAST)) return MODULE_TYPE.BROADCAST;
    return MODULE_TYPE.NULL;
}

function resolveModule(modules: Map<string, Module>, name: string, type?: string, outputs?: string[]) {
    if (modules.has(name)) {
        const module = modules.get(name)!;
        module.name = name;
        if (type) module.type = type;
        if (outputs) module.outputs = outputs;
        return module;
    }

    const module = { name, type, inputs: [], outputs, state: false } as Module;
    modules.set(name, module);
    return module;
}

function parseModules(input: string): Map<string, Module> {
    const modules = new Map<string, Module>();
    input.splitByNewLine().forEach((line) => {
        const [moduleDefinition, outputsInput] = line.split(' -> ');
        const type = getModuleType(moduleDefinition);
        const name = type === MODULE_TYPE.FLIP_FLOP || type === MODULE_TYPE.CONJUNCTION ? moduleDefinition.substring(1) : moduleDefinition;
        const outputs = outputsInput.splitByComma();
        resolveModule(modules, name, type, outputs);
        outputs.forEach((output) => {
            const module = resolveModule(modules, output);
            module.inputs.push(name);
        });
    });
    return modules;
};

function propagateSignal(signals: [boolean, string, string][], sourceModule: Module, signal: boolean) {
    const newSignals: [boolean, string, string][] = sourceModule.outputs.map((moduleName: string) => [signal, moduleName, sourceModule.name]);
    signals.push(...newSignals);
}

function startSignal(modules: Map<string, Module>): [boolean, string, string][] {
    const signals: [boolean, string, string][] = [[false, 'broadcaster', '']];
    const sentSignals: [boolean, string, string][] = [];

    while (signals.length > 0) {
        const [signal, targetModuleName, sourceModuleName] = signals.shift()!;
        const targetModule = modules.get(targetModuleName)!;
        sentSignals.push([signal, targetModuleName, sourceModuleName]);

        if (targetModule.type === MODULE_TYPE.BROADCAST) {
            targetModule.state = signal;
            propagateSignal(signals, targetModule, signal);
        } else if (targetModule.type === MODULE_TYPE.FLIP_FLOP) {
            if (signal) continue;
            targetModule.state = !targetModule.state;
            propagateSignal(signals, targetModule, targetModule.state);
        } else if (targetModule.type === MODULE_TYPE.CONJUNCTION) {
            const inputsHigh = targetModule.inputs.every((input) => modules.get(input)!.state);
            targetModule.state = !inputsHigh;
            propagateSignal(signals, targetModule, targetModule.state);
        }
    }

    return sentSignals;
};

export function solvePart1(input: string): any {
    const modules = parseModules(input);

    const sentSignals = [];
    for (let index = 0; index < 1000; index++) {
        sentSignals.push(...startSignal(modules));
    }

    const lowSignalsCount = sentSignals.filter(([signal]) => !signal).length;
    const highSignalsCount = sentSignals.filter(([signal]) => signal).length;
    return lowSignalsCount * highSignalsCount;
}

export function solvePart2(input: string): any {
    const modules = parseModules(input);

    const targetModuleName = modules.get('rx')!.inputs[0];
    const targetModuleInputs = modules.get(targetModuleName)!.inputs;
    const cycleLengths = new Map();

    for (let index = 0; true; index++) {
        startSignal(modules)
            .filter(([signal, , sourceName]) =>
                targetModuleInputs.includes(sourceName) && signal && !cycleLengths.has(sourceName))
            .forEach(([, , sourceName]) => cycleLengths.set(sourceName, index + 1));
        if (cycleLengths.size === targetModuleInputs.length) break;
    }

    return findLeastCommonMultipleOfList(cycleLengths.valuesArray().map((cycleLength) => BigInt(cycleLength)));
}
