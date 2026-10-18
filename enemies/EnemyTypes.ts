export type EnemyType = "normal" | "runner" | "tank" | "immune" | "boss";

export interface EnemyStats {
  name: string;
  archetype: EnemyType;
  baseHp: number;
  speed: number;
  color: number;
  radius: number;
  immuneToSlow?: boolean;

  /** ID моба из пиксельной студии (1..10). Обязателен. */
  studioMobId: number;

  /** Скорость анимации ходьбы (кадров/сек). По умолчанию — 8. */
  frameRate?: number;

  /** Тир, к которому относится моб: 1..4. По умолчанию — 1. */
  tier?: number;
}

export interface EnemyVariantConfig {
  [variantId: number]: EnemyStats;
}

export interface EnemyConfig {
  variants: EnemyVariantConfig;
}
