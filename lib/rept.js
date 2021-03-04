const { execSync } = require("child_process");
const {
  rmSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
} = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");
const { isText } = require("istextorbinary");
const { compile } = require("handlebars");
const prompt = require("prompt");

const rmOpts = { force: true, recursive: true };
const tpl = (text, data) => compile(text)(data);

async function repoTpl({
  repo,
  destination,
  subDir = "",
  branch = "",
  reptFile = true,
}) {
  const tmpPath = mkdtempSync(join(tmpdir(), "tmp-git-"));
  if (existsSync(destination)) {
    console.error(
      `Destination ${destination} already exist. Operation aborted!`
    );
    return;
  }
  console.log(`Downloading ${repo}${branch ? ` ${branch}` : ``}`);
  try {
    execSync(
      `git clone --depth=1${
        branch ? ` --branch=${branch}` : ``
      } ${repo} ${tmpPath}`,
      {
        shell: true,
        stdio: "ignore",
      }
    );

    const subDirPath = join(tmpPath, subDir);
    const { userInput, filter } = await getTemplateConfig(subDirPath, reptFile);

    console.log("Processing files...");
    processDirectorySync(
      subDirPath,
      destination,
      (sourceDir, destDir, filename) => {
        const sourceFilePath = join(sourceDir, filename);
        const destFilePath = join(destDir, tpl(filename, userInput));
        if (isText(filename)) {
          writeFileSync(
            destFilePath,
            tpl(readFileSync(sourceFilePath, "utf-8"), userInput)
          );
        } else {
          copyFileSync(sourceFilePath, destFilePath);
        }
      },
      filter
    );
  } catch (e) {
    console.error(e);
    if (existsSync(destination)) {
      console.log("Remove destination...");
      rmSync(destination, rmOpts);
    }
  } finally {
    console.log("Cleanup...");
    rmSync(tmpPath, rmOpts);
  }
  console.log("Done.");
}

async function getTemplateConfig(subDir, reptFile) {
  const promptConfigPath = join(subDir, "rept.config.js");
  if (reptFile && existsSync(promptConfigPath)) {
    const { schema, filter = () => true } = require(promptConfigPath);
    let userInput = {};
    if (schema) {
      console.log("Get template params...");
      prompt.start();
      userInput = await prompt.get(schema);
    }
    return {
      userInput,
      filter,
    };
  }
  return {
    userInput: {},
    filter: () => true,
  };
}

function processDirectorySync(
  sourcePath,
  destinationPath,
  copyFileSync,
  filter
) {
  mkdirSync(destinationPath, { recursive: true });
  for (const item of readdirSync(sourcePath, { withFileTypes: true })) {
    if (!filter(sourcePath, item.name) || item.name === ".git") {
      continue;
    }
    if (item.isFile()) {
      copyFileSync(sourcePath, destinationPath, item.name);
    } else if (item.isDirectory()) {
      processDirectorySync(
        join(sourcePath, item.name),
        join(destinationPath, item.name),
        copyFileSync,
        filter
      );
    }
  }
}

exports.repoTpl = repoTpl;
exports.processDirectorySync = processDirectorySync;
