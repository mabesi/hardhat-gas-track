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
   ```

3. **Use:**
   - Create baseline: `npx hardhat gas:snapshot`
   - Check changes: `npx hardhat gas:track`

## Documentation

📚 **[Access Complete Documentation](./docs/01-introduction.md)**

For details on advanced configuration, CI/CD, and troubleshooting, check the guide above.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
