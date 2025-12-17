import "hardhat/types/config";
import "hardhat/types/runtime";

export interface GasTrackConfig {
    threshold: number;
    strict: boolean;
    outputFile?: string;
    exclude: string[];
}

export interface GasTrackUserConfig {
    threshold?: number;
    strict?: boolean;
    outputFile?: string;
    exclude?: string[];
}

declare module "hardhat/types/config" {
    export interface HardhatUserConfig {
        gasTrack?: GasTrackUserConfig;
    }

    export interface HardhatConfig {
        gasTrack: GasTrackConfig;
    }
}
