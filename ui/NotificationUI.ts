import * as Phaser from "phaser";
import type { MainScene } from "../main";

export class NotificationUI {
  private scene: MainScene;
  private activeNotifications: (
    | Phaser.GameObjects.Text
    | Phaser.GameObjects.Container
  )[] = [];

  private readonly STEP_Y = 64;
  private readonly BASE_Y = 92;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public show(message: string, color: string = "#3d2817") {
    const PAD_X = 40;
    const H = 64;
    const CORNER = 50;

    const label = this.scene.add
      .text(0, 0, message, {
        fontSize: "18px",
        color,
        fontStyle: "bold",
        stroke: "#fff5e0",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5);

    const W = Math.max(220, label.width + PAD_X * 2);

    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "woodButtonMenuCracked",
      W,
      H,
      CORNER + 60,
      CORNER + 60,
      CORNER - 20,
      CORNER - 20,
    );

    const container = this.scene.add
      .container(this.scene.scale.width / 2, this.BASE_Y, [bg, label])
      .setDepth(1000)
      .setAlpha(0);

    this.pushNotification(container, 3000);
  }

  public showAchievement(name: string) {
    const W = 513;
    const H = 136;

    const bg = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "goldBanner",
      W,
      H,
      1,
      1,
      1,
      1,
    );

    const label = this.scene.add
      .text(0, 0, `: ${name}`, {
        fontSize: "18px",
        color: "#3d2817",
        fontStyle: "bold",
        stroke: "#fff5e0",
        strokeThickness: 2,
      })
      .setOrigin(0, 0.5);

    const iconSize = 32;
    const gap = 10;
    const totalW = iconSize + gap + label.width;
    const startX = -totalW / 2;
    const contentY = 10;

    const icon = this.scene.add
      .image(startX + iconSize / 2, contentY, "icon", "achievements")
      .setDisplaySize(iconSize, iconSize);
    label.setPosition(startX + iconSize + gap, contentY);

    const container = this.scene.add
      .container(this.scene.scale.width / 2, 100, [bg, icon, label])
      .setDepth(1000)
      .setAlpha(0);

    this.pushNotification(container, 4000);
  }

  private pushNotification(
    obj: Phaser.GameObjects.Text | Phaser.GameObjects.Container,
    lifetimeMs: number,
  ) {
    this.activeNotifications.push(obj);

    const total = this.activeNotifications.length;
    for (let i = 0; i < total; i++) {
      const current = this.activeNotifications[i];
      const offsetIndex = total - 1 - i;
      const targetY = this.BASE_Y + offsetIndex * this.STEP_Y;

      this.scene.tweens.add({
        targets: current,
        y: targetY,
        duration: 200,
        ease: "Power2",
      });
    }

    this.scene.tweens.add({
      targets: obj,
      alpha: 1,
      duration: 250,
    });

    this.scene.time.delayedCall(lifetimeMs, () => {
      if (!obj.active) return;

      this.scene.tweens.add({
        targets: obj,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.activeNotifications = this.activeNotifications.filter(
            (n) => n !== obj,
          );
          obj.destroy();
        },
      });
    });
  }
}
