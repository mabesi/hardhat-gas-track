import { expect } from "chai";
import { ethers } from "hardhat";
import { AuctionFactory, MockNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-toolbox/signers";

describe("AuctionFactory", function () {
    let factory: AuctionFactory;
    let nft: MockNFT;
    let seller: SignerWithAddress;
    let otherUser: SignerWithAddress;

    const STARTING_PRICE = ethers.parseEther("1");
    const RESERVE_PRICE = ethers.parseEther("0.5");
    const MIN_BID_INCREMENT = ethers.parseEther("0.1");
    const DURATION = 3600;
    const FEE_PERCENTAGE = 250;
    const AUTO_EXTEND_DURATION = 300;

    beforeEach(async function () {
        [seller, otherUser] = await ethers.getSigners();

        // Deploy factory
        const AuctionFactoryFactory = await ethers.getContractFactory("AuctionFactory");
        factory = await AuctionFactoryFactory.deploy();

        // Deploy NFT contract
        const MockNFTFactory = await ethers.getContractFactory("MockNFT");
        nft = await MockNFTFactory.deploy();
    });

    describe("English Auction Creation", function () {
        it("Should create English auction", async function () {
            // Mint and approve NFT
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const tx = await factory.connect(seller).createEnglishAuction(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            const receipt = await tx.wait();
            const event = receipt?.logs.find(
                (log: any) => log.fragment?.name === "EnglishAuctionCreated"
            );

            expect(event).to.not.be.undefined;
        });

        it("Should register auction in factory", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const tx = await factory.connect(seller).createEnglishAuction(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            const receipt = await tx.wait();

            // Get auction count
            const count = await factory.getAuctionCount();
            expect(count).to.equal(1);

            // Check user auctions
            const userAuctions = await factory.getUserAuctions(seller.address);
            expect(userAuctions.length).to.equal(1);
        });
    });

    describe("Dutch Auction Creation", function () {
        it("Should create Dutch auction", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const tx = await factory.connect(seller).createDutchAuction(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                RESERVE_PRICE,
                DURATION,
                FEE_PERCENTAGE
            );

            const receipt = await tx.wait();
            const event = receipt?.logs.find(
                (log: any) => log.fragment?.name === "DutchAuctionCreated"
            );

            expect(event).to.not.be.undefined;
        });
    });

    describe("Batch Creation", function () {
        it("Should batch create English auctions", async function () {
            // Mint multiple NFTs
            const tokenIds = await nft.connect(seller).batchMint(seller.address, 3);

            const nftAddress = await nft.getAddress();
            const nftContracts = [nftAddress, nftAddress, nftAddress];
            const tokenIdArray = [0, 1, 2];
            const startingPrices = [
                STARTING_PRICE,
                STARTING_PRICE,
                STARTING_PRICE
            ];

            const tx = await factory.connect(seller).batchCreateEnglishAuctions(
                nftContracts,
                tokenIdArray,
                startingPrices,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            await tx.wait();

            // Check count
            const count = await factory.getAuctionCount();
            expect(count).to.equal(3);

            // Check user auctions
            const userAuctions = await factory.getUserAuctions(seller.address);
            expect(userAuctions.length).to.equal(3);
        });

        it("Should batch create Dutch auctions", async function () {
            await nft.connect(seller).batchMint(seller.address, 3);

            const nftAddress = await nft.getAddress();
            const nftContracts = [nftAddress, nftAddress, nftAddress];
            const tokenIdArray = [0, 1, 2];
            const startingPrices = [
                STARTING_PRICE,
                STARTING_PRICE,
                STARTING_PRICE
            ];
            const reservePrices = [
                RESERVE_PRICE,
                RESERVE_PRICE,
                RESERVE_PRICE
            ];

            const tx = await factory.connect(seller).batchCreateDutchAuctions(
                nftContracts,
                tokenIdArray,
                startingPrices,
                reservePrices,
                DURATION,
                FEE_PERCENTAGE
            );

            await tx.wait();

            const count = await factory.getAuctionCount();
            expect(count).to.equal(3);
        });

        it("Should reject batch creation with mismatched arrays", async function () {
            const nftAddress = await nft.getAddress();
            const nftContracts = [nftAddress, nftAddress];
            const tokenIdArray = [0, 1, 2]; // Mismatch!
            const startingPrices = [STARTING_PRICE, STARTING_PRICE];

            await expect(
                factory.connect(seller).batchCreateEnglishAuctions(
                    nftContracts,
                    tokenIdArray,
                    startingPrices,
                    DURATION,
                    MIN_BID_INCREMENT,
                    FEE_PERCENTAGE,
                    true,
                    AUTO_EXTEND_DURATION
                )
            ).to.be.revertedWith("Length mismatch");
        });
    });

    describe("Auction Registry", function () {
        it("Should track all auctions", async function () {
            // Create multiple auctions
            await nft.connect(seller).batchMint(seller.address, 2);
            await nft.connect(otherUser).batchMint(otherUser.address, 1);

            await factory.connect(seller).createEnglishAuction(
                await nft.getAddress(),
                0,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            await factory.connect(seller).createDutchAuction(
                await nft.getAddress(),
                1,
                STARTING_PRICE,
                RESERVE_PRICE,
                DURATION,
                FEE_PERCENTAGE
            );

            await factory.connect(otherUser).createEnglishAuction(
                await nft.getAddress(),
                2,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            // Check total count
            expect(await factory.getAuctionCount()).to.equal(3);

            // Check user-specific auctions
            expect((await factory.getUserAuctions(seller.address)).length).to.equal(2);
            expect((await factory.getUserAuctions(otherUser.address)).length).to.equal(1);

            // Check all auctions
            const allAuctions = await factory.getAllAuctions();
            expect(allAuctions.length).to.equal(3);
        });
    });
});
