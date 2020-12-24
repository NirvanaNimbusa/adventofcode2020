import * as fs from "fs/promises";
import * as path from "path";

const passportFields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid", "cid"];
type PassPortFieldKey = "byr" | "iyr" | "eyr" | "hgt" | "hcl" | "ecl" | "pid" | "cid";

const fieldValidity: Record<PassPortFieldKey, RegExp> = {
  byr: RegExp("^((19[2-9]\\d)|(200[0-2]))$"),
  iyr: RegExp("^((201\\d)|2020)$"),
  eyr: RegExp("^((202\\d)|2030)$"),
  hgt: RegExp("^((((1[5-8]\\d)|(19[0-3]))cm)|((59|6\\d|7[0-6])in))$"),
  hcl: RegExp("^#[0-9a-f]{6}$"),
  ecl: RegExp("^(amb|blu|brn|gry|grn|hzl|oth)$"),
  pid: RegExp("^\\d{9}$"),
  cid: RegExp(".*"),
};

type Passport = Partial<Record<PassPortFieldKey, string>>;

const passportCountainsEnoughFields = (passport: Passport) =>
  passportFields.every((fieldName) => fieldName in passport || fieldName === "cid");

const isValid = (passport: Passport) =>
  Object.entries(passport).every(([key, value]) => {
    const result = value ? fieldValidity[key as PassPortFieldKey].test(value) : false;
    // console.log("kv", key, value, result);
    return result;
  });

const hasFields = (passport: Passport) => {
  for (const key in passport) {
    return true;
  }
  return false;
};

async function readInput(): Promise<Passport[]> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });
  const passports: Passport[] = [];
  let currentPassport: Passport = {};
  const spacesRe = / +/;

  fileContents.split("\n").forEach((line) => {
    if (line.length) {
      line.split(spacesRe).forEach((field) => {
        const [key, value] = field.split(":", 2);
        currentPassport[key as PassPortFieldKey] = value;
      });
    } else {
      if (hasFields(currentPassport)) {
        passports.push(currentPassport);
      }
      currentPassport = {};
    }
  });
  if (hasFields(currentPassport)) {
    passports.push(currentPassport);
  }
  return passports;
}

async function part01(passports: Passport[]) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const validCount = passports.filter(passportCountainsEnoughFields).length;
  await fs.writeFile(outputPath, validCount.toString(), "utf-8");
  console.log("Part 01:", validCount);
}

async function part02(passports: Passport[]) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  const validCount = passports.filter(passportCountainsEnoughFields).filter(isValid).length;
  console.log(
    "?0",
    passports[0],
    passportCountainsEnoughFields(passports[0]),
    isValid(passports[0])
  );

  await fs.writeFile(outputPath, validCount.toString(), "utf-8");
  console.log("Part 02:", validCount);
}

// async function part02(forest: Forest) {
//   const outputPath = path.resolve(__dirname, "output.part02.dat");

//   const product =
//     getSlopeTreeCount(forest, 1, 1) *
//     getSlopeTreeCount(forest, 1, 3) *
//     getSlopeTreeCount(forest, 1, 5) *
//     getSlopeTreeCount(forest, 1, 7) *
//     getSlopeTreeCount(forest, 2, 1);
//   await fs.writeFile(outputPath, product.toString(), "utf-8");
//   console.log("Part 02:", product);
// }

async function main() {
  const passports = await readInput();

  await part01(passports);
  await part02(passports);
}

main();
