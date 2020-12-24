import * as fs from "fs/promises";
import * as path from "path";

// Map of <color> contained by Set<color>
type Containments = Map<string, Map<string, number>>;

function stringSplitWithTail(input: string, partCount: number): string[] {
  const words = input.split(" ");
  return [...words.slice(0, partCount - 1), words.slice(partCount - 1).join(" ")];
}

function parseLine(
  line: string,
  containmentCallback: (container: string, contained: string, n: number) => void
) {
  // line structure:
  // <colorA.1> SP <colorA.2> SP 'bags' SP 'contain'
  //     N <colorB.1> SP <colorB.2> SP ('bag'|'bags')
  //     [ ',' SP N <colorB.1> SP <colorB.2> SP ('bag'|'bags') ]* '.'
  const [container1, container2, , , containedAll] = stringSplitWithTail(line, 5);
  const containerColor = container1 + " " + container2;

  if (containedAll == "no other bags") {
    return;
  }

  containedAll
    .split(", ")
    .map((containedPart) => {
      if (containedPart == "no other bags.") {
        return { color: "", n: 0 };
      }
      const [nStr, containedColor1, containedColor2] = containedPart.split(" ", 4);
      const containedColor = containedColor1 + " " + containedColor2;
      return { color: containedColor, n: parseInt(nStr, 10) };
    })
    .filter((it) => it.n)
    .forEach((contained) => containmentCallback(containerColor, contained.color, contained.n));
}

async function readInput(): Promise<{ containments: Containments; revContainments: Containments }> {
  const inputPath = path.resolve(__dirname, "input.dat");
  const fileContents = await fs.readFile(inputPath, { encoding: "utf-8" });

  // containments: contaier => contained
  const containments: Containments = new Map();
  // revContainments: contained => containers
  const revContainments: Containments = new Map();

  fileContents
    .split("\n")
    .filter((it) => it)
    .forEach((line) =>
      parseLine(line, (container: string, contained: string, n: number) => {
        const revContainers = revContainments.get(contained) ?? new Map();
        revContainers.set(container, 0); // number is not relevant for rev containment
        if (revContainers.size == 1) {
          revContainments.set(contained, revContainers);
        }

        const containds = containments.get(container) ?? new Map();
        containds.set(contained, n);
        if (containds.size == 1) {
          containments.set(container, containds);
        }
      })
    );

  return { containments, revContainments };
}

const EMPTY_MAP = new Map();

function getUniqueContainers(
  contained: string,
  containments: Containments,
  alreadyFound: string[] = []
): string[] {
  const newContainers = [...(containments.get(contained) ?? EMPTY_MAP).keys()].filter(
    (it) => !alreadyFound.includes(it)
  );

  const nextGenAlreadyFound = [...alreadyFound, ...newContainers];

  return [
    ...new Set([
      ...newContainers,
      ...newContainers.flatMap((newContained) =>
        getUniqueContainers(newContained, containments, nextGenAlreadyFound)
      ),
    ]),
  ];
}

async function part01(revContainments: Containments) {
  const outputPath = path.resolve(__dirname, "output.part01.dat");
  const totalUniqueContainer = getUniqueContainers("shiny gold", revContainments);

  await fs.writeFile(outputPath, totalUniqueContainer.length.toString(), "utf-8");
  console.log("Part 01:", totalUniqueContainer.length);
}

function getContainedCount(container: string, containments: Containments): number {
  const contained = containments.get(container);
  if (!contained) {
    return 0;
  }

  return [...contained.entries()].reduce((acc, [contained, n]) => {
    return acc + n * (1 + getContainedCount(contained, containments));
  }, 0);
}

async function part02(containments: Containments) {
  const outputPath = path.resolve(__dirname, "output.part02.dat");
  const totalContainedCount = getContainedCount("shiny gold", containments);

  await fs.writeFile(outputPath, totalContainedCount.toString(), "utf-8");
  console.log("Part 02:", totalContainedCount);
}

async function main() {
  const { containments, revContainments } = await readInput();
  // [...revContainments.entries()].forEach(([contained, containers], idx) => {
  //   console.log(`< ${idx}:`, contained, "contained by", [...containers.keys()]);
  // });
  // [...containments.entries()].forEach(([container, containeds], idx) => {
  //   console.log(`> ${idx}:`, container, "contains", [...containeds]);
  // });

  await part01(revContainments);
  await part02(containments);
}

main();
