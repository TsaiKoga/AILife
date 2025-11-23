import OpenAI from 'openai';

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
    
    const prompt = `
You are a character in a pixel RPG.
Name: ${state.name}
Personality: ${state.personality}
Health: ${state.health}/100
Hunger: ${state.hunger}/100 (0=Full, 100=Starving)
Location: (${Math.floor(state.x)}, ${Math.floor(state.y)})
Nearby Entities: ${state.nearby.join(', ') || 'None'}

Incoming Message: ${state.incomingMessage ? `${state.incomingMessage.sender} says: "${state.incomingMessage.content}"` : "None"}

Decide your next immediate action (next 1-2 seconds).
Available Actions:
1. MOVE: Walk in a direction (up, down, left, right).
2. STOP: Stand still.
3. TALK: Say something to someone nearby or to yourself.

Instructions:
- If you have an Incoming Message, you MUST decide to REPLY or IGNORE based on your Personality.
  - If replying, set action 'talk' and target=[sender].
  - If ignoring, set action 'stop' or 'move' away.
- If no message, you can explore (MOVE) or chat with nearby people (TALK).
- Speak in Chinese.

Output strictly in JSON format:
{
  "action": "move" | "stop" | "talk",
  "direction": "up" | "down" | "left" | "right" (required if move),
  "content": "message in Chinese" (required if talk),
  "target": "name" (optional if talk)
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
