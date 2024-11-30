import '../../prototype-extensions';

function hash(input: string): number {
    return input.toArray().reduce((result, char) => ((result + char.charCodeAt(0)) * 17) % 256, 0);
}

export function solvePart1(input: string): any {
    return input.splitByComma().map(hash).sum();
}

function hashMap(input: string): Map<number, [string, number][]> {
    const boxes = new Map<number, [string, number][]>();
    input.splitByComma().forEach((operation) => {
        const [label, focalLengthString] = operation.split(/[^a-z0-9]/);
        const boxNumber = hash(label);
        const focalLength = parseInt(focalLengthString);
        if (!boxes.has(boxNumber)) boxes.set(boxNumber, []);
        const lenses = boxes.get(boxNumber)!;

        // Add operation.
        if (operation.includes('=')) {
            const duplicateLens = lenses.find(([lensLabel]) => lensLabel === label);

            // Lens label is already present.
            if (duplicateLens) {
                duplicateLens[1] = focalLength;
                return;
            }

            // Lens label is not present, add it to the box.
            lenses.push([label, focalLength]);
            return;
        }

        // Remove operation.
        const lensIndex = lenses.findIndex(([lensLabel]) => lensLabel === label);
        if (lensIndex === -1) return;
        lenses.splice(lensIndex, 1);
    });
    return boxes;
}

export function solvePart2(input: string): any {
    const boxes = hashMap(input);
    return [...boxes.entries()]
        .flatMap(([boxNumber, lenses]: [number, [string, number][]]) =>
            lenses.map(([label, focalLength], index) => (boxNumber + 1) * focalLength * (index + 1)))
        .sum();
}
