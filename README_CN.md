# AI Life: Web3 像素小镇

![Game Preview](./public/assets/preview.png)

AI Life 是一个实验性的 Web3 像素风格角色扮演游戏（RPG），其中的游戏角色由大语言模型（LLM）驱动。与传统游戏中玩家直接控制角色不同，在这里，你只需要提供一个 AI API Token (DeepSeek)，AI 就会“成为”你的角色——根据其性格、生命值和饥饿状态，自主做出决定、在小镇中移动并与其他玩家进行交谈。

## 🎮 游戏玩法 (Gameplay)

1.  **连接钱包 (Connect Wallet)**:
    - 连接你的 Web3 钱包（通过 RainbowKit/Wagmi）。
    - 支持 **Base** 链。
    - 签名消息以验证所有权并初始化你的会话。

2.  **创建角色 (Create Character)**:
    - 输入你的角色名称。
    - **ERC-8004 集成**: 使用 ERC-8004 标准进行角色创建，生成对应的 NFT 资产（未完成）。
    - **自带钱包**: 每个角色将拥有自带的钱包功能（未完成）。
    - 系统会为你随机生成属性：
        - **外貌**: 头发颜色，是否戴眼镜。
        - **性格**: 自动分配 **MBTI 人格** (如 INTJ - 建筑师, ENFP - 竞选者)，包含详细的核心特质描述。
        - **状态**: 生命值 (100)，饥饿度 (0)。

3.  **唤醒 AI (Awaken the AI)**:
    - 输入你的 **DeepSeek API Token**。
    - AI 将接管你的角色。它会接收角色的档案（姓名、MBTI 人格、状态）和感知数据。
    - **思维链 (Chain of Thought)**: AI 在做出行动前，会进行内部“思维链”推理，基于人格特质评估当前环境和自身状态。

4.  **观察与交互 (Observation & Interaction)**:
    - **自主移动**: AI 会根据 MBTI 人格和内部状态（如探索欲、饥饿感）决定行动策略。
    - **动态对话**:
        - 如果 AI 决定说话，屏幕上会弹出包含实时生成内容的对话框。
        - 如果你撞到其他玩家，会触发对话。
    - **AI 支付**: AI 角色可以通过 x402 协议进行自主支付（未完成）。
    - **状态监控**: 在左上角的 HUD 中查看角色的生命值和饥饿度。

## 🛠 游戏设计 (Game Design)

-   **前端**: Next.js + React.
-   **游戏引擎**: Phaser 3 (Arcade Physics).
-   **Web3 集成**: Wagmi + RainbowKit (Base Chain).
-   **AI 核心**: 配置为 DeepSeek API 的 OpenAI SDK。
    -   **MBTI 系统**: 角色拥有 16 种独特的 MBTI 人格，影响其行为模式和对话风格。
    -   **决策引擎**: 采用“思维链”推理，综合分析环境（时间、位置、饥饿）并输出 JSON 指令。
    -   **对话引擎**: 生成符合角色 MBTI 人设的中文上下文感知对话。
-   **素材**: Modern Interiors (Limezu) 16x16 像素画。

## 📂 目录结构 (Directory Structure)

```
AILife/
├── public/
│   └── assets/             # 游戏素材 (精灵图, 地图块)
├── src/
│   ├── components/
│   │   └── Game/
│   │       ├── PhaserGame.tsx  # Phaser 的 React 包装器
│   │       ├── GameScene.ts    # 主游戏逻辑 (地图, 物理, AI 循环)
│   │       └── UIScene.ts      # UI 覆盖层 (对话框)
│   ├── config/
│   │   └── wagmi.ts        # Web3 钱包配置
│   ├── pages/
│   │   ├── _app.tsx        # 应用入口 (Providers)
│   │   └── index.tsx       # 主页面 (连接钱包, 角色创建)
│   ├── utils/
│   │   └── ai.ts           # AI 逻辑 (DeepSeek API 集成)
│   └── styles/             # 全局 CSS & Tailwind
├── next.config.js          # Next.js 配置
├── tailwind.config.js      # Tailwind 配置
└── package.json            # 依赖项
```

## 🚀 安装 (Installation)

1.  **克隆仓库**:
    ```bash
    git clone <repository_url>
    cd AILife
    ```

2.  **安装依赖**:
    ```bash
    npm install
    ```

3.  **准备素材**:
    确保 `public/assets` 文件夹包含所需的 Limezu 像素画素材：
    - `Modern tiles_Free/Interiors_free/16x16/Interiors_free_16x16.png`
    - `Modern tiles_Free/Characters_free/Adam_16x16.png` (以及其他)

## ▶️ 运行 (Running)

1.  **启动开发服务器**:
    ```bash
    npm run dev
    ```

2.  **打开浏览器**:
    访问 `http://localhost:3000`。

3.  **开始游戏**:
    - 连接钱包。
    - 输入名字 -> 签名。
    - 输入 DeepSeek API Token。
    - 观看你的 AI 人生展开！

## ⚠️ 注意事项 (Notes)

-   **安全性**: 你的 API Token 仅存储在浏览器的内存中，并直接发送到 DeepSeek API。它不会存储在任何后端服务器上。
-   **性能**: 游戏每隔几秒轮询一次 AI API。请确保你有稳定的互联网连接。
