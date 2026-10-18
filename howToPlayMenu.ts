import * as Phaser from "phaser";
import type { MainScene } from "./main";

export class HowToPlayMenu {
  private scene: MainScene;
  private container!: Phaser.GameObjects.Container;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.createUI();
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }

  // --- ГЕНЕРАТОР ИЗОГНУТОГО ТЕКСТА ---
  private createCurvedTitle(
    x: number,
    y: number,
    text: string,
    radius: number = 2400,
    angleSpread: number = 0.14,
    isRainbow: boolean = false,
    fontSize: string = "36px",
    textColor: string = "#ffffff",
  ) {
    const container = this.scene.add.container(x, y);
    const chars = text.split("");
    const startAngle = -angleSpread / 2;
    const angleStep = angleSpread / Math.max(1, chars.length - 1);

    for (let i = 0; i < chars.length; i++) {
      const angle = startAngle + i * angleStep;
      const charX = Math.sin(angle) * radius;
      let charY = Math.cos(angle) * radius - radius;
      if (isRainbow) charY = -charY;

      const letter = this.scene.add
        .text(charX, charY, chars[i], {
          fontSize: fontSize,
          color: textColor,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 5,
        })
        .setOrigin(0.5);

      letter.setRotation(isRainbow ? angle : -angle);
      container.add(letter);
    }
    return container;
  }

  // --- ГЕНЕРАТОР КНОПОК ---
  private createButton(
    x: number,
    y: number,
    frame: string,
    text: string,
    onClick: () => void,
  ) {
    const btnCorner = 25;
    const img = this.scene.add.nineslice(
      0,
      0,
      "ui",
      frame,
      280,
      56,
      btnCorner,
      btnCorner,
      btnCorner,
      btnCorner,
    );
    const label = this.scene.add
      .text(0, 0, text, {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const btn = this.scene.add.container(x, y, [img, label]);

    img
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
          this.scene.tweens.add({
            targets: btn,
            scale: 0.9,
            duration: 60,
            yoyo: true,
            onComplete: () => onClick(),
          });
        },
      )
      .on("pointerover", () => img.setTint(0xcccccc))
      .on("pointerout", () => img.clearTint());

    return btn;
  }

  private createUI() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(600)
      .setVisible(false);

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    // 1. Щит от кликов
    const blocker = this.scene.add
      .zone(centerX, centerY, this.scene.scale.width, this.scene.scale.height)
      .setInteractive()
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => event.stopPropagation(),
      );

    // 2. Деревянная панель
    const panelWidth = 800;
    const panelHeight = 740;
    const panelCorner = 30;

    const panel = this.scene.add.nineslice(
      centerX,
      centerY,
      "ui",
      "panel_brown.png",
      panelWidth,
      panelHeight,
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );
    panel.setTint(0xc5c5c5);

    // 3. Баннер и заголовок
    const banner = this.scene.add.image(
      centerX,
      centerY - panelHeight / 2 + 2,
      "ui",
      "banner_classic_curtain.png",
    );
    banner.setScale(1.2);

    const title = this.createCurvedTitle(
      centerX,
      centerY - panelHeight / 2 - 3,
      "Как играть",
      3100,
      0.08,
      false,
      "36px",
    );

    // 4. Текст правил
    const rulesText =
      "1. Кликай по сетке, покупай башни или овощи\n" +
      "2. Одинаковые башни можно слить, чтобы получить более сильную башню\n" +
      "3. Овощи попадают в инвентарь, каждые две волны плантация пропадает\n" +
      "4. Продавай овощи когда выгодно (цены для них указаны справа сверху)\n" +
      "5. В инвентаре есть Счастливый билет, нажми на него и испытай удачу!\n" +
      "6. Проходи игру на разных сложностях и получай Титулы (бонусы в профиле)\n" +
      "7. Выполняй достижения, чтобы получить ресурсы для башен и овощей\n" +
      "8. На рынке можно купить улучшения для башен или бонусы за медали\n" +
      "9. Медали начисляются каждые 5 пройденных волн, трать с умом!\n" +
      "10. Посадка овощей одного типа увеличит их базовую цену\n";

    const info = this.scene.add
      .text(centerX, centerY - 15, rulesText, {
        fontSize: "17px",
        color: "#ffffff", // Приятный кремовый цвет текста
        align: "left",
        lineSpacing: 11, // Побольше воздуха между пунктами
        wordWrap: { width: 660, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    // 5. Кнопка закрытия
    const btnClose = this.createButton(
      centerX,
      centerY + 300,
      "button_red.png",
      "✖ ПОНЯТНО",
      () => {
        this.setVisible(false);
      },
    );

    this.container.add([blocker, panel, banner, title, info, btnClose]);
  }

  public setVisible(visible: boolean) {
    this.container.setVisible(visible);
  }
}
