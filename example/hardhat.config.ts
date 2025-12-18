import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "hardhat-gas-track";
import { HardhatUserConfig } from "hardhat/config";

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            viaIR: true,
        },
    },
    networks: {
        hardhat: {
            chainId: 31337,
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
        gasPrice: 21,
        outputFile: process.env.REPORT_GAS ? "gas-report.txt" : undefined,
        noColors: process.env.REPORT_GAS !== undefined,
        coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    },
    gasTrack: {
        enabled: true,
        outputFile: "gas-track-report.json",
        trackMethods: true,
        trackDeployments: true,
        compareRuns: true,
    },
} as any;

export default config;
