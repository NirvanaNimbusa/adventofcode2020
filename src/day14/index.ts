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
  // list of bits that float
  floats: number[];
}

const PART_BITS = 12;
const PART_MODULO = 2 ** 12;
const HIGH_PART_DIVIDER = PART_MODULO ** 2;
const MID_PART_DIVIDER = PART_MODULO ** 1;
const LOW_PART_DIVIDER = 1;

function parsePartMask(input: string): PartMask {
  let ones = 0;
  let zeros = 0;
  const floats: number[] = [];
  for (let i = 0, bitValue = 1; i < PART_BITS; i += 1, bitValue <<= 1) {
    const bitStr = input.slice(-i - 1, -i || undefined);
    if (bitStr === "1") {
      ones += bitValue;
    }
    if (bitStr !== "0") {
      zeros += bitValue;
    }
    if (bitStr === "X") {
      floats.push(bitValue);
    }
    // console.log(bitStr, -i - 1, -i, { ones: ones.toString(2), zeros: zeros.toString(2) });
  }
  return { ones, zeros, floats };
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
  console.log("F", m.high.floats, m.mid.floats, m.low.floats);
}

interface Register {
  high: number;
  mid: number;
  low: number;
}

const valueToParts = (value: number): Register => ({
  high: Math.floor(value / HIGH_PART_DIVIDER) % PART_MODULO,
  mid: Math.floor(value / MID_PART_DIVIDER) % PART_MODULO,
  low: Math.floor(value / LOW_PART_DIVIDER) % PART_MODULO,
});

const partsToValue = (parts: Register): number =>
  parts.high * HIGH_PART_DIVIDER + parts.mid * MID_PART_DIVIDER + parts.low;

const maskPartValue = (partValue: Register, mask: FullMask): Register => ({
  high: (partValue.high & mask.high.zeros) | mask.high.ones,
  mid: (partValue.mid & mask.mid.zeros) | mask.mid.ones,
  low: (partValue.low & mask.low.zeros) | mask.low.ones,
});

async function part01(program: Program) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const registries = new Map<number, Register>();

  let currentMask: FullMask = {
    high: { ones: 0, zeros: 0, floats: [] },
    mid: { ones: 0, zeros: 0, floats: [] },
    low: { ones: 0, zeros: 0, floats: [] },
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
      const partValue = valueToParts(op.value);
      // console.log("V", fullBits(partValue.high, partValue.mid, partValue.low));
      const partNext = maskPartValue(partValue, currentMask);
      // console.log(">", fullBits(partNext.high, partNext.mid, partNext.low));
      // console.log(" ", `L:${partBits(lowPartValue)}`);
      // console.log(" ", `0:${partBits(currentMask.low.zeros)}`);
      // console.log(" ", `1:${partBits(currentMask.low.ones)}`);
      // console.log(" ", `=:${partBits(partNext.low)}`);
      registries.set(op.register, partNext);
      // console.log("set", op.register, next);
      return;
    }
  });

  const answer = [...registries.values()].reduce((acc, cur) => acc + partsToValue(cur), 0);

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 01:", answer);
  return answer;
}

async function part02(program: Program) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  const registries = new Map<number, Register>();

  let currentMask: FullMask = {
    high: { ones: 0, zeros: 0, floats: [] },
    mid: { ones: 0, zeros: 0, floats: [] },
    low: { ones: 0, zeros: 0, floats: [] },
  };

  const expandRegisterFloats = (
    reg: Register,
    high: number[],
    mid: number[],
    low: number[]
  ): Register[] => {
    // console.log("expanding", partBits(reg.low), low.map(partBits));
    if (high.length) {
      const [floatBitValue, ...newFloats] = high;
      const oneFloat = reg.high | floatBitValue;
      const zeroFloat = reg.high & floatBitValue ? reg.high - floatBitValue : reg.high;
      return [
        ...expandRegisterFloats({ ...reg, high: oneFloat }, newFloats, mid, low),
        ...expandRegisterFloats({ ...reg, high: zeroFloat }, newFloats, mid, low),
      ];
    }
    if (mid.length) {
      const [floatBitValue, ...newFloats] = mid;
      const oneFloat = reg.mid | floatBitValue;
      const zeroFloat = reg.mid & floatBitValue ? reg.mid - floatBitValue : reg.mid;
      return [
        ...expandRegisterFloats({ ...reg, mid: oneFloat }, high, newFloats, low),
        ...expandRegisterFloats({ ...reg, mid: zeroFloat }, high, newFloats, low),
      ];
    }
    if (low.length) {
      const [floatBitValue, ...newFloats] = low;
      const oneFloat = reg.low | floatBitValue;
      const zeroFloat = reg.low & floatBitValue ? reg.low - floatBitValue : reg.low;
      return [
        ...expandRegisterFloats({ ...reg, low: oneFloat }, high, mid, newFloats),
        ...expandRegisterFloats({ ...reg, low: zeroFloat }, high, mid, newFloats),
      ];
    }
    return [reg];
  };

  program.forEach((op) => {
    if (op.type === OpType.MASK) {
      currentMask = op.value;
      // console.log("set mask", currentMask);
      return;
    }
    if (op.type === OpType.SET) {
      const partsValue = valueToParts(op.value);
      const partsReg = valueToParts(op.register);
      const maskedReg = {
        high: partsReg.high | currentMask.high.ones,
        mid: partsReg.mid | currentMask.mid.ones,
        low: partsReg.low | currentMask.low.ones,
      };
      // console.log("R", partBits(partsReg.low), partBits(maskedReg.low));
      // console.log("M", partBits(currentMask.low.ones), partBits(currentMask.low.zeros));
      const registriesToSet = expandRegisterFloats(
        maskedReg,
        currentMask.high.floats,
        currentMask.mid.floats,
        currentMask.low.floats
      );
      // console.log("LF:", currentMask.low.floats);
      // console.log(
      //   ">>",
      //   registriesToSet.map((it) => partBits(it.low))
      // );
      registriesToSet.forEach((register) => registries.set(partsToValue(register), partsValue));
      return;
    }
  });

  const answer = [...registries.values()].reduce((acc, cur) => acc + partsToValue(cur), 0);

  await fs.writeFile(outputPath, answer.toString(), "utf-8");
  console.log("Part 02:", answer);
  return answer;
}

async function main() {
  const program = await readInput();
  // program.forEach((op, idx) => console.log(">", idx, ":", op));

  // await part01(program);
  await part02(program);
}

main();
