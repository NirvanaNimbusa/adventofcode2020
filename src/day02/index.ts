import * as fs from "fs/promises";
import * as path from "path";

interface Entry {
  character: string;
  numFirst: number;
  numSecond: number;
  password: string;
}

function lineToEntry(line: string): Entry {
  // line looks like:
  // <minCount>-<maxCount><space><character>:<space><password>
  const parts = line.split(" ", 3);

  const counts = parts[0].split("-");

  const minCount = parseInt(counts[0], 10);
  const maxCount = parseInt(counts[1], 10);

  const character = parts[1].substr(0, 1);

  const password = parts[2];

  return { character, numFirst: minCount, numSecond: maxCount, password };
}

async function readEntries(): Promise<Entry[]> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });
  const lines = fileContents.split("\n");
  return lines.filter((it) => !!it).map(lineToEntry);
}

async function part01(entries: Entry[]) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");

  const correctCount = entries.reduce((count, entry) => {
    const entryCharacterCount = entry.password.split("").filter((it) => it == entry.character)
      .length;
    const isValid =
      entryCharacterCount >= entry.numFirst && entryCharacterCount <= entry.numSecond ? 1 : 0;
    return count + isValid;
  }, 0);

  await fs.writeFile(outputPath, correctCount.toString(), "utf-8");
  console.log("Part 01:", correctCount);
}

async function part02(entries: Entry[]) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");

  const correctCount = entries.reduce((count, entry) => {
    const isValid =
      (entry.password[entry.numFirst - 1] == entry.character) !=
      (entry.password[entry.numSecond - 1] == entry.character)
        ? 1
        : 0;
    console.log(">", entry, isValid);
    return count + isValid;
  }, 0);

  await fs.writeFile(outputPath, correctCount.toString(), "utf-8");
  console.log("Part 02:", correctCount);
}

// async function part02(inputs: number[]) {}

async function main() {
  const entries = await readEntries();

  await part01(entries);
  await part02(entries);
}

main();
