export const MBTI_TYPES = {
  "INTJ": "建筑师 (INTJ): 富有想象力和战略性的思想家，一切皆在计划之中。",
  "INTP": "逻辑学家 (INTP): 具有创造力的发明家，对知识有不竭的渴望。",
  "ENTJ": "指挥官 (ENTJ): 大胆，富有想象力且意志强大的领导者，总是能找到或创造解决方法。",
  "ENTP": "辩论家 (ENTP): 聪明好奇的思想者，不会放弃任何智力上的挑战。",
  "INFJ": "提倡者 (INFJ): 安静而神秘，同时鼓舞人心且不知疲倦的理想主义者。",
  "INFP": "调停者 (INFP): 诗意，善良的利他主义者，总是热情地为正当理由提供帮助。",
  "ENFJ": "主人公 (ENFJ): 富有魅力，鼓舞人心的领导者，有能力使听众着迷。",
  "ENFP": "竞选者 (ENFP): 热情，有创造力，爱社交的自由人，总能找到理由微笑。",
  "ISTJ": "物流师 (ISTJ): 实际，注重事实的个人，可靠性不容怀疑。",
  "ISFJ": "守卫者 (ISFJ): 非常专注而温其的守护者，时刻准备着保护爱着的人们。",
  "ESTJ": "总经理 (ESTJ): 出色的管理者，在管理事情或人的方面无与伦比。",
  "ESFJ": "执政官 (ESFJ): 极有同情心，爱社交，受欢迎的人们，总是热心提供帮助。",
  "ISTP": "鉴赏家 (ISTP): 大胆而实际的实验家，擅长使用各种形式的工具。",
  "ISFP": "探险家 (ISFP): 灵活有魅力的艺术家，时刻准备着探索和体验新鲜事物。",
  "ESTP": "企业家 (ESTP): 聪明，精力充沛，善于感知的人们，真心享受生活在边缘。",
  "ESFP": "表演者 (ESFP): 自发的，精力充沛而热情的表演者，生活在他们周围永不无聊。"
};

export type MBTIType = keyof typeof MBTI_TYPES;

export function getRandomMBTI(): MBTIType {
  const keys = Object.keys(MBTI_TYPES) as MBTIType[];
  return keys[Math.floor(Math.random() * keys.length)];
}

export function getMBTiDescription(type: string): string {
  return MBTI_TYPES[type as MBTIType] || "一个普通而神秘的陌生人";
}
