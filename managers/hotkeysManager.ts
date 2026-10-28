import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { hideTooltip } from "../tooltip";

export class HotkeysManager {
  private scene: MainScene;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public register() {
    this.registerBuildKeys();
    this.registerActionKeys();
    this.registerMenuKeys();
    this.registerEscapeKey();
  }

  private registerBuildKeys() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    kb.on("keydown-ONE", (event: KeyboardEvent) => {
      if (!this.scene.canUseHotkeys()) return;
      if (this.scene.inventory && this.scene.inventory.isSellMenuVisible()) {
        this.scene.inventory.handleKeyOne();
        return;
      }
      if (!this.scene.radialMenu.isOpen) return;
      const c = this.scene.interaction.activeCellCoords;
      if (!c) return;

      const isShift = event.shiftKey;

      if (this.scene.radialMenu.mode === "build") {
        if (isShift) {
          this.scene.interaction.activateQuickBuild({
            kind: "tower",
            level: 1,
            cost: this.scene.economy.COST_CHEAP,
            label: "Башня 1 ур.",
          });
        }
        this.scene.builder.buyTower(
          c.col,
          c.row,
          1,
          this.scene.economy.COST_CHEAP,
        );
      } else {
        if (isShift) {
          this.scene.interaction.activateQuickBuild({
            kind: "crop",
            cropType: "potato",
            label: "Картофель",
          });
        }
        this.scene.builder.buyCrop(c.col, c.row, "potato");
      }
    });

    kb.on("keydown-TWO", (event: KeyboardEvent) => {
      if (!this.scene.canUseHotkeys()) return;
      if (this.scene.inventory && this.scene.inventory.isSellMenuVisible()) {
        this.scene.inventory.handleKeyTwo();
        return;
      }
      if (!this.scene.radialMenu.isOpen) return;
      const c = this.scene.interaction.activeCellCoords;
      if (!c) return;

      const isShift = event.shiftKey;

      if (this.scene.radialMenu.mode === "build") {
        if (isShift) {
          this.scene.interaction.activateQuickBuild({
            kind: "tower",
            level: 4,
            cost: this.scene.economy.COST_EXP,
            label: "Башня 4 ур.",
          });
        }
        this.scene.builder.buyTower(
          c.col,
          c.row,
          4,
          this.scene.economy.COST_EXP,
        );
      } else {
        if (isShift) {
          this.scene.interaction.activateQuickBuild({
            kind: "crop",
            cropType: "onion",
            label: "Лук",
          });
        }
        this.scene.builder.buyCrop(c.col, c.row, "onion");
      }
    });

    kb.on("keydown-THREE", (event: KeyboardEvent) => {
      if (!this.scene.canUseHotkeys()) return;
      if (!this.scene.radialMenu.isOpen) return;
      const c = this.scene.interaction.activeCellCoords;
      if (!c) return;

      if (this.scene.radialMenu.mode === "build") {
        this.scene.radialMenu.switchMode("crop");
      } else {
        if (event.shiftKey) {
          this.scene.interaction.activateQuickBuild({
            kind: "crop",
            cropType: "pineapple",
            label: "Ананас",
          });
        }
        this.scene.builder.buyCrop(c.col, c.row, "pineapple");
      }
    });
  }

  private registerActionKeys() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    kb.on("keydown-S", () => {
      if (!this.scene.canUseHotkeys()) return;
      if (this.scene.interaction.selectedCoords)
        this.scene.builder.sellTower(
          this.scene.interaction.selectedCoords.col,
          this.scene.interaction.selectedCoords.row,
        );
    });

    kb.on("keydown-R", () => {
      if (!this.scene.canUseHotkeys()) return;
      if (
        this.scene.sideMenuContainer.visible &&
        this.scene.btnReroll &&
        this.scene.btnReroll.visible &&
        this.scene.interaction.selectedCoords
      ) {
        this.scene.builder.rerollTower(
          this.scene.interaction.selectedCoords.col,
          this.scene.interaction.selectedCoords.row,
        );
      }
    });

    kb.on("keydown-Q", () => {
      if (!this.scene.canUseHotkeys()) return;
      this.scene.interaction.cycleTargetMode();
    });

    kb.on("keydown-W", () => {
      if (!this.scene.canUseHotkeys()) return;
      this.scene.interaction.doRandomMerge();
    });

    kb.on("keydown-E", () => {
      if (!this.scene.canUseHotkeys()) return;
      this.scene.interaction.startTargetedMerge();
    });

    kb.on("keydown-SPACE", () => {
      if (!this.scene.canUseHotkeys()) return;
      this.scene.waveController.skipPrepPhase();
    });

    kb.on("keydown-F", () => {
      if (!this.scene.canUseHotkeys()) return;
      this.scene.cycleGameSpeed();
    });

    kb.on("keydown-T", () => {
      if (!this.scene.canUseHotkeys()) return;
      this.scene.topBar?.toggleBurgerPopup();
    });
  }

  private registerMenuKeys() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    kb.on("keydown-B", () => {
      if (!this.scene.canUseHotkeys()) return;
      if (this.scene.inventory.isVisible) {
        this.scene.openMenu(null);
      } else {
        this.scene.openMenu("inventory");
      }
    });

    kb.on("keydown-I", () => {
      if (!this.scene.canUseHotkeys()) return;
      if (this.scene.profileMenu.visible) {
        this.scene.openMenu(null);
      } else {
        this.scene.openMenu("profile");
      }
    });

    kb.on("keydown-J", () => {
      if (!this.scene.canUseHotkeys()) return;
      if (this.scene.achievementsMenu.visible) {
        this.scene.openMenu(null);
      } else {
        this.scene.openMenu("achievements");
      }
    });
  }

  private registerEscapeKey() {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    kb.on("keydown-ESC", () => {
      hideTooltip();
      if (this.scene.isTyping) return;

      if (this.scene.interaction.quickBuildTarget) {
        this.scene.interaction.deactivateQuickBuild();
        return;
      }

      if (this.scene.confirmDialog.isVisible) {
        this.scene.confirmDialog.hide();
        return;
      }

      if (
        this.scene.isPaused &&
        (this.scene.achievementsMenu.visible ||
          this.scene.howToPlayMenu.isVisible ||
          this.scene.bugReportMenu.isVisible ||
          this.scene.profileMenu.visible)
      ) {
        this.scene.openMenu("pause");
        return;
      }

      if (this.scene.waveManager.state === "menu" || this.scene.isGameOver) {
        if (
          this.scene.waveManager.state === "menu" &&
          this.scene.mainMenu &&
          this.scene.mainMenu.isDifficultyOpen
        ) {
          this.scene.mainMenu.closeDifficultyMenu();
          return;
        }

        if (this.scene.anyMenuOpen()) {
          this.scene.openMenu(null);
        }
        return;
      }

      if (
        this.scene.radialMenu.isOpen &&
        this.scene.radialMenu.mode === "crop"
      ) {
        this.scene.radialMenu.switchMode("build");
        return;
      }

      if (
        this.scene.interaction.selectedInformerTower &&
        this.scene.sideMenuContainer.visible
      ) {
        this.scene.sidePanel.close();
        return;
      }

      if (this.scene.anyMenuOpen()) {
        this.scene.openMenu(null);
        return;
      }

      if (this.scene.interaction.isWaitingForMergeTarget) {
        this.scene.interaction.isWaitingForMergeTarget = false;
        this.scene.showNotification("Слияние отменено");
        return;
      }

      if (this.scene.interaction.selectedCoords) {
        this.scene.interaction.deselectTower();
        return;
      }

      this.scene.togglePause();
    });
  }
}
