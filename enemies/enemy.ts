import * as Phaser from "phaser";

// import type { EnemyType, EnemyStats } from "./EnemyTypes";

import { EnemyRenderer } from "./EnemyRenderer";

import { ENEMY_CONFIG } from "./EnemyConfig";

export class Enemy {
  public readonly variantId: number;
  public readonly studioMobId: number;
  public readonly enemyType: string;
  public isDead: boolean = false;
  public hp: number;
  public maxHp: number;
  private baseSpeed: number;
  private slowTimer: Phaser.Time.TimerEvent | null = null;
  public activeSlowPct: number = 0;
  private poisonTimer: Phaser.Time.TimerEvent | null = null;
  private burnTimer: Phaser.Time.TimerEvent | null = null;
  public isStunned: boolean = false;
  private stunTimer: Phaser.Time.TimerEvent | null = null;

  public isImmuneToSlow: boolean;
  public isBoss: boolean;
  public auraSlowPct: number = 0;
  public isInPoisonZone: boolean = false;
  public displayName: string;

  private renderer!: EnemyRenderer;

  private scene: Phaser.Scene;
  private container!: Phaser.GameObjects.Container;
  private path: { col: number; row: number }[];

  public pathIndex: number = 0;
  public get x(): number {
    return this.container ? this.container.x : 0;
  }
  public get y(): number {
    return this.container ? this.container.y : 0;
  }

  private static readonly RESISTANCE_MATRIX: Record<
    string,
    Record<number, number>
  > = {
    normal: { 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0 },
    runner: { 1: 1.0, 2: 1.5, 3: 0.5, 4: 1.2, 5: 1.0, 6: 1.0, 7: 1.0 },
    tank: { 1: 0.5, 2: 0.5, 3: 1.5, 4: 1.5, 5: 1.0, 6: 1.0, 7: 1.0 },
    immune: { 1: 0.2, 2: 0.2, 3: 0.2, 4: 1.0, 5: 1.0, 6: 2.0, 7: 0.5 },
    boss: { 1: 0.8, 2: 0.8, 3: 0.8, 4: 0.8, 5: 1.5, 6: 1.0, 7: 1.2 },
  };

  public static readonly ARCHETYPES: Record<string, string> = {
    normal: "(Обычный)",
    runner: "(Быстрый)",
    tank: "(Танк)",
    immune: "(Иммунный)",
    boss: "(Босс)",
  };

  // --- ЛОГИКА "МЕШКА" ---
  private static usedVariants: Record<string, number[]> = {};

  public static resetUsedVariants() {
    Enemy.usedVariants = {};
  }

  public static getNextVariantForWave(
    archetype: string,
    currentWaveIndex: number,
  ): number {
    const config = ENEMY_CONFIG[archetype];
    if (!config) {
      return Number(Object.keys(ENEMY_CONFIG.normal.variants)[0]);
    }

    // Тир: 1 для волн 0-9, 2 для 10-19, 3 для 20-29, 4 для 30-39
    const tier = Math.floor(currentWaveIndex / 10) + 1;

    // Все ключи вариантов, у которых tier совпадает
    const matchingVariants = Object.entries(config.variants)
      .filter(([_, v]) => (v.tier ?? 1) === tier)
      .map(([k, _]) => Number(k));

    // Если для этого тира вариантов нет — падаем на первый доступный
    const availableVariants =
      matchingVariants.length > 0
        ? matchingVariants
        : Object.keys(config.variants).map(Number);

    // Мешок (без повторов): свой bucket на каждую пару archetype+tier
    const bucketKey = `${archetype}_t${tier}`;
    if (!Enemy.usedVariants[bucketKey]) {
      Enemy.usedVariants[bucketKey] = [];
    }

    let unusedKeys = availableVariants.filter(
      (k) => !Enemy.usedVariants[bucketKey].includes(k),
    );

    if (unusedKeys.length === 0) {
      Enemy.usedVariants[bucketKey] = [];
      unusedKeys = availableVariants;
    }

    const chosen = Phaser.Utils.Array.GetRandom(unusedKeys);
    Enemy.usedVariants[bucketKey].push(chosen);

    return chosen;
  }

  public isSlowed(): boolean {
    return this.activeSlowPct > 0 || this.auraSlowPct > 0;
  }

  public isPoisoned(): boolean {
    return this.poisonTimer !== null;
  }

  public isBurning(): boolean {
    return this.burnTimer !== null;
  }

  public getBaseSpeed(): number {
    return this.baseSpeed;
  }

  public getEffectiveSpeed(): number {
    if (this.isImmuneToSlow) return this.baseSpeed;

    let totalSlowPct = this.auraSlowPct + this.activeSlowPct;
    const mainScene = this.scene as any;
    if (mainScene.metaProgress) {
      totalSlowPct += mainScene.metaProgress.currentTitleId * 1;
    }
    const cappedSlowPct = Math.min(totalSlowPct, 50);
    return this.baseSpeed * (1 - cappedSlowPct / 100);
  }

  public getResistances() {
    return (
      Enemy.RESISTANCE_MATRIX[this.enemyType] ||
      Enemy.RESISTANCE_MATRIX["normal"]
    );
  }

  private onReachEnd: (enemy: Enemy) => void;
  private cellSize: number;

  constructor(
    scene: Phaser.Scene,
    path: { col: number; row: number }[],
    cellSize: number,
    enemyType: string,
    variantId: number,
    hpMultiplier: number,
    onReachEnd: (enemy: Enemy) => void,
  ) {
    this.scene = scene;
    this.path = path;
    this.onReachEnd = onReachEnd;
    this.cellSize = cellSize;
    this.enemyType = enemyType;
    this.variantId = variantId;

    const availableVariants =
      ENEMY_CONFIG[enemyType]?.variants || ENEMY_CONFIG.normal.variants;
    const fallbackKey = Number(Object.keys(availableVariants)[0]);
    const stats =
      availableVariants[variantId] || availableVariants[fallbackKey];

    const suffix = Enemy.ARCHETYPES[enemyType] || "";
    this.displayName = `${stats.name} ${suffix}`;
    this.studioMobId = stats.studioMobId;

    this.maxHp = Math.floor(stats.baseHp * hpMultiplier);
    this.hp = this.maxHp;
    this.baseSpeed = stats.speed;
    // ИСПРАВЛЕНО: убрано мёртвое поле this.speed

    this.isImmuneToSlow = stats.immuneToSlow || false;
    this.isBoss = enemyType === "boss";

    const startX = this.path[0].col * cellSize + cellSize / 2;
    const startY = this.path[0].row * cellSize + cellSize / 2;

    this.renderer = new EnemyRenderer(scene, stats, cellSize);

    this.updateHpDisplay(this.cellSize);

    this.container = scene.add.container(startX, startY, [
      this.renderer.statusAura,
      this.renderer.sprite,
      this.renderer.hpBar,
      this.renderer.hpText,
      this.renderer.stunIcon,
      this.renderer.statusParticles,
    ]);
    this.container.setDepth(18);
    this.container.setSize(cellSize, cellSize);
    this.container.setInteractive({ useHandCursor: true });
    this.container.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        localX: number,
        localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        (this.scene as any).showEnemyInfo(this);
      },
    );
  }

  public takeDamage(amount: number, damageType: number = 1) {
    if (this.isDead) return;

    const typeMultipliers =
      Enemy.RESISTANCE_MATRIX[this.enemyType] ||
      Enemy.RESISTANCE_MATRIX["normal"];
    const multiplier = typeMultipliers[damageType] || 1.0;

    const finalDamage = amount * multiplier;

    this.hp -= finalDamage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.destroy();
    } else {
      this.updateHpDisplay(this.cellSize);
    }
  }

  public updateHpDisplay(cellSize: number) {
    this.renderer.hpBar.clear();
    const width = cellSize * this.renderer.scale * 0.8;
    const height = Math.max(4, Math.round(3 * this.renderer.scale));
    const x = -width / 2;
    const y = this.renderer.topY - 6;

    this.renderer.hpBar.fillStyle(0x555555, 0.8);
    this.renderer.hpBar.fillRect(x, y, width, height);

    const hpPct = Math.max(0, this.hp / this.maxHp);

    let barColor = 0x00ff00;
    if (hpPct <= 0.5 && hpPct > 0.25) barColor = 0xffff00;
    else if (hpPct <= 0.25) barColor = 0xff0000;

    this.renderer.hpBar.fillStyle(barColor, 1);
    this.renderer.hpBar.fillRect(x, y, width * hpPct, height);
    this.renderer.hpText.setText(`${Math.ceil(this.hp)}/${this.maxHp}`);
  }

  public update(delta: number, cellSize: number) {
    if (this.isDead || this.pathIndex >= this.path.length) return;

    // Визуальные эффекты статусов — рисуем ДО проверки isStunned,
    // чтобы пузырьки/огоньки продолжали лететь даже в стане.
    this.renderer.updateStatusEffects(delta, cellSize, {
      slow: this.isSlowed(),
      poison: this.isPoisoned() || this.isInPoisonZone,
      burn: this.isBurning(),
    });

    if (this.isStunned) return;

    this.container.setDepth(18 + this.container.y * 0.001);

    const targetCol = this.path[this.pathIndex].col;
    const targetRow = this.path[this.pathIndex].row;
    const targetX = targetCol * cellSize + cellSize / 2;
    const targetY = targetRow * cellSize + cellSize / 2;

    const currentX = this.container.x;
    const currentY = this.container.y;

    const dx = targetX - currentX;
    const dy = targetY - currentY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const MOVING_THRESHOLD = 0.5;

    if (absDx >= absDy && absDx > MOVING_THRESHOLD) {
      // Горизонтальное движение — боковой ракурс
      this.renderer.setDirection("side", dx < 0);
    } else if (absDy > MOVING_THRESHOLD) {
      // Вертикальное движение — вверх спиной, вниз лицом
      this.renderer.setDirection(dy < 0 ? "back" : "front", false);
    }

    const distance = Math.sqrt(dx * dx + dy * dy);

    const finalSpeed = this.getEffectiveSpeed();
    const step = (finalSpeed * delta) / 1000;

    if (distance <= step) {
      this.container.setPosition(targetX, targetY);
      this.pathIndex++;

      if (this.pathIndex >= this.path.length) {
        this.onReachEnd(this);
        this.destroy();
      }
    } else {
      const ratio = step / distance;
      this.container.x += dx * ratio;
      this.container.y += dy * ratio;
    }
  }

  public destroy() {
    if (this.isDead) return; // защита от повторного вызова
    this.isDead = true;

    if (this.slowTimer) this.slowTimer.remove(false);
    if (this.poisonTimer) this.poisonTimer.remove(false);
    if (this.burnTimer) this.burnTimer.remove(false);
    if (this.stunTimer) this.stunTimer.remove(false);

    // ИСПРАВЛЕНО: container владеет всеми объектами рендерера,
    // поэтому одного container.destroy() достаточно.
    // Раньше сначала вызывался renderer.destroy(), а потом
    // container.destroy() — двойное уничтожение одних и тех же объектов.
    if (this.container) {
      this.container.destroy();
    }
  }

  public applySlow(slowPct: number, durationMs: number) {
    if (this.isImmuneToSlow || this.isDead) return;

    // Слабый slow не должен перебивать сильный. Равный или сильный — обновляем
    // таймер, чтобы slow не «мигал» при повторных попаданиях.
    if (this.activeSlowPct > slowPct) {
      return;
    }

    this.activeSlowPct = slowPct;

    if (this.slowTimer) {
      this.slowTimer.remove(false);
    }

    this.slowTimer = this.scene.time.addEvent({
      delay: durationMs,
      callback: () => {
        if (!this.isDead) {
          this.activeSlowPct = 0;
          this.slowTimer = null;
        }
      },
    });
  }

  public applyPoison(damagePerSec: number, durationSec: number) {
    if (this.isDead) return;

    // ИСПРАВЛЕНО: защита от durationSec <= 0
    // (раньше repeat: -1 давал бесконечный яд)
    if (durationSec <= 0) return;

    if (this.poisonTimer) {
      this.poisonTimer.remove(false);
    }

    this.poisonTimer = this.scene.time.addEvent({
      delay: 1000,
      repeat: durationSec - 1,
      callback: () => {
        if (!this.isDead) {
          this.takeDamage(damagePerSec);
        }
      },
    });
  }

  public applyBurn(durationMs: number) {
    if (this.isDead) return;

    // Как и с slow — повторный burn продлевает таймер,
    // а не создаёт второй параллельный.
    if (this.burnTimer) {
      this.burnTimer.remove(false);
    }

    this.burnTimer = this.scene.time.addEvent({
      delay: durationMs,
      callback: () => {
        if (!this.isDead) {
          this.burnTimer = null;
        }
      },
    });
  }

  public applyStun(durationMs: number) {
    if (this.isDead) return;

    this.isStunned = true;
    this.renderer.stunIcon.setVisible(true);

    if (this.stunTimer) {
      this.stunTimer.remove(false);
    }

    this.stunTimer = this.scene.time.addEvent({
      delay: durationMs,
      callback: () => {
        if (!this.isDead) {
          this.isStunned = false;
          this.renderer.stunIcon.setVisible(false);
          this.stunTimer = null;
        }
      },
    });
  }
}
