import * as Phaser from "phaser";
import type { MainScene } from "./main";
import { SaveSystem } from "./saveSystem";

export class BugReportMenu {
  private scene: MainScene;
  private container!: Phaser.GameObjects.Container;
  private attachLogsToEmail: boolean = true;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.createUI();
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }

  private createUI() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(200)
      .setVisible(false);

    const bg = this.scene.add.graphics();
    bg.fillStyle(0x151515, 0.98);
    bg.fillRoundedRect(
      this.scene.scale.width / 2 - 320,
      this.scene.scale.height / 2 - 200,
      640,
      400,
      16,
    );
    bg.lineStyle(3, 0xff6666);
    bg.strokeRoundedRect(
      this.scene.scale.width / 2 - 320,
      this.scene.scale.height / 2 - 200,
      640,
      400,
      16,
    );

    const title = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 - 140,
        "🐞 СООБЩИТЬ ОБ ОШИБКЕ",
        {
          fontSize: "28px",
          color: "#ff6666",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5);

    const desc = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 - 60,
        'Нашли баг? Нажмите "Написать письмо". \nОткроется ваш почтовый клиент, где вы сможете описать проблему.\n\nСпасибо, что помогаете делать игру лучше!',
        {
          fontSize: "18px",
          color: "#eeeeee",
          align: "center",
          lineSpacing: 1.5,
          wordWrap: { width: 560, useAdvancedWrap: true },
        },
      )
      .setOrigin(0.5);

    const checkboxText = this.scene.add
      .text(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2 + 30,
        "[X] Прикрепить логи игры к письму",
        {
          fontSize: "20px",
          color: "#00ffff",
        },
      )
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        this.attachLogsToEmail = !this.attachLogsToEmail;
        checkboxText.setText(
          this.attachLogsToEmail
            ? "[X] Прикрепить логи игры к письму"
            : "[ ] Прикрепить логи игры к письму",
        );
      });

    const btnSend = this.scene.add
      .text(
        this.scene.scale.width / 2 - 120,
        this.scene.scale.height / 2 + 130,
        "НАПИСАТЬ ПИСЬМО",
        {
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: "#cc2222",
          padding: { x: 20, y: 12 },
        },
      )
      .setOrigin(0.5)
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

          const email = "alo32@yandex.ru";
          const subject = encodeURIComponent("Баг-репорт: Tower Defense");
          let bodyStr =
            "Опишите, что пошло не так:\n\n\n-----------------------\n";
          bodyStr += `Никнейм: ${SaveSystem.nickname}\nБраузер: ${navigator.userAgent}\n`;
          if (this.attachLogsToEmail) {
            // Берем логи через публичный геттер из сцены
            bodyStr +=
              "\n--- ЛОГИ ИГРЫ ---\n" + this.scene.getLogs().join("\n");
          }
          window.open(
            `mailto:${email}?subject=${subject}&body=${encodeURIComponent(bodyStr)}`,
            "_blank",
          );
          this.setVisible(false);
        },
      );

    const btnClose = this.scene.add
      .text(
        this.scene.scale.width / 2 + 140,
        this.scene.scale.height / 2 + 130,
        "ОТМЕНА",
        {
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: "#666666",
          padding: { x: 20, y: 12 },
        },
      )
      .setOrigin(0.5)
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
          this.setVisible(false);
        },
      );

    this.container.add([bg, title, desc, checkboxText, btnSend, btnClose]);
  }

  public setVisible(visible: boolean) {
    this.container.setVisible(visible);
  }
}
