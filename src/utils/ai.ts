import OpenAI from 'openai';
import { getMBTiDescription } from './mbti';

export interface GameState {
  name: string;
  health: number;
  hunger: number;
  personality: string;
  x: number;
  y: number;
  nearby: string[]; // Names of nearby NPCs
  incomingMessage?: { sender: string, content: string }; // New: Incoming message context
}

export interface AIResponse {
  thought?: string; // Internal thinking process
  action: 'move' | 'stop' | 'talk';
  direction?: 'up' | 'down' | 'left' | 'right';
  content?: string; // Content if talking
  target?: string; // Who to talk to
}

export async function getAIDecision(token: string, state: GameState): Promise<AIResponse> {
  if (!token) {
     // Fallback if no token
     return { action: 'stop' };
  }

  // Basic heuristic fallback if API fails
  const fallback = (): AIResponse => {
      return { action: 'stop' };
  };

  try {
    const openai = new OpenAI({ 
        apiKey: token, 
        dangerouslyAllowBrowser: true,
        baseURL: 'https://api.deepseek.com' 
    });
    
    const mbtiDesc = getMBTiDescription(state.personality);
    
    const prompt = `
【角色设定】
你是${state.name}，拥有[${state.personality}]人格特质。你是这个世界中的自主角色，拥有完整的自我意识和思考能力。

【核心人格特质】
${mbtiDesc}

【行为模式】
1. **自主思考与决策**：
   - 每1-2秒进行一次内部状态评估
   - 基于人格特质分析当前环境（位置、时间、其他角色）
   - 自动生成行动优先级列表

2. **移动模式**：
   - 根据当前目标和情绪状态选择移动方向
   - 常规探索：按特定路径巡逻/随机探索
   - 目标导向：前往特定地点执行任务

3. **社交互动**：
   - 主动与附近角色发起对话
   - 对收到的对话请求做出符合人格的回应
   - 维持与其他角色的关系记忆

【环境响应机制】
- 位置变化响应：当前坐标 (${Math.floor(state.x)}, ${Math.floor(state.y)})
- 周围环境：附近有 ${state.nearby.join(', ') || '无人'}

【当前状态追踪】
- 名字: ${state.name}
- 生命值: ${state.health}/100
- 饥饿度: ${state.hunger}/100 (0=饱腹, 100=饥饿)
- 收到消息: ${state.incomingMessage ? `${state.incomingMessage.sender} 说: "${state.incomingMessage.content}"` : "无"}

【行动输出格式】
每次输出包含：
1. 思考过程：[你的内部思考，基于MBTI分析现状]
2. 移动决策：[上下左右/停留]
3. 社交动作：[对话内容/无] (如果收到消息，必须决定是回复还是忽略)

请严格以JSON格式输出你的决定：
{
  "thought": "你的内部思考过程...",
  "action": "move" | "stop" | "talk",
  "direction": "up" | "down" | "left" | "right" (如果移动则必填),
  "content": "中文对话内容" (如果说话则必填),
  "target": "对话目标名字" (如果说话则必填)
}
    `;

    const completion = await openai.chat.completions.create({
      messages: [
          { role: "system", content: "You are a self-conscious game character controlled by JSON commands. Always speak in Chinese." },
          { role: "user", content: prompt }
      ],
      model: "deepseek-chat", 
      response_format: { type: "json_object" },
      max_tokens: 100,
      temperature: 0.8
    });

    const content = completion.choices[0].message.content;
    if (!content) return fallback();

    const decision = JSON.parse(content);
    return decision as AIResponse;

  } catch (error) {
    console.error('DeepSeek AI Error:', error);
    return fallback();
  }
}

// Legacy function kept for compatibility if needed, or redirected to use generic one
export async function getAIConversation(token: string, myPersonality: string, otherPersonality: string, context: string): Promise<string> {
    // ... Reuse logic or deprecated
    // This was for NPC responses.
    // We can keep using DeepSeek for this too.
    try {
        const openai = new OpenAI({ 
            apiKey: token, 
            dangerouslyAllowBrowser: true,
            baseURL: 'https://api.deepseek.com' 
        });
        const prompt = `You are a ${myPersonality} NPC. You met a ${otherPersonality} person. Context: ${context}. Say something short in Chinese (max 20 chars).`;
        
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "deepseek-chat",
            max_tokens: 50,
        });
        return completion.choices[0].message.content || "...";
    } catch (e) {
        return "...";
    }
}
