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
import { MainMenu } from "./mainMenu";
import { PauseMenu } from "./pauseMenu";
import { HowToPlayMenu } from "./howToPlayMenu";
import { BugReportMenu } from "./bugReportMenu";
import { InteractionManager } from "./managers/interactionManager";
import { BuilderManager } from "./managers/builderManager";
import { EnemyManager } from "./managers/enemyManager";
import { Informer } from "./informer";
import { registerMobTextures } from "./enemies/mobGenerator/MobTextures";
import { RadialMenu } from "./radialMenu";
import { attachTooltip, hideTooltip } from "./tooltip";
import { TopBarUI } from "./ui/TopBarUI";
import { SidePanelUI } from "./ui/SidePanelUI";

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

  public enemyPath: { col: number; row: number }[] = [
    { col: 2.5, row: 0 },
    { col: 2.5, row: 4.5 },
    { col: 4.5, row: 4.5 },
    { col: 18.5, row: 4.5 },
    { col: 18.5, row: 0.5 },
    { col: 12.5, row: 0.5 },
    { col: 12.5, row: 12.5 },
    { col: 18.5, row: 12.5 },
    { col: 18.5, row: 8.5 },
    { col: 2.5, row: 8.5 },
    { col: 2.5, row: 12.5 },
    { col: 8.5, row: 12.5 },
    { col: 8.5, row: 8.5 },
    { col: 8.5, row: -1 },
  ];

  private blockedCells: { col: number; row: number }[] = [
    { col: 2, row: 0 },
    { col: 2, row: 1 },
    { col: 2, row: 2 },
    { col: 2, row: 3 },
    { col: 2, row: 4 },
    { col: 2, row: 5 },
    { col: 3, row: 0 },
    { col: 3, row: 1 },
    { col: 3, row: 2 },
    { col: 3, row: 3 },
    { col: 3, row: 4 },
    { col: 3, row: 5 },
    { col: 4, row: 4 },
    { col: 5, row: 4 },
    { col: 6, row: 4 },
    { col: 7, row: 4 },
    { col: 8, row: 4 },
    { col: 9, row: 4 },
    { col: 10, row: 4 },
    { col: 11, row: 4 },
    { col: 12, row: 4 },
    { col: 13, row: 4 },
    { col: 14, row: 4 },
    { col: 15, row: 4 },
    { col: 16, row: 4 },
    { col: 17, row: 4 },
    { col: 18, row: 4 },
    { col: 19, row: 4 },
    { col: 4, row: 5 },
    { col: 5, row: 5 },
    { col: 6, row: 5 },
    { col: 7, row: 5 },
    { col: 8, row: 5 },
    { col: 9, row: 5 },
    { col: 10, row: 5 },
    { col: 11, row: 5 },
    { col: 12, row: 5 },
    { col: 13, row: 5 },
    { col: 14, row: 5 },
    { col: 15, row: 5 },
    { col: 16, row: 5 },
    { col: 17, row: 5 },
    { col: 18, row: 5 },
    { col: 18, row: 2 },
    { col: 18, row: 3 },
    { col: 19, row: 5 },
    { col: 19, row: 3 },
    { col: 19, row: 2 },
    { col: 19, row: 1 },
    { col: 19, row: 0 },
    { col: 18, row: 0 },
    { col: 17, row: 0 },
    { col: 16, row: 0 },
    { col: 15, row: 0 },
    { col: 14, row: 0 },
    { col: 13, row: 0 },
    { col: 12, row: 0 },
    { col: 19, row: 1 },
    { col: 18, row: 1 },
    { col: 17, row: 1 },
    { col: 16, row: 1 },
    { col: 15, row: 1 },
    { col: 14, row: 1 },
    { col: 13, row: 1 },
    { col: 12, row: 1 },
    { col: 12, row: 2 },
    { col: 12, row: 3 },
    { col: 13, row: 2 },
    { col: 13, row: 3 },
    { col: 12, row: 6 },
    { col: 12, row: 7 },
    { col: 12, row: 8 },
    { col: 12, row: 9 },
    { col: 12, row: 10 },
    { col: 12, row: 11 },
    { col: 12, row: 12 },
    { col: 12, row: 13 },
    { col: 13, row: 6 },
    { col: 13, row: 7 },
    { col: 13, row: 8 },
    { col: 13, row: 9 },
    { col: 13, row: 10 },
    { col: 13, row: 11 },
    { col: 13, row: 12 },
    { col: 13, row: 13 },
    { col: 14, row: 13 },
    { col: 15, row: 13 },
    { col: 16, row: 13 },
    { col: 17, row: 13 },
    { col: 18, row: 13 },
    { col: 19, row: 13 },
    { col: 14, row: 12 },
    { col: 15, row: 12 },
    { col: 16, row: 12 },
    { col: 17, row: 12 },
    { col: 18, row: 12 },
    { col: 19, row: 12 },
    { col: 18, row: 11 },
    { col: 19, row: 11 },
    { col: 18, row: 10 },
    { col: 19, row: 10 },
    { col: 18, row: 9 },
    { col: 19, row: 9 },
    { col: 18, row: 8 },
    { col: 19, row: 8 },
    { col: 17, row: 8 },
    { col: 16, row: 8 },
    { col: 15, row: 8 },
    { col: 14, row: 8 },
    { col: 13, row: 8 },
    { col: 12, row: 8 },
    { col: 11, row: 8 },
    { col: 10, row: 8 },
    { col: 9, row: 8 },
    { col: 8, row: 8 },
    { col: 7, row: 8 },
    { col: 6, row: 8 },
    { col: 5, row: 8 },
    { col: 4, row: 8 },
    { col: 3, row: 8 },
    { col: 2, row: 8 },
    { col: 17, row: 9 },
    { col: 16, row: 9 },
    { col: 15, row: 9 },
    { col: 14, row: 9 },
    { col: 13, row: 9 },
    { col: 12, row: 9 },
    { col: 11, row: 9 },
    { col: 10, row: 9 },
    { col: 9, row: 9 },
    { col: 8, row: 9 },
    { col: 7, row: 9 },
    { col: 6, row: 9 },
    { col: 5, row: 9 },
    { col: 4, row: 9 },
    { col: 3, row: 9 },
    { col: 2, row: 9 },
    { col: 2, row: 10 },
    { col: 2, row: 11 },
    { col: 2, row: 12 },
    { col: 2, row: 13 },
    { col: 3, row: 10 },
    { col: 3, row: 11 },
    { col: 3, row: 12 },
    { col: 3, row: 13 },
    { col: 4, row: 13 },
    { col: 5, row: 13 },
    { col: 6, row: 13 },
    { col: 7, row: 13 },
    { col: 8, row: 13 },
    { col: 9, row: 13 },
    { col: 4, row: 12 },
    { col: 5, row: 12 },
    { col: 6, row: 12 },
    { col: 7, row: 12 },
    { col: 8, row: 12 },
    { col: 9, row: 12 },
    { col: 9, row: 11 },
    { col: 9, row: 10 },
    { col: 9, row: 7 },
    { col: 9, row: 6 },
    { col: 9, row: 3 },
    { col: 9, row: 2 },
    { col: 9, row: 1 },
    { col: 9, row: 0 },
    { col: 8, row: 11 },
    { col: 8, row: 10 },
    { col: 8, row: 7 },
    { col: 8, row: 6 },
    { col: 8, row: 3 },
    { col: 8, row: 2 },
    { col: 8, row: 1 },
    { col: 8, row: 0 },
    { col: 22, row: 8 },
    { col: 22, row: 9 },
    { col: 22, row: 10 },
    { col: 22, row: 11 },
    { col: 22, row: 12 },
    { col: 22, row: 13 },
    { col: 23, row: 8 },
    { col: 23, row: 9 },
    { col: 23, row: 10 },
    { col: 23, row: 11 },
    { col: 23, row: 12 },
    { col: 23, row: 13 },
    { col: 24, row: 8 },
    { col: 24, row: 9 },
    { col: 24, row: 10 },
    { col: 24, row: 11 },
    { col: 24, row: 12 },
    { col: 22, row: 6 },
    { col: 23, row: 6 },
    { col: 24, row: 6 },
    { col: 22, row: 7 },
    { col: 23, row: 7 },
    { col: 24, row: 7 },
    { col: 24, row: 13 },
    { col: 23, row: 2 },
  ];

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

  private gameOverMenuContainer!: Phaser.GameObjects.Container;

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

  private profileMenuContainer!: Phaser.GameObjects.Container;
  private profileStatsText!: Phaser.GameObjects.Text;

  private achievementsMenuContainer!: Phaser.GameObjects.Container;
  private activeNotifications: Phaser.GameObjects.Text[] = [];
  public informer!: Informer;
  public informerAura!: Phaser.GameObjects.Graphics;

  // UI сохранения/загрузки
  private inputMenuContainer!: Phaser.GameObjects.Container;
  private inputMenuTitle!: Phaser.GameObjects.Text;
  private inputTextDisplay!: Phaser.GameObjects.Text;
  private btnConfirmInput!: Phaser.GameObjects.Container;
  private btnCancelInput!: Phaser.GameObjects.Container;
  public isTyping: boolean = false;
  private isSelectedAll: boolean = false;
  private currentInputText: string = "";
  private maxInputLength: number = 16;
  private onInputConfirm: ((text: string) => void) | null = null;

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
    // Если выходим из паузы — размораживаем.
    if (this.isPaused && name !== "pause") {
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
    if (name !== "profile") this.profileMenuContainer.setVisible(false);
    if (name !== "achievements")
      this.achievementsMenuContainer.setVisible(false);
    if (name !== "pause") this.pauseMenu.setVisible(false);
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
        this.showProfileMenu();
        this.profileMenuContainer.setVisible(true);
        break;
      case "achievements":
        this.showAchievementsMenu();
        break;
      case "howToPlay":
        this.howToPlayMenu.setVisible(true);
        break;
      case "bugReport":
        this.bugReportMenu.setVisible(true);
        break;
    }
  }

  private anyMenuOpen(): boolean {
    return (
      this.inventory.isVisible ||
      this.market.isVisible() ||
      this.informer.isVisible() ||
      this.luckyTicket.isVisible() ||
      this.howToPlayMenu.isVisible ||
      this.bugReportMenu.isVisible ||
      this.profileMenuContainer.visible ||
      this.achievementsMenuContainer.visible ||
      this.sideMenuContainer.visible ||
      this.radialMenu.isOpen ||
      this.marketPopupContainer.visible
    );
  }

  // ИСПРАВЛЕНО: единый обработчик paste, регистрируется один раз
  private handlePasteEvent = (event: ClipboardEvent) => {
    if (!this.isTyping) return;
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

  private canUseHotkeys(): boolean {
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

    // --- ГОРЯЧИЕ КЛАВИШИ ---
    this.input.keyboard?.on("keydown-ONE", () => {
      if (!this.canUseHotkeys()) return;
      if (this.inventory && this.inventory.isSellMenuVisible()) {
        this.inventory.handleKeyOne();
        return;
      }
      if (!this.radialMenu.isOpen) return;
      const c = this.interaction.activeCellCoords;
      if (!c) return;
      if (this.radialMenu.mode === "build") {
        this.builder.buyTower(c.col, c.row, 1, this.economy.COST_CHEAP);
      } else {
        this.builder.buyCrop(c.col, c.row, "potato");
      }
    });

    this.input.keyboard?.on("keydown-TWO", () => {
      if (!this.canUseHotkeys()) return;
      if (this.inventory && this.inventory.isSellMenuVisible()) {
        this.inventory.handleKeyTwo();
        return;
      }
      if (!this.radialMenu.isOpen) return;
      const c = this.interaction.activeCellCoords;
      if (!c) return;
      if (this.radialMenu.mode === "build") {
        this.builder.buyTower(c.col, c.row, 4, this.economy.COST_EXP);
      } else {
        this.builder.buyCrop(c.col, c.row, "onion");
      }
    });

    this.input.keyboard?.on("keydown-THREE", () => {
      if (!this.canUseHotkeys()) return;
      if (!this.radialMenu.isOpen) return;
      const c = this.interaction.activeCellCoords;
      if (!c) return;
      if (this.radialMenu.mode === "build") {
        this.radialMenu.switchMode("crop");
      } else {
        this.builder.buyCrop(c.col, c.row, "pineapple");
      }
    });

    this.input.keyboard?.on("keydown-B", () => {
      if (!this.canUseHotkeys()) return;
      if (this.inventory.isVisible) {
        this.openMenu(null);
      } else {
        this.openMenu("inventory");
      }
    });
    this.input.keyboard?.on("keydown-S", () => {
      if (!this.canUseHotkeys()) return;
      if (this.interaction.selectedCoords)
        this.builder.sellTower(
          this.interaction.selectedCoords.col,
          this.interaction.selectedCoords.row,
        );
    });
    this.input.keyboard?.on("keydown-R", () => {
      if (!this.canUseHotkeys()) return;
      if (
        this.sideMenuContainer.visible &&
        this.btnReroll &&
        this.btnReroll.visible &&
        this.interaction.selectedCoords
      ) {
        this.builder.rerollTower(
          this.interaction.selectedCoords.col,
          this.interaction.selectedCoords.row,
        );
      }
    });
    this.input.keyboard?.on("keydown-I", () => {
      if (!this.canUseHotkeys()) return;
      if (this.profileMenuContainer.visible) {
        this.openMenu(null);
      } else {
        this.openMenu("profile");
      }
    });
    this.input.keyboard?.on("keydown-Q", () => {
      if (!this.canUseHotkeys()) return;
      this.interaction.cycleTargetMode();
    });
    this.input.keyboard?.on("keydown-W", () => {
      if (!this.canUseHotkeys()) return;
      this.interaction.doRandomMerge();
    });
    this.input.keyboard?.on("keydown-E", () => {
      if (!this.canUseHotkeys()) return;
      this.interaction.startTargetedMerge();
    });
    this.input.keyboard?.on("keydown-SPACE", () => {
      if (!this.canUseHotkeys()) return;
      this.skipPrepPhase();
    });
    this.input.keyboard?.on("keydown-F", () => {
      if (!this.canUseHotkeys()) return;
      this.cycleGameSpeed();
    });
    this.input.keyboard?.on("keydown-T", () => {
  if (!this.canUseHotkeys()) return;
  this.topBar?.toggleBurgerPopup();
});
    this.input.keyboard?.on("keydown-J", () => {
      if (!this.canUseHotkeys()) return;
      if (this.achievementsMenuContainer.visible) {
        this.openMenu(null);
      } else {
        this.openMenu("achievements");
      }
    });

    this.input.keyboard?.on("keydown-ESC", () => {
      hideTooltip();
      if (this.isTyping) return;

      if (this.waveManager.state === "menu" || this.isGameOver) {
        if (
          this.waveManager.state === "menu" &&
          this.mainMenu &&
          this.mainMenu.isDifficultyOpen
        ) {
          this.mainMenu.closeDifficultyMenu();
        }
        return;
      }

      // Радиальное меню в режиме овощей — ESC возвращает в постройку, а не закрывает.
      if (this.radialMenu.isOpen && this.radialMenu.mode === "crop") {
        this.radialMenu.switchMode("build");
        return;
      }

      if (
        this.interaction.selectedInformerTower &&
        this.sideMenuContainer.visible
      ) {
        this.sidePanel.close();
        return;
      }

      if (this.anyMenuOpen()) {
        this.openMenu(null);
        return;
      }

      if (this.interaction.isWaitingForMergeTarget) {
        this.interaction.isWaitingForMergeTarget = false;
        this.showNotification("Слияние отменено");
        return;
      }

      if (this.interaction.selectedCoords) {
        this.interaction.deselectTower();
        return;
      }

      this.togglePause();
    });

    this.input.keyboard?.on("keydown", (event: KeyboardEvent) => {
      if (!this.isTyping) return;
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
        this.confirmInput();
      } else if (event.key === "Escape" && this.btnCancelInput.visible) {
        this.cancelInput();
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
    });

    window.addEventListener("paste", this.handlePasteEvent);
    this.events.once("shutdown", () => {
      window.removeEventListener("paste", this.handlePasteEvent);
    });

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
    this.mainMenu = new MainMenu(this);
    this.market = new Market(this);
    this.luckyTicket = new LuckyTicket(this);
    this.pauseMenu = new PauseMenu(this);
    this.createProfileMenu();
    this.howToPlayMenu = new HowToPlayMenu(this);
    this.bugReportMenu = new BugReportMenu(this);
    this.createInputMenu();
    this.createAchievementsMenu();

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
  }

  private createCurvedTitle(
    x: number,
    y: number,
    text: string,
    radius: number = 2400,
    angleSpread: number = 0.14,
    isRainbow: boolean = true,
    fontSize: string = "36px",
    textColor: string = "#ffffff",
    strokeColor: string = "#000000",
    strokeThickness: number = 6,
  ) {
    const container = this.add.container(x, y);
    const chars = text.split("");

    const startAngle = -angleSpread / 2;
    const angleStep = angleSpread / Math.max(1, chars.length - 1);

    for (let i = 0; i < chars.length; i++) {
      const angle = startAngle + i * angleStep;

      const charX = Math.sin(angle) * radius;
      let charY = Math.cos(angle) * radius - radius;

      if (isRainbow) {
        charY = -charY;
      }

      const finalThickness =
        strokeThickness > 0 ? strokeThickness : parseInt(fontSize) > 40 ? 6 : 4;

      const letter = this.add
        .text(charX, charY, chars[i], {
          fontSize: fontSize,
          color: textColor,
          fontStyle: "bold",
          stroke: strokeColor,
          strokeThickness: finalThickness,
        })
        .setOrigin(0.5);

      letter.setRotation(isRainbow ? angle : -angle);

      container.add(letter);
    }

    return container;
  }

  public isPath(col: number, row: number): boolean {
    const onPath = this.enemyPath.some((p) => p.col === col && p.row === row);
    const isBlocked = this.blockedCells.some(
      (p) => p.col === col && p.row === row,
    );
    return onPath || isBlocked;
  }

  private createInputMenu() {
    this.inputMenuContainer = this.add
      .container(0, 0)
      .setDepth(600)
      .setVisible(false);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const blocker = this.add
      .zone(centerX, centerY, this.scale.width, this.scale.height)
      .setInteractive()
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
        },
      );

    const panelCorner = 30;
    const panel = this.add.nineslice(
      centerX,
      centerY,
      "ui",
      "panel_brown.png",
      620,
      320,
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );

    this.inputMenuTitle = this.add
      .text(centerX, centerY - 100, "Ввод", {
        fontSize: "24px",
        color: "#ffea88",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const tipSize = 32;

    const inputBox = this.add.nineslice(
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

    this.inputTextDisplay = this.add
      .text(centerX, centerY - 10, "_", {
        fontSize: "28px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    const makeMenuBtn = (
      x: number,
      y: number,
      frame: string,
      text: string,
      textColor: string,
      onClick: () => void,
    ) => {
      const btnCorner = 25;
      const img = this.add.nineslice(
        0,
        0,
        "ui",
        frame,
        190,
        52,
        btnCorner,
        btnCorner,
        btnCorner,
        btnCorner,
      );
      const label = this.add
        .text(0, 0, text, {
          fontSize: "20px",
          color: textColor,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      const btn = this.add.container(x, y, [img, label]);

      img
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            lx: number,
            ly: number,
            event: Phaser.Types.Input.EventData,
          ) => {
            event.stopPropagation();
            this.tweens.add({
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

    this.btnConfirmInput = makeMenuBtn(
      centerX - 110,
      centerY + 85,
      "button_brown.png",
      "Принять",
      "#aaffaa",
      () => this.confirmInput(),
    );
    this.btnCancelInput = makeMenuBtn(
      centerX + 110,
      centerY + 85,
      "button_red.png",
      "Отмена",
      "#ffffff",
      () => this.cancelInput(),
    );

    this.inputMenuContainer.add([
      blocker,
      panel,
      inputBox,
      this.inputMenuTitle,
      this.inputTextDisplay,
      this.btnConfirmInput,
      this.btnCancelInput,
    ]);
  }

  public showInputMenu(
    title: string,
    maxLength: number,
    onConfirm: (text: string) => void,
    allowCancel: boolean,
  ) {
    this.isTyping = true;
    this.currentInputText = "";
    this.maxInputLength = maxLength;
    this.onInputConfirm = onConfirm;

    this.isSelectedAll = false;
    this.inputTextDisplay.setBackgroundColor("transparent");
    this.inputMenuTitle.setText(title);
    this.inputTextDisplay.setText("_");

    this.btnCancelInput.setVisible(allowCancel);
    if (allowCancel) {
      this.btnConfirmInput.setX(this.scale.width / 2 - 100);
    } else {
      this.btnConfirmInput.setX(this.scale.width / 2);
    }

    this.inputMenuContainer.setVisible(true);
  }

  private confirmInput() {
    if (!this.isTyping) return;
    this.isTyping = false;
    this.inputMenuContainer.setVisible(false);
    if (this.onInputConfirm) {
      this.onInputConfirm(this.currentInputText);
    }
  }

  private cancelInput() {
    if (!this.isTyping) return;
    this.isTyping = false;
    this.inputMenuContainer.setVisible(false);
  }

  private createAchievementsMenu() {
    this.achievementsMenuContainer = this.add
      .container(0, 0)
      .setDepth(600)
      .setVisible(false);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const blocker = this.add
      .zone(centerX, centerY, this.scale.width, this.scale.height)
      .setInteractive()
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
        },
      );

    const panelWidth = 1250;
    const panelHeight = 740;
    const panelCorner = 30;

    const panel = this.add.nineslice(
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

    const banner = this.add.image(
      centerX,
      centerY - panelHeight / 2 + 12,
      "ui",
      "banner_classic_curtain.png",
    );
    banner.setScale(1.5, 1.2);

    const title = this.createCurvedTitle(
      centerX,
      centerY - panelHeight / 2 + 4,
      "Достижения",
      3800,
      0.06,
      false,
      "30px",
    );

    const btnCorner = 25;
    const btnImg = this.add.nineslice(
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
    const btnLabel = this.add
      .text(0, 0, "✖ ЗАКРЫТЬ", {
        fontSize: "22px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    const btnClose = this.add.container(centerX, centerY + 310, [
      btnImg,
      btnLabel,
    ]);

    btnImg
      .setInteractive({ useHandCursor: true })
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
          this.tweens.add({
            targets: btnClose,
            scale: 0.9,
            duration: 60,
            yoyo: true,
            onComplete: () => this.achievementsMenuContainer.setVisible(false),
          });
        },
      )
      .on("pointerover", () => btnImg.setTint(0xcccccc))
      .on("pointerout", () => btnImg.clearTint());

    this.achievementsMenuContainer.add([
      blocker,
      panel,
      banner,
      title,
      btnClose,
    ]);
  }

  public showAchievementsMenu() {
    while (this.achievementsMenuContainer.length > 5) {
      const child = this.achievementsMenuContainer.last;
      if (child) child.destroy();
    }

    const startXLeft = this.scale.width / 2 - 550;
    const startXRight = this.scale.width / 2;
    const startY = this.scale.height / 2 - 270;

    this.achievements.list.forEach((ach, index) => {
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

      const achNameText = this.add
        .text(x, y, `${statusIcon} ${ach.name}${rewardStr}`, {
          fontSize: "20px",
          color: nameColor,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0, 0);

      const achDescText = this.add
        .text(x + 35, y + 24, desc, {
          fontSize: "14px",
          color: "#bbaaaa",
          fontStyle: "italic",
        })
        .setOrigin(0, 0);

      this.achievementsMenuContainer.add([achNameText, achDescText]);
    });

    this.achievements.markAllSeen();
    this.refreshAchievementsDot();

    this.achievementsMenuContainer.setVisible(true);
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
          `До начала волны ${this.waveManager.currentWaveIndex + 1}: ${timeLeft} сек`,
        );
        if (timeLeft <= 0) this.startWave();
      },
    });
    this.waveInfoText.setText(
      `До начала волны ${this.waveManager.currentWaveIndex + 1}: ${timeLeft} сек`,
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

  private skipPrepPhase() {
    if (this.waveManager.state !== "prep") return;
    if (this.waveTimerEvent) {
      this.waveTimerEvent.destroy();
      this.waveTimerEvent = null;
    }
    this.startWave();
  }

  private createProfileMenu() {
    this.profileMenuContainer = this.add
      .container(0, 0)
      .setDepth(600)
      .setVisible(false);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const blocker = this.add
      .zone(centerX, centerY, this.scale.width, this.scale.height)
      .setInteractive()
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
        },
      );

    const panelWidth = 560;
    const panelHeight = 480;
    const panelCorner = 30;

    const panel = this.add.nineslice(
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

    const banner = this.add.image(
      centerX,
      centerY - panelHeight / 2 + 15,
      "ui",
      "banner_classic_curtain.png",
    );
    banner.setScale(1.15);

    const title = this.createCurvedTitle(
      centerX,
      centerY - panelHeight / 2 + 8,
      "Профиль",
      3000,
      0.045,
      false,
      "32px",
    );

    this.profileStatsText = this.add
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
      const btnCorner = 25;
      const img = this.add.nineslice(
        0,
        0,
        "ui",
        frame,
        220,
        56,
        btnCorner,
        btnCorner,
        btnCorner,
        btnCorner,
      );
      const label = this.add
        .text(0, 0, text, {
          fontSize: "20px",
          color: textColor,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      const btn = this.add.container(x, y, [img, label]);

      img
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            lx: number,
            ly: number,
            event: Phaser.Types.Input.EventData,
          ) => {
            event.stopPropagation();
            this.tweens.add({
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
      "button_red.png",
      "Сбросить",
      "#ffffff",
      () => this.resetProfile(),
    );

    const btnClose = makeBtn(
      centerX + 120,
      centerY + 160,
      "button_brown.png",
      "Закрыть",
      "#ffffff",
      () => {
        this.openMenu(null);
      },
    );

    this.profileMenuContainer.add([
      blocker,
      panel,
      banner,
      title,
      this.profileStatsText,
      btnReset,
      btnClose,
    ]);
  }

  public showProfileMenu() {
    if (this.isGameOver || this.waveManager.state === "menu") return;

    const titleId = this.metaProgress.currentTitleId;
    const titleObj = TITLES.find((t) => t.id === titleId);
    const titleName = titleObj ? titleObj.name : "Отсутствует";
    const buffPct = titleId;
    const nextTitleInfo = this.metaProgress.getNextTitleInfo();

    this.profileStatsText.setText(
      `Игрок: ${SaveSystem.nickname}\n\n` +
        `Текущий титул: ${titleName}\n` +
        `Атака: +${buffPct}% | Замедление: -${buffPct}%\n` +
        `---------------------------------\n` +
        `${nextTitleInfo}`,
    );

    // НЕ трогаем видимость — этим занимается openMenu.
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

  public resetProfile() {
    if (
      window.confirm(
        "Вы уверены, что хотите сбросить прогресс и Никнейм? Это безвозвратно удалит автосохранение!",
      )
    ) {
      localStorage.removeItem("td_save_code");
      localStorage.removeItem("td_player_nick");
      window.location.reload();
    }
  }

  private downloadSaveFile() {
    if (!this.metaProgress) return;
    const reportContent = this.metaProgress.generateSaveReport();
    const blob = new Blob([reportContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = window.URL.createObjectURL(blob);

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const timestamp = `[${year}-${month}-${day}_${hours}-${minutes}-${seconds}]`;

    const a = document.createElement("a");
    a.href = url;
    a.download = `TDSave_${SaveSystem.nickname}_${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.showNotification("💾 Файл успешно сохранен!");
  }

  private showGameOverMenu(isVictory: boolean) {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.waveManager.state = "menu";

    // if (this.waveTimerEvent) this.waveTimerEvent.paused = true;
    // if (this.spawnTimerEvent) this.spawnTimerEvent.paused = true;

    this.gameOverMenuContainer = this.add.container(0, 0).setDepth(650);

    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    const clickBlocker = this.add
      .zone(centerX, centerY, this.scale.width, this.scale.height)
      .setInteractive()
      .on(
        "pointerdown",
        (
          pointer: Phaser.Input.Pointer,
          lx: number,
          ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
        },
      );

    const panelWidth = 530;
    const panelHeight = isVictory ? 530 : 380;
    const panelCorner = 30;
    const panelTexture = isVictory
      ? "panel_brown.png"
      : "panel_brown_damaged.png";
    const panel = this.add.nineslice(
      centerX,
      centerY,
      "ui",
      panelTexture,
      panelWidth,
      panelHeight,
      panelCorner,
      panelCorner,
      panelCorner,
      panelCorner,
    );

    const banner = this.add.image(
      centerX,
      centerY - panelHeight / 2 + 15,
      "ui",
      "banner_classic_curtain.png",
    );
    banner.setScale(1.15);

    const titleText = isVictory ? "Победа!" : "  Поражение...";
    const spread = isVictory ? 0.06 : 0.12;

    const title = this.createCurvedTitle(
      centerX,
      centerY - panelHeight / 2 + 8,
      titleText,
      2400,
      spread,
      false,
      "36px",
      "#ffffff",
      "#000000",
      6,
    );

    const makeBtn = (
      x: number,
      y: number,
      frame: string,
      text: string,
      textColor: string,
      onClick: () => void,
    ) => {
      const btnCorner = 25;
      const img = this.add.nineslice(
        0,
        0,
        "ui",
        frame,
        320,
        56,
        btnCorner,
        btnCorner,
        btnCorner,
        btnCorner,
      );
      const label = this.add
        .text(0, 0, text, {
          fontSize: "22px",
          color: textColor,
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5);

      const btn = this.add.container(x, y, [img, label]);

      img
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            lx: number,
            ly: number,
            event: Phaser.Types.Input.EventData,
          ) => {
            event.stopPropagation();
            this.tweens.add({
              targets: btn,
              scale: 0.92,
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

    this.gameOverMenuContainer.add([clickBlocker, panel, banner, title]);

    if (isVictory) {
      const saveCode = localStorage.getItem("td_save_code") || "ОШИБКА";

      const tipSize = 32;
      const codeBox = this.add.nineslice(
        centerX,
        centerY - 65,
        "ui",
        "hexagon_damaged_brown_dark.png",
        52,
        420,
        0,
        0,
        tipSize,
        tipSize,
      );
      codeBox.setAngle(90);

      const codeLabel = this.add
        .text(centerX, centerY - 105, "Ваш код сохранения:", {
          fontSize: "16px",
          color: "#ffea88",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5);

      const codeText = this.add
        .text(centerX, centerY - 65, saveCode, {
          fontSize: "24px",
          color: "#00ffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => codeText.setColor("#ffff00"))
        .on("pointerout", () => codeText.setColor("#00ffff"))
        .on(
          "pointerdown",
          (
            pointer: Phaser.Input.Pointer,
            lx: number,
            ly: number,
            event: Phaser.Types.Input.EventData,
          ) => {
            event.stopPropagation();
            navigator.clipboard
              .writeText(saveCode)
              .then(() => {
                this.showNotification("📋 Код скопирован в буфер обмена!");
              })
              .catch(() => {
                this.showNotification("❌ Ошибка копирования");
              });
          },
        );

      const copyHint = this.add
        .text(centerX, centerY - 28, "(нажмите на код, чтобы скопировать)", {
          fontSize: "13px",
          color: "#252525",
          fontStyle: "italic",
        })
        .setOrigin(0.5);

      const btnSaveTxt = makeBtn(
        centerX,
        centerY + 45,
        "button_brown.png",
        "Скачать сохранение",
        "#ffffff",
        () => {
          this.downloadSaveFile();
        },
      );

      const btnRestart = makeBtn(
        centerX,
        centerY + 125,
        "button_red.png",
        "Начать заново",
        "#ffffff",
        () => {
          this.restartGame();
        },
      );

      this.gameOverMenuContainer.add([
        codeBox,
        codeLabel,
        codeText,
        copyHint,
        btnSaveTxt,
        btnRestart,
      ]);
    } else {
      const defeatSubtitle = this.add
        .text(
          centerX,
          centerY - 20,
          "Оборона пала...\nПопробуйте другую тактику!",
          {
            fontSize: "24px",
            fontStyle: "bold",
            color: "#fff5ea",
            align: "center",
            lineSpacing: 10,
            stroke: "#000000",
            strokeThickness: 5,
          },
        )
        .setOrigin(0.5);

      const btnRestart = makeBtn(
        centerX,
        centerY + 145,
        "button_red.png",
        "Начать заново",
        "#ffffff",
        () => {
          this.restartGame();
        },
      );

      this.gameOverMenuContainer.add([defeatSubtitle, btnRestart]);
    }
  }

  public updatePlayerLivesText() {
    this.playerLivesText.setText(`: ${this.playerLives}`);
  }

  public triggerGameOver(isVictory: boolean) {
    this.showGameOverMenu(isVictory);
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

    this.economy.addWood(20);
    this.woodText.setText(`: ${this.economy.wood}`);

    this.economy.addGold(150);
    this.goldText.setText(`: ${this.economy.gold}`);

    const passedWave = this.waveManager.currentWaveIndex;
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
    return this.achievementsMenuContainer?.visible ?? false;
  }

  public get profileMenuVisible(): boolean {
    return this.profileMenuContainer?.visible ?? false;
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
