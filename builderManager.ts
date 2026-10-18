import * as Phaser from "phaser";
import type { MainScene } from "./main";
import { Tower } from "./tower";
import { Crop } from "./Crop";
import type { CropType } from "./economy";

export class BuilderManager {
  public scene: MainScene;

  public readonly MAX_TOWER_LEVEL = 6;
  public grid: (Tower | Crop | null)[][] = [];
  public activeTowers: Tower[] = [];

  constructor(scene: MainScene) {
    this.scene = scene;
    this.initGrid();
  }

  private initGrid() {
    for (let y = 0; y < this.scene.rows; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.scene.cols; x++) {
        this.grid[y][x] = null;
      }
    }
  }

  public updateTowers(time: number) {
    for (const tower of this.activeTowers) {
      tower.update(time, this.scene.enemyManager.enemies);
    }
  }

  public buyTower(col: number, row: number, level: number, cost: number) {
    let finalCost = cost;

    if (
      cost >= this.scene.economy.COST_EXP &&
      this.scene.inventory.getItemCount("coupon") > 0
    ) {
      finalCost = 0;
      this.scene.inventory.removeItem("coupon", 1);
      this.scene.showNotification("🎟️ Использован купон из инвентаря!");
    } else if (
      cost >= this.scene.economy.COST_EXP &&
      this.scene.economy.freeTowerCharges > 0
    ) {
      finalCost = 0;
      this.scene.economy.freeTowerCharges--;
      this.scene.showNotification("🎟️ Использован купон на 100% скидку!");
    }

    if (finalCost > 0 && !this.scene.economy.spendGold(finalCost)) {
      this.scene.showNotification("Недостаточно золота!");
      return;
    }

    this.scene.goldText.setText(`: ${this.scene.economy.gold}`);

    let finalLevel = level;
    const roll = Phaser.Math.FloatBetween(0, 1);

    if (level === 1) {
      if (roll <= 0.08) {
        finalLevel = 3;
        this.scene.showNotification("🍀 Удача! Выпала башня 3-го уровня!");
      } else if (roll <= 0.16) {
        finalLevel = 2;
        this.scene.showNotification("🍀 Удача! Выпала башня 2-го уровня!");
      }
    } else if (level >= 3) {
      if (roll <= 0.08) {
        finalLevel = level + 1;
        this.scene.showNotification(
          `🍀 Удача! Выпала башня ${finalLevel}-го уровня!`,
        );
      }
    }

    this.buildTower(col, row, finalLevel);
    this.scene.radialMenu.close();
    this.scene.interaction.activeCellCoords = null;
  }

  public buyCrop(col: number, row: number, type: CropType) {
    const cost = this.scene.economy.CROP_COST[type];
    if (!this.scene.economy.spendWood(cost)) {
      this.scene.showNotification("Недостаточно семян!");
      return;
    }

    this.scene.woodText.setText(`: ${this.scene.economy.wood}`);

    const newCrop = new Crop(this.scene, col, row, type, this.scene.CELL_SIZE);
    this.grid[row][col] = newCrop;

    this.scene.economy.cropsPlanted[type]++;
    this.scene.updateMarketUI();

    const cropNames: Record<string, string> = {
      potato: "🥔 Картофель",
      onion: "🧅 Лук",
      pineapple: "🍍 Ананас",
    };
    this.scene.showNotification(`${cropNames[type]} успешно посажен!`);

    this.scene.radialMenu.close();
    this.scene.interaction.activeCellCoords = null;
  }

  public buildTower(
    col: number,
    row: number,
    level: number,
    specificVariant?: number,
  ) {
    const maxVariants = level === 6 ? 21 : 7;
    const variant = specificVariant || Phaser.Math.Between(1, maxVariants);

    const newTower = new Tower(
      this.scene,
      col,
      row,
      level,
      variant,
      this.scene.CELL_SIZE,
    );
    this.grid[row][col] = newTower;
    this.activeTowers.push(newTower);

    const towerStr = `${level}-${variant}`;
    if (this.scene.achievements.lastBuiltTowerStr === towerStr) {
      this.scene.achievements.consecutiveSameTowers++;
      if (this.scene.achievements.consecutiveSameTowers >= 4) {
        this.scene.achievements.unlock("lucky_one");
      }
    } else {
      this.scene.achievements.lastBuiltTowerStr = towerStr;
      this.scene.achievements.consecutiveSameTowers = 1;
    }

    if (level === 6) {
      const currentWave = this.scene.waveManager.currentWaveIndex + 1;
      if (currentWave <= 13) {
        this.scene.achievements.unlock("speedshooter");
        this.scene.achievements.unlock("first_place");
      } else if (currentWave <= 15) {
        this.scene.achievements.unlock("first_place");
      }
    }

    this.updateAllAuras();
  }

  public removeTower(col: number, row: number) {
    const tower = this.grid[row][col];
    if (tower) {
      if (tower instanceof Tower) {
        this.activeTowers = this.activeTowers.filter((t) => t !== tower);
      }
      tower.destroy();
      this.grid[row][col] = null;
      this.updateAllAuras();
    }
  }

  public sellTower(col: number, row: number) {
    const entity = this.grid[row][col];
    if (!entity) return;
    if (!(entity instanceof Tower)) {
      this.scene.showNotification("Грядка не продается");
      return;
    }

    // ИСПРАВЛЕНО: используем COST_CHEAP вместо хардкода 100
    const baseTowersCount = Math.pow(2, entity.level - 1);
    const totalInvestment = baseTowersCount * this.scene.economy.COST_CHEAP;
    const refund = Math.floor(totalInvestment * 0.7);

    this.scene.economy.addGold(refund);
    this.scene.goldText.setText(`: ${this.scene.economy.gold}`);

    this.removeTower(col, row);

    if (entity.level === 6) this.scene.achievements.unlock("secret_3");

    const towerStr = `${entity.level}-${entity.variant}`;
    this.scene.achievements.soldTowersStats[towerStr] =
      (this.scene.achievements.soldTowersStats[towerStr] || 0) + 1;
    if (this.scene.achievements.soldTowersStats[towerStr] >= 5)
      this.scene.achievements.unlock("not_that");

    if (this.scene.waveManager.state === "wave") {
      this.scene.achievements.towersSoldThisWave++;
      if (this.scene.achievements.towersSoldThisWave >= 5)
        this.scene.achievements.unlock("psycho");
    }

    this.scene.showNotification(`💰 Башня продана за ${refund} золота`);
    this.scene.interaction.deselectTower();
  }

  public rerollTower(col: number, row: number) {
    const tower = this.grid[row][col];
    if (tower instanceof Tower && tower.level === 6) {
      if (this.scene.inventory.removeItem("reroll", 1)) {
        this.removeTower(col, row);
        const newVariant = Phaser.Math.Between(1, 21);
        this.buildTower(col, row, 6, newVariant);
        this.scene.showNotification("🎲 Башня успешно заменена!");

        const pixelX = col * this.scene.CELL_SIZE + this.scene.CELL_SIZE / 2;
        const pixelY = row * this.scene.CELL_SIZE + this.scene.CELL_SIZE / 2;
        this.scene.interaction.handleGridClick(pixelX, pixelY);
      } else {
        this.scene.showNotification("Нет кубиков замены!");
      }
    }
  }

  public updateAllAuras() {
    for (const tower of this.activeTowers) {
      tower.currentFireRate = tower.baseFireRate;
    }
    for (const sourceTower of this.activeTowers) {
      if (sourceTower.auraRadius > 0 && sourceTower.auraSpeedBuff > 0) {
        for (const targetTower of this.activeTowers) {
          if (sourceTower === targetTower) continue;
          const dx = targetTower.centerX - sourceTower.centerX;
          const dy = targetTower.centerY - sourceTower.centerY;
          if (Math.sqrt(dx * dx + dy * dy) <= sourceTower.auraRadius) {
            const buffAmount =
              targetTower.baseFireRate * sourceTower.auraSpeedBuff;
            targetTower.currentFireRate = Math.max(
              100,
              targetTower.currentFireRate - buffAmount,
            );
          }
        }
      }
    }
  }
}
