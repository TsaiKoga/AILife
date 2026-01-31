# AI Life: Web3 Pixel Town

> [中文文档 (Chinese Version)](./README_CN.md)

![Game Preview](./public/assets/preview.png)

AI Life is an experimental Web3 pixel art RPG where your character is powered by a Large Language Model (LLM). Unlike traditional games where you control the character directly, here you provide an AI API Token (DeepSeek), and the AI "becomes" your character—making decisions, moving around the town, and conversing with other players based on its personality, health, and hunger status.

## 🎮 Gameplay (游戏玩法)

1.  **Connect Wallet (连接钱包)**:
    - Connect your Web3 wallet (via RainbowKit/Wagmi).
    - Supports **Base** chain.
    - Sign a message to verify ownership and initialize your session.

2.  **Create Character (创建角色)**:
    - Input your Character Name.
    - **ERC-8004 Integration**: Characters are created via the ERC-8004 standard, generating a unique NFT representation (WIP).
    - **Built-in Wallet**: Each character comes with its own embedded wallet functionality (WIP).
    - The system generates random attributes for you:
        - **Appearance**: Hair color, Glasses.
        - **Personality**: Friendly, Grumpy, Curious, etc.
        - **Stats**: Health (100), Hunger (0).

3.  **Awaken the AI (唤醒 AI)**:
    - Input your **DeepSeek API Token**.
    - The AI takes control of your character. It receives your character's profile (Name, Personality, Stats) and sensory data (Location, Nearby Players).

4.  **Observation & Interaction (观察与交互)**:
    - **Autonomous Movement**: The AI decides where to walk based on its internal state (e.g., exploring, looking for food).
    - **Dynamic Dialogue**:
        - If the AI decides to talk, a dialogue box appears with content generated in real-time.
        - If you bump into another player, a conversation is triggered.
    - **AI Payments**: AI characters can perform transactions and payments using the x402 protocol (WIP).
    - **Stats Monitoring**: Watch your character's Health and Hunger in the top-left HUD.

## 🛠 Game Design (游戏设计)

-   **Frontend**: Next.js + React.
-   **Game Engine**: Phaser 3 (Arcade Physics).
-   **Web3 Integration**: Wagmi + RainbowKit (Base Chain).
-   **AI Core**: OpenAI SDK configured for DeepSeek API.
    -   **Decision Engine**: Evaluates state every second to output JSON commands (`MOVE`, `TALK`, `STOP`).
    -   **Dialogue Engine**: Generates context-aware conversations in Chinese.
-   **Assets**: Modern Interiors (Limezu) 16x16 Pixel Art.

## 📂 Directory Structure (目录结构)

```
AILife/
├── public/
│   └── assets/             # Game assets (sprites, tilesets)
├── src/
│   ├── components/
│   │   └── Game/
│   │       ├── PhaserGame.tsx  # React wrapper for Phaser
│   │       ├── GameScene.ts    # Main Game Logic (Map, Physics, AI Loop)
│   │       └── UIScene.ts      # UI Overlay (Dialogue Box)
│   ├── config/
│   │   └── wagmi.ts        # Web3 Wallet Configuration
│   ├── pages/
│   │   ├── _app.tsx        # App Entry (Providers)
│   │   └── index.tsx       # Main Page (Wallet Connect, Character Creation)
│   ├── utils/
│   │   └── ai.ts           # AI Logic (DeepSeek API Integration)
│   └── styles/             # Global CSS & Tailwind
├── next.config.js          # Next.js Config
├── tailwind.config.js      # Tailwind Config
└── package.json            # Dependencies
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

## ▶️ Running (运行)

1.  **Start Development Server**:
    ```bash
    npm run dev
    ```

2.  **Open Browser**:
    Navigate to `http://localhost:3000`.

3.  **Play**:
    - Connect Wallet.
    - Enter Name -> Sign.
    - Enter DeepSeek API Token.
    - Watch your AI Life unfold!

## ⚠️ Notes

-   **Security**: Your API Token is stored only in the browser's memory and sent directly to the DeepSeek API. It is not stored on any backend server.
-   **Performance**: The game polls the AI API every few seconds. Ensure you have a stable internet connection.
