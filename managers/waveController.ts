import * as Phaser from "phaser";
import type { MainScene } from "../main";
import { Enemy } from "../enemies/enemy";
import { Crop } from "../Crop";

export class WaveController {
  private scene: MainScene;

  public waveInfoText!: Phaser.GameObjects.Text;
  public skipTimerBtn!: Phaser.GameObjects.Text;

  private waveTimerEvent: Phaser.Time.TimerEvent | null = null;
  private spawnTimerEvent: Phaser.Time.TimerEvent | null = null;
  private currentWaveVariantId: number = 1;

  constructor(scene: MainScene) {
    this.scene = scene;
  }

  public create() {
    this.waveInfoText = this.scene.add
      .text(this.scene.scale.width / 4, 80, "", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);

    this.skipTimerBtn = this.scene.add
      .text(this.scene.scale.width / 2, 90, "[Пробел] Пропустить таймер ⏭", {
        fontSize: "18px",
        color: "#ffffff",
        backgroundColor: "#555555",
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this.skipPrepPhase());
  }

  public startPrepPhase(seconds: number) {
    // На случай повторного вызова (например, из startGame дважды) —
    // убираем старые таймеры, чтобы не было двух параллельных отсчётов.
    if (this.waveTimerEvent) {
      this.waveTimerEvent.destroy();
      this.waveTimerEvent = null;
    }
    if (this.spawnTimerEvent) {
      this.spawnTimerEvent.destroy();
      this.spawnTimerEvent = null;
    }

    this.waveInfoText.setVisible(true);
    this.skipTimerBtn.setVisible(true);

    let timeLeft = seconds;
    this.waveTimerEvent = this.scene.time.addEvent({
      delay: 1000,
      repeat: seconds - 1,
      callback: () => {
        timeLeft--;
        this.waveInfoText.setText(
          `До начала волны ${this.scene.waveManager.currentWaveIndex + 1}/40: ${timeLeft} сек`,
        );
        if (timeLeft <= 0) this.startWave();
      },
    });
    this.waveInfoText.setText(
      `До начала волны ${this.scene.waveManager.currentWaveIndex + 1}/40: ${timeLeft} сек`,
    );
  }

  public startWave() {
    this.skipTimerBtn.setVisible(false);
    this.scene.waveManager.startWave();

    const currentConfig = this.scene.waveManager.currentWave;
    this.waveInfoText.setText(
      `Волна ${this.scene.waveManager.currentWaveIndex + 1} / ${this.scene.waveManager.totalWaves}`,
    );

    this.currentWaveVariantId = Enemy.getNextVariantForWave(
      currentConfig.enemyType,
      this.scene.waveManager.currentWaveIndex,
    );

    this.spawnTimerEvent = this.scene.time.addEvent({
      delay: currentConfig.spawnInterval,
      repeat: currentConfig.count - 1,
      callback: () => {
        this.scene.enemyManager.spawnEnemy(
          currentConfig.enemyType,
          this.currentWaveVariantId,
          currentConfig.hpMultiplier * this.scene.difficultyMultiplier,
        );
        this.scene.waveManager.spawnedMobsCount++;
      },
    });
  }

  public skipPrepPhase() {
    if (this.scene.waveManager.state !== "prep") return;
    if (this.waveTimerEvent) {
      this.waveTimerEvent.destroy();
      this.waveTimerEvent = null;
    }
    this.startWave();
  }

  public update() {
    if (this.scene.waveManager.state !== "wave") return;
    const currentConfig = this.scene.waveManager.currentWave;
    if (
      this.scene.waveManager.spawnedMobsCount === currentConfig.count &&
      this.scene.enemyManager.enemies.length === 0
    ) {
      this.handleWaveCompletion(currentConfig.postPause);
    }
  }

  private handleWaveCompletion(postPause: number) {
    const scene = this.scene;
    scene.waveManager.nextWave();

    if (!scene.achievements.baseHasTakenDamage) {
      scene.achievements.wavesPassedWithoutDamage++;
      if (scene.achievements.wavesPassedWithoutDamage >= 15)
        scene.achievements.unlock("armor_piercing");
    }
    scene.achievements.baseHasTakenDamage = false;
    scene.achievements.towersSoldThisWave = 0;

    const passedWave = scene.waveManager.currentWaveIndex;

    scene.economy.addWood(20);
    scene.woodText.setText(`: ${scene.economy.wood}`);

    scene.economy.addGold(passedWave <= 5 ? 200 : 150);
    scene.goldText.setText(`: ${scene.economy.gold}`);

    if (passedWave % 5 === 0) {
      scene.economy.addMedals(1);
      scene.medalsText.setText(`: ${scene.economy.medals}`);
      scene.showNotification("Получена медаль!");
    }

    if (passedWave <= 20) {
      scene.inventory.addItem("ticket", 1);
      scene.showNotification("Счастливый билет получен!");
    }

    for (let y = 0; y < scene.rows; y++) {
      for (let x = 0; x < scene.cols; x++) {
        const entity = scene.builder.grid[y][x];
        if (entity instanceof Crop) {
          scene.inventory.addItem(entity.type, 1);
          entity.wavesAlive++;
          if (entity.wavesAlive >= 2) {
            entity.destroy();
            scene.builder.grid[y][x] = null;
          }
        }
      }
    }

    scene.economy.rollMarketFluctuations();
    scene.updateMarketUI();

    scene.time.delayedCall(500, () => scene.autoShowMarketPrices());

    if (scene.waveManager.isVictory()) {
      scene.metaProgress.addWin(scene.currentDifficultyLevel);
      scene.triggerGameOver(true);
    } else {
      this.startPrepPhase(postPause);
    }
  }
}