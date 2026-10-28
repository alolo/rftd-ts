import * as Phaser from "phaser";
import "./style.css";
import { Enemy } from "./enemies/enemy";
import { WaveManager } from "./waves";
import { EconomyManager } from "./economy";
import { Inventory } from "./inventory";
import { Market } from "./market";
import { LuckyTicket } from "./luckyTicket";
import { MetaProgress } from "./metaProgress";
import type { Difficulty } from "./meta";
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
import type { RadialMenu } from "./ui/radialMenu";
import { hideTooltip } from "./tooltip";
import { TopBarUI } from "./ui/TopBarUI";
import { SidePanelUI } from "./ui/SidePanelUI";
import { ProfileMenuUI } from "./ui/ProfileMenuUI";
import { AchievementsMenuUI } from "./ui/AchievementsMenuUI";
import { GameOverMenuUI } from "./ui/GameOverMenuUI";
import { InputMenuUI } from "./ui/InputMenuUI";
import { ENEMY_PATH, BLOCKED_CELLS } from "./config/mapData";
import { HotkeysManager } from "./managers/hotkeysManager";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { WaveController } from "./managers/waveController";
import { MapBuildingsUI } from "./ui/MapBuildingsUI";
import { NotificationUI } from "./ui/NotificationUI";
import { registerSceneEvents } from "./managers/sceneEvents";
import { createRadialMenu } from "./managers/radialMenuSetup";
import { initializePlayer } from "./managers/playerInit";

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
  private lastUIUpdateTime: number = 0;

  // UI Элементы
  public mainMenu!: MainMenu;
  public pauseMenu!: PauseMenu;
  public howToPlayMenu!: HowToPlayMenu;
  public bugReportMenu!: BugReportMenu;

  public mapBuildings!: MapBuildingsUI;
  public notificationUI!: NotificationUI;
  private quickBuildIndicator!: Phaser.GameObjects.Text;
  public radialMenu!: RadialMenu;

  // --- НОВЫЕ UI-МЕНЕДЖЕРЫ ---
  public topBar!: TopBarUI;
  public sidePanel!: SidePanelUI;

  // Полевые объекты (не UI-панель)
  public rangeCircle!: Phaser.GameObjects.Graphics;
  public abilityRangeCircle!: Phaser.GameObjects.Graphics;

  // --- ГЕТТЕРЫ для обратной совместимости с внешними классами ---
  public get goldText() {
    return this.topBar.goldText;
  }
  public get woodText() {
    return this.topBar.woodText;
  }
  public get medalsText() {
    return this.topBar.medalsText;
  }
  public get playerLivesText() {
    return this.topBar.playerLivesText;
  }
  public get burgerBtn() {
    return this.topBar.burgerBtn;
  }
  public get marketPopupContainer() {
    return this.topBar.marketPopupContainer;
  }
  public get achievementsDot() {
    return this.topBar.achievementsDot;
  }
  public get sideMenuContainer() {
    return this.sidePanel.container;
  }
  public get towerIconGroup() {
    return this.sidePanel.towerIconGroup;
  }
  public get towerIconImage() {
    return this.sidePanel.towerIconImage;
  }
  public get towerTitleText() {
    return this.sidePanel.towerTitleText;
  }
  public get towerInfoText() {
    return this.sidePanel.towerInfoText;
  }
  public get multiSelectText() {
    return this.sidePanel.multiSelectText;
  }
  public get targetModeBtnText() {
    return this.sidePanel.targetModeBtnText;
  }
  public get btnSell() {
    return this.sidePanel.btnSell;
  }
  public get btnRandomMerge() {
    return this.sidePanel.btnRandomMerge;
  }
  public get btnTargetMerge() {
    return this.sidePanel.btnTargetMerge;
  }
  public get btnReroll() {
    return this.sidePanel.btnReroll;
  }
  public get abilityIcon() {
    return this.sidePanel.abilityIcon;
  }

  public gameSpeed: number = 1;
  private gameTime: number = 0;
  public speedBtn!: Phaser.GameObjects.Container;

  public difficultyMultiplier: number = 1.0;
  public currentDifficultyLevel: Difficulty = "easy";

  public profileMenu!: ProfileMenuUI;
  public achievementsMenu!: AchievementsMenuUI;
  public gameOverMenu!: GameOverMenuUI;

  public informer!: Informer;
  public inputMenu!: InputMenuUI;
  public confirmDialog!: ConfirmDialog;
  public waveController!: WaveController;
  public pathMaskSource!: Phaser.GameObjects.Graphics;
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
    if (name !== "pause" && !isPausePreserved) this.pauseMenu.setVisible(false);
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
    (window as any).mainScene = this; // чит для консоли на башни
    registerMobTextures(this);
    this.add.image(0, 0, "map_bg").setOrigin(0, 0);
    this.drawGrid();

    // Маска пути: объединение всех клеток дороги.
    // Используется для обрезки визуала зон урона (см. EnemyManager.createGroundZone).
    const maskShape = this.make.graphics({ x: 0, y: 0 });
    maskShape.fillStyle(0xffffff, 1);
    for (const cell of BLOCKED_CELLS) {
      maskShape.fillRect(
        cell.col * this.CELL_SIZE,
        cell.row * this.CELL_SIZE,
        this.CELL_SIZE,
        this.CELL_SIZE,
      );
    }
    this.pathMaskSource = maskShape; // это Graphics, который будет источником для Mask Filter

    this.rangeCircle = this.add.graphics().setDepth(4).setVisible(false);
    this.abilityRangeCircle = this.add.graphics().setDepth(4).setVisible(false);

    this.cols = Math.floor(this.scale.width / this.CELL_SIZE);
    this.rows = Math.floor(this.scale.height / this.CELL_SIZE);

    this.builder = new BuilderManager(this);
    this.enemyManager = new EnemyManager(this);

    // --- СОЗДАНИЕ UI И СИСТЕМ ---

    this.waveController = new WaveController(this);
    this.waveController.create();

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

    this.quickBuildIndicator = this.add
      .text(this.scale.width / 2, this.scale.height - 20, "", {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        backgroundColor: "#000000cc",
        padding: { x: 14, y: 8 },
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(1001)
      .setVisible(false);

    this.mapBuildings = new MapBuildingsUI(this);
    this.mapBuildings.create();
    this.notificationUI = new NotificationUI(this);
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

    this.informer = new Informer(this);

    initializePlayer(this);

    this.radialMenu = createRadialMenu(this);
    registerSceneEvents(this);
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
    this.waveController.startPrepPhase(this.waveManager.currentWave.prepTime);

    this.updateMarketUI();
    this.setGameSpeed(1);

    this.time.delayedCall(500, () => this.autoShowMarketPrices());
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
    this.interaction?.deactivateQuickBuild();
    this.gameOverMenu.show(isVictory);
  }

  update(time: number, delta: number) {
    this.mapBuildings?.update();
    if (this.isPaused || this.isGameOver) return;

    const scaledDelta = delta * this.gameSpeed;
    this.gameTime += scaledDelta;

    this.enemyManager.update(this.gameTime, scaledDelta);
    this.builder.updateTowers(this.gameTime);

    this.waveController.update();

    if (time - this.lastUIUpdateTime > 150) {
      this.lastUIUpdateTime = time;
      this.updateSideMenuRealtime();
      this.achievements.checkPassiveConditions();
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

  public autoShowMarketPrices() {
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
    this.notificationUI.show(message);
  }

  public showAchievementNotification(name: string) {
    this.notificationUI.showAchievement(name);
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

  public showQuickBuildIndicator(label: string) {
    this.quickBuildIndicator?.setText(
      `Быстрое строительство: ${label} | Отпустите Shift или нажмите ESC`,
    );
    this.quickBuildIndicator?.setVisible(true);
  }

  public hideQuickBuildIndicator() {
    this.quickBuildIndicator?.setVisible(false);
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
