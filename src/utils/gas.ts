import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import path from "path";
import chalk from "chalk";

export interface GasData {
    gas: number;
    calls: number;
}

export interface GasSnapshot {
    [key: string]: GasData;
}

export interface GasReporterOutput {
    info: {
        methods: {
            [key: string]: {
                gasData: number[];
                numberOfCalls: number;
            };
        };
        deployments: {
            [key: string]: {
                gasData: number[];
            };
        };
    };
}

export const loadGasReporterOutput = (hre: HardhatRuntimeEnvironment): GasSnapshot => {
    // Try to find the gas reporter config
    const reporterConfig = (hre.config as any).gasReporter;

    if (!reporterConfig) {
        throw new Error("hardhat-gas-reporter configuration not found in hardhat.config.ts");
    }

    // We expect the user to have configured an output file
    // If they haven't specific one in config, we can't guess where it is easily without enforcing it.
    // Common convention or requiring it:
    const potentialFiles = [
        reporterConfig.outputFile,
        "gas-report.json",
        "gasReporterOutput.json"
    ].filter(f => !!f);

    let foundPath = "";
    for (const file of potentialFiles) {
        const absPath = path.resolve(hre.config.paths.root, file);
        if (fs.existsSync(absPath)) {
            foundPath = absPath;
            break;
        }
    }

    if (!foundPath) {
        console.error(chalk.red("\n❌ Error: Could not find gas reporter output file."));
        console.log(chalk.yellow("\nPlease ensure 'hardhat-gas-reporter' is installed and configured to output JSON:"));
        console.log(chalk.cyan(`
      // hardhat.config.ts
      gasReporter: {
        enabled: true,
        outputJSON: true,
        outputFile: "gas-report.json"
      }
    `));
        throw new Error("Missing gas reporter output");
    }

    const rawData = fs.readFileSync(foundPath, "utf8");
    // hardhat-gas-reporter output varies by version, but often it's a flat structure or nested info.
    // For the sake of robustness without a specific sample of their version, 
    // we'll try to parse a generic structure or assume standard 'info' block if present.

    let json: any;
    try {
        json = JSON.parse(rawData);
    } catch (e) {
        throw new Error(`Invalid JSON in ${foundPath}`);
    }

    const snapshot: GasSnapshot = {};

    // Heuristic parser for standard hardhat-gas-reporter JSON output
    // Specify format: keys are often "Contract:Method" or embedded in objects

    // Logic: Iterate keys (Contract names)
    if (json.info && json.info.methods) {
        for (const [signature, data] of Object.entries(json.info.methods as Record<string, any>)) {
            // data.gasData is array of numbers
            const totalGas = (data.gasData as number[]).reduce((a, b) => a + b, 0);
            const calls = data.numberOfCalls || data.gasData.length;
            snapshot[signature] = { gas: totalGas, calls };
        }
        for (const [name, data] of Object.entries(json.info.deployments as Record<string, any>)) {
            const totalGas = (data.gasData as number[]).reduce((a, b) => a + b, 0);
            const calls = data.gasData.length;
            snapshot[`${name}:deploy`] = { gas: totalGas, calls };
        }
    } else {
        // Fallback or simplified format if the user is using a different reporter version?
        // Just returning empty for safety if structure unknown, but warning
        console.warn(chalk.yellow("Warning: Unknown JSON structure in gas report. Returning empty."));
    }

    return snapshot;
};
