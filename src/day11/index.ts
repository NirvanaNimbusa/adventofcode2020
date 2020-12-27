import * as fs from "fs/promises";
import * as path from "path";

enum SeatType {
  FLOOR = 0,
  EMPTY,
  OCCUPIED,
}
const inputToSeatType = {
  ".": SeatType.FLOOR,
  L: SeatType.EMPTY,
  "#": SeatType.OCCUPIED,
};

const seatTypeToOutput = {
  [SeatType.FLOOR]: ".",
  [SeatType.EMPTY]: "L",
  [SeatType.OCCUPIED]: "#",
};

type Room = SeatType[][];

async function readInput(): Promise<Room> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const room = fileContents
    .split("\n")
    .filter((it) => it)
    .map((line) => {
      return line.split("").map((it) => {
        if (!(it in inputToSeatType)) {
          throw Error(`Invalid input? '${it}'`);
        }
        return inputToSeatType[it as keyof typeof inputToSeatType];
      });
    });

  return room;
}

function cloneRoom(room: Room): Room {
  return room.map((it) => [...it]);
}

function areIdentifical(roomA: Room, roomB: Room): boolean {
  if (roomA.length != roomB.length || roomA[0].length != roomB[0].length) {
    return false;
  }

  for (let i = 0; i < roomA.length; i += 1) {
    const roomARow = roomA[i];
    const roomBRow = roomB[i];
    for (let j = 0; j < roomARow.length; j += 1) {
      if (roomARow[j] != roomBRow[j]) {
        return false;
      }
    }
  }

  return true;
}

function printRoom(room: Room, nocRoom?: number[][]) {
  room.forEach((row, idx) => {
    console.log(
      row.map((it) => seatTypeToOutput[it]).join(""),
      nocRoom ? nocRoom[idx].join("") : " "
    );
  });
}

function occupiedCount(room: Room): number {
  return room.reduce(
    (acc, cur) => cur.reduce((accRow, it) => (it === SeatType.OCCUPIED ? 1 : 0) + accRow, acc),
    0
  );
}

function iterateRoomPart1(room: Room): [number[][], Room] {
  const nextRoom = cloneRoom(room);
  const rowCount = room.length;
  const columnCount = room[0].length;

  const getNeighboursOccupiedCount = (i: number, j: number): number => {
    const countBefore = j > 0;
    const countAfter = j < columnCount - 1;

    let occupiedCount = 0;
    i -= 1;
    if (i >= 0) {
      countBefore && room[i][j - 1] === SeatType.OCCUPIED && (occupiedCount += 1);
      room[i][j] === SeatType.OCCUPIED && (occupiedCount += 1);
      countAfter && room[i][j + 1] === SeatType.OCCUPIED && (occupiedCount += 1);
    }

    i += 1;
    countBefore && room[i][j - 1] === SeatType.OCCUPIED && (occupiedCount += 1);
    countAfter && room[i][j + 1] === SeatType.OCCUPIED && (occupiedCount += 1);

    i += 1;
    if (i < rowCount) {
      countBefore && room[i][j - 1] === SeatType.OCCUPIED && (occupiedCount += 1);
      room[i][j] === SeatType.OCCUPIED && (occupiedCount += 1);
      countAfter && room[i][j + 1] === SeatType.OCCUPIED && (occupiedCount += 1);
    }

    return occupiedCount;
  };
  const nocRoom: number[][] = room.map((row) => row.map(() => -1));

  for (let i = 0; i < rowCount; i += 1) {
    for (let j = 0; j < columnCount; j += 1) {
      const thisSeat = room[i][j];
      const neighboursOccupied = getNeighboursOccupiedCount(i, j);
      nocRoom[i][j] = neighboursOccupied;
      if (thisSeat === SeatType.EMPTY && neighboursOccupied == 0) {
        // nothing occupied? then set to OCCUPIED
        nextRoom[i][j] = SeatType.OCCUPIED;
      } else if (thisSeat === SeatType.OCCUPIED && neighboursOccupied >= 4) {
        // 4 occupied? then set to EMPTY
        nextRoom[i][j] = SeatType.EMPTY;
      }
    }
  }

  return [nextRoom, nocRoom];
}

async function part01(room: Room) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");

  let iteration = -1;
  let previousRoom = cloneRoom(room);
  let nextRoom = cloneRoom(room);
  let nocRoom: number[][] = [];
  // console.log(`START ===========`);
  // printRoom(room);
  do {
    iteration += 1;
    previousRoom = nextRoom;
    [nextRoom, nocRoom] = iterateRoomPart1(nextRoom);
    // console.log(`${iteration} ===========`);
    // printRoom(nextRoom, nocRoom);
  } while (iteration < 1_000_000 && !areIdentifical(previousRoom, nextRoom));

  const answer = occupiedCount(nextRoom);

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer, iteration);
  return answer;
}

function iterateRoomPart2(room: Room): [number[][], Room] {
  const nextRoom = cloneRoom(room);
  const rowCount = room.length;
  const columnCount = room[0].length;

  const dirs = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  const areInBounds = (i: number, j: number) => i >= 0 && j >= 0 && i < rowCount && j < columnCount;

  const getOccupiedVisibleCount = (i: number, j: number): number => {
    let occupiedCount = 0;

    dirs.forEach((dir) => {
      for (let i1 = i + dir[0], j1 = j + dir[1]; areInBounds(i1, j1); i1 += dir[0], j1 += dir[1]) {
        if (room[i1][j1] === SeatType.OCCUPIED) {
          occupiedCount += 1;
        }
        if (room[i1][j1] !== SeatType.FLOOR) {
          return;
        }
      }
    });

    return occupiedCount;
  };
  const nocRoom: number[][] = room.map((row) => row.map(() => -1));

  for (let i = 0; i < rowCount; i += 1) {
    for (let j = 0; j < columnCount; j += 1) {
      const thisSeat = room[i][j];
      const neighboursOccupied = getOccupiedVisibleCount(i, j);
      nocRoom[i][j] = neighboursOccupied;
      if (thisSeat === SeatType.EMPTY && neighboursOccupied == 0) {
        // nothing occupied? then set to OCCUPIED
        nextRoom[i][j] = SeatType.OCCUPIED;
      } else if (thisSeat === SeatType.OCCUPIED && neighboursOccupied >= 5) {
        // 5 occupied visible? then set to EMPTY
        nextRoom[i][j] = SeatType.EMPTY;
      }
    }
  }

  return [nextRoom, nocRoom];
}

async function part02(room: Room) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");

  let iteration = -1;
  let previousRoom = cloneRoom(room);
  let nextRoom = cloneRoom(room);
  let nocRoom: number[][] = [];
  // console.log(`START ===========`);
  // printRoom(room);
  do {
    iteration += 1;
    previousRoom = nextRoom;
    [nextRoom, nocRoom] = iterateRoomPart2(nextRoom);
    // console.log(`${iteration} ===========`);
    // printRoom(nextRoom, nocRoom);
  } while (iteration < 1_000_000 && !areIdentifical(previousRoom, nextRoom));

  const answer = occupiedCount(nextRoom);

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 02:", answer, iteration);
  return answer;
}

async function main() {
  const room = await readInput();
  await part01(room);
  await part02(room);
}

main();
