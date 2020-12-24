import * as fs from "fs/promises";
import * as path from "path";

interface Group {
  size: number;
  answers: Map<string, number>;
}

const groupFactory = (): Group => ({ size: 0, answers: new Map() });

async function readInput(): Promise<Group[]> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const groups: Group[] = [];
  let currentGroup: Group = groupFactory();

  fileContents.split("\n").forEach((line) => {
    if (line.length) {
      currentGroup.size += 1;
      line.split("").forEach((question) => {
        const questionCount = currentGroup.answers.get(question) ?? 0;
        currentGroup.answers.set(question, questionCount + 1);
      });
    } else {
      if (currentGroup.size) {
        groups.push(currentGroup);
      }
      currentGroup = groupFactory();
    }
  });
  if (currentGroup.size) {
    groups.push(currentGroup);
  }

  return groups;
}

async function part01(groups: Group[]) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const groupsAnswersSum = groups.reduce((acc, cur) => acc + cur.answers.size, 0);
  await fs.writeFile(outputPath, groupsAnswersSum.toString(), "utf-8");
  console.log("Part 01:", groupsAnswersSum);
}

const getGroupScore = (group: Group): number =>
  [...group.answers.values()].filter((it) => it == group.size).length;

async function part02(groups: Group[]) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  const groupsAnswersSum = groups.reduce((acc, cur) => {
    const groupScore = getGroupScore(cur);
    return acc + groupScore;
  }, 0);

  await fs.writeFile(outputPath, groupsAnswersSum.toString(), "utf-8");
  console.log("Part 02:", groupsAnswersSum);
}

async function main() {
  const groups = await readInput();
  // seats.forEach((seat, idx) => {
  //   console.log(idx, seat);
  // });

  await part01(groups);
  await part02(groups);
}

main();
