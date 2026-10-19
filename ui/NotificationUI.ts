import * as Phaser from "phaser";
import type { MainScene } from "../main";

export class NotificationUI {
  private scene: MainScene;
  private activeNotifications: Phaser.GameObjects.Text[] = [];

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public show(message: string) {
    const notif = this.scene.add
      .text(this.scene.scale.width / 2, 80, message, {
        fontSize: "24px",
        color: "#ffff00",
        fontStyle: "bold",
        backgroundColor: "#000000cc",
        padding: { x: 15, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setAlpha(0);

    this.activeNotifications.push(notif);

    const startY = 80;
    const stepY = 45;
    const total = this.activeNotifications.length;

    for (let i = 0; i < total; i++) {
      const currentNotif = this.activeNotifications[i];
      const offsetIndex = total - 1 - i;
      const targetY = startY + offsetIndex * stepY;

      this.scene.tweens.add({
        targets: currentNotif,
        y: targetY,
        duration: 200,
        ease: "Power2",
      });
    }

    this.scene.tweens.add({
      targets: notif,
      alpha: 1,
      duration: 250,
    });

    this.scene.time.delayedCall(3000, () => {
      if (!notif.active) return;

      this.scene.tweens.add({
        targets: notif,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.activeNotifications = this.activeNotifications.filter(
            (n) => n !== notif,
          );
          notif.destroy();
        },
      });
    });
  }
}