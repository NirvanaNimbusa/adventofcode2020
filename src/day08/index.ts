import * as fs from "fs/promises";
import * as path from "path";

enum Operation {
  ACC = "acc",
  JMP = "jmp",
  NOP = "nop",
}
const OPERATION_TO_ENUM: Record<string, Operation> = {
  acc: Operation.ACC,
  jmp: Operation.JMP,
  nop: Operation.NOP,
};

interface Instruction {
  operation: Operation;
  operand: number;
}

type Program = Instruction[];

const cloneInstruction = (instruction: Instruction): Instruction => ({
  ...instruction,
});

const cloneProgram = (program: Program): Program => program.map(cloneInstruction);

async function readInput(): Promise<Program> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  const program: Program = fileContents
    .split("\n")
    .filter((it) => it)
    .map((line) => {
      const [operationStr, operandStr] = line.split(" ");
      return {
        operation: OPERATION_TO_ENUM[operationStr],
        operand: parseInt(operandStr, 10),
      };
    });

  return program;
}

function executeProgram(program: Program): { finishes: boolean; accumulator: number } {
  const visitedInstructions = new Set<number>();
  let accumulator = 0;
  let instructionPointer = 0;

  const programLength = program.length;

  // console.log("\nEXECUTION:");
  while (!visitedInstructions.has(instructionPointer)) {
    visitedInstructions.add(instructionPointer);
    const instruction = program[instructionPointer];
    // console.log(instructionPointer, ">", instruction.operation, instruction.operand);

    switch (instruction.operation) {
      case Operation.NOP:
        instructionPointer += 1;
        break;
      case Operation.ACC:
        accumulator += instruction.operand;
        instructionPointer += 1;
        break;
      case Operation.JMP:
        instructionPointer = instructionPointer + instruction.operand;
        break;
    }

    if (instructionPointer < 0) {
      console.log("IP negative");
      return { finishes: false, accumulator };
    }
    if (instructionPointer === programLength) {
      return { finishes: true, accumulator };
    }
    if (instructionPointer > programLength) {
      console.log("IP overflow");
      return { finishes: false, accumulator };
    }
  }

  return { finishes: false, accumulator };
}

async function part01(program: Program) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const { accumulator } = executeProgram(program);

  await fs.writeFile(outputPath, accumulator.toString(), "utf-8");
  console.log("Part 01:", accumulator);
}

async function part02(program: Program) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  let foundAnswer = false;
  let finalAccumulator = 0;

  const programLength = program.length;
  for (let i = 0; i < programLength; i += 1) {
    const currentOperation = program[i].operation;
    if (currentOperation == Operation.ACC) {
      console.log("ITERATION", i, currentOperation, "---");
      continue;
    }
    const patchedProgram = cloneProgram(program);
    const patchedOp = (patchedProgram[i].operation =
      currentOperation == Operation.NOP ? Operation.JMP : Operation.NOP);
    console.log("ITERATION", i, currentOperation, patchedOp);

    const { finishes, accumulator } = executeProgram(patchedProgram);

    if (finishes) {
      console.log(`Winner, winner, chicken dinner: flipping instruction '${i}' does the job!`);
      finalAccumulator = accumulator;
      foundAnswer = true;
      break;
    }
  }

  if (!foundAnswer) {
    console.log("Part 02: found NO ANSWER");
    return;
  }

  await fs.writeFile(outputPath, finalAccumulator.toString(), "utf-8");
  console.log("Part 02:", finalAccumulator);
}

async function main() {
  const program = await readInput();
  // console.log("PROGRAM:");
  // program.forEach((instruction, idx) => {
  //   console.log(idx, ">", instruction.operation, instruction.operand);
  // });

  await part01(program);
  await part02(program);
}

main();
