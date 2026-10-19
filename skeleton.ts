import * as Phaser from "phaser";
import { Enemy } from "./enemies/enemy";

export class Skeleton {
  public isDead: boolean = false;
  public x: number;
  public y: number;

  private scene: Phaser.Scene;
  private damage: number = 249;
  private range: number = 128;
  private fireRate: number = 1600;
  private lastFiredTime: number = 0;

  private container: Phaser.GameObjects.Container;
  private lifespanTimer: Phaser.Time.TimerEvent;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    const mobKey = "mob_3_side";
    const children: Phaser.GameObjects.GameObject[] = [];

    if (scene.textures.exists(mobKey)) {
      // Визуал моба-скелета из наших текстур
      const sprite = scene.add.sprite(0, 0, mobKey, `${mobKey}_0`);
      sprite.setScale(0.7);
      if (scene.anims.exists(`${mobKey}_walk`)) {
        sprite.play(`${mobKey}_walk`);
      }
      children.push(sprite);
    } else {
      // Fallback на старый вид
      const bg = scene.add.graphics();
      bg.fillStyle(0x333333, 1);
      bg.fillCircle(0, 0, 14);
      const text = scene.add
        .text(0, 0, "💀", { fontSize: "18px" })
        .setOrigin(0.5);
      children.push(bg, text);
    }

    this.container = scene.add.container(x, y, children);
    this.container.setDepth(6);

    this.lifespanTimer = scene.time.addEvent({
      delay: 15000,
      callback: () => this.destroy(),
    });
  }

  public update(time: number, enemies: Enemy[]) {
    if (this.isDead || time < this.lastFiredTime + this.fireRate) return;

    // Поиск ближайшей цели
    let target: Enemy | null = null;
    let minDist = this.range;

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= minDist) {
        minDist = dist;
        target = enemy;
      }
    }

    // Если нашли кого бить - стреляем серым лазером
    if (target) {
      target.takeDamage(this.damage);
      this.lastFiredTime = time;

      const laser = this.scene.add.graphics();
      laser.lineStyle(3, 0xcccccc, 0.8);
      laser.beginPath();
      laser.moveTo(this.x, this.y);
      laser.lineTo(target.x, target.y);
      laser.strokePath();
      laser.setDepth(15);

      this.scene.tweens.add({
        targets: laser,
        alpha: 0,
        duration: 150,
        onComplete: () => laser.destroy(),
      });
    }
  }

  public destroy() {
    this.isDead = true;
    this.container.destroy();
    if (this.lifespanTimer) this.lifespanTimer.destroy();
  }
}
