import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { createCurvedTitle } from "./CurvedTitle";

const BASE_CHILDREN_COUNT = 5; // blocker, panel, banner, title, btnClose

export class AchievementsMenuUI {
  private scene: MainScene;
  public container!: Phaser.GameObjects.Container;

  constructor(scene: MainScene) {
    this.scene = scene;
    this.create();
  }

  public get visible(): boolean {
    return this.container.visible;
  }

  public show() {
    this.renderAchievements();
    this.scene.achievements.markAllSeen();
    this.scene.refreshAchievementsDot();
    this.container.setVisible(true);
  }

  public hide() {
    this.container.setVisible(false);
  }

  private renderAchievements() {
    while (this.container.length > BASE_CHILDREN_COUNT) {
      const child = this.container.last;
      if (child) child.destroy();
    }

    const startXLeft = this.scene.scale.width / 2 - 550;
    const startXRight = this.scene.scale.width / 2;
    const startY = this.scene.scale.height / 2 - 270;

    this.scene.achievements.list.forEach((ach, index) => {
      const isLeftColumn = index % 2 === 0;
      const x = isLeftColumn ? startXLeft : startXRight;
      const y = startY + Math.floor(index / 2) * 48;

      const statusIcon = ach.isCompleted ? "✅" : "❌";
      const nameColor = ach.isCompleted
        ? "#aaffaa"
        : ach.isSecret
          ? "#ffaaaa"
          : "#fff5ea";

      let desc = ach.description;
      if (ach.isSecret && !ach.isCompleted) {
        desc = ach.secretHint || "Секретное достижение";
      }

      let rewardStr = "";
      if (ach.rewardWood) rewardStr += ` (+${ach.rewardWood}с)`;
      if (ach.rewardGold) rewardStr += ` (+${ach.rewardGold}з)`;

      const achNameText = this.scene.add
        .text(x, y, `${statusIcon} ${ach.name}${rewardStr}`, {
          fontSize: "20px",
          color: nameColor,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0, 0);

      const achDescText = this.scene.add
        .text(x + 35, y + 24, desc, {
          fontSize: "14px",
          color: "#bbaaaa",
          fontStyle: "italic",
        })
        .setOrigin(0, 0);

      this.container.add([achNameText, achDescText]);
    });
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

    const panelWidth = 1250;
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

    const banner = this.scene.add.image(
      centerX,
      centerY - panelHeight / 2 + 12,
      "ui",
      "banner_classic_curtain.png",
    );
    banner.setScale(1.5, 1.2);

    const title = createCurvedTitle(
      this.scene,
      centerX,
      centerY - panelHeight / 2 + 4,
      "Достижения",
      3800,
      0.06,
      false,
      "30px",
    );

    const btnCorner = 25;
    const btnImg = this.scene.add.nineslice(
      0,
      0,
      "ui",
      "button_red.png",
      280,
      56,
      btnCorner,
      btnCorner,
      btnCorner,
      btnCorner,
    );
    const btnLabel = this.scene.add
      .text(0, 0, "✖ ЗАКРЫТЬ", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const btnClose = this.scene.add.container(centerX, centerY + 310, [
      btnImg,
      btnLabel,
    ]);

    btnImg
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
            targets: btnClose,
            scale: 0.9,
            duration: 60,
            yoyo: true,
            onComplete: () => this.container.setVisible(false),
          });
        },
      )
      .on("pointerover", () => btnImg.setTint(0xcccccc))
      .on("pointerout", () => btnImg.clearTint());

    this.container.add([blocker, panel, banner, title, btnClose]);
  }
}