import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { Tower } from "../tower";
import { Crop } from "../Crop";
import type { CropType } from "../economy";
import { hideTooltip } from "../tooltip";

export type QuickBuildTarget =
  | { kind: "tower"; level: number; cost: number; label: string }
  | { kind: "crop"; cropType: CropType; label: string };

export class InteractionManager {
  public scene: MainScene;

  public selectedCoords: { col: number; row: number } | null = null;
  public activeCellCoords: { col: number; row: number } | null = null;
  public isWaitingForMergeTarget: boolean = false;
  public wrongMergeAttempts: number = 0;
  public lastClickTime: number = 0;
  private dragStartX = 0;
  private dragStartY = 0;
  private isDragging = false;
  private readonly DRAG_THRESHOLD = 10;
  public multiSelectedTowers: { col: number; row: number }[] = [];
  public selectedInformerTower: { level: number; variant: number } | null =
    null;

  public shiftHeld: boolean = false;
  public quickBuildTarget: QuickBuildTarget | null = null;

  constructor(scene: MainScene) {
    this.scene = scene;

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.dragStartX = pointer.x;
      this.dragStartY = pointer.y;
      this.isDragging = false;

      // Пинч — обрабатывает setupPinchZoom, не вмешиваемся
      if (
        this.scene.input.pointer1.isDown &&
        this.scene.input.pointer2.isDown
      ) {
        return;
      }

      // Без зума — старое поведение: клик срабатывает сразу
      if (this.scene.cameras.main.zoom <= 1.001) {
        this.handleGridClick(pointer.x, pointer.y);
      }
    });

    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return;
      if (
        this.scene.input.pointer1.isDown &&
        this.scene.input.pointer2.isDown
      ) {
        return;
      }
      // Панорамирование только при зуме
      if (this.scene.cameras.main.zoom <= 1.001) return;

      const dx = pointer.x - this.dragStartX;
      const dy = pointer.y - this.dragStartY;
      if (!this.isDragging && Math.hypot(dx, dy) > this.DRAG_THRESHOLD) {
        this.isDragging = true;
      }

      if (this.isDragging) {
        const cam = this.scene.cameras.main;
        cam.scrollX -= (pointer.x - pointer.prevPosition.x) / cam.zoom;
        cam.scrollY -= (pointer.y - pointer.prevPosition.y) / cam.zoom;
      }
    });

    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging) {
        this.isDragging = false;
        return;
      }
      // Тап при зуме — обрабатываем как клик
      if (this.scene.cameras.main.zoom > 1.001) {
        this.handleGridClick(pointer.x, pointer.y);
      }
    });

    this.scene.input.keyboard?.on("keydown-SHIFT", () => {
      this.shiftHeld = true;
    });
    this.scene.input.keyboard?.on("keyup-SHIFT", () => {
      this.shiftHeld = false;
      this.deactivateQuickBuild();
    });
  }

  public handleGridClick(pixelX: number, pixelY: number) {
    hideTooltip();

    // Если оба пальца нажаты — это пинч, а не клик по сетке.
    if (this.scene.input.pointer1.isDown && this.scene.input.pointer2.isDown) {
      return;
    }
    if (
      this.scene.isGameOver ||
      this.scene.waveManager.state === "menu" ||
      this.scene.isPaused
    )
      return;

    this.scene.selectedEnemy = null;

    if (this.scene.inventory && this.scene.inventory.isVisible) {
      if (!this.scene.inventory.containsPoint(pixelX, pixelY)) {
        this.scene.inventory.hide();
      }
      return;
    }

    if (
      this.scene.market &&
      this.scene.market.checkClickOutside(pixelX, pixelY)
    )
      return;
    if (
      this.scene.luckyTicket &&
      this.scene.luckyTicket.checkClickOutside(pixelX, pixelY)
    )
      return;
    if (
      this.scene.informer &&
      this.scene.informer.checkClickOutside(pixelX, pixelY)
    )
      return;

    // Клик в верхнюю полосу со статами
    if (pixelY < 50) return;

    const world = this.scene.cameras.main.getWorldPoint(pixelX, pixelY);
    const col = Math.floor(world.x / this.scene.CELL_SIZE);
    const row = Math.floor(world.y / this.scene.CELL_SIZE);

    if (col < 0 || col >= this.scene.cols || row < 0 || row >= this.scene.rows)
      return;

    if (this.quickBuildTarget) {
      this.handleQuickBuildClick(col, row);
      return;
    }

    if (this.scene.isPath(col, row)) {
      this.closeAllInGameMenus();
      return;
    }

    const grid = this.scene.builder.grid;
    const currentTower = grid[row][col];

    if (this.isWaitingForMergeTarget) {
      this.handleTargetedMerge(col, row, currentTower);
      return;
    }

    if (currentTower !== null) {
      const prevCoords = this.selectedCoords;

      const now = this.scene.time.now;
      let isDoubleClick = false;
      if (
        prevCoords &&
        prevCoords.col === col &&
        prevCoords.row === row &&
        now - this.lastClickTime < 300
      ) {
        isDoubleClick = true;
      }
      this.lastClickTime = now;

      // 1. Собираем НОВЫЙ набор
      let newSelection: { col: number; row: number }[];
      if (isDoubleClick && currentTower instanceof Tower) {
        newSelection = [];
        for (let y = 0; y < this.scene.rows; y++) {
          for (let x = 0; x < this.scene.cols; x++) {
            const t = grid[y][x];
            if (
              t instanceof Tower &&
              t.level === currentTower.level &&
              t.variant === currentTower.variant
            ) {
              newSelection.push({ col: x, row: y });
            }
          }
        }
      } else {
        newSelection = [{ col, row }];
      }

      // 2. Снимаем выделение со старых, которые НЕ вошли в новый набор
      for (const pos of this.multiSelectedTowers) {
        const inNew = newSelection.some(
          (n) => n.col === pos.col && n.row === pos.row,
        );
        if (!inNew) {
          const t = grid[pos.row]?.[pos.col];
          if (t instanceof Tower || t instanceof Crop) {
            t.setSelected(false);
          }
        }
      }

      // 3. Применяем новое выделение
      this.multiSelectedTowers = newSelection;
      this.selectedCoords = { col, row };

      for (const pos of newSelection) {
        const t = grid[pos.row][pos.col];
        if (t instanceof Tower || t instanceof Crop) {
          t.setSelected(true);
        }
      }

      this.scene.openMenu("side");
      this.scene.updateSideMenuRealtime(); // мгновенное обновление панели

      if (this.multiSelectedTowers.length > 1) {
        this.scene.multiSelectText.setText(
          `Выбрано: ${this.multiSelectedTowers.length}`,
        );
      } else {
        this.scene.multiSelectText.setText("");
      }

      // ИСПРАВЛЕНО: автосужение типов TypeScript без ручных кастов "as"
      if (currentTower instanceof Crop) {
        this.scene.sidePanel.showCrop(currentTower);
      } else if (currentTower instanceof Tower) {
        this.scene.rangeCircle.clear();
        this.scene.rangeCircle.lineStyle(2, 0xffffff, 0.3);
        this.scene.rangeCircle.strokeCircle(
          currentTower.centerX,
          currentTower.centerY,
          currentTower.getRange(),
        );
        this.scene.rangeCircle.setVisible(true);

        this.scene.sidePanel.showTower(currentTower);
      }
    } else {
      const sameCell =
        this.activeCellCoords &&
        this.activeCellCoords.col === col &&
        this.activeCellCoords.row === row;

      const menuOpen = this.scene.radialMenu.isOpen;

      // 1. Повторный клик по той же клетке — закрываем.
      if (sameCell && menuOpen) {
        this.scene.radialMenu.close();
        this.activeCellCoords = null;
        return;
      }

      // 2. Меню уже открыто, клик по другой клетке — плавно переезжаем.
      if (menuOpen) {
        this.activeCellCoords = { col, row };
        const pixelX = col * this.scene.CELL_SIZE + this.scene.CELL_SIZE / 2;
        const pixelY = row * this.scene.CELL_SIZE + this.scene.CELL_SIZE / 2;
        this.scene.radialMenu.open(pixelX, pixelY, "build");
        return;
      }

      // 3. Меню закрыто — открываем свежее.
      this.closeAllInGameMenus();
      this.activeCellCoords = { col, row };

      const pixelX = col * this.scene.CELL_SIZE + this.scene.CELL_SIZE / 2;
      const pixelY = row * this.scene.CELL_SIZE + this.scene.CELL_SIZE / 2;
      this.scene.radialMenu.open(pixelX, pixelY, "build");
    }
  }

  public activateQuickBuild(target: QuickBuildTarget) {
    this.quickBuildTarget = target;
    this.scene.showQuickBuildIndicator(target.label);
  }

  public deactivateQuickBuild() {
    if (!this.quickBuildTarget) return;
    this.quickBuildTarget = null;
    this.scene.hideQuickBuildIndicator();
  }

  private handleQuickBuildClick(col: number, row: number) {
    if (!this.quickBuildTarget) return;

    if (this.scene.isPath(col, row)) {
      this.scene.showNotification("Здесь нельзя строить");
      return;
    }

    if (this.scene.builder.grid[row][col] !== null) {
      this.scene.showNotification("Клетка занята");
      return;
    }

    const target = this.quickBuildTarget;
    if (target.kind === "tower") {
      this.scene.builder.buyTower(col, row, target.level, target.cost);
    } else {
      this.scene.builder.buyCrop(col, row, target.cropType);
    }
  }

  public cycleTargetMode() {
    if (!this.selectedCoords) return;
    const tower =
      this.scene.builder.grid[this.selectedCoords.row][this.selectedCoords.col];
    if (tower instanceof Tower) {
      tower.targetMode = (tower.targetMode + 1) % 3;
      const targetModes = ["Первый", "Мин ХП", "Макс ХП"];
      this.scene.targetModeBtnText.setText(
        `Цель: ${targetModes[tower.targetMode]} [Q]`,
      );
    }
  }

  public startTargetedMerge() {
    if (!this.selectedCoords) return;

    const grid = this.scene.builder.grid;
    const tower = grid[this.selectedCoords.row][this.selectedCoords.col];

    if (!(tower instanceof Tower)) return;

    if (tower.level >= this.scene.builder.MAX_TOWER_LEVEL) {
      this.scene.showNotification("Башня уже максимального уровня!");
      return;
    }
    this.wrongMergeAttempts = 0;
    this.isWaitingForMergeTarget = true;
    this.scene.showNotification("Выберите такую же башню!");
    this.scene.sideMenuContainer.setVisible(false);
  }

  // ИСПРАВЛЕНО: строгая типизация targetTower вместо any
  private handleTargetedMerge(
    targetCol: number,
    targetRow: number,
    targetTower: Tower | Crop | null,
  ) {
    if (!this.selectedCoords) return;
    const grid = this.scene.builder.grid;
    const srcTower = grid[this.selectedCoords.row][this.selectedCoords.col];

    if (!(srcTower instanceof Tower)) {
      this.isWaitingForMergeTarget = false;
      this.deselectTower();
      return;
    }

    if (
      !targetTower ||
      !(targetTower instanceof Tower) ||
      (targetCol === this.selectedCoords.col &&
        targetRow === this.selectedCoords.row) ||
      targetTower.level !== srcTower.level ||
      targetTower.variant !== srcTower.variant
    ) {
      this.wrongMergeAttempts++;
      if (this.wrongMergeAttempts >= 3) {
        this.scene.showNotification(
          "Ты конечно попробуй ещё разочек, но вряд-ли что-то у тебя получится)))",
        );
        this.wrongMergeAttempts = 0;
      } else {
        this.scene.showNotification(
          "Неподходящая цель! Выберите такую же башню",
        );
      }

      // ИСПРАВЛЕНО: не сбрасываем режим слияния при случайном промахе мимо башни
      return;
    }

    this.wrongMergeAttempts = 0;
    this.executeMerge(
      this.selectedCoords.col,
      this.selectedCoords.row,
      targetCol,
      targetRow,
      srcTower.level,
    );
  }

  public doRandomMerge() {
    if (!this.selectedCoords) return;
    const grid = this.scene.builder.grid;
    const srcTower = grid[this.selectedCoords.row][this.selectedCoords.col];
    if (!(srcTower instanceof Tower)) return;

    if (srcTower.level >= this.scene.builder.MAX_TOWER_LEVEL) {
      this.scene.showNotification("Башня уже максимального уровня!");
      return;
    }

    if (this.multiSelectedTowers && this.multiSelectedTowers.length >= 2) {
      const t1 = this.multiSelectedTowers.pop()!;
      const t2 = this.multiSelectedTowers.pop()!;

      this.executeMerge(t1.col, t1.row, t2.col, t2.row, srcTower.level, true);

      if (this.multiSelectedTowers.length > 0) {
        this.selectedCoords = this.multiSelectedTowers[0];

        for (const pos of this.multiSelectedTowers) {
          const t = grid[pos.row][pos.col];
          if (t instanceof Tower) {
            t.setSelected(true);
          }
        }

        if (this.multiSelectedTowers.length > 1) {
          this.scene.multiSelectText.setText(
            `Выбрано: ${this.multiSelectedTowers.length}`,
          );
        } else {
          this.scene.multiSelectText.setText("");
        }
      } else {
        this.deselectTower();
      }
      return;
    }

    const candidates: { col: number; row: number }[] = [];

    for (let y = 0; y < this.scene.rows; y++) {
      for (let x = 0; x < this.scene.cols; x++) {
        if (x === this.selectedCoords.col && y === this.selectedCoords.row)
          continue;
        const t = grid[y][x];
        if (
          t instanceof Tower &&
          t.level === srcTower.level &&
          t.variant === srcTower.variant
        ) {
          candidates.push({ col: x, row: y });
        }
      }
    }

    if (candidates.length === 0) {
      this.scene.showNotification("Нет пары для слияния!");
      return;
    }

    const target = Phaser.Utils.Array.GetRandom(candidates);
    this.executeMerge(
      this.selectedCoords.col,
      this.selectedCoords.row,
      target.col,
      target.row,
      srcTower.level,
    );
  }

  private executeMerge(
    col1: number,
    row1: number,
    col2: number,
    row2: number,
    oldLevel: number,
    keepSelection: boolean = false,
  ) {
    this.scene.builder.removeTower(col1, row1);
    this.scene.builder.removeTower(col2, row2);

    this.scene.builder.buildTower(col1, row1, oldLevel + 1);

    if (!keepSelection) {
      this.deselectTower();
    }

    this.isWaitingForMergeTarget = false;
    this.scene.showNotification("✨ Успешное слияние! ✨");
  }

  public deselectTower() {
    if (this.multiSelectedTowers) {
      for (const pos of this.multiSelectedTowers) {
        const tower = this.scene.builder.grid[pos.row][pos.col];
        if (tower instanceof Tower || tower instanceof Crop) {
          tower.setSelected(false);
        }
      }
    }

    this.selectedCoords = null;
    this.multiSelectedTowers = [];
    this.scene.sideMenuContainer.setVisible(false);
    this.isWaitingForMergeTarget = false;
    this.scene.rangeCircle.setVisible(false);
    this.scene.abilityRangeCircle.setVisible(false);
    if (this.scene.multiSelectText) this.scene.multiSelectText.setText("");
  }

  public closeAllInGameMenus() {
    this.scene.openMenu(null);
    this.isWaitingForMergeTarget = false;
    this.selectedInformerTower = null;
    this.scene.selectedEnemy = null;
  }
}
