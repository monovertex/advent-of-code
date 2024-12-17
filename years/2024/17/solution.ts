import '../../prototype-extensions';

enum REGISTER_IDENTIFIER { A = 'A', B = 'B', C = 'C' };

type Memory = {
    [REGISTER_IDENTIFIER.A]: bigint;
    [REGISTER_IDENTIFIER.B]: bigint;
    [REGISTER_IDENTIFIER.C]: bigint;
}

type Instructions = number[];

function evalComboOperand(memory: Memory, operand: number): bigint | null {
    if (operand <= 3) return BigInt(operand);
    if (operand === 4) return memory[REGISTER_IDENTIFIER.A];
    if (operand === 5) return memory[REGISTER_IDENTIFIER.B];
    if (operand === 6) return memory[REGISTER_IDENTIFIER.C];
    if (operand === 7) return null;
    throw new Error(`Invalid operand: ${operand}`);
}

function evalOpcode(memory: Memory, opcode: number, operand: number): { pointer: number | null, output: number | null } | null {
    const comboOperand = evalComboOperand(memory, operand);

    switch (opcode) {
        case 0: // adv, division, combo operand
            memory[REGISTER_IDENTIFIER.A] = BigInt(Math.floor(Number(memory[REGISTER_IDENTIFIER.A] / (2n ** comboOperand!))))
            return null;
        case 6: // bdv, division, combo operand
            memory[REGISTER_IDENTIFIER.B] = BigInt(Math.floor(Number(memory[REGISTER_IDENTIFIER.A] / (2n ** comboOperand!))));
            return null;
        case 7: // cdv, division, combo operand
            memory[REGISTER_IDENTIFIER.C] = BigInt(Math.floor(Number(memory[REGISTER_IDENTIFIER.A] / (2n ** comboOperand!))));
            return null;

        case 1: // bxl, bitwise XOR, literal operand
            memory[REGISTER_IDENTIFIER.B] = memory[REGISTER_IDENTIFIER.B] ^ BigInt(operand);
            return null;
        case 4: // bxc, bitwise XOR, ignored operand
            memory[REGISTER_IDENTIFIER.B] = memory[REGISTER_IDENTIFIER.B] ^ memory[REGISTER_IDENTIFIER.C];
            return null;

        case 2: // bst, modulo 8, combo operand
            memory[REGISTER_IDENTIFIER.B] = comboOperand! % 8n;
            return null;
        case 3: // jnz, jump if A > 0, literal operand
            if (memory[REGISTER_IDENTIFIER.A] === 0n) return null;
            return { pointer: operand, output: null };
        case 5: // out, modulo 8, combo operand
            return { pointer: null, output: Number(comboOperand! % 8n) };
    }

    throw new Error(`Invalid opcode: ${opcode}`);
}

function parseInput(input: string): [Memory, Instructions] {
    const [memoryInput, instructionsInput] = input.splitByDoubleNewLine();
    const memory: Memory = memoryInput
        .splitByNewLine()
        .map((line) => line.match(/^Register (.): (\d+)$/)!)
        .reduce((result, [, identifier, value]) =>
            ({ ...result, [identifier as REGISTER_IDENTIFIER]: BigInt(parseInt(value)) }),
        {} as Memory);
    const instructions = instructionsInput.replace('Program: ', '').splitByComma().toNumbers();

    return [memory, instructions];
}

function serializeOutput(output: number[]): string {
    return output.join(',');
}

function evalProgram(memory: Memory, instructions: Instructions): string {
    const output = [];

    for (let pointer = 0; pointer < instructions.length;) {
        const result = evalOpcode(memory, instructions[pointer], instructions[pointer + 1]);

        pointer += 2
        if (result !== null) {
            if (result.pointer !== null) pointer = result.pointer;
            if (result.output !== null) output.push(result.output);
        }
    }

    return serializeOutput(output);
}

export function solvePart1(input: string): string {
    const [memory, instructions] = parseInput(input);
    return evalProgram(memory, instructions);
}

export function solvePart2(input: string): number {
    const [memory, instructions] = parseInput(input);

    const valuesToCheck: bigint[] = [0n];
    for (let digitIndex = instructions.length - 1; digitIndex >= 0; digitIndex--) {
        const expectedOutput = serializeOutput(instructions.slice(digitIndex));
        const nextValuesToCheck: bigint[] = [];

        for (const value of valuesToCheck) {
            for (let offset: bigint = 0n; offset < 8n; offset++) {
                const aValue = BigInt(value + offset);
                const memoryCopy = { ...memory, [REGISTER_IDENTIFIER.A]: aValue };
                const output = evalProgram(memoryCopy, instructions);

                if (output === expectedOutput) {
                    if (digitIndex === 0) return Number(aValue);
                    nextValuesToCheck.push(aValue * 8n);
                }
            }
        }

        valuesToCheck.push(...nextValuesToCheck);
    };

    throw new Error('No solution found');
}
