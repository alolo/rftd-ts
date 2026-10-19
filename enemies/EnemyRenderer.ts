import * as Phaser from "phaser";
import type { EnemyStats } from "./EnemyTypes";

export class EnemyRenderer {
  public sprite: Phaser.GameObjects.Sprite;
  public hpBar: Phaser.GameObjects.Graphics;
  public hpText: Phaser.GameObjects.Text;
  public stunIcon: Phaser.GameObjects.Text;
  public statusAura: Phaser.GameObjects.Graphics;
  public statusParticles: Phaser.GameObjects.Graphics;
  public readonly scale: number;
  public readonly topY: number;

  private particleTime = 0;
  private currentTint: number | null = null;

  private baseKey: string;
  private currentDirection: "front" | "side" | "back" | null = null;

  constructor(scene: Phaser.Scene, stats: EnemyStats, cellSize: number) {
    this.baseKey = `mob_${stats.studioMobId}`;
    const sideKey = `${this.baseKey}_side`;
    const sideFrame = `${sideKey}_0`;
    const sideAnim = `${sideKey}_walk`;

if (!scene.textures.exists(sideKey)) {
  console.error(`[EnemyRenderer] Missing texture: ${sideKey}, using fallback`);
  // Fallback: используем красный квадрат Phaser по умолчанию.
  // Игра не крашится, моб выглядит как красный маркер — сразу видно, кого не хватает.
  this.baseKey = "__DEFAULT";
  // ↓ продолжаем инициализацию с фолбэком
  this.scale = stats.radius ? stats.radius / 18 : 1;
  this.topY = 0;
  this.sprite = scene.add.sprite(0, 0, "__DEFAULT");
  this.sprite.setTint(0xff0000);
  this.hpBar = scene.add.graphics();
  this.hpText = scene.add.text(0, -20, "", {
    fontSize: "11px",
    color: "#ffffff",
    fontStyle: "bold",
    stroke: "#000000",
    strokeThickness: 3,
  }).setOrigin(0.5);
  this.stunIcon = scene.add.text(0, -34, "💫", { fontSize: "16px" }).setOrigin(0.5).setVisible(false);
  this.statusAura = scene.add.graphics();
  this.statusParticles = scene.add.graphics();
  this.sprite.setDisplaySize(cellSize * 0.5, cellSize * 0.5);
  return;
}

    const baseRadius = 18;
    const scale = stats.radius ? stats.radius / baseRadius : 1;
    const feetLocalY = 24;
    const yShift = -feetLocalY * (scale - 1);

    this.scale = scale;
    this.topY = yShift - (cellSize * scale) / 2; // локальный Y верхней грани кадра спрайта

    this.sprite = scene.add.sprite(0, 0, sideKey, sideFrame);
    this.sprite.setDisplaySize(cellSize * scale, cellSize * scale);
    this.sprite.setOrigin(0.5, 0.5);
    this.sprite.setY(yShift);

    if (scene.anims.exists(sideAnim)) {
      this.sprite.play(sideAnim);
      this.currentDirection = "side";
    }

    this.hpBar = scene.add.graphics();

    this.hpText = scene.add
      .text(0, this.topY - 22, "", {
        fontSize: "11px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.stunIcon = scene.add
      .text(0, this.topY - 34, "💫", {
        fontSize: "16px",
      })
      .setOrigin(0.5)
      .setVisible(false);

    this.statusAura = scene.add.graphics();
    this.statusParticles = scene.add.graphics();

    this.hpBar.setY(yShift);
    this.hpText.setY(this.hpText.y + yShift);
    this.stunIcon.setY(this.stunIcon.y + yShift);
  }

  public setDirection(
    direction: "front" | "side" | "back",
    flipX: boolean,
  ): void {
    if (this.currentDirection !== direction) {
      const animKey = `${this.baseKey}_${direction}_walk`;
      if (this.sprite.scene.anims.exists(animKey)) {
        this.sprite.play(animKey);
        this.currentDirection = direction;
      }
    }

    // Только боковой ракурс флипается. Фронт и спина симметричны.
    this.sprite.setFlipX(direction === "side" ? flipX : false);
  }
    public updateStatusEffects(
    delta: number,
    cellSize: number,
    status: { slow: boolean; poison: boolean; burn: boolean },
  ) {
    const any = status.slow || status.poison || status.burn;

    // ---------- 1. Tint спрайта ----------
    if (any) {
      const colors: number[] = [];
      if (status.slow) colors.push(0x88bbff);
      if (status.poison) colors.push(0x88ff88);
      if (status.burn) colors.push(0xffaa66);

      let r = 0;
      let g = 0;
      let b = 0;
      for (const c of colors) {
        r += (c >> 16) & 0xff;
        g += (c >> 8) & 0xff;
        b += c & 0xff;
      }
      const n = colors.length;
      const tint = ((Math.floor(r / n) << 16) | (Math.floor(g / n) << 8) | Math.floor(b / n)) >>> 0;

      if (tint !== this.currentTint) {
        this.sprite.setTint(tint);
        this.currentTint = tint;
      }
    } else if (this.currentTint !== null) {
      this.sprite.clearTint();
      this.currentTint = null;
    }

    // ---------- 2. Аура + частицы ----------
    this.statusAura.clear();
    this.statusParticles.clear();
    if (!any) return;

    this.particleTime += delta;

    const pulse = 0.6 + Math.sin(this.particleTime * 0.008) * 0.4;
    const spriteBaseY = this.sprite.y;
    const spriteHalfH = (cellSize * this.scale) / 2;
    const feetY = spriteBaseY + spriteHalfH - 4;
    const bodyY = spriteBaseY;

    // Аура: эллипс под мобом
    const auraW = cellSize * 0.9;
    const auraH = cellSize * 0.32;
    if (status.slow) {
      this.statusAura.fillStyle(0x66aaff, 0.25 + pulse * 0.2);
      this.statusAura.fillEllipse(0, feetY, auraW, auraH);
    }
    if (status.poison) {
      this.statusAura.fillStyle(0x44ff44, 0.25 + pulse * 0.2);
      this.statusAura.fillEllipse(0, feetY, auraW * 0.85, auraH * 0.85);
    }
    if (status.burn) {
      this.statusAura.fillStyle(0xff8822, 0.3 + pulse * 0.25);
      this.statusAura.fillEllipse(0, feetY, auraW * 0.9, auraH * 0.9);
    }

    // Частицы
    const t = this.particleTime * 0.001;
    const PARTICLE_COUNT = 3;

    // Яд — зелёные пузырьки, поднимаются
    if (status.poison) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phase = (t * 0.8 + i / PARTICLE_COUNT) % 1;
        const px = (i - 1) * 10 + Math.sin(t * 4 + i * 1.7) * 3;
        const py = bodyY - phase * 30;
        const alpha = 1 - phase;
        this.statusParticles.fillStyle(0x66ff66, alpha * 0.9);
        this.statusParticles.fillCircle(px, py, 2 + (1 - phase) * 1.5);
      }
    }

    // Горение — оранжево-жёлтые огоньки, поднимаются
    if (status.burn) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phase = (t * 1.3 + i / PARTICLE_COUNT) % 1;
        const px = (i - 1) * 9 + Math.sin(t * 6 + i * 2.3) * 3;
        const py = bodyY - 5 - phase * 35;
        const alpha = 1 - phase;
        // Внешний ореол
        this.statusParticles.fillStyle(0xff5500, alpha * 0.7);
        this.statusParticles.fillCircle(px, py, 3);
        // Ядро пламени
        this.statusParticles.fillStyle(0xffdd44, alpha);
        this.statusParticles.fillCircle(px, py, 1.5);
      }
    }

    // Замедление — голубые снежинки, кружатся вокруг
    if (status.slow) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const phase = (t * 0.9 + i / PARTICLE_COUNT) % 1;
        const angle = t * 3 + i * 2.1;
        const radius = 14 + Math.sin(phase * Math.PI) * 6;
        const px = Math.cos(angle) * radius;
        const py = bodyY + Math.sin(phase * Math.PI * 2) * 8 - 5;
        const alpha = 0.4 + Math.sin(phase * Math.PI) * 0.6;
        this.statusParticles.fillStyle(0xaaddff, alpha);
        this.statusParticles.fillCircle(px, py, 1.8);
      }
    }
  }
}