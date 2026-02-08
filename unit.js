// 部隊・武将ユニットクラス
import { GAME, APTITUDE_MULT, calcMoraleMultiplier, calcSkillLevelMultiplier } from '../data/constants.js';
import { SKILLS_BY_ID } from '../data/skills.js';

export class Unit {
  constructor({ general, position, armyId, weaponType, morale, soldiers, skillIds, skillLevels, level, awakening, bonusPoints, facilityLevel, weaponFacilityLevel }) {
    this.general = general;
    this.position = position; // 'main' | 'sub1' | 'sub2'
    this.armyId = armyId; // 'army1' | 'army2'
    this.weaponType = weaponType; // 部隊単位
    this.morale = morale || GAME.DEFAULT_MORALE;

    // レベル・覚醒
    this.level = level || 50;
    this.awakening = awakening || 5;
    this.bonusPoints = bonusPoints || {}; // { atk: 0, def: 0, strat: 0, spd: 0 }
    this.facilityLevel = facilityLevel || 0; // 能力施設レベル
    this.weaponFacilityLevel = weaponFacilityLevel || 0;

    // 兵士データ
    this.soldiers = soldiers || GAME.DEFAULT_SOLDIERS;
    this.maxSoldiers = this.soldiers;
    this.wounded = 0;
    this.dead = 0;

    // スキル
    this.skills = (skillIds || []).map((id, i) => ({
      data: SKILLS_BY_ID[id],
      level: (skillLevels || [])[i] || 10,
    })).filter(s => s.data);

    // 固有スキル追加
    if (general.uniqueSkill && SKILLS_BY_ID[general.uniqueSkill]) {
      const hasUnique = this.skills.some(s => s.data.id === general.uniqueSkill);
      if (!hasUnique) {
        this.skills.unshift({
          data: SKILLS_BY_ID[general.uniqueSkill],
          level: 10,
        });
      }
    }

    // 計算済みステータス
    this.baseCalculatedStats = this._calcStats();
    this.currentStats = { ...this.baseCalculatedStats };

    // 特殊効果リスト
    this.effects = [];

    // 戦闘統計
    this.stats = {
      damageDealt: 0,
      damageTaken: 0,
      healed: 0,
      skillActivations: 0,
    };
  }

  // 能力値計算
  _calcStats() {
    const g = this.general;
    const bp = this.bonusPoints;
    // 基礎能力値 + ポイント割り振り + 施設補正（簡易: 施設Lv × 2）
    return {
      atk:   g.baseStats.atk   + (bp.atk || 0) + this.facilityLevel * 2,
      def:   g.baseStats.def   + (bp.def || 0) + this.facilityLevel * 2,
      strat: g.baseStats.strat + (bp.strat || 0) + this.facilityLevel * 2,
      spd:   g.baseStats.spd   + (bp.spd || 0) + this.facilityLevel * 2,
    };
  }

  // バフ/デバフ反映後の実効ステータス
  getEffectiveStat(statName) {
    let value = this.baseCalculatedStats[statName] || 0;
    // バフ/デバフ加算
    for (const eff of this.effects) {
      if ((eff.type === 'buff' || eff.type === 'debuff') && eff.stat === statName && eff.remainingTurns > 0) {
        value += eff.value;
      }
    }
    return value;
  }

  // 適性倍率取得
  getAptitudeMultiplier() {
    const apt = this.general.aptitude[this.weaponType] || 'C';
    return APTITUDE_MULT[apt] || 1.0;
  }

  // 士気倍率
  getMoraleMultiplier() {
    return calcMoraleMultiplier(this.morale);
  }

  // 生存判定
  isAlive() {
    return this.soldiers > 0;
  }

  // ダメージ適用（負傷兵システム込み）
  applyDamage(amount) {
    const actualDmg = Math.min(amount, this.soldiers);
    const wounded = Math.floor(actualDmg * 0.9);
    const dead = actualDmg - wounded;
    this.soldiers -= actualDmg;
    this.wounded += wounded;
    this.dead += dead;
    return { actualDmg, wounded, dead };
  }

  // 回復（負傷兵→兵士）
  applyHeal(amount) {
    // 回復無効チェック
    if (this.hasEffect('heal_block')) return 0;
    const healable = Math.min(amount, this.wounded);
    this.soldiers += healable;
    this.wounded -= healable;
    return healable;
  }

  // 特殊効果チェック
  hasEffect(type) {
    return this.effects.some(e => e.type === type && e.remainingTurns > 0);
  }

  // 特定タイプの効果取得
  getEffects(type) {
    return this.effects.filter(e => e.type === type && e.remainingTurns > 0);
  }

  // 特殊効果付与
  addEffect(effect) {
    const existing = this.effects.find(e => e.type === effect.type && e.sourceSkillId === effect.sourceSkillId);
    if (existing) {
      // 上書き型: 麻痺・混乱・挑発
      if (['paralyze', 'confusion', 'provoke'].includes(effect.type)) {
        existing.remainingTurns = effect.remainingTurns;
        existing.value = effect.value;
        return;
      }
      // 延長型: 火計・持続回復
      if (['burn', 'regen'].includes(effect.type)) {
        if (effect.type === 'regen' && existing.value >= effect.value) return; // 高効力のみ
        existing.remainingTurns = Math.max(existing.remainingTurns, effect.remainingTurns);
        existing.value = Math.max(existing.value || 0, effect.value || 0);
        return;
      }
    }
    this.effects.push({ ...effect });
  }

  // ターン終了時の処理
  processEndOfTurn() {
    // 負傷兵10%死亡
    const deaths = Math.floor(this.wounded * 0.1);
    this.wounded -= deaths;
    this.dead += deaths;
  }

  // 効果の持続ターン減少
  tickEffects() {
    for (const eff of this.effects) {
      if (eff.remainingTurns > 0) {
        eff.remainingTurns--;
      }
    }
    // 期限切れ効果削除
    this.effects = this.effects.filter(e => e.remainingTurns > 0 || e.remainingTurns === undefined);
  }

  // 戦闘終了時の負傷兵処理
  processBattleEnd() {
    const deaths = Math.floor(this.wounded * 0.3);
    this.wounded -= deaths;
    this.dead += deaths;
  }

  // 表示用の識別名
  get displayName() {
    return this.general.name;
  }

  // 部隊側を返す
  get side() {
    return this.armyId;
  }
}
