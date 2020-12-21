import * as fs from "fs/promises";
import * as path from "path";

type Forest = boolean[][];

async function readInput(): Promise<Forest> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });
  const lines = fileContents.split("\n");
  return lines.filter((row) => !!row).map((row) => row.split("").map((it) => it == "#"));
}

function getSlopeTreeCount(forest: Forest, stepRow: number, stepColumn: number): number {
  const patternWidth = forest[0].length;
  const patternHeight = forest.length;
  const forestHasTreeAt = (column: number, row: number) => forest[row][column % patternWidth];

  let column = 0;
  let treeCount = 0;
  for (let row = 0; row < patternHeight; row += stepRow) {
    if (forestHasTreeAt(column, row)) {
      treeCount += 1;
    }
    column += stepColumn;
  }

  return treeCount;
}

async function part01(forest: Forest) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");

  const treeCount = getSlopeTreeCount(forest, 1, 3);
  await fs.writeFile(outputPath, treeCount.toString(), "utf-8");
  console.log("Part 01:", treeCount);
}

async function part02(forest: Forest) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");

  const product =
    getSlopeTreeCount(forest, 1, 1) *
    getSlopeTreeCount(forest, 1, 3) *
    getSlopeTreeCount(forest, 1, 5) *
    getSlopeTreeCount(forest, 1, 7) *
    getSlopeTreeCount(forest, 2, 1);
  await fs.writeFile(outputPath, product.toString(), "utf-8");
  console.log("Part 02:", product);
}

async function main() {
  const forest = await readInput();

  await part01(forest);
  await part02(forest);
}

main();
