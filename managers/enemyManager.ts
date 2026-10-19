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
    overlay: Phaser.GameObjects.Graphics;
    damageType: number;
    isBlackHole: boolean;
    color: number;
    zoneType: "fire" | "poison" | "slow" | "other";
    particleTime: number;
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
    visual.enableFilters().filters!.external.addMask(this.scene.pathMaskSource);

    const overlay = this.scene.add.graphics();
    overlay.setDepth(5);
    overlay.enableFilters().filters!.external.addMask(this.scene.pathMaskSource);

    const zoneType = this.classifyZoneColor(color, isBlackHole);

    this.groundZones.push({
      x,
      y,
      radius,
      duration,
      dmgPerSec,
      slowPct,
      visual,
      overlay,
      damageType,
      isBlackHole,
      color,
      zoneType,
      particleTime: 0,
    });
  }

  private classifyZoneColor(
    color: number,
    isBlackHole: boolean,
  ): "fire" | "poison" | "slow" | "other" {
    // Ифрит (6-14) и Врата боли (6-3)
    if (color === 0xff4400 || color === 0x8b0000) return "fire";
    // Статуя бога Яда (6-21)
    if (color === 0x00ff33) return "poison";
    // Чёрная дыра (6-17)
    if (isBlackHole || color === 0x220033) return "slow";
    return "other";
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
    // 1. АУРЫ ЗАМЕДЛЕНИЯ ОТ БАШЕН + сброс визуальных флагов зон
    for (const enemy of this.enemies) {
      enemy.auraSlowPct = 0;
      enemy.isInPoisonZone = false;
    }

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
        zone.overlay.destroy();
        this.groundZones.splice(i, 1);
        continue;
      }

      // Анимация частиц на поверхности зоны
      zone.particleTime += delta;
      zone.overlay.clear();
      if (zone.zoneType === "fire") this.drawFireOverlay(zone);
      else if (zone.zoneType === "poison") this.drawPoisonOverlay(zone);
      else if (zone.zoneType === "slow") this.drawSlowOverlay(zone);

      for (const enemy of this.enemies) {
        if (enemy.isDead) continue;
        const dx = enemy.x - zone.x;
        const dy = enemy.y - zone.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= zone.radius) {
          if (zone.dmgPerSec > 0)
            enemy.takeDamage(zone.dmgPerSec * (delta / 1000), zone.damageType);

          if (zone.zoneType === "fire") {
            enemy.applyBurn(400);
          } else if (zone.zoneType === "poison") {
            enemy.isInPoisonZone = true;
          }

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
    private drawFireOverlay(zone: {
    x: number;
    y: number;
    radius: number;
    overlay: Phaser.GameObjects.Graphics;
    particleTime: number;
  }) {
    const t = zone.particleTime * 0.001;
    for (let i = 0; i < 10; i++) {
      const phase = (t * 1.2 + i / 10) % 1;
      const angle = i * 2.399 + phase * 2;
      const dist = (i / 10) * zone.radius * 0.85;
      const px = zone.x + Math.cos(angle) * dist;
      const py = zone.y + Math.sin(angle) * dist * 0.6 - phase * 25;
      const alpha = (1 - phase) * 0.9;
      // Внешний ореол
      zone.overlay.fillStyle(0xff4400, alpha * 0.6);
      zone.overlay.fillCircle(px, py, 3 + (1 - phase) * 2);
      // Ядро пламени
      zone.overlay.fillStyle(0xffdd44, alpha);
      zone.overlay.fillCircle(px, py, 1.5);
    }
    // Угольки, тлеющие на земле
    for (let i = 0; i < 4; i++) {
      const phase = (t * 0.6 + i / 4) % 1;
      const angle = i * 1.57 + t * 0.5;
      const dist = zone.radius * 0.7 * ((i * 0.37 + phase) % 1);
      const px = zone.x + Math.cos(angle) * dist;
      const py = zone.y + Math.sin(angle) * dist * 0.5;
      zone.overlay.fillStyle(0xffaa00, (1 - phase) * 0.5);
      zone.overlay.fillCircle(px, py, 2);
    }
  }

  private drawPoisonOverlay(zone: {
    x: number;
    y: number;
    radius: number;
    overlay: Phaser.GameObjects.Graphics;
    particleTime: number;
  }) {
    const t = zone.particleTime * 0.001;
    for (let i = 0; i < 8; i++) {
      const phase = (t * 0.5 + i / 8) % 1;
      const angle = i * 2.399 + phase * 1.5;
      const dist = (i / 8) * zone.radius * 0.8;
      const px = zone.x + Math.cos(angle) * dist;
      const py = zone.y + Math.sin(angle) * dist * 0.5 - phase * 20;
      const alpha = (1 - phase) * 0.85;
      // Пузырь
      zone.overlay.fillStyle(0x44cc44, alpha * 0.4);
      zone.overlay.fillCircle(px, py, 4 + (1 - phase) * 3);
      // Ядро пузыря
      zone.overlay.fillStyle(0x88ff88, alpha);
      zone.overlay.fillCircle(px, py, 2 + (1 - phase) * 1.5);
      // Блик
      zone.overlay.fillStyle(0xccffcc, alpha);
      zone.overlay.fillCircle(px - 1, py - 1, 0.8);
    }
  }

  private drawSlowOverlay(zone: {
    x: number;
    y: number;
    radius: number;
    overlay: Phaser.GameObjects.Graphics;
    particleTime: number;
  }) {
    const t = zone.particleTime * 0.001;
    for (let i = 0; i < 6; i++) {
      const phase = (t * 0.4 + i / 6) % 1;
      const angle = i * 1.57 + t * 2;
      const dist = zone.radius * phase * 0.9;
      const px = zone.x + Math.cos(angle) * dist;
      const py = zone.y + Math.sin(angle) * dist * 0.5;
      zone.overlay.fillStyle(0xaa44ff, (1 - phase) * 0.7);
      zone.overlay.fillCircle(px, py, 2);
      zone.overlay.fillStyle(0xdd88ff, (1 - phase) * 0.4);
      zone.overlay.fillCircle(px, py, 4);
    }
  }
}
