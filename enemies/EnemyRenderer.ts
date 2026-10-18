import * as Phaser from "phaser";
import type { EnemyStats } from "./EnemyTypes";

export class EnemyRenderer {
  public sprite: Phaser.GameObjects.Sprite;
  public hpBar: Phaser.GameObjects.Graphics;
  public hpText: Phaser.GameObjects.Text;
  public stunIcon: Phaser.GameObjects.Text;
  public readonly scale: number;
  public readonly topY: number;

  private baseKey: string;
  private currentDirection: "front" | "side" | "back" | null = null;

  constructor(scene: Phaser.Scene, stats: EnemyStats, cellSize: number) {
    this.baseKey = `mob_${stats.studioMobId}`;
    const sideKey = `${this.baseKey}_side`;
    const sideFrame = `${sideKey}_0`;
    const sideAnim = `${sideKey}_walk`;

    if (!scene.textures.exists(sideKey)) {
      throw new Error(`[EnemyRenderer] Missing texture: ${sideKey}`);
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
}
