import * as Phaser from "phaser";
import type { MainScene } from "./main";
import type { Crop } from "./Crop";
import { Tower, TOWER_DICTIONARY } from "./tower";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  isSecret: boolean;
  secretHint?: string;
  isCompleted: boolean;
  rewardWood?: number;
  rewardGold?: number;
  checkCondition?: (sys: AchievementSystem, scene: MainScene) => boolean;
}

export class AchievementSystem {
  private scene: MainScene;
  public list: Achievement[] = [];
  public hasUnseen: boolean = false;

  public rouletteLosses: number = 0;
  public towersSoldThisWave: number = 0;

  public lastBuiltTowerStr: string | null = null;
  public consecutiveSameTowers: number = 0;

  public baseHasTakenDamage: boolean = false;
  public wavesPassedWithoutDamage: number = 0;

  public dailyTowerTier1Variant: number = 1;
  public dailyTowerTier3Variant: number = 1;

  public soldTowersStats: Record<string, number> = {};

  constructor(scene: MainScene) {
    this.scene = scene;
    this.initAchievements();
  }

  private initAchievements() {
    this.list = [
      {
        id: "unlucky_luck",
        name: "Удачная неудача",
        description: "Поймать 4 раза неудачу в рулетке подряд",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
      },
      {
        id: "vegetable_soup",
        name: "Овощной суп",
        description: "Посадить одновременно 3 картофеля, 3 лука и 3 ананаса",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
        checkCondition: (sys, scene) => {
          let p = 0,
            o = 0,
            a = 0;
          const grid = scene.getGrid();
          for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
              const entity = grid[y][x];
              if (entity && "isCrop" in entity) {
                if ((entity as Crop).type === "potato") p++;
                else if ((entity as Crop).type === "onion") o++;
                else if ((entity as Crop).type === "pineapple") a++;
              }
            }
          }
          return p >= 3 && o >= 3 && a >= 3;
        },
      },
      {
        id: "veggie_magnate",
        name: "Овощной магнат",
        description: "Посадить одновременно 20 грядок",
        isSecret: false,
        isCompleted: false,
        rewardWood: 30,
        checkCondition: (sys, scene) => {
          let totalCrops = 0;
          const grid = scene.getGrid();
          for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
              const entity = grid[y][x];
              if (entity && "isCrop" in entity) totalCrops++;
            }
          }
          return totalCrops >= 20;
        },
      },
      {
        id: "great_start",
        name: "Отличное начало",
        description: "Построить все уникальные башни 1-го уровня (7)",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
        checkCondition: (sys, scene) => {
          const tier1Towers = new Set(
            scene
              .getActiveTowers()
              .filter((t) => t.level === 1)
              .map((t) => t.variant),
          );
          return tier1Towers.size >= 7;
        },
      },
      {
        id: "armor_piercing",
        name: "Бронебойный",
        description: "Пройти 15 волн, не потратив ни одной жизни",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
      },
      {
        id: "near_death",
        name: "На грани смерти",
        description: "Остаться в игре с 3-мя жизнями",
        isSecret: false,
        isCompleted: false,
        rewardWood: 50,
      },
      {
        id: "groundhog_day_1",
        name: "День сурка 1",
        description: "Построить 7 башен дня 1-го уровня",
        isSecret: false,
        isCompleted: false,
        rewardWood: 40,
        checkCondition: (sys, scene) => {
          const count = scene
            .getActiveTowers()
            .filter(
              (t) => t.level === 1 && t.variant === sys.dailyTowerTier1Variant,
            ).length;
          return count >= 7;
        },
      },
      {
        id: "repeat_please",
        name: "Повторим?",
        description: "Собрать все 7 уникальных башен 2-го уровня (7)",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
        checkCondition: (sys, scene) => {
          const tier2Towers = new Set(
            scene
              .getActiveTowers()
              .filter((t) => t.level === 2)
              .map((t) => t.variant),
          );
          return tier2Towers.size >= 7;
        },
      },
      {
        id: "groundhog_day_2",
        name: "День сурка 2",
        description: "Построить 6 башен дня 3-го уровня",
        isSecret: false,
        isCompleted: false,
        rewardWood: 30,
        checkCondition: (sys, scene) => {
          const count = scene
            .getActiveTowers()
            .filter(
              (t) => t.level === 3 && t.variant === sys.dailyTowerTier3Variant,
            ).length;
          return count >= 6;
        },
      },
      {
        id: "first_place",
        name: "Первый!",
        description: "Построить башню 6-го уровня до 15-й волны",
        isSecret: false,
        isCompleted: false,
        rewardWood: 40,
      },
      {
        id: "speedshooter",
        name: "Скорострел!",
        description: "Построить башню 5-го уровня до 12-й волны",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
      },
      {
        id: "secret_1",
        name: "Скрытый квест 1",
        description: 'Собрать все башни "Башня"',
        isSecret: true,
        secretHint: "Построй 3 определенные башни (одного типа)",
        isCompleted: false,
        rewardWood: 20,
        checkCondition: (sys, scene) => {
          const has1 = scene
            .getActiveTowers()
            .some((t) => t.level === 1 && t.variant === 1);
          const has2 = scene
            .getActiveTowers()
            .some((t) => t.level === 2 && t.variant === 5);
          const has3 = scene
            .getActiveTowers()
            .some((t) => t.level === 3 && t.variant === 4);
          return has1 && has2 && has3;
        },
      },
      {
        id: "lets_fly",
        name: "Полетели?",
        description: "Собрать все летающие башни (5)",
        isSecret: false,
        isCompleted: false,
        rewardWood: 40,
        checkCondition: (sys, scene) => {
          const req = ["2-1", "3-6", "4-7", "5-1", "5-4"];
          const current = new Set(
            scene.getActiveTowers().map((t) => `${t.level}-${t.variant}`),
          );
          return req.every((id) => current.has(id));
        },
      },
      {
        id: "sculptor",
        name: "Скульптор",
        description: "Собрать на поле все статуи (2)",
        isSecret: false,
        isCompleted: false,
        rewardWood: 10,
        checkCondition: (sys, scene) => {
          const req = ["6-7", "6-21"];
          const current = new Set(
            scene.getActiveTowers().map((t) => `${t.level}-${t.variant}`),
          );
          return req.every((id) => current.has(id));
        },
      },
      {
        id: "otherworldly_voice",
        name: "Потусторонний голос",
        description: "Собрать все призрачные башни (5)",
        isSecret: false,
        isCompleted: false,
        rewardWood: 50,
        checkCondition: (sys, scene) => {
          const req = ["1-6", "5-1", "6-11", "6-13", "6-19"];
          const current = new Set(
            scene.getActiveTowers().map((t) => `${t.level}-${t.variant}`),
          );
          return req.every((id) => current.has(id));
        },
      },
      {
        id: "not_that",
        name: "Совсем не то?",
        description: "Продать одну и ту же башню 5 раз за игру",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
      },
      {
        id: "secret_2",
        name: "Скрытый квест 2",
        description: "Продай одномоментно стак из 60+ овощей",
        isSecret: true,
        secretHint: "Столько копил и наконец продал",
        isCompleted: false,
        rewardWood: 30,
      },
      {
        id: "secret_3",
        name: "Скрытый квест 3",
        description: "Продай любую башню 6-го уровня",
        isSecret: true,
        secretHint: "Я получил мощь, которая и не снилась моему отцу!",
        isCompleted: false,
        rewardWood: 20,
      },
      {
        id: "lucky_one",
        name: "Везунчик",
        description: "Построить 4 раза подряд одну и ту же башню",
        isSecret: false,
        isCompleted: false,
        rewardWood: 20,
      },
      {
        id: "psycho",
        name: "Психанул",
        description: "Продано 5 башен за одну волну",
        isSecret: true,
        secretHint: "Массовая распродажа! Уииии!",
        isCompleted: false,
        rewardWood: 30,
      },
      {
        id: "slumdog_millionaire",
        name: "Миллионер из трущоб",
        description: "Накопить 8000 золота",
        isSecret: false,
        isCompleted: false,
        rewardWood: 50,
        checkCondition: (sys, scene) => scene.economy.gold >= 8000,
      },
    ];
  }

  public unlock(id: string) {
    const ach = this.list.find((a) => a.id === id);
    if (!ach || ach.isCompleted) return;

    ach.isCompleted = true;
    this.hasUnseen = true;

    if (ach.rewardWood) this.scene.economy.addWood(ach.rewardWood);
    if (ach.rewardGold) this.scene.economy.addGold(ach.rewardGold);

    this.scene.showNotification(`🏆 Выполнено: ${ach.name}!`);

    this.scene.woodText.setText(`: ${this.scene.economy.wood}`);
    this.scene.goldText.setText(`: ${this.scene.economy.gold}`);

    this.scene.refreshAchievementsDot();
  }

  public markAllSeen() {
    this.hasUnseen = false;
  }

  public resetSession() {
    this.list.forEach((a) => (a.isCompleted = false));

    this.rouletteLosses = 0;
    this.towersSoldThisWave = 0;
    this.lastBuiltTowerStr = null;
    this.consecutiveSameTowers = 0;
    this.soldTowersStats = {};
    this.baseHasTakenDamage = false;
    this.wavesPassedWithoutDamage = 0;
    this.hasUnseen = false;

    this.randomizeDailyTowers();
  }

  private randomizeDailyTowers() {
    this.dailyTowerTier1Variant = Phaser.Math.Between(1, 7);
    this.dailyTowerTier3Variant = Phaser.Math.Between(1, 7);

    const name1 =
      TOWER_DICTIONARY[1][this.dailyTowerTier1Variant]?.name ||
      `Башня 1-${this.dailyTowerTier1Variant}`;
    const name3 =
      TOWER_DICTIONARY[3][this.dailyTowerTier3Variant]?.name ||
      `Башня 3-${this.dailyTowerTier3Variant}`;

    const groundhog1 = this.list.find((a) => a.id === "groundhog_day_1");
    if (groundhog1) {
      groundhog1.description = `Построить 7 одинаковых башен "${name1}"`;
    }

    const groundhog2 = this.list.find((a) => a.id === "groundhog_day_2");
    if (groundhog2) {
      groundhog2.description = `Построить 6 одинаковых башен "${name3}"`;
    }
  }

  public checkPassiveConditions() {
    for (const ach of this.list) {
      if (!ach.isCompleted && ach.checkCondition) {
        if (ach.checkCondition(this, this.scene)) {
          this.unlock(ach.id);
        }
      }
    }
  }
}
