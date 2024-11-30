import '../../prototype-extensions';

const FILESYSTEM_SIZE = 70_000_000;
const MIN_SPACE_NEEDED = 30_000_000;
const MAX_DIRECTORY_SIZE = 100_000;

class TreeNodeFile {
    #name: string;
    #parent: TreeNodeDirectory | null;
    #size: number;

    get name() { return this.#name; }
    get size() { return this.#size; }
    get parent() { return this.#parent; }

    constructor(name: string, parent: TreeNodeDirectory | null, size: number) {
        this.#name = name;
        this.#parent = parent;
        this.#size = size;
    }
}

class TreeNodeDirectory extends TreeNodeFile {
    #children: TreeNodeFile[] = []

    get children() { return this.#children; }

    constructor(name: string, parent: TreeNodeDirectory | null = null, children: TreeNodeFile[] = []) {
        super(name, parent, 0);
        this.#children = children;
    }

    get size() {
        return this.#children.map((child) => child.size).sum();
    }

    addChild(node: TreeNodeFile) {
        this.#children.push(node);
    }

    findChild(name: string): TreeNodeFile {
        return this.#children.find((child) => child.name === name)!;
    }
}

class TreeTraversal {
    #cursor: TreeNodeDirectory;
    #root: TreeNodeDirectory;

    get currentDirectory() { return this.#cursor; }

    constructor(root: TreeNodeDirectory) {
        this.#root = root;
        this.#cursor = root;
    }

    cd(destination: string) {
        if (destination === '..') return (this.#cursor = this.#cursor.parent!);
        if (destination === '/') return (this.#cursor = this.#root);
        return this.#cursor = this.#cursor.findChild(destination) as TreeNodeDirectory;
    }
}

function flattenDirectoryTree(tree: TreeNodeDirectory): TreeNodeDirectory[] {
    const flatChildren = tree.children
        .filter((child) => child instanceof TreeNodeDirectory)
        .flatMap((child) => flattenDirectoryTree(child as TreeNodeDirectory));
    return [tree, ...flatChildren];
}

function buildDirectoryTree(input: string): TreeNodeDirectory {
    const tree = new TreeNodeDirectory('/');
    const traversal = new TreeTraversal(tree);

    for (const line of input.splitByNewLine()) {
        if (line.startsWith('$')) {
            if (line.startsWith('$ cd')) {
                traversal.cd(line.replace('$ cd ', ''));
                continue;
            }
            continue;
        }

        if (line.startsWith('dir')) {
            const directoryName: string = line.replace('dir ', '');
            const newDirectory: TreeNodeDirectory = new TreeNodeDirectory(directoryName, traversal.currentDirectory);
            traversal.currentDirectory.addChild(newDirectory);
        } else {
            const [fileSize, fileName] = line.split(' ');
            const newFile: TreeNodeFile = new TreeNodeFile(fileName, traversal.currentDirectory, Number(fileSize));
            traversal.currentDirectory.addChild(newFile);
        }
    }

    return tree;
}

export function solvePart1(input: string): any {
    return flattenDirectoryTree(buildDirectoryTree(input))
        .filter((directory) => directory.size <= MAX_DIRECTORY_SIZE)
        .map((directory) => directory.size)
        .sum();
}

export function solvePart2(input: string): any {
    const tree = buildDirectoryTree(input);

    const remainingFreeSpace = FILESYSTEM_SIZE - tree.size;
    const additionalFreeSpaceRequired = MIN_SPACE_NEEDED - remainingFreeSpace;
    return flattenDirectoryTree(tree)
        // Sort by size, smallest to biggest.
        .sort((a, b) => a.size - b.size)
        // Find the first one that is big enough to free the required space.
        .find((directory: TreeNodeDirectory) => directory.size >= additionalFreeSpaceRequired)!
        .size;
}
