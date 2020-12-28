import * as fs from "fs/promises";
import * as path from "path";

async function readInput(): Promise<[number, number[]]> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const lines = fileContents.split("\n").filter((it) => it);

  const now = parseInt(lines[0]);
  const busLines = lines[1].split(",").map((it) => parseInt(it));

  return [now, busLines];
}

async function part01(now: number, dirtyBusLines: number[]) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const busLines = dirtyBusLines.filter((it) => !Number.isNaN(it));

  let busLine = 0;
  let departureTime = Number.MAX_SAFE_INTEGER;
  busLines.forEach((it) => {
    const linePrevDepartureTime = Math.floor(now / it) * it;
    const lineDepartureTime =
      linePrevDepartureTime == now ? linePrevDepartureTime : linePrevDepartureTime + it;
    // console.log(">", it, linePrevDepartureTime, lineDepartureTime);
    if (lineDepartureTime < departureTime) {
      busLine = it;
      departureTime = lineDepartureTime;
    }
  });
  const waitTime = departureTime - now;
  const answer = busLine * waitTime;

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer, busLine, waitTime, departureTime, now);
  return answer;
}

interface LineOffset {
  line: number;
  offset: number;
}

async function part02(busLines: number[]) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  const lineOffsets: LineOffset[] = busLines
    .map((line, idx) => ({ line, offset: idx }))
    .filter((it) => !Number.isNaN(it.line));

  let stepSize = lineOffsets[0].line;
  let time = 0;
  lineOffsets.slice(1).forEach(({ line, offset }) => {
    while ((time + offset) % line) {
      time += stepSize;
    }
    stepSize *= line; // New Ratio!
  });

  const answer = time;

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 02:", answer);
  return answer;
}

async function main() {
  const [now, busLines] = await readInput();

  // await part01(now, busLines);
  await part02(busLines);
}

main();
