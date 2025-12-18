import "hardhat/types/config";
import "hardhat/types/runtime";

export interface GasTrackConfig {
    enabled: boolean;
    threshold: number;
    strict: boolean;
    outputFile?: string;
    exclude: string[];
    trackMethods: boolean;
    trackDeployments: boolean;
    compareRuns: boolean;
}

export interface GasTrackUserConfig {
    enabled?: boolean;
    threshold?: number;
    strict?: boolean;
    outputFile?: string;
    exclude?: string[];
    trackMethods?: boolean;
    trackDeployments?: boolean;
    compareRuns?: boolean;
}

declare module "hardhat/types/config" {
    export interface HardhatUserConfig {
        gasTrack?: GasTrackUserConfig;
    }

    export interface HardhatConfig {
        gasTrack: GasTrackConfig;
    }
}
