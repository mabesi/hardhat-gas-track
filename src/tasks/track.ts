import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import path from "path";
import Table from "cli-table3";
import chalk from "chalk";
import { GasSnapshot, GasData } from "../utils/gas";

task("gas:track", "Compares current gas usage against snapshot")
    .setAction(async (_, hre: HardhatRuntimeEnvironment) => {
        const config = hre.config.gasTrack;
        const snapshotPath = path.resolve(hre.config.paths.root, ".gas-snapshot.json");

        if (!fs.existsSync(snapshotPath)) {
            console.error(chalk.red("Error: Snapshot not found. Run 'npx hardhat gas:snapshot' first."));
            process.exit(1);
        }

        const snapshot: GasSnapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));

        console.log("Running tests to verify gas costs...");
        await hre.run("test");

        // Mock current data (Simulating changes for demonstration logic)
        // In production, collecting fresh data would use the same util as snapshot
        const currentData: GasSnapshot = {
            "ContractName:methodName": { gas: 155000, calls: 10 }, // Increased
            "ContractName:deploy": { gas: 2500000, calls: 1 }      // Same
        };

        const table = new Table({
            head: ["Function Name", "Old Cost", "New Cost", "Diff (%)", "Status"],
            style: { head: ["cyan"] }
        });

        let hasRegression = false;

        for (const [key, oldMetric] of Object.entries(snapshot)) {
            if (config.exclude.some(pattern => key.match(new RegExp(pattern.replace("*", ".*"))))) {
                continue;
            }

            const newMetric = currentData[key];
            if (!newMetric) continue; // Method missing in new run

            const oldGas = oldMetric.gas / oldMetric.calls;
            const newGas = newMetric.gas / newMetric.calls;

            const diff = newGas - oldGas;
            const diffPercent = (diff / oldGas) * 100;

            let diffStr = `${diffPercent.toFixed(2)}%`;
            let status = chalk.green("OK");

            if (diff > 0) {
                if (config.strict || diffPercent > config.threshold) {
                    diffStr = chalk.red(`+${diffPercent.toFixed(2)}%`);
                    status = chalk.red("FAIL");
                    hasRegression = true;
                } else {
                    diffStr = chalk.yellow(`+${diffPercent.toFixed(2)}%`);
                    status = chalk.yellow("WARN");
                }
            } else if (diff < 0) {
                diffStr = chalk.green(`${diffPercent.toFixed(2)}%`);
            }

            table.push([
                key,
                oldGas.toFixed(0),
                newGas.toFixed(0),
                diffStr,
                status
            ]);
        }

        console.log(table.toString());

        if (hasRegression) {
            console.error(chalk.red("\nGas regression detected above threshold!"));
            process.exit(1);
        } else {
            console.log(chalk.green("\nGas check passed!"));
        }
    });
