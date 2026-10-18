import * as Phaser from "phaser";

export type CropType = "potato" | "onion" | "pineapple";

export class EconomyManager {
  public gold: number = 500;
  public wood: number = 0;
  public medals: number = 0;

  // --- НОВЫЕ ПЕРЕМЕННЫЕ ---
  public freeTowerCharges: number = 0;
  public freeRouletteSpins: number = 0;

  // 📈 Счетчик посаженных грядок для динамической цены
  public cropsPlanted: Record<CropType, number> = {
    potato: 0,
    onion: 0,
    pineapple: 0,
  };
  // -------------------------

  public damageUpgrades: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
  };
  public globalDamageBuff: number = 0;
  public cropPriceBonus: number = 1.0;

  public readonly COST_CHEAP = 100;
  public readonly COST_EXP = 850;

  public readonly CROP_COST: Record<CropType, number> = {
    potato: 10,
    onion: 10,
    pineapple: 10,
  };

  public readonly BASE_CROP_PRICE: Record<CropType, number> = {
    potato: 40,
    onion: 40,
    pineapple: 40,
  };

  public marketPrices: Record<CropType, number> = {
    potato: 10,
    onion: 10,
    pineapple: 10,
  };

  public currentFluctuations: Record<CropType, number> = {
    potato: 1.0,
    onion: 1.0,
    pineapple: 1.0,
  };

  constructor() {
    this.reset();
  }

  public reset() {
    this.gold = 500;
    this.wood = 0;
    this.medals = 0;
    this.freeTowerCharges = 0;
    this.freeRouletteSpins = 0;

    // Сбрасываем счетчик грядок в начале игры
    this.cropsPlanted = { potato: 0, onion: 0, pineapple: 0 };

    this.damageUpgrades = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    this.globalDamageBuff = 0;
    this.cropPriceBonus = 1.0;

    this.rollMarketFluctuations();
  }

  // 🧮 НОВЫЙ МЕТОД: Считаем базовую цену с учетом бонуса за массовую посадку
  public getDynamicBasePrice(type: CropType): number {
    const base = this.BASE_CROP_PRICE[type] * this.cropPriceBonus;
    const count = this.cropsPlanted[type] || 0;

    let bonusPct = 0;
    const thresholds = [15, 30, 45, 60, 75, 90];
    for (const t of thresholds) {
      if (count >= t) bonusPct += 0.05; // +5% за каждый порог
    }

    return base * (1 + bonusPct);
  }

  public rollMarketFluctuations() {
    // Колебания от 80% до 150%
    this.currentFluctuations.potato = Phaser.Math.FloatBetween(0.8, 1.5);
    this.currentFluctuations.onion = Phaser.Math.FloatBetween(0.8, 1.5);
    this.currentFluctuations.pineapple = Phaser.Math.FloatBetween(0.8, 1.5);

    this.updateMarketPrices();
  }

  public updateMarketPrices() {
    // Теперь умножаем колебания на ДИНАМИЧЕСКУЮ базу
    this.marketPrices.potato = Math.floor(
      this.getDynamicBasePrice("potato") * this.currentFluctuations.potato,
    );
    this.marketPrices.onion = Math.floor(
      this.getDynamicBasePrice("onion") * this.currentFluctuations.onion,
    );
    this.marketPrices.pineapple = Math.floor(
      this.getDynamicBasePrice("pineapple") *
        this.currentFluctuations.pineapple,
    );
  }

  // --- ТРАНЗАКЦИИ ---
  public spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      return true;
    }
    return false;
  }

  public addGold(amount: number) {
    this.gold += amount;
  }

  public spendWood(amount: number): boolean {
    if (this.wood >= amount) {
      this.wood -= amount;
      return true;
    }
    return false;
  }

  public addWood(amount: number) {
    this.wood += amount;
  }

  public spendMedals(amount: number): boolean {
    if (this.medals >= amount) {
      this.medals -= amount;
      return true;
    }
    return false;
  }

  public addMedals(amount: number) {
    this.medals += amount;
  }
}
