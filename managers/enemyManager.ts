import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { Enemy } from "../enemies/enemy";
import { Skeleton } from "../skeleton";
import { Mine } from "../mine";

export class EnemyManager {
  private scene: MainScene;

  private readonly VISUAL_BG_SCALE = 0.8;
  private readonly VISUAL_PARTICLES_SCALE = 1;

  public enemies: Enemy[] = [];
  public skeletons: Skeleton[] = [];
  public mines: Mine[] = [];
  public groundZones: {
    x: number;
    y: number;
    radius: number;
    visualRadius: number;
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
    visual.fillStyle(color, 0.05);
    visual.fillCircle(x, y, radius * this.VISUAL_BG_SCALE);
    visual.setDepth(4);
    visual.enableFilters().filters!.external.addMask(this.scene.pathMaskSource);

    const overlay = this.scene.add.graphics();
    overlay.setDepth(5);
    overlay.enableFilters().filters!.external.addMask(this.scene.pathMaskSource);

    const zoneType = this.classifyZoneColor(color, isBlackHole);

    // Врата боли (6-3): единоразовый взрыв при создании + последующее горение
    if (color === 0x8b0000) {
      this.spawnExplosion(x, y, radius);
    }

    this.groundZones.push({
      x, y, radius,
      visualRadius: radius * this.VISUAL_PARTICLES_SCALE, 
      duration, dmgPerSec, slowPct,
      visual, overlay, damageType, isBlackHole, color, zoneType,
      particleTime: 0,
    });
  }

  private spawnExplosion(x: number, y: number, radius: number) {
    // 1. Яркая вспышка
    const flash = this.scene.add.graphics().setPosition(x, y).setDepth(14);
    flash.fillStyle(0xffffff, 0.9);
    flash.fillCircle(0, 0, radius * 0.3);
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2.5,
      duration: 200,
      ease: "Quad.easeOut",
      onComplete: () => flash.destroy(),
    });

    // 2. Огненный шар (два слоя)
    const ball = this.scene.add.graphics().setPosition(x, y).setDepth(14);
    ball.fillStyle(0xffaa00, 0.85);
    ball.fillCircle(0, 0, radius * 0.35);
    ball.fillStyle(0xff4400, 0.6);
    ball.fillCircle(0, 0, radius * 0.55);
    this.scene.tweens.add({
      targets: ball,
      alpha: 0,
      scale: 2,
      duration: 420,
      ease: "Quad.easeOut",
      onComplete: () => ball.destroy(),
    });

    // 3. Ударная волна — расходящееся кольцо
    const shockwave = this.scene.add.graphics().setPosition(x, y).setDepth(15);
    shockwave.lineStyle(4, 0xffcc33, 1);
    shockwave.strokeCircle(0, 0, radius * 0.3);
    this.scene.tweens.add({
      targets: shockwave,
      scale: 3.5,
      alpha: 0,
      duration: 380,
      ease: "Quad.easeOut",
      onComplete: () => shockwave.destroy(),
    });

    // 4. Искры разлетаются радиально
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.3;
      const dist = radius * (0.6 + Math.random() * 0.4);
      const spark = this.scene.add.graphics().setPosition(x, y).setDepth(15);
      spark.fillStyle(i % 2 ? 0xffdd44 : 0xff6600, 1);
      spark.fillCircle(0, 0, 2 + Math.random() * 2);
      this.scene.tweens.add({
        targets: spark,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist * 0.6,
        alpha: 0,
        duration: 350 + Math.random() * 200,
        ease: "Quad.easeOut",
        onComplete: () => spark.destroy(),
      });
    }

    // 5. Лёгкая тряска камеры — «вес» взрыва
    this.scene.cameras.main.shake(180, 0.004);
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
    visualRadius: number;
    overlay: Phaser.GameObjects.Graphics;
    particleTime: number;
  }) {
    const t = zone.particleTime * 0.001;

    const FLAME_COUNT = 18;
    for (let i = 0; i < FLAME_COUNT; i++) {
      const h1 = ((i * 2654435761) >>> 0) / 4294967295;
      const h2 = ((i * 1597334677) >>> 0) / 4294967295;

      const baseAngle = h1 * Math.PI * 2;
      const baseR = Math.sqrt(h2) * zone.visualRadius * 0.85;

      const phase = (t * 1.2 + i / FLAME_COUNT) % 1;
      const wobble = Math.sin(t * 3 + i * 1.7) * 4;

      const px = zone.x + Math.cos(baseAngle) * baseR + wobble;
      const py = zone.y + Math.sin(baseAngle) * baseR * 0.6 - phase * 30;

      const alpha = (1 - phase) * 0.9;
      zone.overlay.fillStyle(0xff4400, alpha * 0.55);
      zone.overlay.fillCircle(px, py, 3 + (1 - phase) * 2.5);
      zone.overlay.fillStyle(0xffdd44, alpha);
      zone.overlay.fillCircle(px, py, 1.5);
    }

    const COALS = 8;
    for (let i = 0; i < COALS; i++) {
      const h1 = ((i * 374761393) >>> 0) / 4294967295;
      const h2 = ((i * 668265263) >>> 0) / 4294967295;
      const angle = h1 * Math.PI * 2;
      const r = Math.sqrt(h2) * zone.visualRadius * 0.8;
      const px = zone.x + Math.cos(angle) * r;
      const py = zone.y + Math.sin(angle) * r * 0.6;

      const pulse = 0.5 + Math.sin(t * 2 + i) * 0.5;
      zone.overlay.fillStyle(0xffaa00, 0.4 + pulse * 0.3);
      zone.overlay.fillCircle(px, py, 2);
      zone.overlay.fillStyle(0xffdd44, pulse * 0.6);
      zone.overlay.fillCircle(px, py, 1);
    }
  }

  private drawPoisonOverlay(zone: {
    x: number;
    y: number;
    radius: number;
    visualRadius: number;
    overlay: Phaser.GameObjects.Graphics;
    particleTime: number;
  }) {
    const t = zone.particleTime * 0.001;

    const BUBBLE_COUNT = 20;
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      const h1 = ((i * 2654435761) >>> 0) / 4294967295;
      const h2 = ((i * 1597334677) >>> 0) / 4294967295;

      const baseAngle = h1 * Math.PI * 2;
      const baseR = Math.sqrt(h2) * zone.visualRadius * 0.85;

      const phase = (t * 0.5 + i * 0.13) % 1;
      const wobble = Math.sin(t * 2 + i * 1.3) * 3;

      const px = zone.x + Math.cos(baseAngle) * baseR + wobble;
      const py = zone.y + Math.sin(baseAngle) * baseR * 0.6 - phase * 22;

      const alpha = (1 - phase) * 0.85;
      zone.overlay.fillStyle(0x44cc44, alpha * 0.4);
      zone.overlay.fillCircle(px, py, 4 + (1 - phase) * 3);
      zone.overlay.fillStyle(0x88ff88, alpha);
      zone.overlay.fillCircle(px, py, 2 + (1 - phase) * 1.5);
      zone.overlay.fillStyle(0xccffcc, alpha);
      zone.overlay.fillCircle(px - 1, py - 1, 0.8);
    }
  }

  private drawSlowOverlay(zone: {
    x: number;
    y: number;
    radius: number;
    visualRadius: number;
    overlay: Phaser.GameObjects.Graphics;
    particleTime: number;
    isBlackHole: boolean;
    color: number;
  }) {
    const t = zone.particleTime * 0.001;

    if (!zone.isBlackHole) {
      for (let i = 0; i < 6; i++) {
        const phase = (t * 0.4 + i / 6) % 1;
        const angle = i * 1.57 + t * 2;
        const dist = zone.visualRadius * phase * 0.9;
        const px = zone.x + Math.cos(angle) * dist;
        const py = zone.y + Math.sin(angle) * dist * 0.5;
        zone.overlay.fillStyle(0xaa44ff, (1 - phase) * 0.7);
        zone.overlay.fillCircle(px, py, 2);
        zone.overlay.fillStyle(0xdd88ff, (1 - phase) * 0.4);
        zone.overlay.fillCircle(px, py, 4);
      }
      return;
    }

    const ARMS = 4;
    const PARTICLES_PER_ARM = 6;

    const lerpColor = (a: number, b: number, k: number): number => {
      const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
      const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
      const r = Math.floor(ar + (br - ar) * k);
      const g = Math.floor(ag + (bg - ag) * k);
      const bl = Math.floor(ab + (bb - ab) * k);
      return (r << 16) | (g << 8) | bl;
    };

    const OUTER = 0x4422aa;
    const MID = 0xaa66ff;
    const CORE = 0xeeccff;
    const vr = zone.visualRadius;

    zone.overlay.fillStyle(0x000000, 0.75);
    zone.overlay.fillCircle(zone.x, zone.y, vr * 0.18);
    zone.overlay.fillStyle(0x220033, 0.55);
    zone.overlay.fillCircle(zone.x, zone.y, vr * 0.32);

    const photonPulse = 0.6 + Math.sin(t * 3) * 0.4;
    zone.overlay.lineStyle(2, 0xcc99ff, 0.55 * photonPulse);
    zone.overlay.strokeEllipse(zone.x, zone.y, vr * 0.44, vr * 0.44 * 0.6);

    const corePulse = 0.6 + Math.sin(t * 4) * 0.4;
    zone.overlay.fillStyle(0xeeccff, corePulse * 0.4);
    zone.overlay.fillCircle(zone.x, zone.y, vr * 0.12);
    zone.overlay.fillStyle(0xffffff, corePulse * 0.75);
    zone.overlay.fillCircle(zone.x, zone.y, vr * 0.05);

    const jetPulse = 0.7 + Math.sin(t * 6) * 0.3;
    const jetLen = vr * 0.6;
    for (const dir of [-1, 1] as const) {
      for (let i = 0; i < 10; i++) {
        const fp = i / 10;
        const jy = zone.y + dir * jetLen * fp;
        const size = (1 - fp) * 2.2 * jetPulse;
        const alpha = (1 - fp) * 0.85 * jetPulse;
        zone.overlay.fillStyle(0xaaddff, alpha * 0.45);
        zone.overlay.fillCircle(zone.x, jy, size * 2);
        zone.overlay.fillStyle(0xffffff, alpha);
        zone.overlay.fillCircle(zone.x, jy, size);
      }
    }

    for (let arm = 0; arm < ARMS; arm++) {
      const armOffset = (arm / ARMS) * Math.PI * 2;
      for (let i = 0; i < PARTICLES_PER_ARM; i++) {
        const phase = (t * 0.35 + i / PARTICLES_PER_ARM) % 1;
        const easedPhase = Math.pow(phase, 1.7);
        const dist = vr * (1 - easedPhase) * 0.9;
        const wobble = (1 - phase) * Math.sin(t * 2) * 0.3;
        const angle = armOffset + phase * 4.0 - t * (2 + phase * 3) + wobble;

        const px = zone.x + Math.cos(angle) * dist;
        const py = zone.y + Math.sin(angle) * dist * 0.6;

        const color =
          phase < 0.65
            ? lerpColor(OUTER, MID, phase / 0.65)
            : lerpColor(MID, CORE, (phase - 0.65) / 0.35);

        const alpha = 0.3 + phase * 0.7;
        const size = 5 - phase * 3;
        const twinkle = 0.85 + Math.sin(t * 8 + i * 1.7 + arm) * 0.15;

        zone.overlay.fillStyle(color, alpha * 0.35 * twinkle);
        zone.overlay.fillCircle(px, py, size);
        zone.overlay.fillStyle(color, alpha * 0.85 * twinkle);
        zone.overlay.fillCircle(px, py, size * 0.55);
        zone.overlay.fillStyle(0xffffff, alpha * twinkle);
        zone.overlay.fillCircle(px, py, size * 0.25);
      }
    }

    for (let ring = 0; ring < 3; ring++) {
      const ringDist = vr * (0.45 + ring * 0.22);
      const SEGMENTS = 12;
      const ringSpeed = t * (2.4 - ring * 0.5);
      const ringPulse = 0.5 + Math.sin(t * 3 + ring) * 0.5;
      const segColor = lerpColor(MID, CORE, 1 - ring / 3);

      for (let s = 0; s < SEGMENTS; s++) {
        if (s % 2 === 1) continue;
        const baseAngle = (s / SEGMENTS) * Math.PI * 2 - ringSpeed;
        const arcLen = ((Math.PI * 2) / SEGMENTS) * 0.6;
        for (let a = 0; a < 5; a++) {
          const angle = baseAngle + (arcLen * a) / 5;
          const px = zone.x + Math.cos(angle) * ringDist;
          const py = zone.y + Math.sin(angle) * ringDist * 0.6;
          const edgeFade = Math.sin((a / 4) * Math.PI);
          zone.overlay.fillStyle(segColor, 0.7 * edgeFade * ringPulse);
          zone.overlay.fillCircle(px, py, 1.4);
        }
      }
    }
  }
}
