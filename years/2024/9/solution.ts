import '../../prototype-extensions';

// #region Part 1

export function solvePart1(input: string): bigint {
    const items = input.toArray().toNumbers();

    let id = 0n;
    const blocks: (bigint | null)[] = items.flatMap((item, index) => {
        if (index.isEven()) {
            const result = new Array(item).fill(id);
            id++;
            return result;
        } else {
            return new Array(item).fill(null);
        }
    });

    for (let index = 0; index < blocks.length; index++) {
        const block = blocks[index];
        if (block !== null) continue;
        let movedBlock;
        do movedBlock = blocks.pop()!; while (movedBlock === null);
        blocks[index] = movedBlock;
    }

    return blocks
        .reject((block: bigint | null) => block === null)
        .map((block, index) => block! * BigInt(index))
        .sum();
}

// #endregion


// #region Part 2

class File {
    id: number | null;
    size: number;

    constructor(size: number, id: number | null = null) {
        this.size = size;
        this.id = id;
    }

    isEmpty() {
        return this.id === null;
    }

    checksum(offset: number): bigint {
        if (this.isEmpty()) return 0n;
        let result: bigint = BigInt(0);
        for (let index = 0; index < this.size; index++) {
            result += BigInt(offset + index) * BigInt(this.id!);
        }
        return result;
    }
}

function parseInput(input: string): File[] {
    const items = input.toArray().toNumbers();
    let id = 0;
    return items.map((item, index) => {
        if (index.isEven()) {
            const result = new File(item, id);
            id++;
            return result;
        } else {
            return new File(item);
        }
    });
}

function computeChecksum(files: File[]): bigint {
    let offset = 0;
    return files.map((file) => {
        const result = file.checksum(offset);
        offset += file.size;
        return result;
    }).sum();
}

export function solvePart2(input: string): bigint {
    const files = parseInput(input);

    let fileId = files.map((file) => file.id).max();
    while (fileId > 0) {
        const targetFileIndex = files.findLastIndex((file: File) => file.id === fileId)!;
        fileId--;

        const targetFile = files[targetFileIndex];
        const destinationFileIndex = files.findIndex((file: File) => file.isEmpty() && file.size >= targetFile.size);
        if (destinationFileIndex === -1 || destinationFileIndex > targetFileIndex) continue;

        // Remove file to move from its current position and insert empty space instead
        // (merge empty spaces, if any).
        files.splice(targetFileIndex, 1);
        let newEmptySpace = targetFile.size;
        let newEmptySpaceIndex = targetFileIndex;

        const nextFile = files[targetFileIndex];
        if (nextFile && nextFile.isEmpty()) {
            newEmptySpace += nextFile.size;
            files.splice(targetFileIndex, 1);
        }

        const prevFile = files[targetFileIndex - 1];
        if (prevFile && prevFile.isEmpty()) {
            newEmptySpace += prevFile.size;
            newEmptySpaceIndex = targetFileIndex - 1;
            files.splice(targetFileIndex - 1, 1);
        }

        files.splice(newEmptySpaceIndex, 0, new File(newEmptySpace));

        // Move the file to the destination position and insert empty space if any left over.
        const destinationFile = files.splice(destinationFileIndex, 1)[0];
        files.splice(destinationFileIndex, 0, targetFile);
        const leftoverEmptySpace = destinationFile.size - targetFile.size;
        if (leftoverEmptySpace > 0) files.splice(destinationFileIndex + 1, 0, new File(leftoverEmptySpace));
    }

    return computeChecksum(files);
}

// #endregion
