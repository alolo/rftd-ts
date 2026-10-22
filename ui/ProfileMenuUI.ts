import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { TITLES } from "../meta";
import { SaveSystem } from "../saveSystem";
import { createCurvedTitle } from "./CurvedTitle";

export class ProfileMenuUI {
  private scene: MainScene;
  public container!: Phaser.GameObjects.Container;
  private statsText!: Phaser.GameObjects.Text;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.create();
  }

  public get visible(): boolean {
    return this.container.visible;
  }

  public show() {
    if (this.scene.isGameOver || this.scene.waveManager.state === "menu")
      return;
    this.updateStats();
    this.container.setVisible(true);
  }

  public hide() {
    this.container.setVisible(false);
  }

  private updateStats() {
    const titleId = this.scene.metaProgress.currentTitleId;
    const titleObj = TITLES.find((t) => t.id === titleId);
    const titleName = titleObj ? titleObj.name : "Отсутствует";
    const buffPct = titleId;
    const nextTitleInfo = this.scene.metaProgress.getNextTitleInfo();

    this.statsText.setText(
      `Игрок: ${SaveSystem.nickname}\n\n` +
        `Текущий титул: ${titleName}\n` +
        `Атака: +${buffPct}% | Замедление: -${buffPct}%\n` +
        `---------------------------------\n` +
        `${nextTitleInfo}`,
    );
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

    const panelWidth = 630;
    const panelHeight = 520;
    const panelCorner = 60;

    const panel = this.scene.add.nineslice(
      centerX,
      centerY,
      "ui_v2",
      "woodPanelMenu",
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
      "ui_v2",
      "bannerGreen",
    );
    banner.setScale(1.15);

    const title = createCurvedTitle(
      this.scene,
      centerX,
      centerY - panelHeight / 2 + 19,
      "Профиль",
      1900,
      0.1,
      false,
      "32px",
    );

    this.statsText = this.scene.add
      .text(centerX, centerY - 35, "", {
        fontSize: "21px",
        color: "#fff5ea",
        align: "center",
        lineSpacing: 10,
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
        210,
        60,
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

    const btnReset = makeBtn(
      centerX - 120,
      centerY + 160,
      "redButton",
      "Сбросить",
      "#ffffff",
      () => this.scene.resetProfile(),
    );

    const btnClose = makeBtn(
      centerX + 120,
      centerY + 160,
      "lightButtonClear",
      "Закрыть",
      "#ffffff",
      () => this.scene.openMenu(null),
    );

    this.container.add([
      blocker,
      panel,
      banner,
      title,
      this.statsText,
      btnReset,
      btnClose,
    ]);
  }
}
