import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { Tower, TOWER_DICTIONARY } from "../tower";
import { Crop } from "../Crop";
import type { Enemy } from "../enemies/enemy";
import { ActionButton } from "./ActionButton";

export class SidePanelUI {
  public container!: Phaser.GameObjects.Container;
  public towerIconGroup!: Phaser.GameObjects.Container;
  public towerIconImage!: Phaser.GameObjects.Sprite;
  public towerIconFrame!: Phaser.GameObjects.Image;
  public towerTitleText!: Phaser.GameObjects.Text;
  public towerInfoText!: Phaser.GameObjects.Text;
  public multiSelectText!: Phaser.GameObjects.Text;
  public abilityIcon!: Phaser.GameObjects.Container;
  public abilityTooltip!: Phaser.GameObjects.Text;
  public abilityLabelText!: Phaser.GameObjects.Text;
  public targetModeBtnText!: ActionButton;
  public btnRandomMerge!: ActionButton;
  public btnTargetMerge!: ActionButton;
  public btnSell!: ActionButton;
  public btnReroll!: ActionButton;

  private readonly PANEL_HEIGHT = 260;
  private readonly PANEL_WIDTH = 1100;
  private readonly PANEL_BOTTOM_MARGIN = 20;
  private readonly PANEL_TOP_MARGIN = 80;

  private scene: MainScene;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public create() {
    const panelWidth = this.PANEL_WIDTH;
    const panelHeight = this.PANEL_HEIGHT;
    const centerX = this.scene.scale.width / 2;
    const centerY =
      this.scene.scale.height - panelHeight / 2 - this.PANEL_BOTTOM_MARGIN;

    this.container = this.scene.add
      .container(centerX, centerY)
      .setVisible(false)
      .setDepth(50);

    const panel = this.scene.add.nineslice(
      0,
      0,
      "ui_v2",
      "panelClear",
      panelWidth,
      panelHeight,
      40,
      40,
      40,
      40,
    );
    this.container.add(panel);

    const blocker = this.scene.add
      .zone(0, 0, panelWidth, panelHeight)
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
    this.container.add(blocker);

    // ЛЕВЫЙ БЛОК: ИКОНКА + ТЕКСТ
    const iconX = -panelWidth / 2 + 40 + 70;
    const iconSize = 140;

    this.towerIconGroup = this.scene.add.container(iconX, 0);
    this.container.add(this.towerIconGroup);

    this.towerIconFrame = this.scene.add.image(
      0,
      0,
      "ui_v2",
      "woodButtonClear",
    );
    this.towerIconFrame.setDisplaySize(iconSize, iconSize);
    this.towerIconGroup.add(this.towerIconFrame);

    this.towerIconImage = this.scene.add.sprite(0, 0, "towers", "1_1");
    const initialFrame = this.scene.textures.getFrame("towers", "1_1");
    if (initialFrame) {
      const maxDim = Math.max(initialFrame.width, initialFrame.height);
      this.towerIconImage.setScale(110 / maxDim);
    }
    this.towerIconGroup.add(this.towerIconImage);

    const textX = -panelWidth / 2 + 40 + iconSize + 30;
    const textWidth = 420;

    this.towerTitleText = this.scene.add
      .text(textX, -100, "", {
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
        lineSpacing: 6,
      })
      .setOrigin(0, 0);
    this.container.add(this.towerTitleText);

    this.towerInfoText = this.scene.add
      .text(textX, -30, "", {
        fontSize: "22px",
        color: "#fff5ea",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
        lineSpacing: 5,
        wordWrap: { width: textWidth, useAdvancedWrap: true },
      })
      .setOrigin(0, 0);
    this.container.add(this.towerInfoText);

    this.multiSelectText = this.scene.add
      .text(iconX, iconSize / 2 + 2, "", {
        fontSize: "16px",
        color: "#00ffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
        align: "center",
        wordWrap: { width: iconSize + 40, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);
    this.container.add(this.multiSelectText);

    // ПРАВЫЙ БЛОК: СЕТКА КНОПОК
    const btnW = 280;
    const btnH = 56;
    const btnGapX = 10;
    const totalBtnW = btnW * 2 + btnGapX;
    const btnStartX = panelWidth / 2 - 30 - totalBtnW;

    const col0X = btnStartX + btnW / 2;
    const col1X = btnStartX + btnW + btnGapX + btnW / 2;

    const row0Y = -66;
    const row1Y = 0;
    const row2Y = 66;

    // Умение
    const abilityBg = this.scene.add.nineslice(
      0,
      0,
      "ui",
      "button_brown.png",
      btnW,
      btnH,
      30,
      30,
      30,
      30,
    );

    this.abilityLabelText = this.scene.add
      .text(0, 0, "✨ УМЕНИЕ (наведи)", {
        fontSize: "16px",
        color: "#ffd700",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    this.abilityIcon = this.scene.add.container(col0X, row0Y, [
      abilityBg,
      this.abilityLabelText,
    ]);
    this.abilityIcon.setSize(btnW, btnH);
    this.abilityIcon.setInteractive({ useHandCursor: true });
    this.abilityIcon.setVisible(false);

    this.abilityTooltip = this.scene.add
      .text(0, 0, "", {
        fontSize: "14px",
        color: "#ffffff",
        backgroundColor: "#111111",
        padding: { x: 10, y: 8 },
        wordWrap: { width: 340 },
      })
      .setOrigin(0.5, 1)
      .setDepth(100)
      .setVisible(false);

    this.abilityIcon.on("pointerover", () => {
      this.abilityTooltip.setPosition(col0X, row0Y - btnH / 2 - 8);
      this.abilityTooltip.setVisible(true);
      this.drawAbilityRange();
    });

    this.abilityIcon.on("pointerout", () => {
      this.abilityTooltip.setVisible(false);
      this.scene.abilityRangeCircle.setVisible(false);
    });

    this.btnSell = new ActionButton(
      this.scene,
      col0X,
      row1Y,
      btnW,
      btnH,
      "button_red.png",
      "ПРОДАТЬ [S]",
      () => {
        if (this.scene.interaction.selectedCoords)
          this.scene.builder.sellTower(
            this.scene.interaction.selectedCoords.col,
            this.scene.interaction.selectedCoords.row,
          );
      },
    );

    this.targetModeBtnText = new ActionButton(
      this.scene,
      col0X,
      row2Y,
      btnW,
      btnH,
      "button_brown.png",
      "ЦЕЛЬ: ПЕРВЫЙ [Q]",
      () => this.scene.interaction.cycleTargetMode(),
    );

    this.btnTargetMerge = new ActionButton(
      this.scene,
      col1X,
      row0Y,
      btnW,
      btnH,
      "button_brown.png",
      "СЛИЯНИЕ [E]",
      () => this.scene.interaction.startTargetedMerge(),
    );

    this.btnRandomMerge = new ActionButton(
      this.scene,
      col1X,
      row1Y,
      btnW,
      btnH,
      "button_brown.png",
      "СЛИЯНИЕ СЛУЧ [W]",
      () => this.scene.interaction.doRandomMerge(),
    );

    this.btnReroll = new ActionButton(
      this.scene,
      col1X,
      row2Y,
      btnW,
      btnH,
      "button_brown.png",
      "ЗАМЕНИТЬ [R]",
      () => {
        if (this.scene.interaction.selectedCoords)
          this.scene.builder.rerollTower(
            this.scene.interaction.selectedCoords.col,
            this.scene.interaction.selectedCoords.row,
          );
      },
    );

    this.container.add([
      this.targetModeBtnText.container,
      this.btnRandomMerge.container,
      this.btnTargetMerge.container,
      this.btnSell.container,
      this.btnReroll.container,
      this.abilityIcon,
      this.abilityTooltip,
    ]);

    // Крестик
    const CLOSE_SIZE = 40;
    const CLOSE_OFFSET = 12;
    const closeBtn = this.scene.add
      .image(
        panelWidth / 2 - CLOSE_SIZE / 2 + CLOSE_OFFSET,
        -panelHeight / 2 + CLOSE_SIZE / 2 - CLOSE_OFFSET,
        "ui_v2",
        "squareButtonWoodClose",
      )
      .setDisplaySize(CLOSE_SIZE, CLOSE_SIZE)
      .setDepth(10)
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
          this.close();
        },
      )
      .on("pointerover", () => closeBtn.setTint(0xdddddd))
      .on("pointerout", () => closeBtn.clearTint());

    this.container.add(closeBtn);
  }

  private computePanelY(targetWorldY: number): number {
    const screenH = this.scene.scale.height;
    const bottomY = screenH - this.PANEL_HEIGHT / 2 - this.PANEL_BOTTOM_MARGIN;
    const topY = this.PANEL_HEIGHT / 2 + this.PANEL_TOP_MARGIN;
    const bottomPanelTop = bottomY - this.PANEL_HEIGHT / 2;

    if (targetWorldY > bottomPanelTop) return topY;
    return bottomY;
  }

  private snapToY(y: number) {
    this.scene.tweens.killTweensOf(this.container);
    if (!this.container.visible || Math.abs(this.container.y - y) < 5) {
      this.container.y = y;
      return;
    }
    this.scene.tweens.add({
      targets: this.container,
      y,
      duration: 220,
      ease: "Cubic.easeOut",
    });
  }

  public showTower(tower: Tower) {
    this.snapToY(this.computePanelY(tower.centerY));
    this.container.setDepth(50).setVisible(true);
    this.renderTowerInfo(tower);
  }

  private drawAbilityRange() {
    if (!this.scene.interaction.selectedCoords) return;
    const tower =
      this.scene.builder.grid[this.scene.interaction.selectedCoords.row][
        this.scene.interaction.selectedCoords.col
      ];
    if (!(tower instanceof Tower)) return;

    let abilityRadius = 0;
    if (tower.auraRadius > 0) abilityRadius = tower.auraRadius;
    else if (tower.auraEnemySlowRadius > 0)
      abilityRadius = tower.auraEnemySlowRadius;
    else if (tower.stunRadius > 0) abilityRadius = tower.stunRadius;
    else if (tower.splashRadius > 0) abilityRadius = tower.splashRadius;
    else if (tower.zoneRadius > 0) abilityRadius = tower.zoneRadius;
    else if (tower.pulseRadius > 0) abilityRadius = tower.pulseRadius;
    else if (tower.randomTargetRange > 0)
      abilityRadius = tower.randomTargetRange;
    else if (tower.mineRadius > 0) abilityRadius = tower.mineRadius;

    if (abilityRadius > 0) {
      this.drawDashedCircle(
        this.scene.abilityRangeCircle,
        tower.centerX,
        tower.centerY,
        abilityRadius,
      );
      this.scene.abilityRangeCircle.setVisible(true);
    } else if (tower.waveLength > 0) {
      this.scene.abilityRangeCircle.clear();
      this.scene.abilityRangeCircle.fillStyle(0x00ffff, 0.2);
      this.scene.abilityRangeCircle.fillRect(
        tower.centerX,
        tower.centerY - tower.waveWidth / 2,
        tower.waveLength,
        tower.waveWidth,
      );
      this.scene.abilityRangeCircle.lineStyle(2, 0x00ffff, 0.8);
      this.scene.abilityRangeCircle.strokeRect(
        tower.centerX,
        tower.centerY - tower.waveWidth / 2,
        tower.waveLength,
        tower.waveWidth,
      );
      this.scene.abilityRangeCircle.setVisible(true);
    }
  }

  private drawDashedCircle(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    radius: number,
  ) {
    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 0.8);
    const dashes = 32;
    const angleStep = (Math.PI * 2) / dashes;
    for (let i = 0; i < dashes; i += 2) {
      graphics.beginPath();
      graphics.arc(x, y, radius, i * angleStep, (i + 1) * angleStep, false);
      graphics.strokePath();
    }
  }

  private centerText() {
    const gap = 10;
    const hasTitle = this.towerTitleText.text.length > 0;

    const titleH = hasTitle ? this.towerTitleText.height : 0;
    const infoH = this.towerInfoText.height;
    const totalH = titleH + (hasTitle ? gap : 0) + infoH;
    const startY = -totalH / 2;

    if (hasTitle) {
      this.towerTitleText.setY(startY);
      this.towerInfoText.setY(startY + titleH + gap);
    } else {
      this.towerInfoText.setY(startY);
    }
  }

  public updateRealtime() {
    if (!this.container.visible) return;

    if (this.scene.selectedEnemy) {
      this.renderEnemyInfo(this.scene.selectedEnemy);
      return;
    }

    if (this.scene.interaction.selectedInformerTower) {
      const { level, variant } = this.scene.interaction.selectedInformerTower;
      this.renderInformerInfo(level, variant);
      return;
    }

    if (this.scene.interaction.selectedCoords) {
      const cell =
        this.scene.builder.grid[this.scene.interaction.selectedCoords.row][
          this.scene.interaction.selectedCoords.col
        ];
      if (cell instanceof Tower) {
        this.renderTowerInfo(cell);
      }
    }
  }

  public showEnemy(enemy: Enemy) {
    this.snapToY(this.computePanelY(enemy.y));
    this.container.setDepth(50).setVisible(true);
    this.targetModeBtnText.setVisible(false);
    this.btnRandomMerge.setVisible(false);
    this.btnTargetMerge.setVisible(false);
    this.btnSell.setVisible(false);
    this.btnReroll.setVisible(false);
    this.abilityIcon.setVisible(false);
    this.abilityTooltip.setVisible(false);
    this.scene.abilityRangeCircle.setVisible(false);
    this.renderEnemyInfo(enemy);
  }

  public showTowerFromInformer(level: number, variant: number) {
    this.snapToY(this.computePanelY(this.scene.scale.height / 2));
    this.container.setDepth(400).setVisible(true);
    this.targetModeBtnText.setVisible(false);
    this.btnRandomMerge.setVisible(false);
    this.btnTargetMerge.setVisible(false);
    this.btnSell.setVisible(false);
    this.btnReroll.setVisible(false);
    this.renderInformerInfo(level, variant);
  }

  public showCrop(crop: Crop) {
    this.snapToY(this.computePanelY(crop.centerY));
    this.container.setDepth(50).setVisible(true);

    this.towerIconGroup.setVisible(true);
    this.towerIconImage.anims.stop();
    const cropKey = crop.type;
    if (this.scene.textures.exists(cropKey)) {
      this.towerIconImage.setTexture(cropKey);
      const frame = this.scene.textures.getFrame(cropKey);
      if (frame) {
        const maxDim = Math.max(frame.width, frame.height);
        this.towerIconImage.setScale(110 / maxDim);
      }
    }

    const cropNames: Record<string, string> = {
      potato: "🥔 Картофель",
      onion: "🧅 Лук",
      pineapple: "🍍 Ананас",
    };
    const wavesLeft = Math.max(0, 2 - crop.wavesAlive);

    this.towerTitleText.setText(cropNames[crop.type] || "Грядка");
    this.towerInfoText.setText(`🌱 Созревание\nОсталось волн: ${wavesLeft}`);
    this.centerText();

    this.targetModeBtnText.setVisible(false);
    this.btnRandomMerge.setVisible(false);
    this.btnTargetMerge.setVisible(false);
    this.btnSell.setVisible(false);
    this.btnReroll.setVisible(false);
    this.abilityIcon.setVisible(false);
    this.abilityTooltip.setVisible(false);
    this.scene.abilityRangeCircle.setVisible(false);
  }

  public close() {
    if (this.scene.interaction.selectedInformerTower) {
      this.container.setVisible(false);
      this.scene.interaction.selectedInformerTower = null;
      this.scene.rangeCircle.setVisible(false);
      this.scene.abilityRangeCircle.setVisible(false);
      return;
    }
    this.scene.interaction.deselectTower();
  }

  private renderTowerInfo(tower: Tower) {
    this.towerIconGroup.setVisible(true);
    this.towerIconImage.anims.stop();
    const textureName = `${tower.level}_${tower.variant}`;
    if (this.scene.textures.exists("towers")) {
      this.towerIconImage.setTexture("towers", textureName);
      const frame = this.scene.textures.getFrame("towers", textureName);
      if (frame) {
        const maxDim = Math.max(frame.width, frame.height);
        this.towerIconImage.setScale(120 / maxDim);
      }
    }

    this.towerTitleText.setText(
      `${tower.towerName.toUpperCase()}\nУР. ${tower.level}`,
    );

    const dmgStr = tower.getDamageDisplay();
    const fireRateSec = (tower.getFireRate() / 1000).toFixed(2);
    const dmgTypeName = Tower.DAMAGE_TYPES[tower.damageType] || "Обычный";

    this.towerInfoText.setText(
      `Урон: ${dmgStr}\n` +
        `Тип: ${dmgTypeName}\n` +
        `Дальность: ${tower.getRange()}\n` +
        `Скор. атаки: ${fireRateSec}с`,
    );
    this.centerText();

    this.targetModeBtnText.setVisible(true);
    this.btnRandomMerge.setVisible(true);
    this.btnTargetMerge.setVisible(true);
    this.btnSell.setVisible(true);
    this.btnReroll.setVisible(
      tower.level === 6 && this.scene.inventory.getItemCount("reroll") > 0,
    );

    if (tower.specialDesc) {
      this.abilityIcon.setVisible(true);
      this.abilityLabelText.setText("СПОСОБНОСТЬ (наведи)");
      this.abilityLabelText.setColor("#ffd700");
      this.abilityTooltip.setText(tower.specialDesc);
    } else {
      this.abilityIcon.setVisible(true);
      this.abilityLabelText.setText("НЕТ СПОСОБНОСТИ");
      this.abilityLabelText.setColor("#ffffff");
      this.abilityTooltip.setText("У этой башни нет особых способностей");
    }
  }

  private renderInformerInfo(level: number, variant: number) {
    const stats = TOWER_DICTIONARY[level]?.[variant];
    if (!stats) return;

    this.towerIconGroup.setVisible(true);
    this.towerIconImage.anims.stop();
    const textureName = `${level}_${variant}`;
    if (this.scene.textures.exists("towers")) {
      this.towerIconImage.setTexture("towers", textureName);
      const frame = this.scene.textures.getFrame("towers", textureName);
      if (frame) {
        const maxDim = Math.max(frame.width, frame.height);
        this.towerIconImage.setScale(110 / maxDim);
      }
    }

    const damageType = (stats as any).damageType || 1;
    const typeLvl = this.scene.economy.damageUpgrades[damageType] || 0;
    const buffMultiplier = typeLvl * 0.15 + this.scene.economy.globalDamageBuff;

    const bonusMin =
      Math.floor(stats.minDamage * (1 + buffMultiplier)) - stats.minDamage;
    const bonusMax =
      Math.floor(stats.maxDamage * (1 + buffMultiplier)) - stats.maxDamage;

    let dmgStr = `${stats.minDamage} - ${stats.maxDamage}`;
    if (bonusMin > 0 || bonusMax > 0) {
      dmgStr +=
        bonusMin === bonusMax ? ` +${bonusMin}` : ` +${bonusMin}-${bonusMax}`;
    }

    let rate = stats.fireRate;
    if (this.scene.metaProgress) {
      const titleBuff = this.scene.metaProgress.currentTitleId * 0.01;
      rate = rate * (1 - titleBuff);
    }
    const fireRateSec = (rate / 1000).toFixed(2);
    const dmgTypeName = Tower.DAMAGE_TYPES[damageType] || "Обычный";

    this.towerTitleText.setText(`${stats.name.toUpperCase()}\nУР. ${level}`);
    this.towerInfoText.setText(
      `Урон: ${dmgStr}\n` +
        `Тип: ${dmgTypeName}\n` +
        `Дальность: ${stats.range}\n` +
        `Скор. атаки: ${fireRateSec}с`,
    );
    this.centerText();

    if ((stats as any).desc) {
      this.abilityIcon.setVisible(true);
      this.abilityLabelText.setText("Способность (наведи)");
      this.abilityLabelText.setColor("#ffd700");
      this.abilityTooltip.setText((stats as any).desc);
    } else {
      this.abilityIcon.setVisible(true);
      this.abilityLabelText.setText("Нет способности");
      this.abilityLabelText.setColor("#fdfdfd");
      this.abilityTooltip.setText("У этой башни нет особых способностей");
    }
  }

  private renderEnemyInfo(enemy: Enemy) {
    this.towerIconGroup.setVisible(true);
    const mobKey = `mob_${enemy.studioMobId}_front`;

    if (this.scene.textures.exists(mobKey)) {
      this.towerIconImage.anims.stop();
      this.towerIconImage.setTexture(mobKey, `${mobKey}_0`);
      const frame = this.scene.textures.getFrame(mobKey, `${mobKey}_0`);
      if (frame) {
        const maxDim = Math.max(frame.width, frame.height);
        this.towerIconImage.setScale(120 / maxDim);
      }
    } else {
      this.towerIconImage.setTexture("towers", "1_1");
    }

    const statusText = enemy.isDead ? " ☠" : "";
    this.towerTitleText.setText(`${enemy.displayName}${statusText}`);

    const resists = enemy.getResistances();
    const weakArr: string[] = [];
    const resistArr: string[] = [];

    for (let i = 1; i <= 7; i++) {
      const mult = resists[i] || 1;
      const name = Tower.DAMAGE_TYPES[i];
      if (mult > 1) {
        weakArr.push(`${name} +${Math.round((mult - 1) * 100)}%`);
      } else if (mult < 1) {
        resistArr.push(`${name} -${Math.round((1 - mult) * 100)}%`);
      }
    }

    const weakStr = weakArr.length ? weakArr.join(", ") : "—";
    const resistStr = resistArr.length ? resistArr.join(", ") : "—";
    const displayHp = enemy.isDead ? 0 : Math.max(0, Math.floor(enemy.hp));

    const baseSpd = Math.round(enemy.getBaseSpeed());
    const curSpd = Math.round(enemy.getEffectiveSpeed());
    const spdStr = baseSpd === curSpd ? `${baseSpd}` : `${baseSpd} (${curSpd})`;

    this.towerInfoText.setText(
      `HP: ${displayHp} / ${enemy.maxHp}\n` +
        `Скорость: ${spdStr}\n` +
        `Уязвимость: ${weakStr}\n` +
        `Сопротивление: ${resistStr}`,
    );
    this.centerText();

    this.targetModeBtnText.setVisible(false);
    this.btnRandomMerge.setVisible(false);
    this.btnTargetMerge.setVisible(false);
    this.btnSell.setVisible(false);
    this.btnReroll.setVisible(false);
    this.abilityIcon.setVisible(false);
    this.abilityTooltip.setVisible(false);
    this.scene.abilityRangeCircle.setVisible(false);
  }
}
