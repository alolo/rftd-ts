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
  private minInputLength: number = 0;
  private isSelectedAll: boolean = false;
  private onInputConfirm: ((text: string) => void) | null = null;
  private hiddenInput!: HTMLInputElement;

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
    minLength: number = 2,
  ) {
    this.currentInputText = "";
    this.maxInputLength = maxLength;
    this.onInputConfirm = onConfirm;
    this.isSelectedAll = false;

    if (this.hiddenInput) {
      this.hiddenInput.value = "";
      this.hiddenInput.maxLength = maxLength;
    }

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
    this.focusHiddenInput();
  }

  private confirm() {
    if (!this.container.visible) return;

    const trimmed = this.currentInputText.trim();
    if (trimmed.length < this.minInputLength) {
      const n = this.minInputLength;
      const lastDigit = n % 10;
      const lastTwo = n % 100;
      let word = "символов";
      if (lastTwo < 10 || lastTwo >= 20) {
        if (lastDigit === 1) word = "символ";
        else if (lastDigit >= 2 && lastDigit <= 4) word = "символа";
      }
      this.scene.showNotification(`Минимум ${n} ${word}`);
      return;
    }

    const text = trimmed;
    const cb = this.onInputConfirm;
    this.blurHiddenInput();
    this.container.setVisible(false);
    this.onInputConfirm = null;
    if (cb) cb(text);
  }

  private cancel() {
    if (!this.container.visible) return;
    this.blurHiddenInput();
    this.container.setVisible(false);
    this.onInputConfirm = null;
  }

  private handlePaste = (event: ClipboardEvent) => {
    if (!this.isVisible) return;
    if (document.activeElement === this.hiddenInput) return;
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

  private handleHtmlInput = () => {
    if (!this.isVisible || !this.hiddenInput) return;
    let val = this.hiddenInput.value;
    val = val.replace(/[^a-zA-Zа-яА-ЯёЁ0-9_.\-!@#$%^&*()[\]? ]/g, "");
    if (val.length > this.maxInputLength) {
      val = val.substring(0, this.maxInputLength);
    }
    if (val !== this.hiddenInput.value) this.hiddenInput.value = val;
    this.currentInputText = val;
    this.inputTextDisplay.setText(val + "_");
  };

  private handleHtmlKeyDown = (e: KeyboardEvent) => {
    if (!this.isVisible) return;
    if (e.key === "Enter" || e.keyCode === 13) {
      e.preventDefault();
      this.confirm();
      return;
    }
    if (e.key === "Escape" && this.btnCancelInput.visible) {
      e.preventDefault();
      this.cancel();
      return;
    }
    // Не даём Phaser'у дублировать ввод (он слушает window, а мы — input)
    e.stopPropagation();
  };

  private createHiddenInput() {
    const input = document.createElement("input");
    input.type = "text";
    input.autocapitalize = "off";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.setAttribute("inputmode", "text");
    input.setAttribute("enterkeyhint", "done");
    input.maxLength = this.maxInputLength;

    Object.assign(input.style, {
      position: "fixed",
      left: "50%",
      top: "50%",
      width: "1px",
      height: "1px",
      opacity: "0",
      padding: "0",
      margin: "0",
      border: "0",
      outline: "none",
      background: "transparent",
      caretColor: "transparent",
      zIndex: "9999",
      fontSize: "16px", // <16px на iOS вызывает авто-зум страницы
      pointerEvents: "none", // фокус даём программно
    });

    input.addEventListener("input", this.handleHtmlInput);
    input.addEventListener("keydown", this.handleHtmlKeyDown);

    document.body.appendChild(input);
    this.hiddenInput = input;

    this.scene.events.once("shutdown", () => {
      input.removeEventListener("input", this.handleHtmlInput);
      input.removeEventListener("keydown", this.handleHtmlKeyDown);
      input.remove();
    });
  }

  private focusHiddenInput() {
    if (!this.hiddenInput) return;
    this.hiddenInput.maxLength = this.maxInputLength;
    this.hiddenInput.value = this.currentInputText;
    this.hiddenInput.focus();
    const len = this.currentInputText.length;
    try {
      this.hiddenInput.setSelectionRange(len, len);
    } catch (_) {}
  }

  private blurHiddenInput() {
    if (this.hiddenInput && document.activeElement === this.hiddenInput) {
      this.hiddenInput.blur();
    }
  }

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

    // Кликабельная зона над полем ввода — тап открывает клавиатуру на мобилке.
    const inputTapZone = this.scene.add
      .zone(centerX, centerY - 10, 460, 48)
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
          this.focusHiddenInput();
        },
      );

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

    this.container.add(inputTapZone);
    this.createHiddenInput();
    this.scene.input.keyboard?.on("keydown", this.handleKeyDown);
    window.addEventListener("paste", this.handlePaste);
    this.scene.events.once("shutdown", () => {
      window.removeEventListener("paste", this.handlePaste);
    });
  }
}
