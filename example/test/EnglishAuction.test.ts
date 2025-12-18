import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { EnglishAuction, MockNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-toolbox/signers";

describe("EnglishAuction", function () {
    let nft: MockNFT;
    let seller: SignerWithAddress;
    let bidder1: SignerWithAddress;
    let bidder2: SignerWithAddress;
    let bidder3: SignerWithAddress;

    const STARTING_PRICE = ethers.parseEther("1");
    const MIN_BID_INCREMENT = ethers.parseEther("0.1");
    const DURATION = 3600; // 1 hour
    const FEE_PERCENTAGE = 250; // 2.5%
    const AUTO_EXTEND_DURATION = 300; // 5 minutes

    beforeEach(async function () {
        [seller, bidder1, bidder2, bidder3] = await ethers.getSigners();

        // Deploy NFT contract
        const MockNFTFactory = await ethers.getContractFactory("MockNFT");
        nft = await MockNFTFactory.deploy();

        // Mint NFT to seller
        await nft.connect(seller).mint(seller.address);
    });

    async function deployAuction(usePullPayment: boolean): Promise<EnglishAuction> {
        const tokenId = 0;

        const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");

        // Calculate future auction address
        const nonce = await ethers.provider.getTransactionCount(seller.address);
        const futureAddress = ethers.getCreateAddress({ from: seller.address, nonce });

        // Approve future auction contract
        await nft.connect(seller).approve(futureAddress, tokenId);

        // Deploy auction
        const auction = await EnglishAuctionFactory.connect(seller).deploy(
            await nft.getAddress(),
            tokenId,
            STARTING_PRICE,
            DURATION,
            MIN_BID_INCREMENT,
            FEE_PERCENTAGE,
            usePullPayment,
            AUTO_EXTEND_DURATION
        );

        return auction;
    }

    describe("Pull Payment Pattern", function () {
        let englishAuction: EnglishAuction;

        beforeEach(async function () {
            englishAuction = await deployAuction(true);
        });

        it("Should create auction with correct parameters", async function () {
            const data = await englishAuction.getAuctionData();

            expect(data.seller).to.equal(seller.address);
            expect(data.startingPrice).to.equal(STARTING_PRICE);
            expect(data.usePullPayment).to.be.true;
        });

        it("Should accept first bid at starting price", async function () {
            await expect(
                englishAuction.connect(bidder1).bid({ value: STARTING_PRICE })
            ).to.emit(englishAuction, "BidPlaced")
                .withArgs(bidder1.address, STARTING_PRICE);

            const data = await englishAuction.getAuctionData();
            expect(data.highestBidder).to.equal(bidder1.address);
            expect(data.highestBid).to.equal(STARTING_PRICE);
        });

        it("Should reject bid below starting price", async function () {
            const lowBid = STARTING_PRICE - ethers.parseEther("0.1");

            await expect(
                englishAuction.connect(bidder1).bid({ value: lowBid })
            ).to.be.revertedWithCustomError(englishAuction, "InsufficientBid");
        });

        it("Should reject bid without minimum increment", async function () {
            // First bid
            await englishAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            // Second bid without enough increment
            const insufficientBid = STARTING_PRICE + MIN_BID_INCREMENT - ethers.parseEther("0.01");

            await expect(
                englishAuction.connect(bidder2).bid({ value: insufficientBid })
            ).to.be.revertedWithCustomError(englishAuction, "InsufficientBid");
        });

        it("Should store pending returns for outbid bidders (pull pattern)", async function () {
            // Bidder1 bids
            await englishAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            // Bidder2 outbids
            const higherBid = STARTING_PRICE + MIN_BID_INCREMENT;
            await englishAuction.connect(bidder2).bid({ value: higherBid });

            // Check pending returns
            const pendingReturn = await englishAuction.pendingReturns(bidder1.address);
            expect(pendingReturn).to.equal(STARTING_PRICE);
        });

        it("Should allow withdrawal of pending returns", async function () {
            // Bidder1 bids
            await englishAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            // Bidder2 outbids
            const higherBid = STARTING_PRICE + MIN_BID_INCREMENT;
            await englishAuction.connect(bidder2).bid({ value: higherBid });

            // Bidder1 withdraws
            const balanceBefore = await ethers.provider.getBalance(bidder1.address);
            const tx = await englishAuction.connect(bidder1).withdraw();
            const receipt = await tx.wait();
            const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
            const balanceAfter = await ethers.provider.getBalance(bidder1.address);

            expect(balanceAfter).to.equal(balanceBefore + STARTING_PRICE - gasUsed);
        });

        it("Should settle auction and transfer NFT to winner", async function () {
            // Place bids
            await englishAuction.connect(bidder1).bid({ value: STARTING_PRICE });
            const winningBid = STARTING_PRICE + MIN_BID_INCREMENT;
            await englishAuction.connect(bidder2).bid({ value: winningBid });

            // Fast forward past end
            await time.increase(DURATION + 1);

            // Settle
            await expect(englishAuction.settle())
                .to.emit(englishAuction, "AuctionSettled")
                .withArgs(bidder2.address, winningBid);

            // Check NFT ownership
            expect(await nft.ownerOf(0)).to.equal(bidder2.address);
        });

        it("Should transfer correct amount to seller after fees", async function () {
            const winningBid = STARTING_PRICE + MIN_BID_INCREMENT;
            await englishAuction.connect(bidder1).bid({ value: winningBid });

            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

            // Fast forward and settle
            await time.increase(DURATION + 1);
            await englishAuction.settle();

            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);

            // Calculate expected amount (bid - fee)
            const fee = (winningBid * BigInt(FEE_PERCENTAGE)) / BigInt(10000);
            const expectedProceeds = winningBid - fee;

            expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedProceeds);
        });
    });

    describe("Push Payment Pattern", function () {
        let englishAuction: EnglishAuction;

        beforeEach(async function () {
            englishAuction = await deployAuction(false);
        });

        it("Should immediately refund outbid bidders (push pattern)", async function () {
            // Bidder1 bids
            await englishAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            const balanceBefore = await ethers.provider.getBalance(bidder1.address);

            // Bidder2 outbids (should trigger immediate refund to bidder1)
            const higherBid = STARTING_PRICE + MIN_BID_INCREMENT;
            await englishAuction.connect(bidder2).bid({ value: higherBid });

            const balanceAfter = await ethers.provider.getBalance(bidder1.address);

            // Bidder1 should have received refund
            expect(balanceAfter).to.equal(balanceBefore + STARTING_PRICE);

            // No pending returns
            expect(await englishAuction.pendingReturns(bidder1.address)).to.equal(0);
        });
    });

    describe("Whitelist Functionality", function () {
        let englishAuction: EnglishAuction;

        beforeEach(async function () {
            englishAuction = await deployAuction(true);
        });

        it("Should allow anyone to bid when whitelist disabled", async function () {
            await expect(
                englishAuction.connect(bidder1).bid({ value: STARTING_PRICE })
            ).to.not.be.reverted;
        });

        it("Should reject non-whitelisted bidders when enabled", async function () {
            await englishAuction.connect(seller).setWhitelistEnabled(true);

            await expect(
                englishAuction.connect(bidder1).bid({ value: STARTING_PRICE })
            ).to.be.revertedWithCustomError(englishAuction, "Unauthorized");
        });

        it("Should allow whitelisted bidders", async function () {
            await englishAuction.connect(seller).setWhitelistEnabled(true);
            await englishAuction.connect(seller).addToWhitelist(bidder1.address);

            await expect(
                englishAuction.connect(bidder1).bid({ value: STARTING_PRICE })
            ).to.not.be.reverted;
        });

        it("Should batch add to whitelist", async function () {
            await englishAuction.connect(seller).setWhitelistEnabled(true);

            const addresses = [bidder1.address, bidder2.address, bidder3.address];
            await englishAuction.connect(seller).batchAddToWhitelist(addresses);

            // All should be able to bid
            await englishAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            const higherBid = STARTING_PRICE + MIN_BID_INCREMENT;
            await expect(
                englishAuction.connect(bidder2).bid({ value: higherBid })
            ).to.not.be.reverted;
        });
    });

    describe("Pause Functionality", function () {
        let englishAuction: EnglishAuction;

        beforeEach(async function () {
            englishAuction = await deployAuction(true);
        });

        it("Should reject bids when paused", async function () {
            await englishAuction.connect(seller).pause();

            await expect(
                englishAuction.connect(bidder1).bid({ value: STARTING_PRICE })
            ).to.be.revertedWithCustomError(englishAuction, "EnforcedPause");
        });

        it("Should allow bids after unpause", async function () {
            await englishAuction.connect(seller).pause();
            await englishAuction.connect(seller).unpause();

            await expect(
                englishAuction.connect(bidder1).bid({ value: STARTING_PRICE })
            ).to.not.be.reverted;
        });
    });
});
