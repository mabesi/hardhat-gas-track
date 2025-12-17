import { extendConfig } from "hardhat/config";
import { HardhatConfig, HardhatUserConfig } from "hardhat/types";
import path from "path";

// Import types and tasks
import "./type-extensions";
import "./tasks/snapshot";
import "./tasks/track";

extendConfig(
    (config: HardhatConfig, userConfig: Readonly<HardhatUserConfig>) => {
        const defaultConfig = {
            threshold: 5.0,
            strict: false,
            outputFile: "proposals-gas-report.md",
            exclude: []
        };

        config.gasTrack = {
            ...defaultConfig,
            ...userConfig.gasTrack
        };
    }
);
