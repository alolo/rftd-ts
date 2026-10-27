import * as Phaser from "phaser";
import type { MainScene } from "../main";

export class InputMenuUI {
  private scene: MainScene;
  public container!: Phaser.GameObjects.Container;
  private titleText!: Phaser.GameObjects.Text;
  private inputTextDisplay!: Phaser.GameObjects.Text;
  private btnConfirmInput!: Phaser.GameObjects.Container;
  private btnCancelInput!: Phaser.GameObjects.Container;

  private currentInputText: string = "";
  private maxInputLength: number = 16;
  private isSelectedAll: boolean = false;
  private onInputConfirm: ((text: string) => void) | null = null;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.create();
  }

  public get isVisible(): boolean {
    return this.container.visible;
  }

  public show(
    title: string,
    maxLength: number,
    onConfirm: (text: string) => void,
    allowCancel: boolean,
  ) {
    this.currentInputText = "";
    this.maxInputLength = maxLength;
    this.onInputConfirm = onConfirm;
    this.isSelectedAll = false;

    this.inputTextDisplay.setBackgroundColor("transparent");
    this.titleText.setText(title);
    this.inputTextDisplay.setText("_");

    this.btnCancelInput.setVisible(allowCancel);
    if (allowCancel) {
      this.btnConfirmInput.setX(this.scene.scale.width / 2 - 100);
    } else {
      this.btnConfirmInput.setX(this.scene.scale.width / 2);
    }

    this.container.setVisible(true);
  }

  private confirm() {
    if (!this.container.visible) return;
    const text = this.currentInputText;
    const cb = this.onInputConfirm;
    this.container.setVisible(false);
    this.onInputConfirm = null;
    if (cb) cb(text);
  }

  private cancel() {
    if (!this.container.visible) return;
    this.container.setVisible(false);
    this.onInputConfirm = null;
  }

  private handlePaste = (event: ClipboardEvent) => {
    if (!this.isVisible) return;
    if (this.isSelectedAll) {
      this.currentInputText = "";
      this.isSelectedAll = false;
      this.inputTextDisplay.setBackgroundColor("transparent");
    }
    const pastedText = event.clipboardData?.getData("text") || "";
    const cleanedText = pastedText.replace(/[^a-zA-Zа-яА-ЯёЁ0-9 \-]/g, "");

    this.currentInputText += cleanedText;
    if (this.currentInputText.length > this.maxInputLength) {
      this.currentInputText = this.currentInputText.substring(
        0,
        this.maxInputLength,
      );
    }
    this.inputTextDisplay.setText(this.currentInputText + "_");
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.isVisible) return;

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") {
      event.preventDefault();
      this.isSelectedAll = true;
      this.inputTextDisplay.setBackgroundColor("#0055aa");
      return;
    }

    if (this.isSelectedAll) {
      if (["Control", "Meta", "Shift", "Alt"].includes(event.key)) return;
      this.isSelectedAll = false;
      this.inputTextDisplay.setBackgroundColor("transparent");

      if (
        event.key === "Backspace" ||
        event.key === "Delete" ||
        (/^[a-zA-Zа-яА-ЯёЁ0-9_.\-!@#$%^&*()[\]? ]+$/.test(event.key) &&
          event.key.length === 1)
      ) {
        this.currentInputText = "";
        if (event.key === "Backspace" || event.key === "Delete") {
          this.inputTextDisplay.setText(this.currentInputText + "_");
          return;
        }
      }
    }

    if (event.key === "Backspace") {
      this.currentInputText = this.currentInputText.slice(0, -1);
    } else if (event.key === "Enter") {
      this.confirm();
      return;
    } else if (event.key === "Escape" && this.btnCancelInput.visible) {
      this.cancel();
      return;
    } else if (
      event.key.length === 1 &&
      this.currentInputText.length < this.maxInputLength
    ) {
      if (event.ctrlKey || event.metaKey) return;
      if (/^[a-zA-Zа-яА-ЯёЁ0-9_.\-!@#$%^&*()[\]? ]+$/.test(event.key)) {
        this.currentInputText += event.key;
      }
    }

    this.inputTextDisplay.setText(this.currentInputText + "_");
  };

  private create() {
    this.container = this.scene.add
      .container(0, 0)
      .setDepth(600)
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

    const panelCorner = 60;
    const panel = this.scene.add.nineslice(
      centerX,
      centerY,
      "ui_v2",
      "woodPanelMenu",
      620,
      320,
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );

    this.titleText = this.scene.add
      .text(centerX, centerY - 100, "Ввод", {
        fontSize: "24px",
        color: "#ffea88",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const tipSize = 32;
    const inputBox = this.scene.add.nineslice(
      centerX,
      centerY - 10,
      "ui",
      "hexagon_brown_dark.png",
      48,
      480,
      0,
      0,
      tipSize,
      tipSize,
    );
    inputBox.setAngle(90);

    this.inputTextDisplay = this.scene.add
      .text(centerX, centerY - 10, "_", {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const makeBtn = (
      x: number,
      y: number,
      frame: string,
      text: string,
      textColor: string,
      onClick: () => void,
    ) => {
      const btnCorner = 1;
      const img = this.scene.add.nineslice(
        0,
        0,
        "ui_v2",
        frame,
        190,
        52,
        btnCorner,
        btnCorner,
        btnCorner,
        btnCorner,
      );
      const label = this.scene.add
        .text(0, 0, text, {
          fontSize: "20px",
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

    this.btnConfirmInput = makeBtn(
      centerX - 110,
      centerY + 85,
      "lightButtonClear",
      "Принять",
      "#ffffffff",
      () => this.confirm(),
    );

    this.btnCancelInput = makeBtn(
      centerX + 110,
      centerY + 85,
      "redButton",
      "Отмена",
      "#ffffff",
      () => this.cancel(),
    );

    this.container.add([
      blocker,
      panel,
      inputBox,
      this.titleText,
      this.inputTextDisplay,
      this.btnConfirmInput,
      this.btnCancelInput,
    ]);

    this.scene.input.keyboard?.on("keydown", this.handleKeyDown);
    window.addEventListener("paste", this.handlePaste);
    this.scene.events.once("shutdown", () => {
      window.removeEventListener("paste", this.handlePaste);
    });
  }
}
