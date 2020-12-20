import * as fs from "fs/promises";
import * as path from "path";

const TARGET_SUM = 2020;

async function part01(inputs: number[]) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");

  const inputCount = inputs.length;
  for (let i = 0; i < inputCount - 1; i++) {
    const inputI = inputs[i];
    for (let j = i + 1; j < inputCount; j++) {
      const inputJ = inputs[j];
      if (inputI + inputJ === TARGET_SUM) {
        await fs.writeFile(outputPath, (inputI * inputJ).toString(), "utf-8");
        console.log("Part 01:", inputI, inputJ, inputI * inputJ);
        return;
      }
    }
  }
}

async function part02(inputs: number[]) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");

  const inputCount = inputs.length;
  for (let i = 0; i < inputCount - 2; i++) {
    const inputI = inputs[i];
    for (let j = i + 1; j < inputCount - 1; j++) {
      const inputJ = inputs[j];
      for (let k = j + 1; k < inputCount; k++) {
        const inputK = inputs[k];
        if (inputI + inputJ + inputK === TARGET_SUM) {
          await fs.writeFile(outputPath, (inputI * inputJ * inputK).toString(), "utf-8");
          console.log("Part 02:", inputI, inputJ, inputK, inputI * inputJ * inputK);
          return;
        }
      }
    }
  }
}

async function main() {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });
  const lines = fileContents.split("\n");
  console.log("lines:", lines.length);

  const inputs = lines.map((it) => parseInt(it));
  await part01(inputs);
  await part02(inputs);
}

main();
