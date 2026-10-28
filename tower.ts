import * as Phaser from "phaser";
import { Enemy } from "./enemies/enemy";

export const TOWER_DICTIONARY: Record<
  number,
  Record<
    number,
    {
      name: string;
      minDamage: number;
      maxDamage: number;
      range: number;
      fireRate: number;
      desc?: string;
      targetCount?: number;
      splashRadius?: number;
      splashChance?: number;
      splashDamage?: number;
      slowPct?: number;
      slowDuration?: number;
      poisonChance?: number;
      poisonDamage?: number;
      auraRadius?: number;
      auraSpeedBuff?: number;
      skeletonChance?: number;
      chainChance?: number;
      chainTargets?: number;
      chainDamage?: number;
      bounceTargets?: number;
      owlBuffChance?: number;
      mineChance?: number;
      mineDamage?: number;
      mineRadius?: number;
      mineTargetMode?: "random" | "target";
      auraEnemySlowPct?: number;
      auraEnemySlowRadius?: number;
      critChance?: number;
      critMultiplier?: number;
      selfBuffChance?: number;
      selfBuffMultiplier?: number;
      selfBuffDuration?: number;
      stunChance?: number;
      stunDuration?: number;
      stunRadius?: number;
      stunDamage?: number;
      stunAroundTower?: boolean;
      stunExtraDmgPctNormal?: number;
      stunExtraDmgPctBoss?: number;
      zoneChance?: number;
      zoneRadius?: number;
      zoneDuration?: number;
      zoneDmgPerSec?: number;
      zoneSlowPct?: number;
      zoneColor?: number;
      waveChance?: number;
      waveDamage?: number;
      waveLength?: number;
      waveWidth?: number;
      bonusDamageChance?: number;
      bonusDamageAmount?: number;
      randomTargetChance?: number;
      randomTargetCount?: number;
      randomTargetDamage?: number;
      randomTargetRange?: number;
      pulseChance?: number;
      pulseRadius?: number;
      pulseDamage?: number;
      pulseCount?: number;
      nextAttackBuffChance?: number;
      nextAttackBuffRange?: number;
      nextAttackBuffDamage?: number;
      damageType?: number;
    }
  >
> = {
  1: {
    1: {
      name: "Стрелковая башня",
      damageType: 3,
      minDamage: 20,
      maxDamage: 20,
      range: 180,
      fireRate: 800,
    },
    2: {
      name: "Грут",
      damageType: 5,
      minDamage: 50,
      maxDamage: 50,
      range: 180,
      fireRate: 1700,
    },
    3: {
      name: "Пони",
      damageType: 1,
      minDamage: 20,
      maxDamage: 20,
      range: 180,
      fireRate: 800,
    },
    4: {
      name: "Мурлок",
      damageType: 4,
      minDamage: 19,
      maxDamage: 19,
      range: 180,
      fireRate: 780,
    },
    5: {
      name: "Гоблин",
      damageType: 7,
      minDamage: 23,
      maxDamage: 23,
      range: 180,
      fireRate: 1000,
    },
    6: {
      name: "Призрак",
      damageType: 6,
      minDamage: 17,
      maxDamage: 17,
      range: 200,
      fireRate: 1000,
    },
    7: {
      name: "Лягушка",
      damageType: 2,
      minDamage: 6,
      maxDamage: 6,
      range: 250,
      fireRate: 700,
      desc: "Мультиатака на 3 юнита",
      targetCount: 3,
    },
  },
  2: {
    1: {
      name: "Курица",
      damageType: 1,
      minDamage: 15,
      maxDamage: 15,
      range: 180,
      fireRate: 450,
    },
    2: {
      name: "Черепаха",
      damageType: 3,
      minDamage: 43,
      maxDamage: 43,
      range: 180,
      fireRate: 900,
    },
    3: {
      name: "Дриада",
      damageType: 2,
      minDamage: 18,
      maxDamage: 18,
      range: 180,
      fireRate: 500,
    },
    4: {
      name: "Сирена",
      damageType: 4,
      minDamage: 40,
      maxDamage: 40,
      range: 280,
      fireRate: 1100,
    },
    5: {
      name: "Защитная башня",
      damageType: 6,
      minDamage: 50,
      maxDamage: 50,
      range: 160,
      fireRate: 1000,
    },
    6: {
      name: "Наездник",
      damageType: 5,
      minDamage: 55,
      maxDamage: 55,
      range: 160,
      fireRate: 1000,
    },
    7: {
      name: "Сапёр",
      damageType: 7,
      minDamage: 60,
      maxDamage: 60,
      range: 160,
      fireRate: 1050,
      desc: "5% шанс кинуть мину (урон 50, аое 100px)",
      mineChance: 0.05,
      mineDamage: 50,
      mineRadius: 100,
      mineTargetMode: "random",
    },
  },
  3: {
    1: {
      name: "Овечка",
      damageType: 4,
      minDamage: 45,
      maxDamage: 45,
      range: 250,
      fireRate: 700,
      desc: "Мультиатака на 4 юнита",
      targetCount: 4,
    },
    2: {
      name: "Индюк",
      damageType: 2,
      minDamage: 130,
      maxDamage: 130,
      range: 200,
      fireRate: 1000,
    },
    3: {
      name: "Снеговик",
      damageType: 7,
      minDamage: 190,
      maxDamage: 190,
      range: 165,
      fireRate: 1000,
      desc: "Замедляет мобов на 8% на 2 сек",
      slowPct: 8,
      slowDuration: 2000,
    },
    4: {
      name: "Осадная башня",
      damageType: 1,
      minDamage: 135,
      maxDamage: 135,
      range: 250,
      fireRate: 1200,
    },
    5: {
      name: "Охотница",
      damageType: 6,
      minDamage: 65,
      maxDamage: 65,
      range: 200,
      fireRate: 1000,
      desc: "Отскок атаки на 3 цели",
      bounceTargets: 3,
    },
    6: {
      name: "Дирижабль, ага",
      damageType: 3,
      minDamage: 180,
      maxDamage: 180,
      range: 250,
      fireRate: 1600,
      desc: "Сплеш 100px",
      splashRadius: 100,
    },
    7: {
      name: "Краб",
      damageType: 5,
      minDamage: 65,
      maxDamage: 65,
      range: 140,
      fireRate: 600,
    },
  },
  4: {
    1: {
      name: "Гигант",
      damageType: 1,
      minDamage: 245,
      maxDamage: 245,
      range: 200,
      fireRate: 1200,
      desc: "8% шанс ударить сплешем 150px и нанести 350 урона",
      splashRadius: 150,
      splashChance: 0.08,
      splashDamage: 350,
    },
    2: {
      name: "Обелиск",
      damageType: 4,
      minDamage: 365,
      maxDamage: 365,
      range: 200,
      fireRate: 1400,
      desc: "Добавляет скорость атаки для соседних башен на 10% в радиусе 256px",
      auraRadius: 256,
      auraSpeedBuff: 0.1,
    },
    3: {
      name: "Пулемёт",
      damageType: 2,
      minDamage: 12,
      maxDamage: 12,
      range: 170,
      fireRate: 50,
      desc: "3% шанс нанести 600% урона",
      critChance: 0.03,
      critMultiplier: 6,
    },
    4: {
      name: "Лёд",
      damageType: 7,
      minDamage: 315,
      maxDamage: 315,
      range: 200,
      fireRate: 1200,
      desc: "замедляет мобов на 20% на 3 сек",
      slowPct: 20,
      slowDuration: 3000,
    },
    5: {
      name: "Корова",
      damageType: 6,
      minDamage: 210,
      maxDamage: 210,
      range: 210,
      fireRate: 1200,
      desc: "Замедление врагов на 12% в радиусе 192px",
      auraEnemySlowPct: 12,
      auraEnemySlowRadius: 160,
    },
    6: {
      name: "Катапульта",
      damageType: 3,
      minDamage: 175,
      maxDamage: 175,
      range: 300,
      fireRate: 1500,
      splashRadius: 100,
      desc: "Сплеш 100px",
    },
    7: {
      name: "Сова",
      damageType: 5,
      minDamage: 60,
      maxDamage: 60,
      range: 300,
      fireRate: 800,
      desc: "10% шанс на цепную молнию (6 целей, урон 100)",
      chainChance: 0.1,
      chainTargets: 6,
      chainDamage: 100,
    },
  },
  5: {
    1: {
      name: "Призрачная сова",
      damageType: 6,
      minDamage: 910,
      maxDamage: 910,
      range: 200,
      fireRate: 1000,
      desc: "30% шанс дать случайной башне +20% скор. атаки",
      owlBuffChance: 0.3,
    },
    2: {
      name: "Молот",
      damageType: 3,
      minDamage: 790,
      maxDamage: 790,
      range: 250,
      fireRate: 1200,
      desc: "Шанс 5% оглушить мобов в радиусе 192px от башни на 2.5с (урон 50)",
      stunChance: 0.05,
      stunRadius: 192,
      stunDamage: 50,
      stunDuration: 2500,
      stunAroundTower: true,
    },
    3: {
      name: "Свинка",
      damageType: 4,
      minDamage: 650,
      maxDamage: 650,
      range: 250,
      fireRate: 1200,
      desc: "10% шанс выпустить волну (300 урона, 96x256px)",
      waveChance: 0.1,
      waveDamage: 300,
      waveLength: 256,
      waveWidth: 96,
    },
    4: {
      name: "Летающий змей",
      damageType: 7,
      minDamage: 400,
      maxDamage: 400,
      range: 200,
      fireRate: 1200,
      desc: "15% шанс нанести 400 урона 4 случайным целям",
      randomTargetChance: 0.15,
      randomTargetCount: 4,
      randomTargetDamage: 400,
      randomTargetRange: 0,
    },
    5: {
      name: "Минный завод",
      damageType: 1,
      minDamage: 465,
      maxDamage: 465,
      range: 250,
      fireRate: 1800,
      desc: "15% шанс кинуть мину (урон 300, аое 128px)",
      mineChance: 0.15,
      mineDamage: 300,
      mineRadius: 128,
      mineTargetMode: "random",
    },
    6: {
      name: "Замок",
      damageType: 5,
      minDamage: 700,
      maxDamage: 700,
      range: 180,
      fireRate: 1000,
      desc: "Добавляет скорость атаки для соседних башен на 12% в радиусе 256px",
      auraRadius: 256,
      auraSpeedBuff: 0.12,
    },
    7: {
      name: "Скорпион",
      damageType: 2,
      minDamage: 940,
      maxDamage: 940,
      range: 180,
      fireRate: 1200,
      desc: "15% шанс отравить цель на 4 сек (2сек если босс) (200ур/сек)",
      poisonChance: 0.15,
      poisonDamage: 200,
    },
  },
  6: {
    1: {
      name: "Камень душ",
      damageType: 1,
      minDamage: 630,
      maxDamage: 630,
      range: 200,
      fireRate: 400,
      desc: "3% шанс нанести 500% урона",
      critChance: 0.03,
      critMultiplier: 5,
    },
    2: {
      name: "Врата ада",
      damageType: 7,
      minDamage: 1602,
      maxDamage: 1602,
      range: 200,
      fireRate: 1200,
      desc: "30% шанс выпустить волну (275 урона, 128x300px)",
      waveChance: 0.3,
      waveDamage: 275,
      waveLength: 300,
      waveWidth: 128,
    },
    3: {
      name: "Врата боли",
      damageType: 2,
      minDamage: 1855,
      maxDamage: 1855,
      range: 200,
      fireRate: 1300,
      desc: "5% шанс взорвать землю под целью (80px, 4с, 200 ур/сек)",
      zoneChance: 0.05,
      zoneRadius: 80,
      zoneDuration: 4000,
      zoneDmgPerSec: 200,
      zoneColor: 0x8b0000,
    },
    4: {
      name: "Глыба льда",
      damageType: 4,
      minDamage: 2005,
      maxDamage: 2005,
      range: 200,
      fireRate: 1200,
      desc: "10% шанс вызвать 5 волн ударов (256px, 175 урона/волна)",
      pulseChance: 0.1,
      pulseRadius: 256,
      pulseDamage: 175,
      pulseCount: 5,
    },
    5: {
      name: "Цитадель тьмы",
      damageType: 7,
      minDamage: 2520,
      maxDamage: 2520,
      range: 180,
      fireRate: 1300,
      desc: "50% шанс призвать скелета, после убийства моба",
      skeletonChance: 0.5,
    },
    6: {
      name: "Сгусток магии",
      damageType: 4,
      minDamage: 1345,
      maxDamage: 1345,
      range: 250,
      fireRate: 1000,
      desc: "10% шанс повысить скор. атаки на 200% на 3с",
      selfBuffChance: 0.1,
      selfBuffMultiplier: 2,
      selfBuffDuration: 3000,
    },
    7: {
      name: "Магическая статуя",
      damageType: 1,
      minDamage: 891,
      maxDamage: 891,
      range: 250,
      fireRate: 650,
      desc: "10% шанс оглушить моба на 2.5с и нанести +15% урона мобу либо 5% боссу",
      stunChance: 0.1,
      stunDuration: 2500,
      stunExtraDmgPctNormal: 0.15,
      stunExtraDmgPctBoss: 0.05,
    },
    8: {
      name: "Шаровая молния",
      damageType: 4,
      minDamage: 1406,
      maxDamage: 1406,
      range: 200,
      fireRate: 1000,
      desc: "15% шанс оглушить врагов в радиусе 156px на 0.5с (урон 250)",
      stunChance: 0.15,
      stunRadius: 156,
      stunDamage: 250,
      stunDuration: 500,
    },
    9: {
      name: "Высший демон",
      damageType: 7,
      minDamage: 1491,
      maxDamage: 1491,
      range: 180,
      fireRate: 1200,
      desc: "20% шанс нанести случайному мобу двойной урон",
      randomTargetChance: 0.2,
      randomTargetCount: 1,
      randomTargetDamage: 2982,
      randomTargetRange: 0,
    },
    10: {
      name: "Король вампиров",
      damageType: 2,
      minDamage: 1067,
      maxDamage: 1067,
      range: 200,
      fireRate: 1000,
      desc: "10% шанс нанести 600 урона врагам в радиусе 140px",
      pulseChance: 0.1,
      pulseRadius: 140,
      pulseDamage: 600,
      pulseCount: 1,
    },
    11: {
      name: "Дух леса",
      damageType: 5,
      minDamage: 1905,
      maxDamage: 1905,
      range: 200,
      fireRate: 1300,
      desc: "10% шанс увеличить дальность (+150px) и урон (+450) следующей атаки",
      nextAttackBuffChance: 0.1,
      nextAttackBuffRange: 150,
      nextAttackBuffDamage: 450,
    },
    12: {
      name: "Монетка",
      damageType: 1,
      minDamage: 520,
      maxDamage: 520,
      range: 200,
      fireRate: 500,
      desc: "5% шанс на цепную молнию (10 целей, урон 400)",
      chainChance: 0.05,
      chainTargets: 10,
      chainDamage: 400,
    },
    13: {
      name: "Король Душ",
      damageType: 5,
      minDamage: 1731,
      maxDamage: 1731,
      range: 200,
      fireRate: 1000,
      desc: "5% шанс нанести 3000 доп. урона цели",
      bonusDamageChance: 0.05,
      bonusDamageAmount: 3000,
    },
    14: {
      name: "Ифрит",
      damageType: 3,
      minDamage: 1734,
      maxDamage: 1734,
      range: 200,
      fireRate: 1200,
      desc: "10% шанс поджечь землю (80px, 5с, 250 ур/сек)",
      zoneChance: 0.1,
      zoneRadius: 80,
      zoneDuration: 5000,
      zoneDmgPerSec: 250,
      zoneColor: 0xff4400,
    },
    15: {
      name: "Король гномов",
      damageType: 6,
      minDamage: 2186,
      maxDamage: 2186,
      range: 180,
      fireRate: 1300,
      desc: "20% шанс оглушить мобов вокруг башни (128px) на 0.5с (урон 200)",
      stunChance: 0.2,
      stunRadius: 128,
      stunDamage: 200,
      stunDuration: 500,
      stunAroundTower: true,
    },
    16: {
      name: "Рыцарь-Герой",
      damageType: 5,
      minDamage: 1971,
      maxDamage: 1971,
      range: 180,
      fireRate: 1100,
      desc: "10% шанс нанести 500 доп. урона цели",
      bonusDamageChance: 0.1,
      bonusDamageAmount: 500,
    },
    17: {
      name: "Черная Дыра",
      damageType: 6,
      minDamage: 1456,
      maxDamage: 1456,
      range: 220,
      fireRate: 1000,
      desc: "10% шанс открыть черную дыру (80px, 7с, замедление 50% - в центре дыры)",
      zoneChance: 0.1,
      zoneRadius: 80,
      zoneDuration: 7000,
      zoneSlowPct: 50,
      zoneColor: 0x220033,
    },
    18: {
      name: "Мировое древо",
      damageType: 2,
      minDamage: 2206,
      maxDamage: 2206,
      range: 200,
      fireRate: 1200,
      desc: "10% шанс опутать моба на 2с и нанести 200 урона",
      stunChance: 0.1,
      stunDuration: 2000,
      stunDamage: 200,
    },
    19: {
      name: "Призрачный маг",
      damageType: 6,
      minDamage: 1861,
      maxDamage: 1861,
      range: 180,
      fireRate: 1000,
      desc: "15% шанс атаковать 6 мобов и нанести 300 урона",
      randomTargetChance: 0.15,
      randomTargetCount: 6,
      randomTargetDamage: 300,
      randomTargetRange: 256,
    },
    20: {
      name: "Алтарь смерти",
      damageType: 3,
      minDamage: 2751,
      maxDamage: 2751,
      range: 220,
      fireRate: 1600,
      desc: "5% шанс нанести 1500 доп. урона цели",
      bonusDamageChance: 0.05,
      bonusDamageAmount: 1500,
    },
    21: {
      name: "Статуя бога Яда",
      damageType: 3,
      minDamage: 1886,
      maxDamage: 1886,
      range: 200,
      fireRate: 1000,
      desc: "10% шанс вызвать ядовитое облако (80px, 5с, замедление 10% + 100ур/сек)",
      zoneChance: 0.1,
      zoneRadius: 80,
      zoneDuration: 5000,
      zoneDmgPerSec: 100,
      zoneSlowPct: 10,
      zoneColor: 0x00ff33,
    },
  },
};

export class Tower {
  public level: number;
  public variant: number;
  public targetMode: number = 0;
  public col: number;
  public row: number;
  public damageType: number;

  public static readonly DAMAGE_TYPES = [
    "Неизвестно", // 0
    "Обычный", // 1
    "Колющий", // 2
    "Осадный", // 3
    "Магический", // 4
    "Героический", // 5
    "Свет", // 6
    "Тьма", // 7
  ];

  public towerName: string;
  private minDamage: number;
  private maxDamage: number;
  public specialDesc: string | null = null;
  private targetCount: number;
  public splashRadius: number;
  private splashChance: number;
  private splashDamage: number;
  private slowPct: number;
  private slowDuration: number;
  private poisonChance: number;
  private poisonDamage: number;
  private skeletonChance: number;
  private chainChance: number;
  private chainTargets: number;
  private chainDamage: number;
  private bounceTargets: number;
  private owlBuffChance: number;
  public isOwlBuffed: boolean = false;
  private owlBuffTimer: Phaser.Time.TimerEvent | null = null;
  private buffVisual: Phaser.GameObjects.Text | null = null;
  private mineChance: number;
  private mineDamage: number;
  public mineRadius: number;
  private mineTargetMode: "random" | "target";
  public auraEnemySlowPct: number;
  public auraEnemySlowRadius: number;
  private critChance: number;
  private critMultiplier: number;
  private selfBuffChance: number;
  private selfBuffMultiplier: number;
  private selfBuffDuration: number;
  public isSelfBuffed: boolean = false;
  private selfBuffTimer: Phaser.Time.TimerEvent | null = null;
  private selfBuffVisual: Phaser.GameObjects.Graphics | null = null;
  private stunChance: number;
  private stunDuration: number;
  public stunRadius: number;
  private stunDamage: number;
  public stunAroundTower: boolean;
  private stunExtraDmgPctNormal: number;
  private stunExtraDmgPctBoss: number;
  private zoneChance: number;
  public zoneRadius: number;
  private zoneDuration: number;
  private zoneDmgPerSec: number;
  private zoneSlowPct: number;
  private zoneColor: number;
  private waveChance: number;
  private waveDamage: number;
  public waveLength: number;
  public waveWidth: number;
  private bonusDamageChance: number;
  private bonusDamageAmount: number;
  private randomTargetChance: number;
  private randomTargetCount: number;
  private randomTargetDamage: number;
  public randomTargetRange: number;
  private pulseChance: number;
  public pulseRadius: number;
  private pulseDamage: number;
  private pulseCount: number;
  private nextAttackBuffChance: number;
  private nextAttackBuffRange: number;
  private nextAttackBuffDamage: number;
  public hasNextAttackBuff: boolean = false;
  private towerImage!: Phaser.GameObjects.Image;
  private auraGraphic!: Phaser.GameObjects.Graphics;
  private baseScale: number = 0.5;
  private attackTween: Phaser.Tweens.Tween | null = null;

  private range: number;
  public baseFireRate: number;
  public currentFireRate: number;
  public auraRadius: number;
  public auraSpeedBuff: number;
  private lastFiredTime: number = 0;

  private container: Phaser.GameObjects.Container;
  private scene: Phaser.Scene;
  private cellSize: number;

  public get centerX(): number {
    return this.col * this.cellSize + this.cellSize / 2;
  }
  public get centerY(): number {
    return this.row * this.cellSize + this.cellSize / 2;
  }

  constructor(
    scene: Phaser.Scene,
    col: number,
    row: number,
    level: number,
    variant: number,
    cellSize: number,
  ) {
    this.scene = scene;
    this.col = col;
    this.row = row;
    this.level = level;
    this.variant = variant;
    this.cellSize = cellSize;

    const stats = TOWER_DICTIONARY[level]?.[variant] || {
      name: `T-${level}-${variant}`,
      minDamage: 1,
      maxDamage: 1,
      range: 100,
      fireRate: 1000,
    };

    this.towerName = stats.name;
    this.minDamage = stats.minDamage;
    this.maxDamage = stats.maxDamage;
    this.damageType = (stats as any).damageType || 1;
    this.range = stats.range;
    this.baseFireRate = stats.fireRate;
    this.currentFireRate = this.baseFireRate;
    this.auraRadius = (stats as any).auraRadius || 0;
    this.auraSpeedBuff = (stats as any).auraSpeedBuff || 0;
    this.auraEnemySlowPct = (stats as any).auraEnemySlowPct || 0;
    this.auraEnemySlowRadius = (stats as any).auraEnemySlowRadius || 0;
    this.specialDesc = (stats as any).desc || null;
    this.targetCount = (stats as any).targetCount || 1;
    this.splashRadius = (stats as any).splashRadius || 0;
    this.splashChance = (stats as any).splashChance || 1.0;
    this.splashDamage = (stats as any).splashDamage || 0;
    this.slowPct = (stats as any).slowPct || 0;
    this.slowDuration = (stats as any).slowDuration || 0;
    this.poisonChance = (stats as any).poisonChance || 0;
    this.poisonDamage = (stats as any).poisonDamage || 0;
    this.skeletonChance = (stats as any).skeletonChance || 0;
    this.chainChance = (stats as any).chainChance || 0;
    this.chainTargets = (stats as any).chainTargets || 0;
    this.chainDamage = (stats as any).chainDamage || 0;
    this.bounceTargets = (stats as any).bounceTargets || 0;
    this.owlBuffChance = (stats as any).owlBuffChance || 0;
    this.mineChance = (stats as any).mineChance || 0;
    this.mineDamage = (stats as any).mineDamage || 0;
    this.mineRadius = (stats as any).mineRadius || 0;
    this.mineTargetMode = (stats as any).mineTargetMode || "target";
    this.critChance = (stats as any).critChance || 0;
    this.critMultiplier = (stats as any).critMultiplier || 1;
    this.selfBuffChance = (stats as any).selfBuffChance || 0;
    this.selfBuffMultiplier = (stats as any).selfBuffMultiplier || 1;
    this.selfBuffDuration = (stats as any).selfBuffDuration || 0;
    this.stunChance = (stats as any).stunChance || 0;
    this.stunDuration = (stats as any).stunDuration || 0;
    this.stunRadius = (stats as any).stunRadius || 0;
    this.stunDamage = (stats as any).stunDamage || 0;
    this.stunAroundTower = (stats as any).stunAroundTower || false;
    this.stunExtraDmgPctNormal = (stats as any).stunExtraDmgPctNormal || 0;
    this.stunExtraDmgPctBoss = (stats as any).stunExtraDmgPctBoss || 0;
    this.zoneChance = (stats as any).zoneChance || 0;
    this.zoneRadius = (stats as any).zoneRadius || 0;
    this.zoneDuration = (stats as any).zoneDuration || 0;
    this.zoneDmgPerSec = (stats as any).zoneDmgPerSec || 0;
    this.zoneSlowPct = (stats as any).zoneSlowPct || 0;
    this.zoneColor = (stats as any).zoneColor || 0xffffff;
    this.waveChance = (stats as any).waveChance || 0;
    this.waveDamage = (stats as any).waveDamage || 0;
    this.waveLength = (stats as any).waveLength || 0;
    this.waveWidth = (stats as any).waveWidth || 0;
    this.bonusDamageAmount = (stats as any).bonusDamageAmount || 0;
    this.bonusDamageChance = (stats as any).bonusDamageChance || 0;
    this.randomTargetChance = (stats as any).randomTargetChance || 0;
    this.randomTargetCount = (stats as any).randomTargetCount || 0;
    this.randomTargetDamage = (stats as any).randomTargetDamage || 0;
    this.randomTargetRange = (stats as any).randomTargetRange || 0;
    this.pulseChance = (stats as any).pulseChance || 0;
    this.pulseCount = (stats as any).pulseCount || 0;
    this.pulseDamage = (stats as any).pulseDamage || 0;
    this.pulseRadius = (stats as any).pulseRadius || 0;
    this.nextAttackBuffChance = (stats as any).nextAttackBuffChance || 0;
    this.nextAttackBuffDamage = (stats as any).nextAttackBuffDamage || 0;
    this.nextAttackBuffRange = (stats as any).nextAttackBuffRange || 0;
    this.auraGraphic = scene.add.graphics();
    this.drawAura(false);

    const textureName = `${level}_${variant}`;

    this.towerImage = scene.add.image(
      cellSize / 2,
      cellSize,
      "towers",
      textureName,
    );
    this.towerImage.setOrigin(0.5, 1);
    this.towerImage.setScale(this.baseScale);

    this.container = scene.add.container(col * cellSize, row * cellSize, [
      this.auraGraphic,
      this.towerImage,
    ]);
    this.container.setDepth(5 + row);
  }

  public update(time: number, enemies: Enemy[]) {
    const actualFireRate = this.getFireRate();

    if (time < this.lastFiredTime + actualFireRate) return;

    const targets = this.findTargets(enemies);

    if (targets.length > 0) {
      targets.forEach((target) => this.shoot(target, enemies));
      this.lastFiredTime = time;
    }
  }

  private findTargets(enemies: Enemy[]): Enemy[] {
    let validTargets = enemies.filter((enemy) => {
      if (enemy.isDead) return false;

      const dx = enemy.x - this.centerX;
      const dy = enemy.y - this.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= this.getRange();
    });

    if (validTargets.length === 0) return [];

    validTargets.sort((a, b) => {
      if (this.targetMode === 1) return a.hp - b.hp;
      if (this.targetMode === 2) return b.hp - a.hp;
      return b.pathIndex - a.pathIndex;
    });

    return validTargets.slice(0, this.targetCount);
  }

  private shoot(target: Enemy, enemies: Enemy[]) {
    const actualDmg = this.getDamage();
    let damage = Phaser.Math.Between(actualDmg.min, actualDmg.max);

    // --- АНИМАЦИЯ ВЫСТРЕЛА ---
    // Длительность "вздутия" - 35% от скорости атаки, но не дольше 80 мс
    const animDuration = Math.min(this.getFireRate() * 0.35, 80);

    // Если старая анимация еще играет (например, у пулемета), останавливаем её
    if (this.attackTween && this.attackTween.isPlaying()) {
      this.attackTween.stop();
      this.towerImage.setScale(this.baseScale); // Сбрасываем размер на дефолтный
    }

    // Запускаем новую анимацию
    this.attackTween = this.scene.tweens.add({
      targets: this.towerImage,
      scaleX: this.baseScale * 1.05, // Увеличиваем ширину на 15%
      scaleY: this.baseScale * 1.05, // Увеличиваем высоту на 15%
      duration: animDuration,
      yoyo: true, // Автоматически возвращает масштаб обратно (сдувается)
      ease: "Quad.easeOut", // Делает увеличение резким, а возврат плавным
      onComplete: () => {
        // Защита от багов: точно возвращаем к базе по окончании
        if (this.towerImage && this.towerImage.active) {
          this.towerImage.setScale(this.baseScale);
        }
      },
    });

    const buffMult = this.minDamage > 0 ? actualDmg.min / this.minDamage : 1;

    if (this.hasNextAttackBuff) {
      damage += this.nextAttackBuffDamage * buffMult;
      this.hasNextAttackBuff = false;

      const buffRing = this.scene.add.graphics();
      buffRing.lineStyle(4, 0x00ffaa, 1);
      buffRing.setPosition(this.centerX, this.centerY);
      buffRing.strokeCircle(0, 0, this.cellSize / 2);
      buffRing.setDepth(4);
      this.scene.tweens.add({
        targets: buffRing,
        scale: 2.5,
        alpha: 0,
        duration: 400,
        onComplete: () => buffRing.destroy(),
      });
    }

    if (
      this.bonusDamageChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.bonusDamageChance
    ) {
      const bonus = Math.floor(this.bonusDamageAmount * buffMult);
      damage += bonus;

      if (this.level === 6 && this.variant === 13) {
        // Король душ — столб света
        (this.scene as any).enemyManager.spawnLightPillar(
          target.x,
          target.y,
          0xffffcc,
        );
      } else if (this.level === 6 && this.variant === 20) {
        // Алтарь смерти — красный луч
        (this.scene as any).enemyManager.spawnBeam(
          this.centerX,
          this.centerY,
          target.x,
          target.y,
          0xff2222,
        );
      } else if (this.level === 6 && this.variant === 16) {
        // Рыцарь-Герой — меч падает с неба
        (this.scene as any).enemyManager.spawnHeroStrike(
          target.x,
          target.y,
          bonus,
        );
      } else {
        // Fallback — старый текст
        const txt = this.scene.add
          .text(target.x, target.y - 30, `💥 СМЕРТЕЛЬНЫЙ УДАР!`, {
            fontSize: "16px",
            color: "#ff00ff",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setDepth(20);
        this.scene.tweens.add({
          targets: txt,
          y: target.y - 70,
          alpha: 0,
          duration: 1000,
          onComplete: () => txt.destroy(),
        });
      }
    }

    let isCrit = false;

    if (
      this.critChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.critChance
    ) {
      damage = Math.floor(damage * this.critMultiplier);
      isCrit = true;
    }

    const wasDead = target.isDead;
    target.takeDamage(damage, this.damageType);

    if (isCrit && !wasDead) {
      if (this.level === 6 && this.variant === 1) {
        // Камень душ (6-1) — столб душ + вспышка
        (this.scene as any).enemyManager.spawnSoulCrit(target.x, target.y);
      } else {
        // Остальные crit-башни (Пулемёт 4-3 и др.) — старый текст
        const critText = this.scene.add
          .text(target.x, target.y - 20, `${damage}!`, {
            fontSize: "20px",
            color: "#ff3333",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
          })
          .setOrigin(0.5)
          .setDepth(20);
        this.scene.tweens.add({
          targets: critText,
          y: target.y - 60,
          alpha: 0,
          duration: 800,
          ease: "Power1",
          onComplete: () => critText.destroy(),
        });
      }
    }

    if (
      !wasDead &&
      target.isDead &&
      this.skeletonChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.skeletonChance
    ) {
      this.scene.events.emit("spawn-skeleton", target.x, target.y);
    }

    if (this.slowPct > 0) {
      target.applySlow(this.slowPct, this.slowDuration);
    }

    if (
      this.poisonChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.poisonChance
    ) {
      const duration = target.isBoss ? 2 : 4;
      target.applyPoison(this.poisonDamage * buffMult, duration);
    }

    if (
      this.splashRadius > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.splashChance
    ) {
      enemies.forEach((enemy) => {
        if (enemy === target || enemy.isDead) return;

        const dx = enemy.x - target.x;
        const dy = enemy.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= this.splashRadius) {
          const aoeDamage =
            this.splashDamage > 0 ? this.splashDamage * buffMult : damage;
          enemy.takeDamage(aoeDamage, this.damageType);
        }
      });

      const explosion = this.scene.add.graphics();
      explosion.fillStyle(0xffaa00, 0.4);
      explosion.fillCircle(target.x, target.y, this.splashRadius);
      explosion.setDepth(4);

      this.scene.tweens.add({
        targets: explosion,
        alpha: 0,
        duration: 200,
        onComplete: () => explosion.destroy(),
      });
    }

    if (this.bounceTargets > 0) {
      let currentTarget = target;
      let bouncesLeft = this.bounceTargets - 1;

      const hitEnemies = new Set<Enemy>();
      hitEnemies.add(target);

      const bouncePath: { x: number; y: number; enemy?: Enemy }[] = [
        { x: this.centerX, y: this.centerY },
        { x: target.x, y: target.y, enemy: target },
      ];

      while (bouncesLeft > 0) {
        let nextTarget: Enemy | null = null;
        let minDist = 150;

        for (const enemy of enemies) {
          if (enemy.isDead || hitEnemies.has(enemy)) continue;

          const dx = enemy.x - currentTarget.x;
          const dy = enemy.y - currentTarget.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= minDist) {
            minDist = dist;
            nextTarget = enemy;
          }
        }

        if (!nextTarget) break;

        hitEnemies.add(nextTarget);
        bouncePath.push({
          x: nextTarget.x,
          y: nextTarget.y,
          enemy: nextTarget,
        });

        currentTarget = nextTarget;
        bouncesLeft--;
      }

      const glaive = this.scene.add.graphics();
      glaive.fillStyle(0xffd700, 1);
      glaive.fillCircle(0, 0, 7);
      glaive.setDepth(16);
      glaive.setPosition(this.centerX, this.centerY);

      const playBounceAnimation = (step: number) => {
        if (step >= bouncePath.length) {
          glaive.destroy();
          return;
        }
        const nextPoint = bouncePath[step];

        const destX =
          nextPoint.enemy && !nextPoint.enemy.isDead
            ? nextPoint.enemy.x
            : nextPoint.x;
        const destY =
          nextPoint.enemy && !nextPoint.enemy.isDead
            ? nextPoint.enemy.y
            : nextPoint.y;

        this.scene.tweens.add({
          targets: glaive,
          x: destX,
          y: destY,
          duration: 150,
          onComplete: () => {
            if (step >= 2 && nextPoint.enemy && !nextPoint.enemy.isDead) {
              nextPoint.enemy.takeDamage(damage, this.damageType);
            }
            playBounceAnimation(step + 1);
          },
        });
      };

      playBounceAnimation(1);
    } else {
      const laser = this.scene.add.graphics();
      laser.lineStyle(4, this.getFarmColor(this.level), 0.8);
      laser.beginPath();
      laser.moveTo(this.centerX, this.centerY);
      laser.lineTo(target.x, target.y);
      laser.strokePath();
      laser.setDepth(4);

      this.scene.tweens.add({
        targets: laser,
        alpha: 0,
        duration: 150,
        onComplete: () => laser.destroy(),
      });
    }

    if (
      this.chainChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.chainChance
    ) {
      let currentTarget = target;
      let jumpsLeft = this.chainTargets - 1;

      target.takeDamage(this.chainDamage * buffMult, this.damageType);

      const hitEnemies = new Set<Enemy>();
      hitEnemies.add(target);

      while (jumpsLeft > 0) {
        let nextTarget: Enemy | null = null;
        let minDist = 200;

        for (const enemy of enemies) {
          if (enemy.isDead || hitEnemies.has(enemy)) continue;

          const dx = enemy.x - currentTarget.x;
          const dy = enemy.y - currentTarget.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist <= minDist) {
            minDist = dist;
            nextTarget = enemy;
          }
        }

        if (!nextTarget) break;

        nextTarget.takeDamage(this.chainDamage * buffMult, this.damageType);
        hitEnemies.add(nextTarget);

        const lightning = this.scene.add.graphics();
        lightning.lineStyle(3, 0x00ffff, 1);
        lightning.beginPath();
        lightning.moveTo(currentTarget.x, currentTarget.y);

        const midX =
          (currentTarget.x + nextTarget.x) / 2 + Phaser.Math.Between(-15, 15);
        const midY =
          (currentTarget.y + nextTarget.y) / 2 + Phaser.Math.Between(-15, 15);
        lightning.lineTo(midX, midY);
        lightning.lineTo(nextTarget.x, nextTarget.y);

        lightning.strokePath();
        lightning.setDepth(16);

        this.scene.tweens.add({
          targets: lightning,
          alpha: 0,
          duration: 250,
          onComplete: () => lightning.destroy(),
        });

        currentTarget = nextTarget;
        jumpsLeft--;
      }
    }

    if (
      this.owlBuffChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.owlBuffChance
    ) {
      this.scene.events.emit("trigger-owl-buff");
    }

    if (
      this.mineChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.mineChance
    ) {
      let mx = target.x;
      let my = target.y;

      if (this.mineTargetMode === "random") {
        mx = -1;
        my = -1;
      }
      this.scene.events.emit(
        "spawn-mine",
        mx,
        my,
        this.mineDamage * buffMult,
        this.mineRadius,
      );
    }

    if (
      this.selfBuffChance > 0 &&
      !this.isSelfBuffed &&
      Phaser.Math.FloatBetween(0, 1) <= this.selfBuffChance
    ) {
      this.isSelfBuffed = true;

      if (!this.selfBuffVisual) {
        this.createSelfBuffVisual();
      } else {
        this.selfBuffVisual.setVisible(true);
        if (!this.scene.tweens.isTweening(this.selfBuffVisual)) {
          this.scene.tweens.add({
            targets: this.selfBuffVisual,
            scale: { from: 0.9, to: 1.12 },
            alpha: { from: 0.65, to: 1.0 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
          });
        }
      }

      this.selfBuffTimer = this.scene.time.addEvent({
        delay: this.selfBuffDuration,
        callback: () => {
          this.isSelfBuffed = false;
          if (this.selfBuffVisual) {
            this.selfBuffVisual.setVisible(false);
          }
        },
      });
    }

    if (
      this.stunChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.stunChance
    ) {
      let extraStunDmg = this.stunDamage * buffMult;
      if (this.stunExtraDmgPctNormal > 0 && !target.isBoss) {
        extraStunDmg += damage * this.stunExtraDmgPctNormal;
      }
      if (this.stunExtraDmgPctBoss > 0 && target.isBoss) {
        extraStunDmg += damage * this.stunExtraDmgPctBoss;
      }

      if (this.stunRadius > 0) {
        const centerX = this.stunAroundTower ? this.centerX : target.x;
        const centerY = this.stunAroundTower ? this.centerY : target.y;

        enemies.forEach((enemy) => {
          if (enemy.isDead) return;
          const dx = enemy.x - centerX;
          const dy = enemy.y - centerY;
          if (Math.sqrt(dx * dx + dy * dy) <= this.stunRadius) {
            enemy.applyStun(this.stunDuration);
            if (extraStunDmg > 0)
              enemy.takeDamage(extraStunDmg, this.damageType);
          }
        });

        // Специфичные визуалы по варианту башни
        if (this.level === 6 && this.variant === 8) {
          // Шаровая молния — электричество от башни
          (this.scene as any).enemyManager.spawnElectricBurst(
            this.centerX,
            this.centerY,
            this.stunRadius,
          );
        } else if (this.level === 6 && this.variant === 15) {
          // Король гномов — трещины насыщенного цвета
          (this.scene as any).enemyManager.spawnGroundCrack(
            this.centerX,
            this.centerY,
            this.stunRadius,
            "gnome",
          );
        } else if (this.level === 5 && this.variant === 2) {
          // Молот — трещины
          (this.scene as any).enemyManager.spawnGroundCrack(
            this.centerX,
            this.centerY,
            this.stunRadius,
            "hammer",
          );
        } else {
          // Fallback для остальных (на всякий случай)
          const stunCircle = this.scene.add.graphics();
          stunCircle.fillStyle(0xffff00, 0.4);
          stunCircle.fillCircle(centerX, centerY, this.stunRadius);
          stunCircle.setDepth(4);
          this.scene.tweens.add({
            targets: stunCircle,
            alpha: 0,
            duration: 300,
            onComplete: () => stunCircle.destroy(),
          });
        }
      } else {
        target.applyStun(this.stunDuration);
        if (extraStunDmg > 0) target.takeDamage(extraStunDmg, this.damageType);

        // Одиночный стан — специфичные визуалы
        if (this.level === 6 && this.variant === 7) {
          // Магическая статуя — молния с неба
          (this.scene as any).enemyManager.spawnLightningStrike(
            target.x,
            target.y,
          );
        } else if (this.level === 6 && this.variant === 18) {
          // Мировое древо — корни
          (this.scene as any).enemyManager.spawnRootEntangle(
            target.x,
            target.y,
            this.stunDuration,
          );
        }
      }
    }

    if (
      this.zoneChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.zoneChance
    ) {
      const isBlackHole = this.level === 6 && this.variant === 17;
      (this.scene as any).enemyManager.createGroundZone(
        target.x,
        target.y,
        this.zoneRadius,
        this.zoneDuration,
        this.zoneDmgPerSec * buffMult,
        this.zoneSlowPct,
        this.zoneColor,
        this.damageType,
        isBlackHole,
      );
    }

    if (
      this.waveChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.waveChance
    ) {
      const dx = target.x - this.centerX;
      const dy = target.y - this.centerY;
      const distToTarget = Math.sqrt(dx * dx + dy * dy);

      if (distToTarget > 0) {
        const dirX = dx / distToTarget;
        const dirY = dy / distToTarget;

        enemies.forEach((enemy) => {
          if (enemy.isDead) return;

          const ex = enemy.x - this.centerX;
          const ey = enemy.y - this.centerY;

          const projection = ex * dirX + ey * dirY;

          if (projection >= 0 && projection <= this.waveLength) {
            const distToEnemySq = ex * ex + ey * ey;
            const lateralDist = Math.sqrt(
              Math.max(0, distToEnemySq - projection * projection),
            );

            if (lateralDist <= this.waveWidth / 2) {
              enemy.takeDamage(this.waveDamage * buffMult, this.damageType);
            }
          }
        });

        const waveAngle = Math.atan2(dy, dx);
        const waveKind =
          this.level === 6 && this.variant === 2 ? "lava" : "water";
        (this.scene as any).enemyManager.spawnWaveVisual(
          this.centerX,
          this.centerY,
          this.waveLength,
          this.waveWidth,
          waveAngle,
          waveKind,
        );
      }
    }

    if (
      this.randomTargetChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.randomTargetChance
    ) {
      let validTargets = enemies.filter((e) => !e.isDead);

      if (this.randomTargetRange > 0) {
        validTargets = validTargets.filter((e) => {
          const dist = Math.sqrt(
            (e.x - this.centerX) ** 2 + (e.y - this.centerY) ** 2,
          );
          return dist <= this.randomTargetRange;
        });
      }

      Phaser.Utils.Array.Shuffle(validTargets);
      const selected = validTargets.slice(0, this.randomTargetCount);

      selected.forEach((enemy) => {
        enemy.takeDamage(this.randomTargetDamage * buffMult, this.damageType);

        if (this.level === 6 && this.variant === 9) {
          // Высший демон — разлёт крови
          (this.scene as any).enemyManager.spawnBloodSplatter(enemy.x, enemy.y);
        }

        // Старый «луч сверху» для остальных random-target башен
        const beam = this.scene.add.graphics();
        beam.lineStyle(3, 0xff0055, 0.9);
        beam.beginPath();
        beam.moveTo(enemy.x, enemy.y - 800);
        beam.lineTo(enemy.x, enemy.y);
        beam.strokePath();
        beam.setDepth(15);
        this.scene.tweens.add({
          targets: beam,
          alpha: 0,
          duration: 250,
          onComplete: () => beam.destroy(),
        });
      });
    }

    if (
      this.pulseChance > 0 &&
      Phaser.Math.FloatBetween(0, 1) <= this.pulseChance
    ) {
      const doPulse = () => {
        enemies.forEach((enemy) => {
          if (enemy.isDead) return;
          const dist = Math.sqrt(
            (enemy.x - this.centerX) ** 2 + (enemy.y - this.centerY) ** 2,
          );
          if (dist <= this.pulseRadius) {
            enemy.takeDamage(this.pulseDamage * buffMult, this.damageType);
          }
        });

        if (this.level === 6 && this.variant === 4) {
          // Глыба льда — снежинки
          (this.scene as any).enemyManager.spawnSnowBurst(
            this.centerX,
            this.centerY,
            this.pulseRadius,
          );
        } else if (this.level === 6 && this.variant === 10) {
          // Король вампиров — пузырь крови
          (this.scene as any).enemyManager.spawnBloodBubble(
            this.centerX,
            this.centerY,
            this.pulseRadius,
          );
        } else {
          // Fallback — старое кольцо
          const pulseCircle = this.scene.add.graphics();
          pulseCircle.lineStyle(
            4,
            this.pulseCount > 1 ? 0x00ffff : 0xaa0000,
            0.8,
          );
          pulseCircle.setPosition(this.centerX, this.centerY);
          pulseCircle.strokeCircle(0, 0, this.pulseRadius);
          pulseCircle.setDepth(4);
          this.scene.tweens.add({
            targets: pulseCircle,
            scale: 1.15,
            alpha: 0,
            duration: 450,
            onComplete: () => pulseCircle.destroy(),
          });
        }
      };

      doPulse();

      if (this.pulseCount > 1) {
        this.scene.time.addEvent({
          delay: 700,
          repeat: this.pulseCount - 2,
          callback: doPulse,
        });
      }
    }

    if (
      this.nextAttackBuffChance > 0 &&
      !this.hasNextAttackBuff &&
      Phaser.Math.FloatBetween(0, 1) <= this.nextAttackBuffChance
    ) {
      this.hasNextAttackBuff = true;
    }
  }

  public applyOwlBuff() {
    if (this.owlBuffTimer) {
      this.owlBuffTimer.remove(false);
    }

    this.isOwlBuffed = true;

    if (!this.buffVisual) {
      this.buffVisual = this.scene.add
        .text(this.centerX, this.centerY - this.cellSize / 2, "⚡", {
          fontSize: "18px",
        })
        .setOrigin(0.5);
      this.buffVisual.setDepth(20);
    } else {
      this.buffVisual.setVisible(true);
    }

    const durationSec = this.level === 6 ? 16 : 30;

    this.owlBuffTimer = this.scene.time.addEvent({
      delay: durationSec * 1000,
      callback: () => {
        this.isOwlBuffed = false;
        if (this.buffVisual) this.buffVisual.setVisible(false);
      },
    });
  }

  public destroy() {
    if (this.attackTween) this.attackTween.stop();
    this.container.destroy();
    if (this.owlBuffTimer) this.owlBuffTimer.destroy();
    if (this.buffVisual) this.buffVisual.destroy();
    if (this.selfBuffTimer) this.selfBuffTimer.destroy();
    if (this.selfBuffVisual) {
      this.scene.tweens.killTweensOf(this.selfBuffVisual);
      this.selfBuffVisual.destroy();
    }
  }

  private getFarmColor(level: number): number {
    const colors = [0xbbbbbd, 0x8aff8a, 0x4db2ff, 0xa3648f, 0xf1ff52, 0xace5ee];
    return colors[(level - 1) % colors.length];
  }

  private drawAura(isSelected: boolean) {
    this.auraGraphic.clear();

    const color = this.getFarmColor(this.level);
    const glowX = this.cellSize / 2;
    const glowY = this.cellSize - 4;

    if (isSelected) {
      // ВЫДЕЛЕННОЕ СОСТОЯНИЕ (Ярче и чуть шире)
      this.auraGraphic.fillStyle(color, 0.95); // Плотный центр
      this.auraGraphic.fillEllipse(
        glowX,
        glowY,
        this.cellSize * 0.8,
        this.cellSize * 0.3,
      );

      this.auraGraphic.fillStyle(color, 0.8); // Мягкий край
      this.auraGraphic.fillEllipse(
        glowX,
        glowY,
        this.cellSize * 1.1,
        this.cellSize * 0.3,
      );

      this.auraGraphic.lineStyle(2, 0xffff00, 1);
      // Рисуем обводку того же размера, что и плотный центр:
      this.auraGraphic.strokeEllipse(
        glowX,
        glowY,
        this.cellSize * 1,
        this.cellSize * 0.3,
      );
    } else {
      // ОБЫЧНОЕ СОСТОЯНИЕ (Спокойное свечение)
      this.auraGraphic.fillStyle(color, 0.75); // Плотный центр
      this.auraGraphic.fillEllipse(
        glowX,
        glowY,
        this.cellSize * 0.6,
        this.cellSize * 0.3,
      );

      this.auraGraphic.fillStyle(color, 0.55); // Мягкий край
      this.auraGraphic.fillEllipse(
        glowX,
        glowY,
        this.cellSize * 1.1,
        this.cellSize * 0.3,
      );
    }
  }

  private createSelfBuffVisual() {
    const cx = this.centerX;
    const cy = this.centerY;
    const auraY = cy - 5;
    const rx = this.cellSize * 0.75;
    const ry = this.cellSize * 0.9;

    this.selfBuffVisual = this.scene.add.graphics({ x: cx, y: auraY });
    this.selfBuffVisual.setDepth(6 + this.row);

    this.selfBuffVisual.fillStyle(0xcc88ff, 0.12);
    this.selfBuffVisual.fillEllipse(0, 0, rx * 2, ry * 2);

    this.selfBuffVisual.fillStyle(0xaa66ff, 0.22);
    this.selfBuffVisual.fillEllipse(0, 0, rx * 1.4, ry * 1.4);

    this.selfBuffVisual.fillStyle(0xddbbff, 0.28);
    this.selfBuffVisual.fillEllipse(0, 0, rx * 0.9, ry * 0.9);

    this.selfBuffVisual.lineStyle(2, 0xeeddff, 0.7);
    this.selfBuffVisual.strokeEllipse(0, 0, rx * 1.7, ry * 1.7);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const px = Math.cos(angle) * rx * 0.75;
      const py = Math.sin(angle) * ry * 0.75;
      this.selfBuffVisual.fillStyle(0xffffff, 0.7);
      this.selfBuffVisual.fillCircle(px, py, 1.5);
    }

    this.scene.tweens.add({
      targets: this.selfBuffVisual,
      scaleX: { from: 0.92, to: 1.1 },
      scaleY: { from: 0.92, to: 1.1 },
      alpha: { from: 0.65, to: 1.0 },
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  public setSelected(isSelected: boolean) {
    this.drawAura(isSelected);
  }

  public getDamage() {
    const economy = (this.scene as any).economy;
    let buffMultiplier = 0;

    if (economy) {
      const typeLvl = economy.damageUpgrades[this.damageType] || 0;
      buffMultiplier = typeLvl * 0.15 + economy.globalDamageBuff;
    }

    return {
      min: Math.floor(this.minDamage * (1 + buffMultiplier)),
      max: Math.floor(this.maxDamage * (1 + buffMultiplier)),
    };
  }

  public getDamageBreakdown() {
    const economy = (this.scene as any).economy;
    let buffMultiplier = 0;

    if (economy) {
      const typeLvl = economy.damageUpgrades[this.damageType] || 0;
      buffMultiplier = typeLvl * 0.15 + economy.globalDamageBuff;
    }

    const baseMin = this.minDamage;
    const baseMax = this.maxDamage;
    const finalMin = Math.floor(baseMin * (1 + buffMultiplier));
    const finalMax = Math.floor(baseMax * (1 + buffMultiplier));

    return {
      baseMin,
      baseMax,
      finalMin,
      finalMax,
      bonusMin: finalMin - baseMin,
      bonusMax: finalMax - baseMax,
    };
  }

  public getDamageDisplay(): string {
    const b = this.getDamageBreakdown();
    let result = `${b.baseMin} - ${b.baseMax}`;

    if (b.bonusMin > 0 || b.bonusMax > 0) {
      if (b.bonusMin === b.bonusMax) {
        result += ` +${b.bonusMin}`;
      } else {
        result += ` +${b.bonusMin}-${b.bonusMax}`;
      }
    }

    return result;
  }

  public getRange() {
    return this.hasNextAttackBuff
      ? this.range + this.nextAttackBuffRange
      : this.range;
  }

  public getFireRate() {
    let rate = this.currentFireRate;
    if (this.isOwlBuffed) rate *= 0.8;
    if (this.isSelfBuffed) rate /= this.selfBuffMultiplier;

    const mainScene = this.scene as any;
    if (mainScene.metaProgress) {
      const titleBuff = mainScene.metaProgress.currentTitleId * 0.01; // до 11% (0.11)
      rate = rate * (1 - titleBuff);
    }

    return rate;
  }
}
