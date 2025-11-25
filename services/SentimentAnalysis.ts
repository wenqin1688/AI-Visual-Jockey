import { SentimentData } from "../types";

// Default "Cyberpunk/Neutral" State
const DEFAULT_SENTIMENT: SentimentData = {
  baseColor: [0.05, 0.8, 0.9], // Cyan
  secondaryColor: [0.1, 0.1, 0.3], // Dark Blue
  turbulence: 0.3,
  speed: 1.0,
  description: "NEUTRAL"
};

export const analyzeSentiment = (text: string): SentimentData => {
  const t = text.toLowerCase();

  // 1. PASSION / FIRE / ANGER (Red/Orange, High Chaos)
  if (t.match(/fire|burn|hot|flame|red|anger|hate|blood|hell|fight|power|bomb|fast|crazy|火|热|红|燃|爆|痛/)) {
    return {
      baseColor: [1.0, 0.2, 0.05], // Bright Red/Orange
      secondaryColor: [0.5, 0.0, 0.0], // Dark Red
      turbulence: 0.8, // Very chaotic
      speed: 1.8,
      description: "INTENSE"
    };
  }

  // 2. SADNESS / COLD / ISOLATION (Blue/White, Low Movement)
  if (t.match(/cold|ice|snow|blue|sad|cry|tear|alone|lonely|gone|die|dead|miss|slow|winter|冰|冷|雪|蓝|泪|悲|独|死/)) {
    return {
      baseColor: [0.6, 0.8, 1.0], // Ice Blue
      secondaryColor: [0.8, 0.9, 1.0], // Whiteish
      turbulence: 0.1, // Frozen/Slow
      speed: 0.4,
      description: "COLD"
    };
  }

  // 3. LOVE / ROMANCE / SWEET (Pink/Purple, Gentle)
  if (t.match(/love|kiss|heart|sweet|baby|girl|honey|pink|rose|flower|beautiful|soft|爱|吻|心|甜|粉|花|美/)) {
    return {
      baseColor: [1.0, 0.4, 0.7], // Hot Pink
      secondaryColor: [0.6, 0.1, 0.6], // Purple
      turbulence: 0.4,
      speed: 0.8,
      description: "ROMANTIC"
    };
  }

  // 4. NATURE / PEACE / LIFE (Green/Gold, Flowing)
  if (t.match(/tree|grass|green|life|world|nature|sun|gold|light|shine|sky|grow|生|草|绿|树|光|阳|天/)) {
    return {
      baseColor: [0.2, 0.9, 0.4], // Neon Green
      secondaryColor: [1.0, 0.9, 0.2], // Gold
      turbulence: 0.35,
      speed: 1.0,
      description: "NATURE"
    };
  }

  // 5. DARKNESS / MYSTERY / SPACE (Dark Purple/Black, Deep)
  if (t.match(/dark|night|black|shadow|space|star|moon|deep|fear|lost|void|dream|暗|夜|黑|影|星|月|深|梦/)) {
    return {
      baseColor: [0.4, 0.1, 0.8], // Deep Purple
      secondaryColor: [0.0, 0.0, 0.1], // Black/Blue
      turbulence: 0.5,
      speed: 0.6,
      description: "MYSTERY"
    };
  }

  return DEFAULT_SENTIMENT;
};