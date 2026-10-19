import * as Phaser from "phaser";
import "./style.css";
import { Enemy } from "./enemies/enemy";
import { WaveManager } from "./waves";
import { EconomyManager } from "./economy";
import { Crop } from "./Crop";
import { Inventory } from "./inventory";
import { Market } from "./market";
import { LuckyTicket } from "./luckyTicket";
import { MetaProgress } from "./metaProgress";
import { TITLES, type Difficulty } from "./meta";
import { SaveSystem } from "./saveSystem";
import { AchievementSystem } from "./achievementSystem";
import { MainMenu } from "./ui/mainMenu";
import { PauseMenu } from "./ui/pauseMenu";
import { HowToPlayMenu } from "./ui/howToPlayMenu";
import { BugReportMenu } from "./bugReportMenu";
import { InteractionManager } from "./managers/interactionManager";
import { BuilderManager } from "./managers/builderManager";
import { EnemyManager } from "./managers/enemyManager";
import { Informer } from "./informer";
import { registerMobTextures } from "./enemies/mobGenerator/MobTextures";
import { RadialMenu } from "./ui/radialMenu";
import { attachTooltip, hideTooltip } from "./tooltip";
import { TopBarUI } from "./ui/TopBarUI";
import { SidePanelUI } from "./ui/SidePanelUI";
import { ProfileMenuUI } from "./ui/ProfileMenuUI";
import { AchievementsMenuUI } from "./ui/AchievementsMenuUI";
import { GameOverMenuUI } from "./ui/GameOverMenuUI";
import { InputMenuUI } from "./ui/InputMenuUI";
import { ENEMY_PATH, BLOCKED_CELLS } from "./config/mapData";
import { HotkeysManager } from "./managers/hotkeysManager";
import { ConfirmDialog } from "./ui/ConfirmDialog";

const originalAddText = Phaser.GameObjects.GameObjectFactory.prototype.text;

Phaser.GameObjects.GameObjectFactory.prototype.text = function (
  x: number,
  y: number,
  text: string | string[],
  style?: Phaser.Types.GameObjects.Text.TextStyle,
) {
  const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: 'GameFont, "Trebuchet MS", sans-serif',
    letterSpacing: 2.5,
    lineSpacing: 3,
    stroke: "#000000",
    strokeThickness: 3,
  };

  const finalStyle = style ? { ...defaultStyle, ...style } : defaultStyle;
  return originalAddText.call(this, x, y, text, finalStyle);
};

export class MainScene extends Phaser.Scene {
  public readonly CELL_SIZE = 64;
  public readonly SIDE_MENU_WIDTH = 450;

  public enemyPath = ENEMY_PATH;
  private blockedCells = BLOCKED_CELLS;

  // --- СИСТЕМЫ ---
  public waveManager: WaveManager = new WaveManager();
  public economy: EconomyManager = new EconomyManager();
  public inventory!: Inventory;
  public market!: Market;
  public luckyTicket!: LuckyTicket;
  public metaProgress!: MetaProgress;
  private gameLogs: string[] = [];
  public achievements!: AchievementSystem;
  public interaction!: InteractionManager;
  public builder!: BuilderManager;
  public enemyManager!: EnemyManager;
  public cols!: number;
  public rows!: number;

  // Таймеры
  private waveTimerEvent: Phaser.Time.TimerEvent | null = null;
  private spawnTimerEvent: Phaser.Time.TimerEvent | null = null;
  private lastUIUpdateTime: number = 0;
  private currentWaveVariantId: number = 1;

  // UI Элементы
  public mainMenu!: MainMenu;
  public pauseMenu!: PauseMenu;
  public howToPlayMenu!: HowToPlayMenu;
  public bugReportMenu!: BugReportMenu;

  private waveInfoText!: Phaser.GameObjects.Text;
  private skipTimerBtn!: Phaser.GameObjects.Text;
  public marketAura!: Phaser.GameObjects.Graphics;
  public radialMenu!: RadialMenu;

    // --- НОВЫЕ UI-МЕНЕДЖЕРЫ ---
  public topBar!: TopBarUI;
  public sidePanel!: SidePanelUI;

  // Полевые объекты (не UI-панель)
  public rangeCircle!: Phaser.GameObjects.Graphics;
  public abilityRangeCircle!: Phaser.GameObjects.Graphics;

  // --- ГЕТТЕРЫ для обратной совместимости с внешними классами ---
  public get goldText() { return this.topBar.goldText; }
  public get woodText() { return this.topBar.woodText; }
  public get medalsText() { return this.topBar.medalsText; }
  public get playerLivesText() { return this.topBar.playerLivesText; }
  public get burgerBtn() { return this.topBar.burgerBtn; }
  public get marketPopupContainer() { return this.topBar.marketPopupContainer; }
  public get achievementsDot() { return this.topBar.achievementsDot; }
  public get sideMenuContainer() { return this.sidePanel.container; }
  public get towerIconGroup() { return this.sidePanel.towerIconGroup; }
  public get towerIconImage() { return this.sidePanel.towerIconImage; }
  public get towerTitleText() { return this.sidePanel.towerTitleText; }
  public get towerInfoText() { return this.sidePanel.towerInfoText; }
  public get multiSelectText() { return this.sidePanel.multiSelectText; }
  public get targetModeBtnText() { return this.sidePanel.targetModeBtnText; }
  public get btnSell() { return this.sidePanel.btnSell; }
  public get btnRandomMerge() { return this.sidePanel.btnRandomMerge; }
  public get btnTargetMerge() { return this.sidePanel.btnTargetMerge; }
  public get btnReroll() { return this.sidePanel.btnReroll; }
  public get abilityIcon() { return this.sidePanel.abilityIcon; }
  public get abilityTooltip() { return this.sidePanel.abilityTooltip; }

  public gameSpeed: number = 1;
  private gameTime: number = 0;
  public speedBtn!: Phaser.GameObjects.Container;

  private difficultyMultiplier: number = 1.0;
  private currentDifficultyLevel: Difficulty = "easy";

  public profileMenu!: ProfileMenuUI;
  public achievementsMenu!: AchievementsMenuUI;
  public gameOverMenu!: GameOverMenuUI;

  private activeNotifications: Phaser.GameObjects.Text[] = [];
  public informer!: Informer;
  public informerAura!: Phaser.GameObjects.Graphics;

  public inputMenu!: InputMenuUI;
  public confirmDialog!: ConfirmDialog;
  private hotkeys!: HotkeysManager;

  public get isTyping(): boolean {
    return this.inputMenu?.isVisible ?? false;
  }

  // Состояние
  public playerLives: number = 20;
  public isGameOver: boolean = false;
  public isPaused: boolean = false;
  public selectedEnemy: Enemy | null = null;

  public getGrid() {
    return this.builder.grid;
  }

  public getActiveTowers() {
    return this.builder.activeTowers;
  }

  public getLogs(): string[] {
    return this.gameLogs;
  }

  public openMenu(
    name:
      | "side"
      | "inventory"
      | "market"
      | "informer"
      | "luckyTicket"
      | "pause"
      | "profile"
      | "achievements"
      | "howToPlay"
      | "bugReport"
      | null,
  ) {
    // Если из паузы открывают одно из этих меню — паузу СОХРАНЯЕМ
    // (pauseMenu остаётся внизу, оверлей рисуется поверх).
    const isPausePreserved =
      this.isPaused &&
      (name === "achievements" ||
        name === "howToPlay" ||
        name === "bugReport" ||
        name === "profile");

    // Обычный выход из паузы (не в оверлей) — размораживаем.
    if (!isPausePreserved && this.isPaused && name !== "pause") {
      this.isPaused = false;
      this.pauseMenu.setVisible(false);
      this.time.paused = false;
      this.anims.resumeAll();
    }
    // 1. Закрываем всё, кроме запрошенного.
    if (name !== "inventory") this.inventory.hide();
    if (name !== "market") this.market.hide();
    if (name !== "informer") this.informer.hide();
    if (name !== "luckyTicket") this.luckyTicket.hide();
    if (name !== "howToPlay") this.howToPlayMenu.setVisible(false);
    if (name !== "bugReport") this.bugReportMenu.setVisible(false);
    if (name !== "profile") this.profileMenu.hide();
    if (name !== "achievements") this.achievementsMenu.hide();
    if (name !== "pause" && !isPausePreserved)
      this.pauseMenu.setVisible(false);
    if (name !== "side") {
      this.sideMenuContainer.setVisible(false);
      this.interaction.deselectTower();
    }

    this.radialMenu.close();
    this.closeMarketPopup();
    hideTooltip();
    this.interaction.activeCellCoords = null;

    if (name === null) return;

    // 2. Открываем запрошенное.
    switch (name) {
      case "side":
        this.sideMenuContainer.setDepth(50);
        this.sideMenuContainer.setVisible(true);
        break;
      case "inventory":
        this.inventory.show();
        break;
      case "market":
        this.market.show();
        break;
      case "informer":
        this.informer.show();
        break;
      case "luckyTicket":
        this.luckyTicket.show();
        break;
      case "pause":
        this.isPaused = true;
        this.pauseMenu.updateDifficultyText(this.currentDifficultyLevel);
        this.pauseMenu.setVisible(true);
        this.time.paused = true;
        this.anims.pauseAll();
        break;
      case "profile":
        this.profileMenu.show();
        break;
      case "achievements":
        this.achievementsMenu.show();
        break;
      case "howToPlay":
        this.howToPlayMenu.setVisible(true);
        break;
      case "bugReport":
        this.bugReportMenu.setVisible(true);
        break;
    }
  }

  public anyMenuOpen(): boolean {
    return (
      this.inventory.isVisible ||
      this.market.isVisible() ||
      this.informer.isVisible() ||
      this.luckyTicket.isVisible() ||
      this.howToPlayMenu.isVisible ||
      this.bugReportMenu.isVisible ||
      this.profileMenu.visible ||
      this.achievementsMenu.visible ||
      this.sideMenuContainer.visible ||
      this.radialMenu.isOpen ||
      this.marketPopupContainer.visible
    );
  }

  init() {
    this.gameLogs = [];
    this.activeNotifications = [];

    if (!(console as any).isWrappedForGame) {
      const originalLog = console.log;
      const originalError = console.error;

      console.log = (...args: any[]) => {
        this.gameLogs.push("[LOG] " + args.join(" "));
        if (this.gameLogs.length > 50) this.gameLogs.shift();
        originalLog.apply(console, args);
      };
      console.error = (...args: any[]) => {
        this.gameLogs.push("[ERR] " + args.join(" "));
        if (this.gameLogs.length > 50) this.gameLogs.shift();
        originalError.apply(console, args);
      };
      (console as any).isWrappedForGame = true;
    }

    this.gameLogs.push(`[SYS] Игра запущена. Версия 0.9`);

    this.metaProgress = new MetaProgress();
    this.achievements = new AchievementSystem(this);
    this.economy.reset();
    this.difficultyMultiplier = 1.0;
    this.playerLives = 20;
    this.isGameOver = false;
    this.isPaused = false;
    this.waveManager = new WaveManager();

    Enemy.resetUsedVariants();
    this.gameSpeed = 1;
    this.gameTime = 0;
  }

  public canUseHotkeys(): boolean {
    if (this.isTyping) return false;
    if (this.isPaused) return false;
    if (this.isGameOver) return false;
    if (this.waveManager.state === "menu") return false;
    return true;
  }

  constructor() {
    super("MainScene");
  }

  preload() {
    if (!this.textures.exists("ui")) {
      this.load.image("map_bg", "./assets/map.png");
      //this.load.atlasXML("ui", "./assets/ui-2.png", "./assets/ui-2.xml");
      this.load.atlas("ui", "./assets/ui-2.1.png", "./assets/ui-2.1.json");
      this.load.atlas(
        "towers",
        "./assets/towersIcon.png",
        "./assets/towersIcon.json",
      );
      this.load.image("market", "./assets/market.png");
      this.load.image("informer", "./assets/informer.png");
      this.load.image("potato", "./assets/potato.png");
      this.load.image("onion", "./assets/onion.png");
      this.load.image("pineapple", "./assets/pineapple.png");
    }

    if (!this.textures.exists("icon")) {
      this.load.atlas("icon", "./assets/icon.png", "./assets/icon.json");
    }

    if (!this.textures.exists("ui_v2")) {
      this.load.atlas("ui_v2", "./assets/ui-3.1.png", "./assets/ui-3.1.json");
    }
  }

  create() {
    registerMobTextures(this);

    this.add.image(0, 0, "map_bg").setOrigin(0, 0);
    this.drawGrid();

    const mx = 22.5 * this.CELL_SIZE;
    const my = 6 * this.CELL_SIZE;

    // --- РЫНОК ---
    this.marketAura = this.add.graphics();
    this.marketAura.setPosition(mx + 64, my + 105);
    this.drawBuildingAura(this.marketAura, 128, false);

    const marketImg = this.add.image(mx + 64, my + 128, "market");
    marketImg.setOrigin(0.5, 1);
    marketImg.setDisplaySize(196, 196);

    const mScaleX = marketImg.scaleX;
    const mScaleY = marketImg.scaleY;

    this.add.container(0, 0, [this.marketAura, marketImg]).setDepth(2);
    const marketZone = this.add
      .zone(mx, my, 128, 128)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    marketZone.on("pointerover", () => {
      if (this.isPaused || this.isGameOver) return;
      this.tweens.add({
        targets: marketImg,
        scaleX: mScaleX * 1.08,
        scaleY: mScaleY * 1.08,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    marketZone.on("pointerout", () => {
      this.tweens.add({
        targets: marketImg,
        scaleX: mScaleX,
        scaleY: mScaleY,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    attachTooltip(this, marketZone, "Рынок овощей");

    marketZone.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        localX: number,
        localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (this.isPaused || this.isGameOver) return;

        this.tweens.add({
          targets: marketImg,
          scaleX: mScaleX * 0.95,
          scaleY: mScaleY * 0.9,
          duration: 60,
          yoyo: true,
        });

        this.openMenu("market");
      },
    );

    this.rangeCircle = this.add.graphics().setDepth(4).setVisible(false);
    this.abilityRangeCircle = this.add.graphics().setDepth(4).setVisible(false);

    this.cols = Math.floor(this.scale.width / this.CELL_SIZE);
    this.rows = Math.floor(this.scale.height / this.CELL_SIZE);

    this.builder = new BuilderManager(this);
    this.enemyManager = new EnemyManager(this);

    // --- СОЗДАНИЕ UI И СИСТЕМ ---

    this.waveInfoText = this.add
      .text(this.scale.width / 4, 80, "", {
        fontSize: "20px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);

    this.skipTimerBtn = this.add
      .text(this.scale.width / 2, 90, "[Пробел] Пропустить таймер ⏭", {
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

    this.inventory = new Inventory(this, this.economy);

    this.events.off("inventory-sold");
    this.events.on("inventory-sold", (msg: string) => {
      this.goldText.setText(`: ${this.economy.gold}`);
      this.updateMarketUI();
      this.showNotification(msg);
    });

    this.cols = Math.floor(this.scale.width / this.CELL_SIZE);
    this.rows = Math.floor(this.scale.height / this.CELL_SIZE);
    this.interaction = new InteractionManager(this);
    this.sidePanel = new SidePanelUI(this);
    this.sidePanel.create();
    this.topBar = new TopBarUI(this);
    this.topBar.create();
    this.profileMenu = new ProfileMenuUI(this);
    this.achievementsMenu = new AchievementsMenuUI(this);
    this.gameOverMenu = new GameOverMenuUI(this);
    this.inputMenu = new InputMenuUI(this);
    this.confirmDialog = new ConfirmDialog(this);
    this.mainMenu = new MainMenu(this);
    this.market = new Market(this);
    this.luckyTicket = new LuckyTicket(this);
    this.pauseMenu = new PauseMenu(this);
    this.howToPlayMenu = new HowToPlayMenu(this);
    this.bugReportMenu = new BugReportMenu(this);

    const ix = 23 * this.CELL_SIZE;
    const iy = 2 * this.CELL_SIZE;

    // --- ИНФО (ЭНЦИКЛОПЕДИЯ) ---
    this.informerAura = this.add.graphics();
    this.informerAura.setPosition(ix + 32, iy + 60);
    this.drawBuildingAura(this.informerAura, 70, false);

    const informerImg = this.add.image(ix + 32, iy + 64, "informer");
    informerImg.setOrigin(0.5, 1);
    informerImg.setDisplaySize(112, 112);

    const iScaleX = informerImg.scaleX;
    const iScaleY = informerImg.scaleY;

    this.add.container(0, 0, [this.informerAura, informerImg]).setDepth(2);
    const informerZone = this.add
      .zone(ix, iy, 64, 64)
      .setOrigin(0, 0)
      .setInteractive({ useHandCursor: true });

    informerZone.on("pointerover", () => {
      if (this.isPaused || this.isGameOver) return;
      this.tweens.add({
        targets: informerImg,
        scaleX: iScaleX * 1.15,
        scaleY: iScaleY * 1.15,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    informerZone.on("pointerout", () => {
      this.tweens.add({
        targets: informerImg,
        scaleX: iScaleX,
        scaleY: iScaleY,
        duration: 150,
        ease: "Sine.easeOut",
      });
    });

    attachTooltip(this, informerZone, "Энциклопедия башен");

    informerZone.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        localX: number,
        localY: number,
        event: Phaser.Types.Input.EventData,
      ) => {
        event.stopPropagation();
        if (this.isPaused || this.isGameOver) return;

        this.tweens.add({
          targets: informerImg,
          scaleX: iScaleX * 0.9,
          scaleY: iScaleY * 0.9,
          duration: 60,
          yoyo: true,
        });

        this.interaction.closeAllInGameMenus();
        this.informer.show();
      },
    );

    this.informer = new Informer(this);

    if (!SaveSystem.loadNickname()) {
      this.mainMenu.setVisible(false);
      this.showInputMenu(
        "Придумайте Никнейм (до 12 букв):",
        12,
        (nick) => {
          const finalNick = nick.trim() || "Player";
          SaveSystem.setNickname(finalNick);
          const savedCode = localStorage.getItem("td_save_code");
          if (savedCode) this.metaProgress.applyCode(savedCode);
          this.mainMenu.setVisible(true);
        },
        false,
      );
    } else {
      const savedCode = localStorage.getItem("td_save_code");
      if (savedCode) this.metaProgress.applyCode(savedCode);
    }

    this.radialMenu = new RadialMenu(this, {
      build1: () => {
        const c = this.interaction.activeCellCoords;
        if (!c) return;
        this.builder.buyTower(c.col, c.row, 1, this.economy.COST_CHEAP);
      },
      build4: () => {
        const c = this.interaction.activeCellCoords;
        if (!c) return;
        this.builder.buyTower(c.col, c.row, 4, this.economy.COST_EXP);
      },
      goCrop: () => {
        this.radialMenu.switchMode("crop");
      },
      plantPotato: () => {
        const c = this.interaction.activeCellCoords;
        if (!c) return;
        this.builder.buyCrop(c.col, c.row, "potato");
      },
      plantOnion: () => {
        const c = this.interaction.activeCellCoords;
        if (!c) return;
        this.builder.buyCrop(c.col, c.row, "onion");
      },
      plantPineapple: () => {
        const c = this.interaction.activeCellCoords;
        if (!c) return;
        this.builder.buyCrop(c.col, c.row, "pineapple");
      },
      onClose: () => {
        this.radialMenu.close();
        this.interaction.activeCellCoords = null;
      },
    });
    this.events.off("spawn-skeleton");
    this.events.on("spawn-skeleton", (x: number, y: number) => {
      this.enemyManager.spawnSkeleton(x, y);
    });

    this.events.off("trigger-owl-buff");
    this.events.on("trigger-owl-buff", () => {
      if (this.builder.activeTowers.length > 0) {
        const randomTower = Phaser.Utils.Array.GetRandom(
          this.builder.activeTowers,
        );
        randomTower.applyOwlBuff();
      }
    });

    this.events.off("spawn-mine");
    this.events.on(
      "spawn-mine",
      (mx: number, my: number, dmg: number, radius: number) => {
        let spawnX = mx;
        let spawnY = my;
        if (mx === -1 && my === -1) {
          const randIndex = Phaser.Math.Between(0, this.enemyPath.length - 2);
          const p1 = this.enemyPath[randIndex];
          const p2 = this.enemyPath[randIndex + 1];
          const t = Phaser.Math.FloatBetween(0, 1);
          spawnX =
            (p1.col + (p2.col - p1.col) * t) * this.CELL_SIZE +
            this.CELL_SIZE / 2;
          spawnY =
            (p1.row + (p2.row - p1.row) * t) * this.CELL_SIZE +
            this.CELL_SIZE / 2;
        }
        this.enemyManager.spawnMine(spawnX, spawnY, dmg, radius);
      },
    );
    this.hotkeys = new HotkeysManager(this);
    this.hotkeys.register();
  }

  public isPath(col: number, row: number): boolean {
    const onPath = this.enemyPath.some((p) => p.col === col && p.row === row);
    const isBlocked = this.blockedCells.some(
      (p) => p.col === col && p.row === row,
    );
    return onPath || isBlocked;
  }

  public showInputMenu(
    title: string,
    maxLength: number,
    onConfirm: (text: string) => void,
    allowCancel: boolean,
  ) {
    this.inputMenu.show(title, maxLength, onConfirm, allowCancel);
  }

  public startGame(
    diffId: Difficulty,
    multiplier: number,
    startGold: number = 500,
  ) {
    this.inventory.reset();
    const startingTickets: Record<string, number> = {
      easy: 5,
      normal: 5,
      hard: 6,
      nightmare: 7,
      hell: 8,
      extreme: 9,
      god: 10,
    };
    this.inventory.addItem("ticket", startingTickets[diffId] || 5);
    this.currentDifficultyLevel = diffId;
    this.difficultyMultiplier = multiplier;

    this.economy.gold = startGold;
    this.goldText.setText(`: ${this.economy.gold}`);
    this.achievements.resetSession();
    this.waveManager.startNewGame();
    this.startPrepPhase(this.waveManager.currentWave.prepTime);

    this.updateMarketUI();
    this.setGameSpeed(1);

    this.time.delayedCall(500, () => this.autoShowMarketPrices());
  }

  private startPrepPhase(seconds: number) {
    this.waveInfoText.setVisible(true);
    this.skipTimerBtn.setVisible(true);

    let timeLeft = seconds;
    this.waveTimerEvent = this.time.addEvent({
      delay: 1000,
      repeat: seconds - 1,
      callback: () => {
        timeLeft--;
        this.waveInfoText.setText(
          `До начала волны ${this.waveManager.currentWaveIndex + 1}/40: ${timeLeft} сек`,
        );
        if (timeLeft <= 0) this.startWave();
      },
    });
    this.waveInfoText.setText(
      `До начала волны ${this.waveManager.currentWaveIndex + 1}/40: ${timeLeft} сек`,
    );
  }

  private startWave() {
    this.skipTimerBtn.setVisible(false);
    this.waveManager.startWave();
    const currentConfig = this.waveManager.currentWave;
    this.waveInfoText.setText(
      `Волна ${this.waveManager.currentWaveIndex + 1} / ${this.waveManager.totalWaves}`,
    );

    this.currentWaveVariantId = Enemy.getNextVariantForWave(
      currentConfig.enemyType,
      this.waveManager.currentWaveIndex,
    );

    this.spawnTimerEvent = this.time.addEvent({
      delay: currentConfig.spawnInterval,
      repeat: currentConfig.count - 1,
      callback: () => {
        this.enemyManager.spawnEnemy(
          currentConfig.enemyType,
          this.currentWaveVariantId,
          currentConfig.hpMultiplier * this.difficultyMultiplier,
        );
        this.waveManager.spawnedMobsCount++;
      },
    });
  }

  public skipPrepPhase() {
    if (this.waveManager.state !== "prep") return;
    if (this.waveTimerEvent) {
      this.waveTimerEvent.destroy();
      this.waveTimerEvent = null;
    }
    this.startWave();
  }

  public showHowToPlay() {
    this.howToPlayMenu.setVisible(true);
  }

  public showBugReport() {
    this.bugReportMenu.setVisible(true);
  }

  public togglePause() {
    if (this.isGameOver || this.waveManager.state === "menu") return;
    if (this.isPaused) {
      this.openMenu(null);
    } else {
      this.openMenu("pause");
    }
  }

  public restartGame() {
    this.tweens.killAll();
    this.time.removeAllEvents();

    this.isPaused = false;

    // На случай рестарта во время паузы — сбрасываем глобальные блокировки,
    // чтобы новая сессия началась с "живыми" таймерами и анимациями
    this.time.paused = false;
    this.anims.resumeAll();

    this.scene.restart();
  }

  public confirmRestart() {
    this.confirmDialog.show(
      "Начать заново?\nВесь текущий прогресс в этой игре будет потерян.",
      () => this.restartGame(),
    );
  }

  public resetProfile() {
    this.confirmDialog.show(
      "Вы уверены, что хотите сбросить прогресс\nи Никнейм?",
      () => {
        localStorage.removeItem("td_save_code");
        localStorage.removeItem("td_player_nick");
        window.location.reload();
      },
    );
  }

  public showAchievementsMenu() {
    this.achievementsMenu.show();
  }

  public updatePlayerLivesText() {
    this.playerLivesText.setText(`: ${this.playerLives}`);
  }

  public triggerGameOver(isVictory: boolean) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.waveManager.state = "menu";
    this.gameOverMenu.show(isVictory);
  }
  public drawBuildingAura(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    isSelected: boolean,
  ) {
    graphics.clear();

    const shadowColor = 0x0a0a0a;

    if (isSelected) {
      graphics.fillStyle(shadowColor, 0.4);
      graphics.fillEllipse(0, 0, width * 1, width * 0.3);

      graphics.fillStyle(shadowColor, 0.7);
      graphics.fillEllipse(0, 0, width * 0.85, width * 0.3);

      graphics.lineStyle(2, 0xffff00, 1);
      graphics.strokeEllipse(0, 0, width * 1.0, width * 0.3);
    } else {
      graphics.fillStyle(shadowColor, 0.3);
      graphics.fillEllipse(0, 0, width * 1, width * 0.3);

      graphics.fillStyle(shadowColor, 0.55);
      graphics.fillEllipse(0, 0, width * 0.75, width * 0.3);
    }
  }

  update(time: number, delta: number) {
    if (this.marketAura && this.market) {
      this.drawBuildingAura(this.marketAura, 128, this.market.isVisible());
    }
    if (this.informerAura && this.informer) {
      this.drawBuildingAura(this.informerAura, 64, this.informer.isVisible());
    }
    if (this.isPaused || this.isGameOver) return;

    const scaledDelta = delta * this.gameSpeed;
    this.gameTime += scaledDelta;

    this.enemyManager.update(this.gameTime, scaledDelta);
    this.builder.updateTowers(this.gameTime);

    if (this.waveManager.state === "wave") {
      const currentConfig = this.waveManager.currentWave;
      if (
        this.waveManager.spawnedMobsCount === currentConfig.count &&
        this.enemyManager.enemies.length === 0
      ) {
        this.handleWaveCompletion(currentConfig.postPause);
      }
    }

    if (time - this.lastUIUpdateTime > 150) {
      this.lastUIUpdateTime = time;
      this.updateSideMenuRealtime();
      this.achievements.checkPassiveConditions();
    }
  }

  private handleWaveCompletion(postPause: number) {
    this.waveManager.nextWave();

    if (!this.achievements.baseHasTakenDamage) {
      this.achievements.wavesPassedWithoutDamage++;
      if (this.achievements.wavesPassedWithoutDamage >= 15)
        this.achievements.unlock("armor_piercing");
    }
    this.achievements.baseHasTakenDamage = false;
    this.achievements.towersSoldThisWave = 0;

    const passedWave = this.waveManager.currentWaveIndex;

    this.economy.addWood(20);
    this.woodText.setText(`: ${this.economy.wood}`);

    this.economy.addGold(passedWave <= 5 ? 200 : 150);
    this.goldText.setText(`: ${this.economy.gold}`);

    if (passedWave % 5 === 0) {
      this.economy.addMedals(1);
      this.medalsText.setText(`: ${this.economy.medals}`);
  this.showNotification("Получена медаль!");
}

    if (passedWave <= 20) {
      this.inventory.addItem("ticket", 1);
      this.showNotification("Счастливый билет получен!");
    }

    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const entity = this.builder.grid[y][x];
        if (entity instanceof Crop) {
          this.inventory.addItem(entity.type, 1);
          entity.wavesAlive++;
          if (entity.wavesAlive >= 2) {
            entity.destroy();
            this.builder.grid[y][x] = null;
          }
        }
      }
    }

    this.economy.rollMarketFluctuations();
    this.updateMarketUI();

    this.time.delayedCall(500, () => this.autoShowMarketPrices());

    if (this.waveManager.isVictory()) {
      this.metaProgress.addWin(this.currentDifficultyLevel);
      this.triggerGameOver(true);
    } else {
      this.startPrepPhase(postPause);
    }
  }

  public refreshAchievementsDot() {
    this.topBar?.refreshAchievementsDot();
  }

  public updateMarketUI() {
    this.topBar?.updateMarketUI();
  }

  public closeMarketPopup() {
    this.topBar?.closeMarketPopup();
  }

  public updateSideMenuRealtime() {
    this.sidePanel?.updateRealtime();
  }

  public showInformerInfo(level: number, variant: number) {
    this.interaction.selectedInformerTower = { level, variant };
    this.interaction.deselectTower();
    this.selectedEnemy = null;
    this.radialMenu.close();
    this.closeMarketPopup();
    hideTooltip();
    this.sidePanel.showTowerFromInformer(level, variant);
  }

  public showEnemyInfo(enemy: Enemy) {
    this.selectedEnemy = enemy;
    this.openMenu("side");
    this.sidePanel.showEnemy(enemy);
  }

  private autoShowMarketPrices() {
    this.topBar?.autoShowMarketPrices();
  }

  public get achievementsMenuVisible(): boolean {
    return this.achievementsMenu?.visible ?? false;
  }

  public get profileMenuVisible(): boolean {
    return this.profileMenu?.visible ?? false;
  }

  public cycleGameSpeed() {
    const speeds = [1, 2, 3];
    const next = speeds[(speeds.indexOf(this.gameSpeed) + 1) % speeds.length];
    this.setGameSpeed(next);
  }

  public setGameSpeed(speed: number) {
    this.gameSpeed = speed;
    this.time.timeScale = speed;
    this.anims.globalTimeScale = speed;
    this.topBar?.setGameSpeed(speed);
  }

  public showNotification(message: string) {
    const notif = this.add
      .text(this.scale.width / 2, 80, message, {
        fontSize: "24px",
        color: "#ffff00",
        fontStyle: "bold",
        backgroundColor: "#000000cc",
        padding: { x: 15, y: 10 },
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setAlpha(0);

    this.activeNotifications.push(notif);

    const startY = 80;
    const stepY = 45;

    const total = this.activeNotifications.length;
    for (let i = 0; i < total; i++) {
      const currentNotif = this.activeNotifications[i];
      const offsetIndex = total - 1 - i;
      const targetY = startY + offsetIndex * stepY;

      this.tweens.add({
        targets: currentNotif,
        y: targetY,
        duration: 200,
        ease: "Power2",
      });
    }

    this.tweens.add({
      targets: notif,
      alpha: 1,
      duration: 250,
    });

    this.time.delayedCall(3000, () => {
      if (!notif.active) return;

      this.tweens.add({
        targets: notif,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          this.activeNotifications = this.activeNotifications.filter(
            (n) => n !== notif,
          );
          notif.destroy();
        },
      });
    });
  }

  private drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(0.5, 0xffffff, 0.4);

    for (let x = 0; x <= this.scale.width; x += this.CELL_SIZE) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, this.scale.height);
    }
    for (let y = 0; y <= this.scale.height; y += this.CELL_SIZE) {
      graphics.moveTo(0, y);
      graphics.lineTo(this.scale.width, y);
    }
    graphics.strokePath();
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: "#1d1d1d",
  parent: "game-container",
  scene: MainScene,
  roundPixels: true,
  antialias: true,
  antialiasGL: true,
  disableContextMenu: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1600,
    height: 896,
  },
};

document.fonts
  .load('16px "GameFont"')
  .then(() => {
    console.log("Шрифт GameFont успешно загружен!");
    new Phaser.Game(config);
  })
  .catch((err) => {
    console.error("Ошибка загрузки шрифта:", err);
    new Phaser.Game(config);
  });
