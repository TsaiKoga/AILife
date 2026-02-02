# AI Life: Web3 Pixel Town

> [中文文档 (Chinese Version)](./README_CN.md)

![Game Preview](./public/assets/preview.png)

AI Life is an experimental Web3 pixel art RPG where your character is powered by a Large Language Model (LLM). Unlike traditional games where you control the character directly, here you provide an AI API Token (DeepSeek), and the AI "becomes" your character—making decisions, moving around the town, and conversing with other players based on its personality, health, and hunger status.

## 🎮 Gameplay (游戏玩法)

1.  **Connect Wallet (连接钱包)**:
    - Connect your Web3 wallet (via RainbowKit/Wagmi).
    - Supports **Base** chain.
    - **Auto-Load**: If you already have a character on-chain, the game automatically loads your stats and progress.

2.  **Create Character (创建角色)**:
    - Input your Character Name.
    - **On-Chain Registration**: Your character's identity (Name, Appearance, Personality) is stored permanently on the **Base Blockchain** via the `CharacterRegistry` smart contract.
    - **ERC-8004 Integration**: Characters are created via the ERC-8004 standard, generating a unique NFT representation (WIP).
    - **Built-in Wallet**: Each character comes with its own embedded wallet functionality (WIP).
    - The system generates random attributes for you:
        - **Appearance**: Hair color, Glasses.
        - **Personality**: Automatically assigned **MBTI Personality** (e.g., INTJ - Architect, ENFP - Campaigner) with detailed traits.
        - **Stats**: Health (100), Hunger (0).

3.  **Awaken the AI (唤醒 AI)**:
    - Input your **DeepSeek API Token**.
    - The AI takes control of your character. It receives your character's profile (Name, MBTI Personality, Stats) and sensory data.
    - **Chain of Thought**: The AI performs an internal "Chain of Thought" process to evaluate its state and environment before taking action.

4.  **Observation & Interaction (观察与交互)**:
    - **Autonomous Movement**: The AI decides where to walk based on its internal state (e.g., exploring, looking for food).
    - **Dynamic Dialogue**:
        - If the AI decides to talk, a dialogue box appears with content generated in real-time.
        - If you bump into another player, a conversation is triggered.
    - **AI Payments**: AI characters can perform transactions and payments using the x402 protocol (WIP).
    - **Stats Monitoring**: Watch your character's Health and Hunger in the top-left HUD. Changes are synced to the blockchain (WIP).

## 🛠 Game Design (游戏设计)

-   **Frontend**: Next.js + React.
-   **Game Engine**: Phaser 3 (Arcade Physics).
-   **Web3 Integration**: Wagmi + RainbowKit (Base Chain).
-   **Smart Contract**: Solidity (On-Chain Character Registry).
-   **AI Core**: OpenAI SDK configured for DeepSeek API.
    -   **MBTI System**: Characters have distinct 16 MBTI personalities affecting their behavior and dialogue style.
    -   **Decision Engine**: Uses "Chain of Thought" reasoning to analyze environment (Time, Location, Hunger) and output JSON commands.
    -   **Dialogue Engine**: Generates context-aware conversations in Chinese, consistent with the character's MBTI persona.
-   **Assets**: Modern Interiors (Limezu) 16x16 Pixel Art.

## 📂 Directory Structure (目录结构)

```
AILife/
├── contracts/          # Solidity Smart Contracts (CharacterRegistry.sol)
├── public/
│   └── assets/         # Game assets (sprites, tilesets)
├── scripts/            # Deployment & Compilation scripts
├── src/
│   ├── abi/            # Generated Contract ABIs
│   ├── components/
│   │   └── Game/
│   │       ├── PhaserGame.tsx  # React wrapper for Phaser
│   │       ├── GameScene.ts    # Main Game Logic (Map, Physics, AI Loop)
│   │       └── UIScene.ts      # UI Overlay (Dialogue Box)
│   ├── config/
│   │   ├── contracts.ts    # Contract Addresses & ABIs
│   │   └── wagmi.ts        # Web3 Wallet Configuration
│   ├── pages/
│   │   ├── _app.tsx        # App Entry (Providers)
│   │   └── index.tsx       # Main Page (Wallet Connect, Character Creation)
│   ├── utils/
│   │   └── ai.ts           # AI Logic (DeepSeek API Integration)
│   └── styles/             # Global CSS & Tailwind
├── next.config.js      # Next.js Config
├── tailwind.config.js  # Tailwind Config
└── package.json        # Dependencies
```

## 🚀 Installation (安装)

1.  **Clone the repository**:
    ```bash
    git clone <repository_url>
    cd AILife
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Prepare Assets**:
    Ensure the `public/assets` folder contains the required Limezu pixel art assets:
    - `Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png`
    - `Modern tiles_Free/Characters_free/Adam_16x16.png` (and others)

## 📜 Smart Contract Deployment (合约部署)

If you want to deploy your own version of the contract:

1.  Create a `.env` file in the root directory:
    ```env
    PRIVATE_KEY=your_private_key_here
    ```
2.  Run the manual deployment script:
    ```bash
    # Deploy to Base Sepolia (Testnet)
    node scripts/deploy-manual.js

    # Deploy to Base Mainnet
    NETWORK=base node scripts/deploy-manual.js
    ```
3.  The frontend config (`src/config/contracts.ts`) will be updated automatically with the new address.

## ▶️ Running (运行)

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```

2.  **Open Browser**:
    Navigate to `http://localhost:3000`.

3.  **Play**:
    - Connect Wallet.
    - **New User**: Enter Name -> Sign -> Transaction to register on-chain.
    - **Returning User**: Character loads automatically.
    - Enter DeepSeek API Token.
    - Watch your AI Life unfold!

## ⚠️ Notes

-   **Security**: Your API Token is stored only in the browser's memory and sent directly to the DeepSeek API. It is not stored on any backend server. **Never commit your `.env` file containing private keys.**
-   **Performance**: The game polls the AI API every few seconds. Ensure you have a stable internet connection.
