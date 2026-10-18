import * as Phaser from "phaser";
import { Enemy } from "./enemies/enemy";

export class Mine {
  public isDead: boolean = false;
  public x: number;
  public y: number;

  private scene: Phaser.Scene;
  private damage: number;
  private radius: number;
  private container: Phaser.GameObjects.Container;
  private isExploding: boolean = false;
  private spawnTween: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    damage: number,
    radius: number,
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.damage = damage;
    this.radius = radius;

    // Рисуем мину: черный кружок с красной обводкой и иконкой
    const bg = scene.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillCircle(0, 0, 10);
    bg.lineStyle(2, 0xff0000, 1);
    bg.strokeCircle(0, 0, 10);

    const text = scene.add
      .text(0, 0, "💣", { fontSize: "12px" })
      .setOrigin(0.5);

    this.container = scene.add.container(x, y, [bg, text]);
    this.container.setDepth(3); // Под башнями и мобами (чтобы лежала на земле)

    // Крутая анимация появления (мина "выпрыгивает" из земли)
    this.container.setScale(0);

    // СОХРАНЯЕМ ссылку на твин в переменную
    this.spawnTween = scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 300,
      ease: "Back.out",
    });
  }

  public update(enemies: Enemy[]) {
    if (this.isDead || this.isExploding) return;

    // Проверяем, наступил ли кто-то на мину
    let triggered = false;
    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Если моб подошел ближе чем на 30 пикселей - БАБАХ!
      if (dist <= 30) {
        triggered = true;
        break;
      }
    }

    if (triggered) {
      this.explode(enemies);
    }
  }

  private explode(enemies: Enemy[]) {
    this.isExploding = true;

    // Наносим урон по площади
    enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      if (Math.sqrt(dx * dx + dy * dy) <= this.radius) {
        enemy.takeDamage(this.damage);
      }
    });

    // Визуал взрыва (огненный шар)
    const explosion = this.scene.add.graphics();
    explosion.fillStyle(0xff4500, 0.6);
    explosion.fillCircle(this.x, this.y, this.radius);
    explosion.setDepth(14);

    this.scene.tweens.add({
      targets: explosion,
      alpha: 0,
      duration: 300,
      onComplete: () => explosion.destroy(),
    });

    this.destroy(); // Удаляем саму мину
  }

  public destroy() {
    this.isDead = true;

    // Если анимация появления еще идет - жестко её останавливаем!
    if (this.spawnTween) {
      this.spawnTween.stop();
    }

    this.container.destroy();
  }
}
