import * as fs from "fs/promises";
import * as path from "path";

async function readInput(): Promise<number[]> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const adapters = fileContents
    .split("\n")
    .filter((it) => it)
    .map((line) => parseInt(line))
    .sort((a, b) => {
      if (a == b) {
        return 0;
      }
      return a < b ? -1 : 1;
    });
  // prepend charging outlet, append my device
  adapters.unshift(0);
  adapters.push(adapters[adapters.length - 1] + 3);
  return adapters;
}

async function part01(adapters: number[]) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  let step1Count = 0;
  let step3Count = 0;

  for (let i = 0; i < adapters.length - 1; i += 1) {
    const numA = adapters[i];
    const numB = adapters[i + 1];
    const diff = numB - numA;
    // console.log("#", i, numA, numB, diff);
    switch (diff) {
      case 1:
        step1Count += 1;
        break;
      case 3:
        step3Count += 1;
        break;
    }
  }

  const answer = step1Count * step3Count;
  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer, step1Count, step3Count);
  return answer;
}

function bruteForceCombinations(adapters: number[]): number {
  const adaptersLength = adapters.length;
  let answer = 0;

  const countOptions = (headIdx: number) => {
    if (adaptersLength - headIdx <= 1) {
      answer += 1;
    }
    const head = adapters[headIdx];

    const tailStartIdx = headIdx + 1;

    for (let attemptStep = 1; attemptStep <= 3; attemptStep += 1) {
      for (let j = 0; j < attemptStep && j + tailStartIdx < adaptersLength; j += 1) {
        if (head + attemptStep == adapters[tailStartIdx + j]) {
          countOptions(tailStartIdx + j);
        }
      }
    }
  };

  countOptions(0);

  return answer;
}

function makeIndependentChains(adapters: number[]): number[][] {
  const chains: number[][] = [];

  for (let mainIdx = 0; mainIdx < adapters.length; mainIdx += 1) {
    const chainStart = mainIdx;

    let chainIdx = chainStart;
    let shouldContinue = false;
    let maxSeen = adapters[mainIdx];
    do {
      shouldContinue = false;

      const idxValue = adapters[chainIdx];
      const lookAhead = adapters.slice(chainIdx + 1, chainIdx + 4);
      const candidates = [idxValue + 1, idxValue + 2, idxValue + 3];
      const candidatesAccessible = candidates.filter((it) => lookAhead.includes(it));

      if (
        chainIdx < adapters.length - 1 &&
        (candidatesAccessible.length > 1 || idxValue < maxSeen)
      ) {
        shouldContinue = true;
        chainIdx += 1;
        maxSeen = Math.max(maxSeen, ...candidatesAccessible);
      }
    } while (shouldContinue);

    chains.push(adapters.slice(chainStart, chainIdx + 1));
    console.log(">", chains[chains.length - 1]);
    mainIdx = chainIdx;
  }

  return chains;
}

async function part02(adapters: number[]) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");

  const chains = makeIndependentChains(adapters);
  const answer = chains.reduce((acc, cur) => acc * bruteForceCombinations(cur), 1);

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 02:", answer);
}

async function main() {
  const adapters = await readInput();
  // console.log("adapters:");
  // adapters.forEach((adapter, idx) => {
  //   console.log(idx, ">", adapter);
  // });

  await part01(adapters);
  await part02(adapters);
}

main();
