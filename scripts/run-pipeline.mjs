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

  console.log("STEP 1: Arbeitnow...");
  await runScript(
    "./scripts/collect-arbeitnow.mjs"
  );

  console.log("");
  console.log("STEP 2: Remotive...");
  await runScript(
    "./scripts/collect-remotive.mjs"
  );

  console.log("");
  console.log("STEP 3: Himalayas...");
  await runScript(
    "./scripts/collect-himalayas.mjs"
  );

  console.log("");
  console.log("STEP 4: Remote OK...");
  await runScript(
    "./scripts/collect-remoteok.mjs"
  );

  console.log("");
  console.log("STEP 5: DeepSeek enrichment...");
  await runScript(
    "./scripts/enrich-deepseek.mjs"
  );

  console.log("");
  console.log("STEP 6: Quality check...");
  await runScript(
    "./scripts/quality-check.mjs"
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