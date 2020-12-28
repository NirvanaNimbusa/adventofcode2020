import * as fs from "fs/promises";
import * as path from "path";

enum OpType {
  MASK,
  SET,
}

interface OpMask {
  type: OpType.MASK;
  value: FullMask;
}

interface OpSet {
  type: OpType.SET;
  register: number;
  value: number;
}

type Op = OpMask | OpSet;

type Program = Op[];

interface FullMask {
  high: PartMask;
  mid: PartMask;
  low: PartMask;
}

interface PartMask {
  // number that has bits `1` that need to be set to `1`; use with `|`
  ones: number;
  // number that has bits `1` that DO NOT need to be set to `0`; use with `&`
  zeros: number;
  // number that has bits `1` that need to be kept; use with `&`
  keeps: number;
}

const PART_BITS = 12;
const PART_MODULO = 2 ** 12;
const HIGH_PART_DIVIDER = PART_MODULO ** 2;
const MID_PART_DIVIDER = PART_MODULO ** 1;
const LOW_PART_DIVIDER = 1;

function parsePartMask(input: string): PartMask {
  let ones = 0;
  let zeros = 0;
  let keeps = 0;
  for (let i = 0, bitValue = 1; i < PART_BITS; i += 1, bitValue <<= 1) {
    const bitStr = input.slice(-i - 1, -i || undefined);
    if (bitStr === "1") {
      ones += bitValue;
    }
    if (bitStr === "X") {
      keeps += bitValue;
    }
    if (bitStr !== "0") {
      zeros += bitValue;
    }
    // console.log(bitStr, -i - 1, -i, { ones: ones.toString(2), zeros: zeros.toString(2) });
  }
  return { ones, zeros, keeps };
}

function parseMask(input: string): FullMask {
  const highLongInputStr = input.slice(0, PART_BITS);
  const midLongInputStr = input.slice(PART_BITS, 2 * PART_BITS);
  const lowLongInputStr = input.slice(-PART_BITS);
  return {
    high: parsePartMask(highLongInputStr),
    mid: parsePartMask(midLongInputStr),
    low: parsePartMask(lowLongInputStr),
  };
}

async function readInput(): Promise<Program> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const memRegistryRE = /^mem\[(\d+)\]$/;

  const ops: Program = fileContents
    .split("\n")
    .filter((it) => it)
    .map((it) => it.split(" "))
    .map(([opTypeStr, , value]) => {
      if (opTypeStr === "mask") {
        return { type: OpType.MASK, value: parseMask(value) };
      }
      const found = opTypeStr.match(memRegistryRE);
      if (!found) {
        throw new Error(`Invalid operator? '${opTypeStr}' (value '${value}')`);
      }
      // console.log("found:", found);
      return {
        type: OpType.SET,
        register: parseInt(found[1]),
        value: parseInt(value),
      };
    });

  return ops;
}

function partBits(part: number): string {
  return part.toString(2).padStart(PART_BITS, "0");
}

function fullBits(hi: number, mid: number, lo: number): string {
  return partBits(hi) + "_" + partBits(mid) + "_" + partBits(lo);
}

function printMask(m: FullMask) {
  console.log("1", fullBits(m.high.ones, m.mid.ones, m.low.ones));
  console.log("0", fullBits(m.high.zeros, m.mid.zeros, m.low.zeros));
  console.log("K", fullBits(m.high.keeps, m.mid.keeps, m.low.keeps));
}

interface Registry {
  high: number;
  mid: number;
  low: number;
}

async function part01(program: Program) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const registries = new Map<number, Registry>();

  let currentMask: FullMask = {
    high: { ones: 0, zeros: 0, keeps: 0 },
    mid: { ones: 0, zeros: 0, keeps: 0 },
    low: { ones: 0, zeros: 0, keeps: 0 },
  };

  program.forEach((op) => {
    if (op.type === OpType.MASK) {
      currentMask = op.value;
      // console.log("set mask", currentMask);
      return;
    }
    if (op.type === OpType.SET) {
      // printMask(currentMask);
      // console.log("!", op.value, op.value.toString(2));
      const highPartValue = Math.floor(op.value / HIGH_PART_DIVIDER) % PART_MODULO;
      const midPartValue = Math.floor(op.value / MID_PART_DIVIDER) % PART_MODULO;
      const lowPartValue = Math.floor(op.value / LOW_PART_DIVIDER) % PART_MODULO;
      // console.log("V", fullBits(highPartValue, midPartValue, lowPartValue));
      const highPartNext = (highPartValue & currentMask.high.zeros) | currentMask.high.ones;
      const midPartNext = (midPartValue & currentMask.mid.zeros) | currentMask.mid.ones;
      const lowPartNext = (lowPartValue & currentMask.low.zeros) | currentMask.low.ones;
      // console.log(">", fullBits(highPartNext, midPartNext, lowPartNext));
      // console.log(" ", `L:${partBits(lowPartValue)}`);
      // console.log(" ", `0:${partBits(currentMask.low.zeros)}`);
      // console.log(" ", `1:${partBits(currentMask.low.ones)}`);
      // console.log(" ", `=:${partBits(lowPartNext)}`);
      const next = { high: highPartNext, mid: midPartNext, low: lowPartNext };
      registries.set(op.register, next);
      // console.log("set", op.register, next);
      return;
    }
  });

  const answer = [...registries.values()].reduce(
    (acc, cur) => acc + (cur.high * HIGH_PART_DIVIDER + cur.mid * MID_PART_DIVIDER + cur.low),
    0
  );

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer);
  return answer;
}

async function main() {
  const program = await readInput();
  // program.forEach((op, idx) => console.log(">", idx, ":", op));

  await part01(program);
  // await part02(busLines);
}

main();
