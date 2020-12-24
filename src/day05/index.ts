import * as fs from "fs/promises";
import * as path from "path";

interface Seat {
  row: number;
  column: number;
  seatId: number;
}

async function readInput(): Promise<Seat[]> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const seats: Seat[] = fileContents
    .split("\n")
    .filter((it) => it)
    .map((line) => {
      const row = line
        .substr(0, 7)
        .split("")
        .reduce((acc, cur) => {
          const digit = cur == "B" ? 1 : 0;
          return acc * 2 + digit;
        }, 0);

      const column = line
        .substr(7)
        .split("")
        .reduce((acc, cur) => {
          const digit = cur == "R" ? 1 : 0;
          return acc * 2 + digit;
        }, 0);

      return {
        row,
        column,
        seatId: row * 8 + column,
      };
    })
    .filter((it) => it);

  return seats;
}

async function part01(seats: Seat[]) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const maxSeatId = seats.reduce((acc, cur) => Math.max(acc, cur.seatId), 0);
  await fs.writeFile(outputPath, maxSeatId.toString(), "utf-8");
  console.log("Part 01:", maxSeatId);
}

async function part02(seats: Seat[]) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  const MAX_ID = 822;
  const seatIds = new Set();
  seats.forEach((it) => {
    seatIds.add(it.seatId);
  });

  let mySeatId = -1;
  for (let i = 0; i <= 822; i += 1) {
    if (!seatIds.has(i) && seatIds.has(i - 1) && seatIds.has(i + 1)) {
      mySeatId = i;
    }
  }

  await fs.writeFile(outputPath, mySeatId.toString(), "utf-8");
  console.log("Part 02:", mySeatId);
}

async function main() {
  const seats = await readInput();
  // seats.forEach((seat, idx) => {
  //   console.log(idx, seat);
  // });

  await part01(seats);
  await part02(seats);
}

main();
