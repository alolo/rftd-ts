import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { SaveSystem } from "../saveSystem";
import { createCurvedTitle } from "./CurvedTitle";

export class GameOverMenuUI {
  private scene: MainScene;
  private container: Phaser.GameObjects.Container | null = null;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public show(isVictory: boolean) {
    if (this.container) return;
    this.container = this.scene.add.container(0, 0).setDepth(650);

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    const clickBlocker = this.scene.add
      .zone(centerX, centerY, this.scene.scale.width, this.scene.scale.height)
      .setInteractive()
      .on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          e: Phaser.Types.Input.EventData,
        ) => e.stopPropagation(),
      );

    const panelWidth = 530;
    const panelHeight = isVictory ? 530 : 380;
    const panelCorner = 30;
    const panelTexture = isVictory
      ? "panel_brown.png"
      : "panel_brown_damaged.png";

    const panel = this.scene.add.nineslice(
      centerX,
      centerY,
      "ui",
      panelTexture,
      panelWidth,
      panelHeight,
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );

    const banner = this.scene.add.image(
      centerX,
      centerY - panelHeight / 2 + 15,
      "ui",
      "banner_classic_curtain.png",
    );
    banner.setScale(1.15);

    const titleText = isVictory ? "Победа!" : "  Поражение...";
    const spread = isVictory ? 0.06 : 0.12;

    const title = createCurvedTitle(
      this.scene,
      centerX,
      centerY - panelHeight / 2 + 8,
      titleText,
      2400,
      spread,
      false,
      "36px",
      "#ffffff",
      "#000000",
      6,
    );

    const makeBtn = (
      x: number,
      y: number,
      frame: string,
      text: string,
      textColor: string,
      onClick: () => void,
    ) => {
      const btnCorner = 25;
      const img = this.scene.add.nineslice(
        0,
        0,
        "ui",
        frame,
        320,
        56,
        btnCorner,
        btnCorner,
        btnCorner,
        btnCorner,
      );
      const label = this.scene.add
        .text(0, 0, text, {
          fontSize: "22px",
          color: textColor,
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
            _p: Phaser.Input.Pointer,
            _lx: number,
            _ly: number,
            e: Phaser.Types.Input.EventData,
          ) => {
            e.stopPropagation();
            this.scene.tweens.add({
              targets: btn,
              scale: 0.92,
              duration: 60,
              yoyo: true,
              onComplete: () => onClick(),
            });
          },
        )
        .on("pointerover", () => img.setTint(0xcccccc))
        .on("pointerout", () => img.clearTint());

      return btn;
    };

    this.container.add([clickBlocker, panel, banner, title]);

    if (isVictory) {
      this.createVictoryContent(centerX, centerY, makeBtn);
    } else {
      this.createDefeatContent(centerX, centerY, makeBtn);
    }
  }

  private createVictoryContent(
    centerX: number,
    centerY: number,
    makeBtn: (
      x: number,
      y: number,
      frame: string,
      text: string,
      textColor: string,
      onClick: () => void,
    ) => Phaser.GameObjects.Container,
  ) {
    const c = this.container!;
    const saveCode = localStorage.getItem("td_save_code") || "ОШИБКА";

    const tipSize = 32;
    const codeBox = this.scene.add.nineslice(
      centerX,
      centerY - 65,
      "ui",
      "hexagon_damaged_brown_dark.png",
      52,
      420,
      0,
      0,
      tipSize,
      tipSize,
    );
    codeBox.setAngle(90);

    const codeLabel = this.scene.add
      .text(centerX, centerY - 105, "Ваш код сохранения:", {
        fontSize: "16px",
        color: "#ffea88",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const codeText = this.scene.add
      .text(centerX, centerY - 65, saveCode, {
        fontSize: "24px",
        color: "#00ffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => codeText.setColor("#ffff00"))
      .on("pointerout", () => codeText.setColor("#00ffff"))
      .on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          e: Phaser.Types.Input.EventData,
        ) => {
          e.stopPropagation();
          navigator.clipboard
            .writeText(saveCode)
            .then(() =>
              this.scene.showNotification("📋 Код скопирован в буфер обмена!"),
            )
            .catch(() =>
              this.scene.showNotification("❌ Ошибка копирования"),
            );
        },
      );

    const copyHint = this.scene.add
      .text(centerX, centerY - 28, "(нажмите на код, чтобы скопировать)", {
        fontSize: "13px",
        color: "#252525",
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    const btnSaveTxt = makeBtn(
      centerX,
      centerY + 45,
      "button_brown.png",
      "Скачать сохранение",
      "#ffffff",
      () => this.downloadSaveFile(),
    );

    const btnRestart = makeBtn(
      centerX,
      centerY + 125,
      "button_red.png",
      "Начать заново",
      "#ffffff",
      () => this.scene.restartGame(),
    );

    c.add([codeBox, codeLabel, codeText, copyHint, btnSaveTxt, btnRestart]);
  }

  private createDefeatContent(
    centerX: number,
    centerY: number,
    makeBtn: (
      x: number,
      y: number,
      frame: string,
      text: string,
      textColor: string,
      onClick: () => void,
    ) => Phaser.GameObjects.Container,
  ) {
    const c = this.container!;

    const defeatSubtitle = this.scene.add
      .text(
        centerX,
        centerY - 20,
        "Оборона пала...\nПопробуйте другую тактику!",
        {
          fontSize: "24px",
          fontStyle: "bold",
          color: "#fff5ea",
          align: "center",
          lineSpacing: 10,
          stroke: "#000000",
          strokeThickness: 5,
        },
      )
      .setOrigin(0.5);

    const btnRestart = makeBtn(
      centerX,
      centerY + 145,
      "button_red.png",
      "Начать заново",
      "#ffffff",
      () => this.scene.restartGame(),
    );

    c.add([defeatSubtitle, btnRestart]);
  }

  private downloadSaveFile() {
    const meta = this.scene.metaProgress;
    if (!meta) return;

    const reportContent = meta.generateSaveReport();
    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `[${year}-${month}-${day}_${hours}-${minutes}-${seconds}]`;

    const a = document.createElement("a");
    a.href = url;
    a.download = `TDSave_${SaveSystem.nickname}_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.scene.showNotification("💾 Файл успешно сохранен!");
  }
}