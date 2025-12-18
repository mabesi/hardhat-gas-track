# Hardhat Gas Track

![Banner](./banner.png)

![NPM Version](https://img.shields.io/npm/v/hardhat-gas-track)
![License](https://img.shields.io/npm/l/hardhat-gas-track)

Automated gas regression prevention for Smart Contracts. Integrate into your CI and never let an expensive update go unnoticed again.

🇧🇷 **[Leia em Português](./README.pt-br.md)**

## Quick Start (3 Steps)

1. **Install:**
   ```bash
   npm install --save-dev hardhat-gas-track
   ```

2. **Configure (`hardhat.config.ts`):**
   ```typescript
   import "hardhat-gas-track";
   import "hardhat-gas-reporter";
   
   export default {
     gasReporter: {
       enabled: true,
       outputJSON: true,
       outputFile: "gas-report.json"
     }
   };
   ```

3. **Use:**
   - Create baseline: `npx hardhat gas:snapshot`
   - Check changes: `npx hardhat gas:track`

## 📚 Example Project

Want to see `hardhat-gas-track` in action? Check out our comprehensive example project!

The **[Auction System Example](./example)** demonstrates:
- ✅ Integration of both `hardhat-gas-reporter` and `hardhat-gas-track`
- ✅ Real-world gas optimization techniques (Pull vs Push patterns, batch operations, storage packing)
- ✅ Complete test suite with measurable gas comparisons
- ✅ English and Dutch auction implementations
- ✅ Factory pattern for efficient deployment

**[→ View Example Documentation](./example/README.md)**

## Documentation

📚 **[Access Complete Documentation](./docs/01-introduction.md)**

For details on advanced configuration, CI/CD, and troubleshooting, check the guide above.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
