import * as fs from "fs/promises";
import * as path from "path";

const preambleLength = 25;

async function readInput(): Promise<number[]> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  return fileContents
    .split("\n")
    .filter((it) => it)
    .map((line) => parseInt(line));
}

function containsSum(prefix: number[], target: number): boolean {
  // console.log("?", target, prefix);
  for (let i = 0; i < prefix.length - 1; i += 1) {
    for (let j = i + 1; j < prefix.length; j += 1) {
      if (prefix[i] + prefix[j] === target) {
        // console.log("Y", i, prefix[i], j, prefix[j]);
        return true;
      }
    }
  }
  // console.log("NO");
  return false;
}

async function part01(sequence: number[]): Promise<number> {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  let answer = 0;
  for (let i = preambleLength; i < sequence.length; i += 1) {
    const currentNumber = sequence[i];
    const contains = containsSum(sequence.slice(i - preambleLength, i), currentNumber);
    // console.log(">", i, currentNumber, contains);
    if (!contains) {
      answer = currentNumber;
      break;
    }
  }

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer);
  return answer;
}

async function part02(sequence: number[], invalid: number) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  let contiguousSet: number[] = [];
  findSequence: {
    for (let i = 0; i < sequence.length; i += 1) {
      let runSum = 0;
      for (let j = i; j < sequence.length; j += 1) {
        runSum += sequence[j];
        if (runSum === invalid) {
          contiguousSet = sequence.slice(i, j + 1);
          break findSequence;
        } else if (runSum > invalid) {
          break;
        }
      }
    }
  }

  if (!contiguousSet.length) {
    console.log("NOT FOUND");
    return;
  }
  const smallest = Math.min(...contiguousSet);
  const largest = Math.max(...contiguousSet);
  const answer = smallest + largest;

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 02:", answer);
}

async function main() {
  const sequence = await readInput();
  // console.log("PROGRAM:");
  // program.forEach((instruction, idx) => {
  //   console.log(idx, ">", instruction.operation, instruction.operand);
  // });

  const invalid = await part01(sequence);
  await part02(sequence, invalid);
}

main();
