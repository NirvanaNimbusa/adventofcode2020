import * as fs from "fs/promises";
import * as path from "path";

type Operation = "N" | "E" | "S" | "W" | "L" | "R" | "F";
interface NavStep {
  op: Operation;
  val: number;
}

type Route = NavStep[];

async function readInput(): Promise<Route> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const route = fileContents
    .split("\n")
    .filter((it) => it)
    .map((line) => ({ op: line[0] as Operation, val: parseInt(line.slice(1)) }));

  return route;
}

async function part02(route: Route) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");

  /* x +: east,  -: west
   * y +: north, -: south
   * dir 90: east, 0: north
   */
  let x = 0,
    y = 0,
    wpX = 10,
    wpY = 1;

  route.forEach(({ op, val }) => {
    // HACK: we only rotate in increments of 90 degrees! 🎉
    switch (true) {
      case op === "N":
        wpY += val;
        break;
      case op === "E":
        wpX += val;
        break;
      case op === "S":
        wpY -= val;
        break;
      case op === "W":
        wpX -= val;
        break;

      case op === "F":
        x += wpX * val;
        y += wpY * val;
        break;

      case op === "L" && val === 90:
      case op === "R" && val === 270: {
        const newWpX = -wpY;
        const newWpY = wpX;
        wpX = newWpX;
        wpY = newWpY;
        break;
      }

      case op === "R" && val === 90:
      case op === "L" && val === 270: {
        const newWpX = wpY;
        const newWpY = -wpX;
        wpX = newWpX;
        wpY = newWpY;
        break;
      }

      case op === "R" && val === 180:
      case op === "L" && val === 180: {
        const newWpX = -wpX;
        const newWpY = -wpY;
        wpX = newWpX;
        wpY = newWpY;
        break;
      }
    }
    // console.log(">", op, val, "-->", { x, y, wpX, wpY });
  });

  const answer = Math.abs(x) + Math.abs(y);

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 02:", answer);
  return answer;
}

async function part01(route: Route) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");

  /* x +: east,  -: west
   * y +: north, -: south
   * dir 90: east, 0: north
   */
  let x = 0,
    y = 0,
    dir = 90;

  route.forEach(({ op, val }) => {
    // HACK: we only rotate in increments of 90 degrees! 🎉
    switch (true) {
      case op === "N":
      case op === "F" && dir === 0:
        x += val;
        break;
      case op === "E":
      case op === "F" && dir === 90:
        y += val;
        break;
      case op === "S":
      case op === "F" && dir === 180:
        x -= val;
        break;
      case op === "W":
      case op === "F" && dir === 270:
        y -= val;
        break;
      case op === "L":
        dir = (dir + 360 - val) % 360;
        break;
      case op === "R":
        dir = (dir + val) % 360;
        break;
    }
    // console.log(">", op, val, "-->", { x, y, dir });
  });

  const answer = Math.abs(x) + Math.abs(y);

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer);
  return answer;
}

async function main() {
  const route = await readInput();
  // route.forEach((it) => {
  //   console.log(JSON.stringify(it));
  // });
  await part01(route);
  await part02(route);
}

main();
