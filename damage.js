// ダメージ計算モジュール
import { GAME, WEAPON_COMPAT } from '../data/constants.js';

// 武力ダメージ基本値
export function calcBaseDamageAtk(attacker, defender) {
  const atk = attacker.getEffectiveStat('atk');
  const def = defender.getEffectiveStat('def');
  const soldierBonus = attacker.soldiers / GAME.DAMAGE_SOLDIER_DIVISOR;
  return (atk - def) * GAME.DAMAGE_STAT_COEFF + soldierBonus;
}

// 計略ダメージ基本値
export function calcBaseDamageStrat(attacker, defender) {
  const stratAtk = attacker.getEffectiveStat('strat');
  const stratDef = defender.getEffectiveStat('strat');
  const soldierBonus = attacker.soldiers / GAME.DAMAGE_SOLDIER_DIVISOR;
  return (stratAtk - stratDef) * GAME.DAMAGE_STAT_COEFF + soldierBonus;
}

// 兵科相性倍率
export function getWeaponCompatMultiplier(attackerWeapon, defenderWeapon) {
  return WEAPON_COMPAT[attackerWeapon]?.[defenderWeapon] ?? 1.0;
}

// 通常攻撃ダメージ
export function calcNormalAttackDamage(attacker, defender) {
  const baseDmg = calcBaseDamageAtk(attacker, defender);
  const weaponMult = getWeaponCompatMultiplier(attacker.weaponType, defender.weaponType);
  const moraleMult = attacker.getMoraleMultiplier();
  const aptMult = attacker.getAptitudeMultiplier();
  const raw = baseDmg * weaponMult * moraleMult * aptMult;
  return Math.max(GAME.MIN_DAMAGE, Math.floor(raw));
}

// スキルダメージ
export function calcSkillDamage(attacker, defender, effect, skillLevel) {
  const isStrat = effect.baseStat === 'strat';
  const baseDmg = isStrat
    ? calcBaseDamageStrat(attacker, defender)
    : calcBaseDamageAtk(attacker, defender);
  const power = effect.power / 100;
  const weaponMult = getWeaponCompatMultiplier(attacker.weaponType, defender.weaponType);
  const moraleMult = attacker.getMoraleMultiplier();
  const aptMult = attacker.getAptitudeMultiplier();
  const raw = baseDmg * power * weaponMult * moraleMult * aptMult;
  return Math.max(GAME.MIN_DAMAGE, Math.floor(raw));
}

// 回復量計算
export function calcHealAmount(healer, effect) {
  const stat = effect.baseStat === 'def'
    ? healer.getEffectiveStat('def')
    : healer.getEffectiveStat('strat');
  const power = effect.power / 100;
  return Math.floor(stat * power * 10); // 基本回復量（仮）
}

// 火計持続ダメージ
export function calcBurnDamage(source, target, power) {
  const strat = source ? source.getEffectiveStat('strat') : 50;
  return Math.max(GAME.MIN_DAMAGE, Math.floor(strat * (power / 100) * 2));
}
