import * as Phaser from "phaser";
import type { MainScene } from "../main";

export class ConfirmDialog {
  private scene: MainScene;
  public container!: Phaser.GameObjects.Container;
  private messageText!: Phaser.GameObjects.Text;
  private onConfirm: (() => void) | null = null;
  private onCancel: (() => void) | null = null;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.create();
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }

  public show(message: string, onConfirm: () => void, onCancel?: () => void) {
    this.messageText.setText(message);
    this.onConfirm = onConfirm;
    this.onCancel = onCancel || null;
    this.container.setVisible(true);
  }

  public hide() {
    if (!this.container.visible) return;
    this.container.setVisible(false);
    this.onConfirm = null;
    this.onCancel = null;
  }

  private confirm() {
    const cb = this.onConfirm;
    this.hide();
    if (cb) cb();
  }

  private cancel() {
    const cb = this.onCancel;
    this.hide();
    if (cb) cb();
  }

  private create() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(700)
      .setVisible(false);

    const centerX = this.scene.scale.width / 2;
    const centerY = this.scene.scale.height / 2;

    const blocker = this.scene.add
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

    const panel = this.scene.add.nineslice(
      centerX,
      centerY,
      "ui_v2",
      "woodPanelMenu",
      580,
      260,
      60,
      60,
      60,
      60,
    );

    this.messageText = this.scene.add
      .text(centerX, centerY - 40, "", {
        fontSize: "22px",
        color: "#fff5ea",
        align: "center",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
        lineSpacing: 6,
        wordWrap: { width: 500, useAdvancedWrap: true },
      })
      .setOrigin(0.5);

    const makeBtn = (
      x: number,
      y: number,
      frame: string,
      text: string,
      color: string,
      onClick: () => void,
    ) => {
      const btnCorner = 1;
      const img = this.scene.add.nineslice(
        0,
        0,
        "ui_v2",
        frame,
        220,
        52,
        btnCorner,
        btnCorner,
        btnCorner,
        btnCorner,
      );
      const label = this.scene.add
        .text(0, 0, text, {
          fontSize: "20px",
          color,
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
    };

    const btnYes = makeBtn(
      centerX - 115,
      centerY + 55,
      "lightButtonClear",
      "Да",
      "#aaffaa",
      () => this.confirm(),
    );

    const btnNo = makeBtn(
      centerX + 115,
      centerY + 55,
      "redButton",
      "Отмена",
      "#ffffff",
      () => this.cancel(),
    );

    this.container.add([blocker, panel, this.messageText, btnYes, btnNo]);
  }
}
