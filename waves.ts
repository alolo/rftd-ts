export interface WaveConfig {
  enemyType: string; // 'runner', 'tank', 'boss', 'immune'
  count: number;
  spawnInterval: number; // в миллисекундах
  prepTime: number; // в секундах
  postPause: number; // в секундах
  hpMultiplier: number; // Множитель здоровья для этой волны
}

// Автоматический генератор 40 волн
function generateWaves(): WaveConfig[] {
  const waves: WaveConfig[] = [];

  for (let i = 1; i <= 40; i++) {
    // Плавный экспоненциальный рост ХП для ОБЫЧНЫХ мобов (на 15% за каждую волну)
    let baseHpMult = Math.pow(1.15, i - 1);

    let type = "normal";
    let count = 20;
    let interval = 800;
    let mult = baseHpMult;

    // Каждая 10-я волна - БОСС (1 жирный моб)
    if (i % 10 === 0) {
      type = "boss";
      count = 1;
      interval = 1000;

      // Жестко задаем множители ХП для боссов (Базовое ХП босса = 1000)
      if (i === 10)
        mult = 10; // 10 * 1000 = 10 000 ХП
      else if (i === 20)
        mult = 40; // 40 * 1000 = 40 000 ХП
      else if (i === 30)
        mult = 130; // 130 * 1000 = 130 000 ХП
      else if (i === 40)
        mult = 440; // 440 * 1000 = 440 000 ХП
      else mult = baseHpMult * 1.75; // Запас на случай добавления 50+ волн
    }
    // 9, 19, 29, 39 волны - ИММУННЫЕ (не замедляются)
    else if (i % 10 === 9) {
      type = "immune";
      count = 25;
      interval = 600;
      mult = baseHpMult * 0.8; // Чуть меньше ХП, но не контрятся льдом
    }
    // Случайное разнообразие для остальных волн
    else if (i % 10 === 7) {
      type = "tank"; // Медленные, но жирные
      count = 15;
      interval = 1200;
      mult = baseHpMult * 0.9;
    } else if (i % 10 === 6) {
      type = "runner"; // Быстрые
      count = 30;
      interval = 500;
      mult = baseHpMult * 0.6;
    }

    waves.push({
      enemyType: type,
      count: count,
      spawnInterval: interval,
      prepTime: i === 1 ? 40 : 20,
      postPause: 20,
      hpMultiplier: mult,
    });
  }
  return waves;
}

export const WAVES_CONFIG: WaveConfig[] = generateWaves();

export class WaveManager {
  public state: "menu" | "prep" | "wave" = "menu";
  public currentWaveIndex: number = 0;
  public spawnedMobsCount: number = 0;

  public get currentWave(): WaveConfig {
    return WAVES_CONFIG[this.currentWaveIndex];
  }

  public get totalWaves(): number {
    return WAVES_CONFIG.length;
  }

  public startNewGame() {
    this.state = "prep";
    this.currentWaveIndex = 0;
    this.spawnedMobsCount = 0;
  }

  public startWave() {
    this.state = "wave";
    this.spawnedMobsCount = 0;
  }

  public nextWave() {
    this.state = "prep";
    this.currentWaveIndex++;
  }

  public isVictory(): boolean {
    return this.currentWaveIndex >= WAVES_CONFIG.length;
  }
}
