import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import path from "path";

task("gas:snapshot", "Creates a baseline of gas costs")
    .setAction(async (_, hre: HardhatRuntimeEnvironment) => {
        console.log("Running tests to generate gas snapshot...");

        // We rely on hardhat-gas-reporter to run and generate the JSON
        await hre.run("test");

        try {
            const { loadGasReporterOutput } = await import("../utils/gas");
            const snapshotData = loadGasReporterOutput(hre);

            const outputPath = path.resolve(hre.config.paths.root, ".gas-snapshot.json");
            fs.writeFileSync(outputPath, JSON.stringify(snapshotData, null, 2));

            console.log(`Snapshot saved to ${outputPath}`);
        } catch (error: any) {
            console.error("Failed to generate snapshot:", error.message);
            process.exit(1);
        }
    });
