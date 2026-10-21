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
    overlay
      .enableFilters()
      .filters!.external.addMask(this.scene.pathMaskSource);

    const zoneType = this.classifyZoneColor(color, isBlackHole);

    // Врата боли (6-3): единоразовый взрыв при создании + последующее горение
    if (color === 0x8b0000) {
      this.spawnExplosion(x, y, radius);
    }

    this.groundZones.push({
      x,
      y,
      radius,
      visualRadius: radius * this.VISUAL_PARTICLES_SCALE,
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

  public spawnExplosion(x: number, y: number, radius: number) {
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
      const ar = (a >> 16) & 0xff,
        ag = (a >> 8) & 0xff,
        ab = a & 0xff;
      const br = (b >> 16) & 0xff,
        bg = (b >> 8) & 0xff,
        bb = b & 0xff;
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

  public spawnWaveVisual(
    x: number,
    y: number,
    length: number,
    width: number,
    angle: number,
    kind: "lava" | "water",
  ) {
    const isLava = kind === "lava";

    const deepColor = isLava ? 0x5a0800 : 0x031a2e;
    const midColor = isLava ? 0xc42e00 : 0x1560a0;
    const brightColor = isLava ? 0xff6600 : 0x2288cc;
    const crestColor = isLava ? 0xffaa00 : 0x88ccff;
    const foamColor = isLava ? 0xffdd66 : 0xffffff;

    const baseWidth = 6;
    const maxWidth = width;
    const SEGMENTS = 24;

    const wave = this.scene.add.graphics().setPosition(x, y).setDepth(4);

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const toWorld = (lx: number, ly: number): [number, number] => [
      lx * cosA - ly * sinA,
      lx * sinA + ly * cosA,
    ];

    // Стабильный «рваный» край (не мерцает)
    const edgeNoise: number[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      edgeNoise.push((Math.random() - 0.5) * 2);
    }

    // Пена: кружки, которые текут от башни вдоль потока
    interface FoamParticle {
      t0: number;
      side: number;
      speed: number;
      size: number;
    }
    const foamParticles: FoamParticle[] = [];
    for (let i = 0; i < 30; i++) {
      foamParticles.push({
        t0: Math.random() * 0.4,
        side: (Math.random() - 0.5) * 1.8,
        speed: 0.3 + Math.random() * 0.7,
        size: 1.5 + Math.random() * 2.5,
      });
    }

    let progress = 0;
    let elapsed = 0;
    let fading = false;
    let timer: Phaser.Time.TimerEvent | null = null;

    const fillPoly = (pts: [number, number][]) => {
      if (pts.length < 3) return;
      wave.beginPath();
      const [sx, sy] = toWorld(pts[0][0], pts[0][1]);
      wave.moveTo(sx, sy);
      for (let i = 1; i < pts.length; i++) {
        const [wx, wy] = toWorld(pts[i][0], pts[i][1]);
        wave.lineTo(wx, wy);
      }
      wave.closePath();
      wave.fillPath();
    };

    const drawWave = () => {
      wave.clear();
      if (progress <= 0) return;

      const alphaAt = (t: number) => {
        if (t <= 0.7) return 1;
        return Math.max(0, 1 - (t - 0.7) / 0.3);
      };

      // ── 1. Основа конуса с рваными краями ──
      for (let i = 0; i < SEGMENTS; i++) {
        const t1 = i / SEGMENTS;
        const t2 = (i + 1) / SEGMENTS;
        if (t1 >= progress) break;
        const t2c = Math.min(t2, progress);

        const w1 = baseWidth + (maxWidth - baseWidth) * t1;
        const w2 = baseWidth + (maxWidth - baseWidth) * t2c;
        const x1 = length * t1;
        const x2 = length * t2c;

        const a = alphaAt(t2c);
        const e1 = w1 * 0.15 * edgeNoise[i];
        const e2 = w2 * 0.15 * edgeNoise[i + 1];

        wave.fillStyle(deepColor, a * 0.9);
        fillPoly([
          [x1, -w1 / 2 + e1],
          [x2, -w2 / 2 + e2],
          [x2, w2 / 2 + e2 * 0.5],
          [x1, w1 / 2 + e1 * 0.5],
        ]);

        wave.fillStyle(midColor, a * 0.95);
        fillPoly([
          [x1, -w1 * 0.4 + e1 * 0.6],
          [x2, -w2 * 0.4 + e2 * 0.6],
          [x2, w2 * 0.4 - e2 * 0.3],
          [x1, w1 * 0.4 - e1 * 0.3],
        ]);

        wave.fillStyle(brightColor, a * 0.7);
        fillPoly([
          [x1, -w1 * 0.4 + e1 * 0.6],
          [x2, -w2 * 0.4 + e2 * 0.6],
          [x2, -w2 * 0.1],
          [x1, -w1 * 0.1],
        ]);

        wave.fillStyle(crestColor, a * 0.85);
        fillPoly([
          [x1, -w1 * 0.4 + e1 * 0.6],
          [x2, -w2 * 0.4 + e2 * 0.6],
          [x2, -w2 * 0.28],
          [x1, -w1 * 0.28],
        ]);
      }

      // ── 2. Круговые волны давления — расходятся от башни ──
      // Главный маркер «вид сверху»: кольца на воде
      const ringCount = 4;
      for (let r = 0; r < ringCount; r++) {
        const ringPhase = (elapsed * 0.0015 + r * 0.3) % 1;
        if (ringPhase < 0.08) continue;

        const ringCenterT = ringPhase * progress;
        const ringRadius = ringPhase * maxWidth * 0.4;
        const ringAlpha = (1 - ringPhase) * 0.6;
        if (ringAlpha < 0.1) continue;

        const cx = length * ringCenterT;

        wave.lineStyle(2, crestColor, ringAlpha);
        wave.beginPath();
        const RING_SEGMENTS = 20;
        for (let s = 0; s <= RING_SEGMENTS; s++) {
          const theta = (s / RING_SEGMENTS) * Math.PI * 2;
          const lx = cx + Math.cos(theta) * ringRadius;
          const ly = Math.sin(theta) * ringRadius * 0.8;
          const [wx, wy] = toWorld(lx, ly);
          if (s === 0) wave.moveTo(wx, wy);
          else wave.lineTo(wx, wy);
        }
        wave.strokePath();
      }

      // ── 3. Пена — кружки, текут вдоль потока ──
      for (const fp of foamParticles) {
        const foamT = (fp.t0 + elapsed * 0.001 * fp.speed) % 1;
        if (foamT > progress || foamT < 0.05) continue;

        const lx = length * foamT;
        const wHere = baseWidth + (maxWidth - baseWidth) * foamT;
        const ly = fp.side * wHere * 0.4 * 0.85;

        const foamAlpha = Math.sin(foamT * Math.PI) * 0.8;
        if (foamAlpha < 0.15) continue;

        const [wx, wy] = toWorld(lx, ly);
        wave.fillStyle(foamColor, foamAlpha);
        wave.fillCircle(wx, wy, fp.size);
      }

      // ── 4. Рваный край — пузыри по периметру ──
      for (let i = 1; i < SEGMENTS; i += 2) {
        const t1 = i / SEGMENTS;
        if (t1 >= progress) break;

        const wHere = baseWidth + (maxWidth - baseWidth) * t1;
        const xHere = length * t1;
        const a = 0.7 * alphaAt(t1);
        if (a < 0.15) continue;

        const e = edgeNoise[i] * wHere * 0.12;

        const r1 = 2 + (edgeNoise[i] + 1) * 1.5;
        const [wx1, wy1] = toWorld(xHere, -wHere * 0.4 + e);
        wave.fillStyle(foamColor, a * 0.7);
        wave.fillCircle(wx1, wy1, r1);

        const r2 = 2 + (edgeNoise[i] + 1) * 1.5;
        const [wx2, wy2] = toWorld(xHere, wHere * 0.4 + e * 0.5);
        wave.fillStyle(foamColor, a * 0.5);
        wave.fillCircle(wx2, wy2, r2);
      }
    };

    timer = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        elapsed += 16;
        if (!fading && progress < 1) progress = Math.min(1, progress + 0.06);

        if (elapsed >= 700 && !fading) {
          fading = true;
          this.scene.tweens.add({
            targets: wave,
            alpha: 0,
            duration: 500,
            onComplete: () => {
              if (timer) {
                timer.destroy();
                timer = null;
              }
              wave.destroy();
            },
          });
        }
        drawWave();
      },
    });

    // ── 5. Брызги при вылете ──
    for (let i = 0; i < 8; i++) {
      this.scene.time.delayedCall(100 + i * 40, () => {
        const foamAngle = angle + (Math.random() - 0.5) * 0.8;
        const foamDist = length * (0.5 + Math.random() * 0.4);
        const foamX = x + Math.cos(foamAngle) * foamDist;
        const foamY = y + Math.sin(foamAngle) * foamDist;

        const foam = this.scene.add.graphics().setDepth(4);
        foam.fillStyle(foamColor, 0.9);
        foam.fillCircle(0, 0, 2 + Math.random() * 2);
        foam.setPosition(foamX, foamY);

        this.scene.tweens.add({
          targets: foam,
          x: foamX + Math.cos(foamAngle) * (15 + Math.random() * 20),
          y: foamY + Math.sin(foamAngle) * (15 + Math.random() * 20),
          alpha: { from: 0.9, to: 0 },
          scale: 0.4,
          duration: 400 + Math.random() * 200,
          ease: "Quad.easeOut",
          onComplete: () => foam.destroy(),
        });
      });
    }
  }

  /** Трещины на земле от удара (Молот/Король гномов). */
  public spawnGroundCrack(
    x: number,
    y: number,
    radius: number,
    kind: "hammer" | "gnome",
  ) {
    const isGnome = kind === "gnome";
    const color = isGnome ? 0x66ccff : 0xcc8844;
    const bright = isGnome ? 0xaaddff : 0xffcc66;
    const visualRadius = radius * 1.3; // трещины уходят на 30% дальше радиуса скилла

    // ── 1. Центральная вспышка ──
    const flash = this.scene.add.graphics().setPosition(x, y).setDepth(4);
    flash.fillStyle(0xffffff, 0.95);
    flash.fillCircle(0, 0, radius * 0.6);
    this.scene.tweens.add({
      targets: flash,
      scale: 1.6,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });

    // ── 2. Ударное кольцо ──
    const ring = this.scene.add.graphics().setPosition(x, y).setDepth(4);
    ring.lineStyle(3, bright, 0.9);
    ring.strokeCircle(0, 0, radius * 0.6);
    this.scene.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 500,
      onComplete: () => ring.destroy(),
    });

    // ── 3. Разломы-трещины (зигзаг + ответвления) ──
    const cracks = this.scene.add.graphics().setPosition(x, y).setDepth(4);

    const crackCount = 7 + Math.floor(Math.random() * 3); // 7–9 основных

    for (let i = 0; i < crackCount; i++) {
      const baseAngle =
        (i / crackCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const segments = 6 + Math.floor(Math.random() * 3); // 4–6 изломов

      let cx = Math.cos(baseAngle) * (4 + Math.random() * 8);
      let cy = Math.sin(baseAngle) * (4 + Math.random() * 8) * 0.6;
      let angle = baseAngle;

      for (let s = 0; s < segments; s++) {
        const t = s / segments;
        const segLen = (visualRadius / segments) * (0.7 + Math.random() * 0.6);

        // Мягко возвращаем к «наружу» + зигзаг
        angle += (baseAngle - angle) * 0.15 + (Math.random() - 0.5) * 0.6;

        const nx = cx + Math.cos(angle) * segLen;
        const ny = cy + Math.sin(angle) * segLen * 0.6;

        // Толщина убывает: 4 → 1
        const thickness = Math.max(1, 4 - t * 3);
        cracks.lineStyle(thickness, color, 0.95);
        cracks.beginPath();
        cracks.moveTo(cx, cy);
        cracks.lineTo(nx, ny);
        cracks.strokePath();

        // Яркая «горячая» жилка внутри трещины (только в первой половине)
        if (t < 0.6) {
          cracks.lineStyle(1, bright, 0.7 * (1 - t));
          cracks.beginPath();
          cracks.moveTo(cx, cy);
          cracks.lineTo(nx, ny);
          cracks.strokePath();
        }

        // Ответвление в сторону (не от каждой трещины, 40% шанс на сегмент)
        if (s > 0 && s < segments - 1 && Math.random() < 0.4) {
          const branchAngle = angle + (Math.random() - 0.5) * 1.4;
          const branchLen = segLen * (0.4 + Math.random() * 0.4);
          const bx = nx + Math.cos(branchAngle) * branchLen;
          const by = ny + Math.sin(branchAngle) * branchLen * 0.6;
          cracks.lineStyle(Math.max(1, thickness - 1), color, 0.85);
          cracks.beginPath();
          cracks.moveTo(nx, ny);
          cracks.lineTo(bx, by);
          cracks.strokePath();
        }

        cx = nx;
        cy = ny;
      }
    }

    // ── 4. Мелкая «паутинка» между основными ──
    for (let i = 0; i < crackCount * 2; i++) {
      const baseAngle = Math.random() * Math.PI * 2;
      const startDist = radius * (0.2 + Math.random() * 0.5);
      const segLen = radius * (0.15 + Math.random() * 0.2);
      const sx = Math.cos(baseAngle) * startDist;
      const sy = Math.sin(baseAngle) * startDist * 0.6;
      const endAngle = baseAngle + (Math.random() - 0.5) * 1.2;
      const ex = sx + Math.cos(endAngle) * segLen;
      const ey = sy + Math.sin(endAngle) * segLen * 0.6;

      cracks.lineStyle(1, color, 0.7);
      cracks.beginPath();
      cracks.moveTo(sx, sy);
      cracks.lineTo(ex, ey);
      cracks.strokePath();
    }

    // ── 5. Осколки разлетаются ──
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = visualRadius * (0.4 + Math.random() * 0.6);
      const debris = this.scene.add.graphics().setPosition(x, y).setDepth(16);
      debris.fillStyle(color, 0.9);
      debris.fillCircle(0, 0, 1.5 + Math.random() * 1.5);
      this.scene.tweens.add({
        targets: debris,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist * 0.6,
        alpha: 0,
        duration: 400 + Math.random() * 300,
        ease: "Quad.easeOut",
        onComplete: () => debris.destroy(),
      });
    }

    // ── 6. Плавное затухание ──
    this.scene.tweens.add({
      targets: cracks,
      alpha: 0,
      duration: 700,
      delay: 200,
      onComplete: () => cracks.destroy(),
    });
  }

  /** Разлёт снежинок (Глыба льда — 5 волн). */
  public spawnSnowBurst(x: number, y: number, radius: number) {
    const FLAKE_COUNT = 36;
    const FLAKE_SIZE = 7; // длина луча (было 4)

    for (let i = 0; i < FLAKE_COUNT; i++) {
      const angle = (i / FLAKE_COUNT) * Math.PI * 2 + Math.random() * 0.2;
      const dist = radius * (0.2 + Math.random() * 1);
      const wx = x + Math.cos(angle) * dist;
      const wy = y + Math.sin(angle) * dist * 0.6;
      const flake = this.scene.add.graphics().setPosition(wx, wy).setDepth(16);
      flake.lineStyle(2, 0xaaddff, 1);

      const s = FLAKE_SIZE;
      flake.beginPath();
      flake.moveTo(-s, 0);
      flake.lineTo(s, 0);
      flake.moveTo(0, -s);
      flake.lineTo(0, s);
      flake.moveTo(-s * 0.7, -s * 0.7);
      flake.lineTo(s * 0.7, s * 0.7);
      flake.moveTo(-s * 0.7, s * 0.7);
      flake.lineTo(s * 0.7, -s * 0.7);
      flake.strokePath();

      flake.fillStyle(0xffffff, 0.95);
      flake.fillCircle(0, 0, 2.5);

      this.scene.tweens.add({
        targets: flake,
        scale: 1.6,
        alpha: 0,
        angle: 180,
        duration: 700,
        delay: i * 15,
        ease: "Quad.easeOut",
        onComplete: () => flake.destroy(),
      });
    }
  }

  /** Электричество расходится от башни (Шаровая молния). */
  public spawnElectricBurst(x: number, y: number, radius: number) {
    const g = this.scene.add.graphics().setPosition(x, y).setDepth(16);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.4;
      const len = radius * (0.7 + Math.random() * 0.3);
      g.lineStyle(2, 0x44ddff, 0.95);
      g.beginPath();
      g.moveTo(0, 0);
      for (let s = 1; s <= 4; s++) {
        const t = s / 4;
        const jitter = (Math.random() - 0.5) * 15;
        const nx =
          Math.cos(angle) * len * t + Math.cos(angle + Math.PI / 2) * jitter;
        const ny =
          Math.sin(angle) * len * t + Math.sin(angle + Math.PI / 2) * jitter;
        g.lineTo(nx, ny);
      }
      g.strokePath();
    }
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      scale: 1.2,
      duration: 400,
      onComplete: () => g.destroy(),
    });
  }

  /** Взрыв пузыря крови (Король вампиров). */
  public spawnBloodBubble(x: number, y: number, radius: number) {
    const bubble = this.scene.add.graphics().setPosition(x, y).setDepth(14);
    bubble.fillStyle(0xaa0000, 0.9);
    bubble.fillCircle(0, 0, radius * 0.3);
    bubble.fillStyle(0xff2222, 0.7);
    bubble.fillCircle(-radius * 0.1, -radius * 0.1, radius * 0.15);
    this.scene.tweens.add({
      targets: bubble,
      scale: 2,
      alpha: 0,
      duration: 700,
      onComplete: () => bubble.destroy(),
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3;
      const dist = radius * (0.8 + Math.random() * 0.5);
      const drop = this.scene.add.graphics().setPosition(x, y).setDepth(15);
      drop.enableFilters().filters!.external.addMask(this.scene.pathMaskSource);
      drop.fillStyle(0xdd0000, 1);
      drop.fillCircle(0, 0, 3);
      this.scene.tweens.add({
        targets: drop,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist * 0.6,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        ease: "Quad.easeOut",
        onComplete: () => drop.destroy(),
      });
    }
  }

  /** Луч от башни к мобу (Алтарь смерти). */
  public spawnBeam(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: number,
  ) {
    const beam = this.scene.add.graphics().setDepth(16);
    beam.lineStyle(4, color, 0.95);
    beam.beginPath();
    beam.moveTo(x1, y1);
    beam.lineTo(x2, y2);
    beam.strokePath();
    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 400,
      onComplete: () => beam.destroy(),
    });
  }

  /** Столб света над мобом (Король душ). */
  public spawnLightPillar(x: number, y: number, color: number = 0xffffcc) {
    const pillar = this.scene.add.graphics().setPosition(x, y).setDepth(15);
    pillar.fillStyle(color, 0.85);
    pillar.fillRect(-15, -200, 30, 200);
    pillar.fillStyle(0xffffff, 0.5);
    pillar.fillRect(-5, -200, 10, 200);
    this.scene.tweens.add({
      targets: pillar,
      alpha: 0,
      scaleX: 1.6,
      duration: 500,
      onComplete: () => pillar.destroy(),
    });
  }

  /** Молния с неба в моба (Магическая статуя). */
  public spawnLightningStrike(x: number, y: number) {
    const lightning = this.scene.add.graphics().setDepth(17);
    const startX = x + (Math.random() - 0.5) * 20;
    const startY = y - 220;
    lightning.lineStyle(3, 0xffff44, 1);
    lightning.beginPath();
    lightning.moveTo(startX, startY);
    for (let i = 1; i <= 6; i++) {
      const t = i / 6;
      lightning.lineTo(
        startX + (x - startX) * t + (Math.random() - 0.5) * 20,
        startY + (y - startY) * t,
      );
    }
    lightning.strokePath();
    this.scene.tweens.add({
      targets: lightning,
      alpha: 0,
      duration: 300,
      onComplete: () => lightning.destroy(),
    });

    const flash = this.scene.add.graphics().setPosition(x, y).setDepth(17);
    flash.fillStyle(0xffffff, 1);
    flash.fillCircle(0, 0, 16);
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }

  /** Разлёт капель крови (Высший демон). */
  public spawnBloodSplatter(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const dist = 30 + Math.random() * 30;
      const drop = this.scene.add.graphics().setPosition(x, y).setDepth(17);
      drop.fillStyle(0xcc0000, 1);
      drop.fillCircle(0, 0, 2 + Math.random() * 2);
      this.scene.tweens.add({
        targets: drop,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist * 0.6,
        alpha: 0,
        duration: 400 + Math.random() * 300,
        ease: "Quad.easeOut",
        onComplete: () => drop.destroy(),
      });
    }
  }

  /** Корни оплетают моба (Мировое древо). */
  public spawnRootEntangle(x: number, y: number, duration: number) {
    const ROOT_COUNT = 9;
    const SEGMENTS = 10;
    const GROUND_Y_OFFSET = 12; // корни выползают снизу (из «земли»)

    interface RootData {
      baseAngle: number;
      endAngleOffset: number;
      wobbleAmp: number;
      wobbleFreq: number;
      phase: number;
      thickness: number;
      branchSide: number;
    }

    // Параметры корней — ОДИН РАЗ, чтобы извивы не прыгали каждый кадр
    const rootData: RootData[] = [];
    for (let i = 0; i < ROOT_COUNT; i++) {
      const baseAngle =
        (i / ROOT_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      rootData.push({
        baseAngle,
        endAngleOffset: (Math.random() - 0.5) * 1.0,
        wobbleAmp: 5 + Math.random() * 4, // сила змеиности
        wobbleFreq: 3 + Math.random() * 1.5, // частота извивов
        phase: Math.random() * Math.PI * 2,
        thickness: 2.5 + Math.random() * 1.5,
        branchSide: Math.random() < 0.5 ? 1 : -1,
      });
    }

    const roots = this.scene.add.graphics().setPosition(x, y).setDepth(16);
    const progress = { value: 0 };

    this.scene.tweens.add({
      targets: progress,
      value: 1,
      duration: 600,
      ease: "Quad.easeOut",
      onUpdate: () => {
        const p = progress.value;
        roots.clear();

        for (const rd of rootData) {
          const startDist = 30;
          const endDist = 6;

          // Строим полилинию из точек с извивами
          const points: { x: number; y: number }[] = [];
          for (let s = 0; s <= SEGMENTS; s++) {
            const t = s / SEGMENTS;
            const angle = rd.baseAngle + rd.endAngleOffset * t;
            const dist = startDist + (endDist - startDist) * t;

            // Извив перпендикулярно направлению корня
            const perpX = -Math.sin(angle);
            const perpY = Math.cos(angle);
            const wobble =
              Math.sin(t * rd.wobbleFreq * Math.PI + rd.phase) *
              rd.wobbleAmp *
              (1 - t); // у основания змеистость максимальна, у конца — затихает

            // Корень растёт из земли: старт ниже, конец — на уровне моба
            const yOffset = GROUND_Y_OFFSET * (1 - t);

            const px = Math.cos(angle) * dist + perpX * wobble;
            const py =
              Math.sin(angle) * dist * 0.6 + perpY * wobble * 0.6 + yOffset;

            points.push({ x: px, y: py });
          }

          const maxIdx = Math.floor(SEGMENTS * p);

          // ── Основной корень (толстый у земли → тонкий на конце) ──
          for (let s = 0; s < maxIdx; s++) {
            const p1 = points[s];
            const p2 = points[s + 1];
            const t = s / SEGMENTS;
            const thickness = Math.max(1, rd.thickness * (1 - t * 0.6));
            roots.lineStyle(thickness, 0x5a3a1e, 0.95);
            roots.beginPath();
            roots.moveTo(p1.x, p1.y);
            roots.lineTo(p2.x, p2.y);
            roots.strokePath();
          }

          // ── Мох/зелёный блик вдоль передней части корня ──
          for (let s = 0; s < maxIdx; s++) {
            const p1 = points[s];
            const p2 = points[s + 1];
            const t = s / SEGMENTS;
            if (t > 0.7) break;
            roots.lineStyle(0.8, 0x88cc66, 0.5 * (1 - t));
            roots.beginPath();
            roots.moveTo(p1.x, p1.y);
            roots.lineTo(p2.x, p2.y);
            roots.strokePath();
          }

          // ── Мелкие ответвления (растут вместе с основным корнем) ──
          for (let s = 2; s < maxIdx; s += 2) {
            const bp = points[s];
            const t = s / SEGMENTS;
            const branchLen = 6 * (1 - t) * Math.min(1, (p - s / SEGMENTS) * 2);
            if (branchLen < 1) continue;

            const branchAngle =
              rd.baseAngle +
              rd.endAngleOffset * t +
              rd.branchSide * (Math.PI / 3 + (s % 2) * 0.3);
            const bex = bp.x + Math.cos(branchAngle) * branchLen;
            const bey = bp.y + Math.sin(branchAngle) * branchLen * 0.6;

            roots.lineStyle(1, 0x5a3a1e, 0.85);
            roots.beginPath();
            roots.moveTo(bp.x, bp.y);
            roots.lineTo(bex, bey);
            roots.strokePath();
          }
        }
      },
      onComplete: () => {
        // Держим корни на мобе `duration` миллисекунд, плавно убираем в конце
        this.scene.tweens.add({
          targets: roots,
          alpha: 0,
          duration: 400,
          delay: Math.max(0, duration - 400),
          onComplete: () => roots.destroy(),
        });
      },
    });
  }

  public spawnHeroStrike(x: number, y: number, damage: number) {
    const S = 1;

    // Пропорции
    const bladeW = 14 * S; // ширина клинка (было 6!)
    const bladeH = 100 * S; // длина клинка (без острия)
    const tipH = 26 * S; // длина острия
    const guardW = 44 * S; // ширина гарды
    const guardH = 7 * S;
    const gripW = 8 * S;
    const gripH = 24 * S;

    // Раскладка по Y (0,0 = остриё)
    const bladeBodyTop = -(bladeH + tipH);
    const guardTop = bladeBodyTop - guardH;
    const gripTop = guardTop - gripH;
    const pommelY = gripTop - 5 * S;

    // ═══ МЕЧ ═══
    const blade = this.scene.add.graphics();

    // Клинок (сужается к острию — это ключ, почему не «пуля»)
    blade.fillStyle(0xdddddd, 1);
    blade.beginPath();
    blade.moveTo(-bladeW / 2, bladeBodyTop);
    blade.lineTo(bladeW / 2, bladeBodyTop);
    blade.lineTo(bladeW * 0.35, bladeBodyTop + bladeH);
    blade.lineTo(0, 0); // остриё
    blade.lineTo(-bladeW * 0.35, bladeBodyTop + bladeH);
    blade.closePath();
    blade.fillPath();

    // Правая грань (тёмная — объём)
    blade.fillStyle(0x999999, 1);
    blade.beginPath();
    blade.moveTo(bladeW / 2, bladeBodyTop);
    blade.lineTo(bladeW * 0.35, bladeBodyTop + bladeH);
    blade.lineTo(0, 0);
    blade.lineTo(0, bladeBodyTop + 4 * S);
    blade.closePath();
    blade.fillPath();

    // Левая грань (светлая — блик)
    blade.fillStyle(0xf5f5f5, 0.9);
    blade.beginPath();
    blade.moveTo(-bladeW / 2, bladeBodyTop);
    blade.lineTo(-bladeW * 0.35, bladeBodyTop + bladeH);
    blade.lineTo(0, 0);
    blade.lineTo(0, bladeBodyTop + 4 * S);
    blade.closePath();
    blade.fillPath();

    // Дол (центральная канавка)
    blade.fillStyle(0x888888, 1);
    blade.fillRect(-1.5 * S, bladeBodyTop + 4 * S, 3 * S, bladeH - 8 * S);

    // Гарда
    blade.fillStyle(0xffcc44, 1);
    blade.fillRect(-guardW / 2, guardTop, guardW, guardH);
    // Левый кончик гарды
    blade.beginPath();
    blade.moveTo(-guardW / 2, guardTop);
    blade.lineTo(-guardW / 2 - 4 * S, guardTop + guardH / 2);
    blade.lineTo(-guardW / 2, guardTop + guardH);
    blade.closePath();
    blade.fillPath();
    // Правый кончик
    blade.beginPath();
    blade.moveTo(guardW / 2, guardTop);
    blade.lineTo(guardW / 2 + 4 * S, guardTop + guardH / 2);
    blade.lineTo(guardW / 2, guardTop + guardH);
    blade.closePath();
    blade.fillPath();
    // Тень гарды
    blade.fillStyle(0xaa8800, 1);
    blade.fillRect(-guardW / 2, guardTop + guardH - 2 * S, guardW, 2 * S);

    // Рукоять
    blade.fillStyle(0x5a2a0a, 1);
    blade.fillRect(-gripW / 2, gripTop, gripW, gripH);
    // Обмотка
    blade.fillStyle(0x884422, 1);
    for (let i = 0; i < 5; i++) {
      blade.fillRect(
        -gripW / 2,
        gripTop + i * (gripH / 5) + 1.5 * S,
        gripW,
        1.5 * S,
      );
    }

    // Навершие
    blade.fillStyle(0xffcc44, 1);
    blade.fillCircle(0, pommelY, 5.5 * S);
    blade.fillStyle(0xffee88, 1);
    blade.fillCircle(-1.5 * S, pommelY - 1.5 * S, 2 * S);

    // ═══ СЛЕД (motion trail) ═══
    const trail = this.scene.add.graphics();
    trail.fillStyle(0xffcc44, 0.3);
    trail.fillRect(
      -bladeW / 2 - 2 * S,
      bladeBodyTop - 120 * S,
      bladeW + 4 * S,
      120 * S,
    );
    trail.fillStyle(0xffcc44, 0.15);
    trail.fillRect(
      -bladeW / 2 - 6 * S,
      bladeBodyTop - 180 * S,
      bladeW + 12 * S,
      60 * S,
    );

    // ═══ ПОЗИЦИЯ + НАКЛОН ═══
    const startY = y - 260 * S;
    blade.setPosition(x, startY).setDepth(19).setRotation(-0.12);
    trail.setPosition(x, startY).setDepth(18).setRotation(-0.12);

    // ═══ ПАДЕНИЕ ═══
    this.scene.tweens.add({
      targets: blade,
      y: y + 20,
      rotation: 0,
      duration: 280,
      ease: "Quad.easeIn",
      onComplete: () => {
        // Вспышка
        const flash = this.scene.add.graphics().setPosition(x, y).setDepth(19);
        flash.fillStyle(0xffffff, 1);
        flash.fillCircle(0, 0, 22 * S);
        flash.fillStyle(0xffcc44, 0.6);
        flash.fillCircle(0, 0, 38 * S);
        this.scene.tweens.add({
          targets: flash,
          scale: 2.2,
          alpha: 0,
          duration: 300,
          ease: "Quad.easeOut",
          onComplete: () => flash.destroy(),
        });

        // Искры
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * Math.PI * 2 + Math.random() * 0.4;
          const spark = this.scene.add
            .graphics()
            .setPosition(x, y)
            .setDepth(20);
          spark.fillStyle(i % 2 ? 0xffdd44 : 0xffffff, 1);
          spark.fillCircle(0, 0, 2 + Math.random() * 2);
          this.scene.tweens.add({
            targets: spark,
            x: x + Math.cos(angle) * (40 + Math.random() * 35),
            y: y + Math.sin(angle) * (35 + Math.random() * 30),
            alpha: 0,
            scale: 0.2,
            duration: 400 + Math.random() * 250,
            ease: "Quad.easeOut",
            onComplete: () => spark.destroy(),
          });
        }

        // Текст
        const txt = this.scene.add
          .text(x, y - 40, `+${damage}!`, {
            fontSize: "28px",
            color: "#ffcc44",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 5,
          })
          .setOrigin(0.5)
          .setDepth(20)
          .setScale(0);
        this.scene.tweens.add({
          targets: txt,
          scale: 1,
          duration: 180,
          ease: "Back.easeOut",
          onComplete: () => {
            this.scene.tweens.add({
              targets: txt,
              y: y - 90,
              alpha: 0,
              duration: 700,
              ease: "Quad.easeOut",
              onComplete: () => txt.destroy(),
            });
          },
        });

        this.scene.cameras.main.shake(90, 0.003);

        // ═══ МЕЧ ТОРЧИТ 500мс, ПОТОМ РАСТВОРЯЕТСЯ ═══
        this.scene.time.delayedCall(500, () => {
          this.scene.tweens.add({
            targets: blade,
            alpha: 0,
            y: y + 30,
            duration: 300,
            ease: "Quad.easeIn",
            onComplete: () => blade.destroy(),
          });
        });
      },
    });
  }

  public spawnSoulCrit(x: number, y: number) {
    // 1. Фиолетовый столб света
    const pillar = this.scene.add.graphics().setPosition(x, y).setDepth(15);
    pillar.fillStyle(0xcc88ff, 0.85);
    pillar.fillRect(-15, -200, 30, 200);
    pillar.fillStyle(0xffffff, 0.5);
    pillar.fillRect(-5, -200, 10, 200);
    this.scene.tweens.add({
      targets: pillar,
      alpha: 0,
      scaleX: 1.6,
      duration: 600,
      onComplete: () => pillar.destroy(),
    });

    // 2. Души вылетают вверх
    for (let i = 0; i < 10; i++) {
      const offsetX = (Math.random() - 0.5) * 40;
      const offsetY = (Math.random() - 0.5) * 20;
      const soul = this.scene.add
        .graphics()
        .setPosition(x + offsetX, y + offsetY)
        .setDepth(16);
      soul.fillStyle(0xddbbff, 0.9);
      soul.fillCircle(0, 0, 6 + Math.random() * 3);
      soul.fillStyle(0xffffff, 0.7);
      soul.fillCircle(-1, -1, 2.5);
      this.scene.tweens.add({
        targets: soul,
        y: y + offsetY - 80 - Math.random() * 40,
        x: x + offsetX + (Math.random() - 0.5) * 20,
        alpha: 0,
        scale: 1.4,
        duration: 700 + Math.random() * 300,
        delay: i * 40,
        ease: "Quad.easeOut",
        onComplete: () => soul.destroy(),
      });
    }

    // 3. Вспышка в точке удара
    const flash = this.scene.add.graphics().setPosition(x, y).setDepth(17);
    flash.fillStyle(0xffffff, 0.95);
    flash.fillCircle(0, 0, 20);
    this.scene.tweens.add({
      targets: flash,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => flash.destroy(),
    });
  }
}
