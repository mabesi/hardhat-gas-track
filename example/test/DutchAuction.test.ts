import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { DutchAuction, MockNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-toolbox/signers";

describe("DutchAuction", function () {
    let dutchAuction: DutchAuction;
    let nft: MockNFT;
    let seller: SignerWithAddress;
    let buyer1: SignerWithAddress;
    let buyer2: SignerWithAddress;

    const STARTING_PRICE = ethers.parseEther("10");
    const RESERVE_PRICE = ethers.parseEther("1");
    const DURATION = 3600; // 1 hour
    const FEE_PERCENTAGE = 250; // 2.5%

    beforeEach(async function () {
        [seller, buyer1, buyer2] = await ethers.getSigners();

        // Deploy NFT contract
        const MockNFTFactory = await ethers.getContractFactory("MockNFT");
        nft = await MockNFTFactory.deploy();

        // Mint NFT to seller
        await nft.connect(seller).mint(seller.address);
        const tokenId = 0;

        // Deploy Dutch auction
        const DutchAuctionFactory = await ethers.getContractFactory("DutchAuction");
        dutchAuction = await DutchAuctionFactory.connect(seller).deploy(
            await nft.getAddress(),
            tokenId,
            STARTING_PRICE,
            RESERVE_PRICE,
            DURATION,
            FEE_PERCENTAGE
        );

        // Approve NFT transfer
        await nft.connect(seller).approve(await dutchAuction.getAddress(), tokenId);
    });

    describe("Price Calculation", function () {
        it("Should start at starting price", async function () {
            const currentPrice = await dutchAuction.getCurrentPrice();
            expect(currentPrice).to.equal(STARTING_PRICE);
        });

        it("Should decrease price linearly over time", async function () {
            // Fast forward 1/4 of duration
            await time.increase(DURATION / 4);

            const currentPrice = await dutchAuction.getCurrentPrice();

            // Price should be approximately 3/4 of the way from starting to reserve
            const expectedDecrease = (STARTING_PRICE - RESERVE_PRICE) / BigInt(4);
            const expectedPrice = STARTING_PRICE - expectedDecrease;

            // Allow small margin for rounding
            expect(currentPrice).to.be.closeTo(expectedPrice, ethers.parseEther("0.01"));
        });

        it("Should reach reserve price at end", async function () {
            await time.increase(DURATION);

            const currentPrice = await dutchAuction.getCurrentPrice();
            expect(currentPrice).to.equal(RESERVE_PRICE);
        });

        it("Should not go below reserve price", async function () {
            await time.increase(DURATION * 2); // Way past end

            const currentPrice = await dutchAuction.getCurrentPrice();
            expect(currentPrice).to.equal(RESERVE_PRICE);
        });

        it("Should calculate price at specific timestamp", async function () {
            const data = await dutchAuction.getAuctionData();
            const startTime = data.startTime;

            // Check price at halfway point
            const halfwayTime = Number(startTime) + DURATION / 2;
            const priceAtHalfway = await dutchAuction.getPriceAt(halfwayTime);

            const expectedPrice = (STARTING_PRICE + RESERVE_PRICE) / BigInt(2);
            expect(priceAtHalfway).to.be.closeTo(expectedPrice, ethers.parseEther("0.01"));
        });
    });

    describe("Buying", function () {
        it("Should allow purchase at current price", async function () {
            const currentPrice = await dutchAuction.getCurrentPrice();

            await expect(
                dutchAuction.connect(buyer1).buy({ value: currentPrice })
            ).to.emit(dutchAuction, "PurchasedAtPrice")
                .withArgs(buyer1.address, currentPrice);

            // Check NFT ownership
            expect(await nft.ownerOf(0)).to.equal(buyer1.address);
        });

        it("Should reject purchase below current price", async function () {
            const currentPrice = await dutchAuction.getCurrentPrice();
            const lowPrice = currentPrice - ethers.parseEther("0.1");

            await expect(
                dutchAuction.connect(buyer1).buy({ value: lowPrice })
            ).to.be.revertedWithCustomError(dutchAuction, "InsufficientBid");
        });

        it("Should refund excess payment", async function () {
            const currentPrice = await dutchAuction.getCurrentPrice();
            const overpayment = currentPrice + ethers.parseEther("1");

            const balanceBefore = await ethers.provider.getBalance(buyer1.address);
            const tx = await dutchAuction.connect(buyer1).buy({ value: overpayment });
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
            const balanceAfter = await ethers.provider.getBalance(buyer1.address);

            // Should only pay current price + gas
            expect(balanceAfter).to.equal(balanceBefore - currentPrice - gasUsed);
        });

        it("Should transfer correct amount to seller after fees", async function () {
            const currentPrice = await dutchAuction.getCurrentPrice();
            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

            await dutchAuction.connect(buyer1).buy({ value: currentPrice });

            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

            // Calculate expected amount
            const fee = (currentPrice * BigInt(FEE_PERCENTAGE)) / BigInt(10000);
            const expectedProceeds = currentPrice - fee;

            expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedProceeds);
        });

        it("Should settle immediately on purchase", async function () {
            const currentPrice = await dutchAuction.getCurrentPrice();
            await dutchAuction.connect(buyer1).buy({ value: currentPrice });

            const data = await dutchAuction.getAuctionData();
            expect(data.settled).to.be.true;
        });

        it("Should reject second purchase attempt", async function () {
            const currentPrice = await dutchAuction.getCurrentPrice();
            await dutchAuction.connect(buyer1).buy({ value: currentPrice });

            await expect(
                dutchAuction.connect(buyer2).buy({ value: currentPrice })
            ).to.be.revertedWithCustomError(dutchAuction, "AuctionAlreadySettled");
        });

        it("Should allow purchase at lower price after time passes", async function () {
            // Wait for price to drop
            await time.increase(DURATION / 2);

            const currentPrice = await dutchAuction.getCurrentPrice();
            expect(currentPrice).to.be.lessThan(STARTING_PRICE);

            await expect(
                dutchAuction.connect(buyer1).buy({ value: currentPrice })
            ).to.not.be.reverted;
        });
    });

    describe("Settlement", function () {
        it("Should return NFT to seller if no purchase", async function () {
            // Fast forward past end
            await time.increase(DURATION + 1);

            await dutchAuction.settle();

            // NFT should be back with seller
            expect(await nft.ownerOf(0)).to.equal(seller.address);
        });

        it("Should not allow settlement before end if no purchase", async function () {
            await expect(
                dutchAuction.settle()
            ).to.be.revertedWithCustomError(dutchAuction, "AuctionStillActive");
        });

        it("Should not allow settlement twice", async function () {
            await time.increase(DURATION + 1);
            await dutchAuction.settle();

            await expect(
                dutchAuction.settle()
            ).to.be.revertedWithCustomError(dutchAuction, "AuctionAlreadySettled");
        });
    });

    describe("Pause Functionality", function () {
        it("Should reject purchase when paused", async function () {
            await dutchAuction.connect(seller).pause();

            const currentPrice = await dutchAuction.getCurrentPrice();
            await expect(
                dutchAuction.connect(buyer1).buy({ value: currentPrice })
            ).to.be.revertedWithCustomError(dutchAuction, "EnforcedPause");
        });

        it("Should allow purchase after unpause", async function () {
            await dutchAuction.connect(seller).pause();
            await dutchAuction.connect(seller).unpause();

            const currentPrice = await dutchAuction.getCurrentPrice();
            await expect(
                dutchAuction.connect(buyer1).buy({ value: currentPrice })
            ).to.not.be.reverted;
        });
    });
});
