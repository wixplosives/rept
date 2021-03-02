const { execSync } = require("child_process");
const {
  rmSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} = require("fs");
const { tmpdir } = require("os");
const { join } = require("path");

const rmOpts = { force: true, recursive: true };

function repoTpl({
  repo,
  outDir,
  internalPath = "",
  branch = "",
  tpl = (_) => _,
  filter = () => true,
}) {
  const tmpPath = mkdtempSync(join(tmpdir(), "tmp-git-"));
  if (existsSync(outDir)) {
    console.error(`Destination ${outDir} already exist. Operation aborted!`);
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
    console.log("Processing files...");
    const onProcessFile = (sourceFilePath, destDir, filename) => {
      writeFileSync(
        join(destDir, tpl(filename, "filename")),
        tpl(readFileSync(sourceFilePath, "utf-8"), "content")
      );
    };
    processDirectorySync(
      join(tmpPath, internalPath),
      outDir,
      onProcessFile,
      filter
    );
  } catch (e) {
    console.error(e);
    if (existsSync(outDir)) {
      console.log("Remove destination...");
      rmSync(outDir, rmOpts);
    }
  } finally {
    console.log("Cleanup...");
    rmSync(tmpPath, rmOpts);
  }
  console.log("Done.");
}

function processDirectorySync(
  sourcePath,
  destinationPath,
  copyFileSync,
  filter
) {
  mkdirSync(destinationPath, { recursive: true });
  for (const item of readdirSync(sourcePath, { withFileTypes: true })) {
    if (!filter(sourcePath, item.name)) {
      continue;
    }
    const sourceItemPath = join(sourcePath, item.name);
    if (item.isFile()) {
      copyFileSync(sourceItemPath, destinationPath, item.name);
    } else if (item.isDirectory()) {
      processDirectorySync(
        sourceItemPath,
        join(destinationPath, item.name),
        copyFileSync,
        filter
      );
    }
  }
}

exports.repoTpl = repoTpl;
exports.processDirectorySync = processDirectorySync;
