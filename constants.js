// ゲームシステム定数
export const GAME = {
  MAX_TURNS: 8,
  MAX_COST: 20,
  DEFAULT_COST_LIMIT: 15,
  MAX_SUB_GENERALS: 2,
  DEFAULT_SOLDIERS: 10000,
  DEFAULT_MORALE: 100,
  MIN_DAMAGE: 1,
  DAMAGE_STAT_COEFF: 1.67,
  DAMAGE_SOLDIER_DIVISOR: 20,
};

// 兵科定義
export const WEAPON_TYPES = {
  cavalry:  { id: 'cavalry',  name: '騎兵', icon: '🐴' },
  shield:   { id: 'shield',   name: '盾兵', icon: '🛡' },
  archer:   { id: 'archer',   name: '弓兵', icon: '🏹' },
  spear:    { id: 'spear',    name: '槍兵', icon: '🔱' },
  siege:    { id: 'siege',    name: '兵器', icon: '⚙' },
};

// 兵科相性表 (attacker -> defender -> multiplier)
// 有利: 1.15, 不利: 0.85, 等倍: 1.00
export const WEAPON_COMPAT = {
  cavalry: { cavalry: 1.00, shield: 0.85, archer: 1.15, spear: 0.85, siege: 1.15 },
  shield:  { cavalry: 1.15, shield: 1.00, archer: 0.85, spear: 1.15, siege: 0.85 },
  archer:  { cavalry: 0.85, shield: 1.15, archer: 1.00, spear: 0.85, siege: 1.15 },
  spear:   { cavalry: 1.15, shield: 0.85, archer: 1.15, spear: 1.00, siege: 0.85 },
  siege:   { cavalry: 0.85, shield: 1.15, archer: 0.85, spear: 1.15, siege: 1.00 },
};

// 適性補正
export const APTITUDE_MULT = {
  S: 1.20,
  A: 1.00,
  B: 0.85,
  C: 0.70,
};

// 負傷兵システム
export const WOUNDED = {
  DAMAGE_TO_WOUNDED_RATE: 0.90,
  DAMAGE_TO_DEAD_RATE: 0.10,
  TURN_END_DEATH_RATE: 0.10,
  BATTLE_END_DEATH_RATE: 0.30,
};

// 士気計算
export function calcMoraleMultiplier(morale) {
  return 1.0 - (100 - morale) * 0.007;
}

// スキルレベル倍率（Lv1=50%, Lv10=100%）
export function calcSkillLevelMultiplier(level) {
  // Lv1: 0.5, Lv10: 1.0 — 線形補間
  return 0.5 + (level - 1) * (0.5 / 9);
}

// 陣営
export const FACTIONS = {
  wei: { id: 'wei', name: '魏', color: '#4a90d9' },
  wu:  { id: 'wu',  name: '呉', color: '#d94a4a' },
  shu: { id: 'shu', name: '蜀', color: '#4ad94a' },
  other: { id: 'other', name: '他', color: '#a0a0a0' },
};

// レアリティ
export const RARITIES = {
  5: { stars: 5, label: '★5', color: '#f0c040' },
  4: { stars: 4, label: '★4', color: '#c080f0' },
  3: { stars: 3, label: '★3', color: '#60b0f0' },
};

// タイプ
export const GENERAL_TYPES = {
  attack:  { id: 'attack',  name: '武力型' },
  strategy:{ id: 'strategy',name: '計略型' },
  balance: { id: 'balance', name: 'バランス型' },
  defense: { id: 'defense', name: '防御型' },
  support: { id: 'support', name: '補助型' },
  speed:   { id: 'speed',   name: '速度型' },
};
