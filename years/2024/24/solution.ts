import '@prototype-extensions';

const RULE_REGEX = /^(.+?) (AND|OR|XOR) (.+?) -> (.+?)$/;
enum OPERATOR { AND = 'AND', OR = 'OR', XOR = 'XOR' };
type Address = string;
type Gate = {
    operandA: Address;
    operandB: Address;
    operator: OPERATOR;
    result: Address;
};

class Device {
    #memory: Map<Address, number>;
    #gates: Map<Address, Gate>;

    constructor(input: string) {
        const [memoryInput, gatesInput] = input.splitByDoubleNewLine();

        this.#memory = memoryInput
            .splitByNewLine()
            .reduce((result: Map<Address, number>, line: string) => {
                const [address, value] = line.splitByColon();
                result.set(address, parseInt(value));
                return result;
            }, new Map<Address, number>());

        this.#gates = gatesInput
            .splitByNewLine()
            .reduce((result: Map<Address, Gate>, line: string) => {
                const [_, operandA, operatorInput, operandB, operationResult] = line.match(RULE_REGEX)!;
                const operator = operatorInput === 'AND' ? OPERATOR.AND : (operatorInput === 'OR' ? OPERATOR.OR : OPERATOR.XOR);
                result.set(operationResult, { operandA, operator, operandB, result: operationResult } as Gate);
                return result;
            }, new Map<Address, Gate>());
    }

    findGate(operandA: Address, operator: OPERATOR, operandB?: Address): Gate | undefined {
        return this.#gates.valuesArray().find((gate) => {
            if (operator !== gate.operator) return false;
            if (operandB === undefined)
                return gate.operandA === operandA || gate.operandB === operandA;
            return gate.operandA === operandA && gate.operandB === operandB ||
                gate.operandA === operandB && gate.operandB === operandA;
        });
    }

    swapGates(addressA: Address, addressB: Address): void {
        const gateA = this.#gates.get(addressA)!;
        const gateB = this.#gates.get(addressB)!;
        this.#gates.delete(addressA);
        this.#gates.delete(addressB);
        gateA.result = addressB;
        gateB.result = addressA;
        this.#gates.set(addressB, gateA);
        this.#gates.set(addressA, gateB);
    }

    resolveNumber(registry: string): number | null {
        const bits = [...this.#gates.keysArray(), ...this.#memory.keysArray()]
            .filter((address) => address.startsWith(registry))
            .unique()
            .sort()
            .reverse()
            .map((address) => this.#resolveAddress(address))
        if (bits.some((bit) => bit === null)) return null;
        return parseInt(bits.join(''), 2);
    }

    #resolveAddress(address: Address): number | null {
        if (this.#memory.has(address)) return this.#memory.get(address)!;
        const gate = this.#gates.get(address)!;
        if (!this.#memory.has(gate.operandA)) this.#resolveAddress(gate.operandA);
        if (!this.#memory.has(gate.operandB)) this.#resolveAddress(gate.operandB);
        return this.#runGate(address);
    }

    #runGate(address: Address): number | null {
        const gate = this.#gates.get(address)!;
        const a = this.#memory.get(gate.operandA);
        const b = this.#memory.get(gate.operandB);

        if (a === undefined || b === undefined) return null;
        const value = gate.operator === OPERATOR.AND ? a & b
            : (gate.operator === OPERATOR.OR ? a | b : a ^ b);
        this.#memory.set(gate.result, value);
        return value;
    }
}

export function solvePart1(input: string): number {
    return new Device(input).resolveNumber('z')!;
}

/**
 * Carry adder logic scheme:
 * An, Bn = inputs
 * Cn = input carry from previous bit
 * Sn = result
 * Cn+1 = carry to next bit
 *
 * An XOR Bn = X (first XOR gate)
 * Cn XOR X = S (second XOR gate)
 * Cn AND X = Y1 (first AND gate)
 * An AND Bn = Y2 (second AND gate)
 * Y1 OR Y2 = Cn+1 (OR gate)
 *
 * Swaps are only contained withing a single adder block based on the input.
 */
function matchAdderGates(device: Device, bitIndex: number, carryAddress: Address): [Address, [Address, Address] | null] {
    const bitIndexAddress = String(bitIndex).padStart(2, '0');
    const xAddress = `x${bitIndexAddress}`;
    const yAddress = `y${bitIndexAddress}`;
    const zAddress = `z${bitIndexAddress}`;

    const firstXorGate = device.findGate(xAddress, OPERATOR.XOR, yAddress)!;
    const secondXorGate = device.findGate(carryAddress, OPERATOR.XOR)!;
    const firstAndGate = device.findGate(carryAddress, OPERATOR.AND)!;
    const firstXorGateExpectedResult = [secondXorGate.operandA, secondXorGate.operandB].without(carryAddress).first();

    // The second XOR gate always outputs the bit result.
    if (secondXorGate.result !== zAddress) {
        const swaps: [Address, Address] = [secondXorGate.result, zAddress];
        device.swapGates(secondXorGate.result, zAddress);
        const [nextCarryAddress] = matchAdderGates(device, bitIndex, carryAddress);
        return [nextCarryAddress, swaps];
    };

    // The first XOR gate always outputs to the second XOR gate (and the carry bit is guaranteed).
    if (firstXorGate.result !== firstXorGateExpectedResult) {
        const swaps: [Address, Address] = [firstXorGate.result, firstXorGateExpectedResult]
        device.swapGates(firstXorGate.result, firstXorGateExpectedResult);
        const [nextCarryAddress] = matchAdderGates(device, bitIndex, carryAddress);
        return [nextCarryAddress, swaps];
    }

    const secondAndGate = device.findGate(xAddress, OPERATOR.AND, yAddress)!;
    const orGate = device.findGate(firstAndGate.result, OPERATOR.OR, secondAndGate.result)!;
    return [orGate.result, null];
}

function fixAdderDevice(device: Device): Address[] {
    let carryAddress: Address = device.findGate('x00', OPERATOR.AND, 'y00')!.result;
    const allSwaps: Address[] = [];
    for (let bitIndex = 1; bitIndex < 45; bitIndex++) {
        const [nextCarryAddress, swaps] = matchAdderGates(device, bitIndex, carryAddress);
        if (swaps !== null) allSwaps.push(...swaps);
        carryAddress = nextCarryAddress;
    }
    return allSwaps;
}

export function solvePart2(input: string): string {
    const device = new Device(input);
    const swaps = fixAdderDevice(device);
    return swaps.sort().join(',');
}
