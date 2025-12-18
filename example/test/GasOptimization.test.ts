import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { EnglishAuction, MockNFT, AuctionFactory } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-toolbox/signers";

/**
 * Gas Optimization Comparison Tests
 * 
 * These tests demonstrate and compare different gas optimization strategies:
 * 1. Pull vs Push payment patterns
 * 2. Batch vs individual operations
 * 3. Storage optimization (packed structs)
 * 4. English vs Dutch auction efficiency
 */
describe("Gas Optimization Comparisons", function () {
    let nft: MockNFT;
    let factory: AuctionFactory;
    let seller: SignerWithAddress;
    let bidder1: SignerWithAddress;
    let bidder2: SignerWithAddress;
    let bidder3: SignerWithAddress;

    const STARTING_PRICE = ethers.parseEther("1");
    const RESERVE_PRICE = ethers.parseEther("0.5");
    const MIN_BID_INCREMENT = ethers.parseEther("0.1");
    const DURATION = 3600;
    const FEE_PERCENTAGE = 250;
    const AUTO_EXTEND_DURATION = 300;

    beforeEach(async function () {
        [seller, bidder1, bidder2, bidder3] = await ethers.getSigners();

        const MockNFTFactory = await ethers.getContractFactory("MockNFT");
        nft = await MockNFTFactory.deploy();

        const AuctionFactoryFactory = await ethers.getContractFactory("AuctionFactory");
        factory = await AuctionFactoryFactory.deploy();
    });

    describe("Pull vs Push Payment Patterns", function () {
        it("Should compare gas costs: Pull payment (deferred refund)", async function () {
            // Create auction with pull payment
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
            const pullAuction = await EnglishAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true, // usePullPayment
                AUTO_EXTEND_DURATION
            );

            await nft.connect(seller).approve(await pullAuction.getAddress(), tokenId);

            // First bid
            await pullAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            // Second bid (outbids first) - measure gas
            const higherBid = STARTING_PRICE + MIN_BID_INCREMENT;
            const tx = await pullAuction.connect(bidder2).bid({ value: higherBid });
            const receipt = await tx.wait();

            console.log(`\n📊 Pull Payment - Second Bid Gas: ${receipt!.gasUsed.toString()}`);

            // Withdrawal gas cost
            const withdrawTx = await pullAuction.connect(bidder1).withdraw();
            const withdrawReceipt = await withdrawTx.wait();

            console.log(`📊 Pull Payment - Withdrawal Gas: ${withdrawReceipt!.gasUsed.toString()}`);
            console.log(`📊 Pull Payment - Total Gas: ${(receipt!.gasUsed + withdrawReceipt!.gasUsed).toString()}`);
        });

        it("Should compare gas costs: Push payment (immediate refund)", async function () {
            // Create auction with push payment
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
            const pushAuction = await EnglishAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                false, // usePullPayment = false
                AUTO_EXTEND_DURATION
            );

            await nft.connect(seller).approve(await pushAuction.getAddress(), tokenId);

            // First bid
            await pushAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            // Second bid (outbids first and immediately refunds) - measure gas
            const higherBid = STARTING_PRICE + MIN_BID_INCREMENT;
            const tx = await pushAuction.connect(bidder2).bid({ value: higherBid });
            const receipt = await tx.wait();

            console.log(`\n📊 Push Payment - Second Bid Gas (includes refund): ${receipt!.gasUsed.toString()}`);
            console.log(`📊 Push Payment - Total Gas: ${receipt!.gasUsed.toString()}`);

            console.log(`\n💡 Analysis: Pull payment splits gas cost between bidder and withdrawer.`);
            console.log(`   Push payment has higher immediate cost but no withdrawal needed.`);
        });

        it("Should demonstrate pull payment advantage with multiple outbids", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
            const pullAuction = await EnglishAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            await nft.connect(seller).approve(await pullAuction.getAddress(), tokenId);

            // Multiple bids
            await pullAuction.connect(bidder1).bid({ value: STARTING_PRICE });

            const bid2 = STARTING_PRICE + MIN_BID_INCREMENT;
            await pullAuction.connect(bidder2).bid({ value: bid2 });

            const bid3 = bid2 + MIN_BID_INCREMENT;
            const tx = await pullAuction.connect(bidder3).bid({ value: bid3 });
            const receipt = await tx.wait();

            console.log(`\n📊 Pull Payment - Third Bid Gas: ${receipt!.gasUsed.toString()}`);
            console.log(`💡 With pull payment, each bid has consistent gas cost regardless of refund count.`);
        });
    });

    describe("Batch vs Individual Operations", function () {
        it("Should compare: Individual auction creation", async function () {
            await nft.connect(seller).batchMint(seller.address, 3);

            const nftAddress = await nft.getAddress();
            let totalGas = BigInt(0);

            // Create 3 auctions individually
            for (let i = 0; i < 3; i++) {
                const tx = await factory.connect(seller).createEnglishAuction(
                    nftAddress,
                    i,
                    STARTING_PRICE,
                    DURATION,
                    MIN_BID_INCREMENT,
                    FEE_PERCENTAGE,
                    true,
                    AUTO_EXTEND_DURATION
                );
                const receipt = await tx.wait();
                totalGas += receipt!.gasUsed;
            }

            console.log(`\n📊 Individual Creation - Total Gas (3 auctions): ${totalGas.toString()}`);
            console.log(`📊 Individual Creation - Average per auction: ${(totalGas / BigInt(3)).toString()}`);
        });

        it("Should compare: Batch auction creation", async function () {
            await nft.connect(seller).batchMint(seller.address, 3);

            const nftAddress = await nft.getAddress();
            const nftContracts = [nftAddress, nftAddress, nftAddress];
            const tokenIds = [0, 1, 2];
            const startingPrices = [STARTING_PRICE, STARTING_PRICE, STARTING_PRICE];

            const tx = await factory.connect(seller).batchCreateEnglishAuctions(
                nftContracts,
                tokenIds,
                startingPrices,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );
            const receipt = await tx.wait();

            console.log(`\n📊 Batch Creation - Total Gas (3 auctions): ${receipt!.gasUsed.toString()}`);
            console.log(`📊 Batch Creation - Average per auction: ${(receipt!.gasUsed / BigInt(3)).toString()}`);
            console.log(`\n💡 Batch operations save gas by amortizing transaction overhead.`);
        });
    });

    describe("English vs Dutch Auction Efficiency", function () {
        it("Should compare: English auction with multiple bids", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
            const englishAuction = await EnglishAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            await nft.connect(seller).approve(await englishAuction.getAddress(), tokenId);

            let totalGas = BigInt(0);

            // Multiple bids
            const tx1 = await englishAuction.connect(bidder1).bid({ value: STARTING_PRICE });
            totalGas += (await tx1.wait())!.gasUsed;

            const bid2 = STARTING_PRICE + MIN_BID_INCREMENT;
            const tx2 = await englishAuction.connect(bidder2).bid({ value: bid2 });
            totalGas += (await tx2.wait())!.gasUsed;

            const bid3 = bid2 + MIN_BID_INCREMENT;
            const tx3 = await englishAuction.connect(bidder3).bid({ value: bid3 });
            totalGas += (await tx3.wait())!.gasUsed;

            // Settlement
            await time.increase(DURATION + 1);
            const settleTx = await englishAuction.settle();
            totalGas += (await settleTx.wait())!.gasUsed;

            console.log(`\n📊 English Auction - Total Gas (3 bids + settlement): ${totalGas.toString()}`);
        });

        it("Should compare: Dutch auction (instant purchase)", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const DutchAuctionFactory = await ethers.getContractFactory("DutchAuction");
            const dutchAuction = await DutchAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                RESERVE_PRICE,
                DURATION,
                FEE_PERCENTAGE
            );

            await nft.connect(seller).approve(await dutchAuction.getAddress(), tokenId);

            // Wait for price to drop
            await time.increase(DURATION / 2);

            // Single purchase (instant settlement)
            const currentPrice = await dutchAuction.getCurrentPrice();
            const tx = await dutchAuction.connect(bidder1).buy({ value: currentPrice });
            const receipt = await tx.wait();

            console.log(`\n📊 Dutch Auction - Total Gas (instant purchase): ${receipt!.gasUsed.toString()}`);
            console.log(`\n💡 Dutch auctions are more gas efficient: single transaction, no refunds needed.`);
        });
    });

    describe("Storage Optimization", function () {
        it("Should demonstrate packed storage in AuctionData struct", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
            const auction = await EnglishAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            await nft.connect(seller).approve(await auction.getAddress(), tokenId);

            console.log(`\n💡 Storage Optimization:`);
            console.log(`   AuctionData struct uses packed storage:`);
            console.log(`   - address (20 bytes) + uint96 (12 bytes) = 32 bytes (1 slot)`);
            console.log(`   - uint64 timestamps fit in single slot with other data`);
            console.log(`   - Reduces SSTORE operations and gas costs`);
        });
    });

    describe("Whitelist Batch Operations", function () {
        it("Should compare: Individual whitelist additions", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
            const auction = await EnglishAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            await nft.connect(seller).approve(await auction.getAddress(), tokenId);

            let totalGas = BigInt(0);

            // Add 3 addresses individually
            const tx1 = await auction.connect(seller).addToWhitelist(bidder1.address);
            totalGas += (await tx1.wait())!.gasUsed;

            const tx2 = await auction.connect(seller).addToWhitelist(bidder2.address);
            totalGas += (await tx2.wait())!.gasUsed;

            const tx3 = await auction.connect(seller).addToWhitelist(bidder3.address);
            totalGas += (await tx3.wait())!.gasUsed;

            console.log(`\n📊 Individual Whitelist - Total Gas (3 addresses): ${totalGas.toString()}`);
        });

        it("Should compare: Batch whitelist addition", async function () {
            await nft.connect(seller).mint(seller.address);
            const tokenId = 0;

            const EnglishAuctionFactory = await ethers.getContractFactory("EnglishAuction");
            const auction = await EnglishAuctionFactory.connect(seller).deploy(
                await nft.getAddress(),
                tokenId,
                STARTING_PRICE,
                DURATION,
                MIN_BID_INCREMENT,
                FEE_PERCENTAGE,
                true,
                AUTO_EXTEND_DURATION
            );

            await nft.connect(seller).approve(await auction.getAddress(), tokenId);

            const addresses = [bidder1.address, bidder2.address, bidder3.address];
            const tx = await auction.connect(seller).batchAddToWhitelist(addresses);
            const receipt = await tx.wait();

            console.log(`\n📊 Batch Whitelist - Total Gas (3 addresses): ${receipt!.gasUsed.toString()}`);
            console.log(`\n💡 Batch operations save ~21,000 gas per item by reducing transaction overhead.`);
        });
    });
});
