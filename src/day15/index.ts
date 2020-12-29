import * as fs from "fs/promises";
import * as path from "path";
import { memoryUsage } from "process";

function seqMapToStr(seq: Map<number, number[]>): string {
  return [...seq.entries()].map(([key, vals]) => `${key}=>${vals.join()}`).join();
}

async function part01() {
  const outputPath = path.resolve(__dirname, "output.part01.dat");

  const initSequence = [0, 1, 5, 10, 3, 12, 19];
  const seqMap = new Map<number, number>();
  initSequence.forEach((n, idx) => seqMap.set(n, idx));
  let turns = initSequence.length;
  let sayNext = 0;
  while (turns < 2020 - 1) {
    // console.log(">", sayNext);
    const lastTimeSpoken = seqMap.get(sayNext) ?? turns;
    seqMap.set(sayNext, turns);
    sayNext = turns - lastTimeSpoken;
    turns += 1;
  }
  const answer = sayNext;

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer);
  return answer;
}

async function part02() {
  const outputPath = path.resolve(__dirname, "output.part02.dat");

  const initSequence = [0, 1, 5, 10, 3, 12, 19];
  const seqMap = new Map<number, number>();
  initSequence.forEach((n, idx) => seqMap.set(n, idx));
  let turns = initSequence.length;
  let sayNext = 0;
  while (turns < 30_000_000 - 1) {
    // console.log(">", sayNext);
    const lastTimeSpoken = seqMap.get(sayNext) ?? turns;
    seqMap.set(sayNext, turns);
    sayNext = turns - lastTimeSpoken;
    turns += 1;
  }
  const answer = sayNext;

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 02:", answer);
  return answer;
}

async function main() {
  await part01();
  await part02();
}

main();
