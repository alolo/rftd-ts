import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { Enemy } from "../enemies/enemy";
import { Skeleton } from "../skeleton";
import { Mine } from "../mine";

export class EnemyManager {
  private scene: MainScene;

  public enemies: Enemy[] = [];
  public skeletons: Skeleton[] = [];
  public mines: Mine[] = [];
  public groundZones: {
    x: number;
    y: number;
    radius: number;
    duration: number;
    dmgPerSec: number;
    slowPct: number;
    visual: Phaser.GameObjects.Graphics;
    damageType: number;
    isBlackHole: boolean;
  }[] = [];

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public spawnEnemy(
    enemyType: string,
    variantId: number,
    hpMultiplier: number,
  ) {
    const newEnemy = new Enemy(
      this.scene,
      this.scene.enemyPath,
      this.scene.CELL_SIZE,
      enemyType,
      variantId,
      hpMultiplier,
      (e: Enemy) => this.handleEnemyReachedEnd(e),
    );
    this.enemies.push(newEnemy);
  }

  public spawnSkeleton(x: number, y: number) {
    this.skeletons.push(new Skeleton(this.scene, x, y));
  }

  public spawnMine(
    spawnX: number,
    spawnY: number,
    dmg: number,
    radius: number,
  ) {
    this.mines.push(new Mine(this.scene, spawnX, spawnY, dmg, radius));
  }

  public createGroundZone(
    x: number,
    y: number,
    radius: number,
    duration: number,
    dmgPerSec: number,
    slowPct: number,
    color: number,
    damageType: number = 1,
    isBlackHole: boolean = false,
  ) {
    const visual = this.scene.add.graphics();
    visual.fillStyle(color, 0.4);
    visual.fillCircle(x, y, radius);
    visual.setDepth(4);
    this.groundZones.push({
      x,
      y,
      radius,
      duration,
      dmgPerSec,
      slowPct,
      visual,
      damageType,
      isBlackHole,
    });
  }

  private handleEnemyReachedEnd(enemy: Enemy) {
    if (this.scene.isGameOver) return;

    const damage = enemy.isBoss ? 10 : 1;
    this.scene.playerLives -= damage;
    if (this.scene.playerLives < 0) this.scene.playerLives = 0;

    this.scene.updatePlayerLivesText();

    this.scene.achievements.baseHasTakenDamage = true;

    // ИСПРАВЛЕНО: раньше требовалось РОВНО 3 жизни.
    // Теперь срабатывает, если игрок ещё жив и у него <= 3 жизней.
    if (this.scene.playerLives > 0 && this.scene.playerLives <= 3) {
      this.scene.achievements.unlock("near_death");
    }

    const damageFlash = this.scene.add.graphics();
    damageFlash.fillStyle(0xfa8072, 0.5);
    damageFlash.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    damageFlash.setDepth(500);

    this.scene.tweens.add({
      targets: damageFlash,
      alpha: 0,
      duration: 300,
      onComplete: () => damageFlash.destroy(),
    });

    if (this.scene.playerLives <= 0) {
      this.scene.triggerGameOver(false);
    }
  }

  public update(time: number, delta: number) {
    // 1. АУРЫ ЗАМЕДЛЕНИЯ ОТ БАШЕН
    for (const enemy of this.enemies) enemy.auraSlowPct = 0;

    for (const tower of this.scene.builder.activeTowers) {
      if (tower.auraEnemySlowRadius > 0) {
        for (const enemy of this.enemies) {
          if (enemy.isDead || enemy.isImmuneToSlow) continue;
          const dx = enemy.x - tower.centerX;
          const dy = enemy.y - tower.centerY;
          if (Math.sqrt(dx * dx + dy * dy) <= tower.auraEnemySlowRadius) {
            enemy.auraSlowPct = Math.max(
              enemy.auraSlowPct,
              tower.auraEnemySlowPct,
            );
          }
        }
      }
    }

    // 2. ЗОНЫ НА ЗЕМЛЕ
    for (let i = this.groundZones.length - 1; i >= 0; i--) {
      const zone = this.groundZones[i];
      zone.duration -= delta;

      if (zone.duration <= 0) {
        zone.visual.destroy();
        this.groundZones.splice(i, 1);
        continue;
      }

      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const dx = enemy.x - zone.x;
        const dy = enemy.y - zone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= zone.radius) {
          if (zone.dmgPerSec > 0)
            enemy.takeDamage(zone.dmgPerSec * (delta / 1000), zone.damageType);

          if (zone.slowPct > 0 && !enemy.isImmuneToSlow) {
            let currentSlow = zone.slowPct;

            if (zone.isBlackHole) {
              const intensity = 1 - dist / zone.radius;
              currentSlow = zone.slowPct * Math.max(0.1, intensity);
            }

            enemy.auraSlowPct = Math.max(enemy.auraSlowPct, currentSlow);
          }
        }
      }
    }

    // 3. ОБНОВЛЕНИЕ СУЩНОСТЕЙ
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(delta, this.scene.CELL_SIZE);
      if (enemy.isDead) this.enemies.splice(i, 1);
    }

    for (let i = this.skeletons.length - 1; i >= 0; i--) {
      const skel = this.skeletons[i];
      skel.update(time, this.enemies);
      if (skel.isDead) this.skeletons.splice(i, 1);
    }

    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i];
      m.update(this.enemies);
      if (m.isDead) this.mines.splice(i, 1);
    }
  }
}
