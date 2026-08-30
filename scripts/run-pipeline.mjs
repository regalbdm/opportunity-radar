import { spawn } from "child_process";

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [scriptPath],
      {
        stdio: "inherit",
        shell: false,
      }
    );

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `${scriptPath} exited with code ${code}`
          )
        );
      }
    });
  });
}

async function run() {
  console.log("");
  console.log("==========================");
  console.log("XEVEZA OPPORTUNITY RADAR");
  console.log("==========================");
  console.log("");

  console.log(
    "STEP 1: Collecting opportunities..."
  );

  await runScript(
    "./scripts/collect-arbeitnow.mjs"
  );

  console.log("");
  console.log(
    "STEP 2: AI enrichment..."
  );

  await runScript(
    "./scripts/enrich-deepseek.mjs"
  );

  console.log("");
  console.log("==========================");
  console.log("PIPELINE FINISHED");
  console.log("==========================");
}

run().catch((error) => {
  console.error("");
  console.error("PIPELINE FAILED");
  console.error(error.message);
  process.exit(1);
});