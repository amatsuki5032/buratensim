// メイン戦闘エンジン
import { GAME, calcSkillLevelMultiplier } from '../data/constants.js';
import { calcNormalAttackDamage, calcSkillDamage, calcHealAmount, calcBurnDamage } from './damage.js';

export class BattleEngine {
  constructor(army1Units, army2Units) {
    this.army1 = army1Units; // Unit[]
    this.army2 = army2Units; // Unit[]
    this.allUnits = [...army1Units, ...army2Units];
    this.turn = 0;
    this.log = [];
    this.finished = false;
    this.winner = null; // 'army1' | 'army2' | 'draw'
  }

  // 全ユニット取得（生存のみ）
  getAliveUnits(armyId) {
    const army = armyId === 'army1' ? this.army1 : this.army2;
    return army.filter(u => u.isAlive());
  }

  // 敵軍取得
  getEnemyArmy(unit) {
    return unit.armyId === 'army1' ? 'army2' : 'army1';
  }

  // ログ追加
  addLog(turn, type, data) {
    this.log.push({ turn, type, ...data });
  }

  // 勝敗判定
  checkVictory() {
    const army1Main = this.army1.find(u => u.position === 'main');
    const army2Main = this.army2.find(u => u.position === 'main');

    if (!army1Main.isAlive() && !army2Main.isAlive()) {
      this.finished = true;
      this.winner = 'draw';
      return true;
    }
    if (!army1Main.isAlive()) {
      this.finished = true;
      this.winner = 'army2';
      return true;
    }
    if (!army2Main.isAlive()) {
      this.finished = true;
      this.winner = 'army1';
      return true;
    }
    return false;
  }

  // 引き分け判定（ターン上限到達）
  checkDraw() {
    if (this.turn >= GAME.MAX_TURNS) {
      const army1Total = this.army1.reduce((s, u) => s + u.soldiers, 0);
      const army2Total = this.army2.reduce((s, u) => s + u.soldiers, 0);
      this.finished = true;
      if (army1Total > army2Total) this.winner = 'army1';
      else if (army2Total > army1Total) this.winner = 'army2';
      else this.winner = 'draw';
      return true;
    }
    return false;
  }

  // 速度順でユニットをソート
  getSortedUnits() {
    return this.allUnits
      .filter(u => u.isAlive())
      .sort((a, b) => {
        const spdA = a.getEffectiveStat('spd');
        const spdB = b.getEffectiveStat('spd');
        if (spdB !== spdA) return spdB - spdA;
        // 同速の場合ランダム
        return Math.random() - 0.5;
      });
  }

  // ターゲット選択
  selectTarget(unit, targetType) {
    const enemyArmyId = this.getEnemyArmy(unit);
    const allyArmyId = unit.armyId;
    const enemies = this.getAliveUnits(enemyArmyId);
    const allies = this.getAliveUnits(allyArmyId);

    // 混乱チェック
    if (unit.hasEffect('confusion')) {
      const allAlive = [...enemies, ...allies];
      if (allAlive.length === 0) return null;
      return allAlive[Math.floor(Math.random() * allAlive.length)];
    }

    switch (targetType) {
      case 'enemy_single': {
        if (enemies.length === 0) return null;
        // 挑発チェック
        const provokers = unit.getEffects('provoke');
        for (const p of provokers) {
          const provoker = this.allUnits.find(u => u.general.id === p.sourceId && u.isAlive());
          if (provoker) return provoker;
        }
        return enemies[Math.floor(Math.random() * enemies.length)];
      }
      case 'enemy_all':
        return enemies;
      case 'enemy_random':
        if (enemies.length === 0) return null;
        return enemies[Math.floor(Math.random() * enemies.length)];
      case 'ally_single': {
        if (allies.length === 0) return null;
        // 最もHP割合が低い味方
        return allies.reduce((worst, u) => {
          const ratio = u.soldiers / u.maxSoldiers;
          const worstRatio = worst.soldiers / worst.maxSoldiers;
          return ratio < worstRatio ? u : worst;
        });
      }
      case 'ally_all':
        return allies;
      case 'self':
        return unit;
      case 'self_army':
        return allies;
      case 'attacker':
        return null; // 反撃用、別途処理
      default:
        return null;
    }
  }

  // エフェクト適用
  applyEffect(source, target, effect, skillLevel) {
    const lvMult = calcSkillLevelMultiplier(skillLevel);

    switch (effect.type) {
      case 'damage_atk':
      case 'damage_strat': {
        const scaledEffect = { ...effect, power: Math.floor(effect.power * lvMult) };
        const dmg = calcSkillDamage(source, target, scaledEffect, skillLevel);
        const result = target.applyDamage(dmg);
        source.stats.damageDealt += result.actualDmg;
        target.stats.damageTaken += result.actualDmg;
        return { type: 'damage', target: target.displayName, amount: result.actualDmg, damageType: effect.type };
      }

      case 'heal_strat':
      case 'heal_def': {
        const scaledEffect = { ...effect, power: Math.floor(effect.power * lvMult) };
        const amount = calcHealAmount(source, scaledEffect);
        const healed = target.applyHeal(amount);
        source.stats.healed += healed;
        return { type: 'heal', target: target.displayName, amount: healed };
      }

      case 'buff': {
        const value = Math.floor((effect.value || 0) * lvMult);
        target.addEffect({
          type: 'buff',
          stat: effect.stat,
          value,
          remainingTurns: effect.duration,
          sourceSkillId: source.general.id,
        });
        return { type: 'buff', target: target.displayName, stat: effect.stat, value, duration: effect.duration };
      }

      case 'debuff': {
        const value = Math.floor((effect.value || 0) * lvMult);
        target.addEffect({
          type: 'debuff',
          stat: effect.stat,
          value,
          remainingTurns: effect.duration,
          sourceSkillId: source.general.id,
        });
        return { type: 'debuff', target: target.displayName, stat: effect.stat, value, duration: effect.duration };
      }

      case 'status': {
        target.addEffect({
          type: effect.status,
          remainingTurns: effect.duration,
          value: effect.power ? Math.floor(effect.power * lvMult) : undefined,
          probability: effect.probability,
          sourceId: source.general.id,
          sourceSkillId: source.general.id,
        });
        return { type: 'status', target: target.displayName, status: effect.status, duration: effect.duration };
      }

      default:
        return null;
    }
  }

  // スキル実行
  executeSkill(unit, skill) {
    const results = [];
    for (const effect of skill.data.effects) {
      const target = this.selectTarget(unit, effect.target);
      if (!target) continue;

      if (Array.isArray(target)) {
        for (const t of target) {
          if (!t.isAlive()) continue;
          const r = this.applyEffect(unit, t, effect, skill.level);
          if (r) results.push(r);
        }
      } else {
        if (!target.isAlive()) continue;
        const r = this.applyEffect(unit, target, effect, skill.level);
        if (r) results.push(r);
      }
    }
    return results;
  }

  // 通常攻撃実行
  executeNormalAttack(unit) {
    const target = this.selectTarget(unit, 'enemy_single');
    if (!target) return [];

    const dmg = calcNormalAttackDamage(unit, target);
    const result = target.applyDamage(dmg);
    unit.stats.damageDealt += result.actualDmg;
    target.stats.damageTaken += result.actualDmg;

    const results = [{ type: 'normal_attack', source: unit.displayName, target: target.displayName, amount: result.actualDmg }];

    // 反撃判定
    this._checkCounterAttack(unit, target, results);

    return results;
  }

  // 反撃チェック
  _checkCounterAttack(attacker, defender, results) {
    // 武力反撃
    for (const eff of defender.getEffects('counter_atk')) {
      if (Math.random() * 100 < (eff.probability || 50)) {
        const counterDmg = Math.floor(calcNormalAttackDamage(defender, attacker) * ((eff.value || 230) / 100));
        const res = attacker.applyDamage(Math.max(1, counterDmg));
        defender.stats.damageDealt += res.actualDmg;
        attacker.stats.damageTaken += res.actualDmg;
        results.push({ type: 'counter', source: defender.displayName, target: attacker.displayName, amount: res.actualDmg });
      }
    }
    // 麻痺反撃
    for (const eff of defender.getEffects('counter_paralyze')) {
      if (Math.random() * 100 < (eff.probability || 40)) {
        attacker.addEffect({ type: 'paralyze', remainingTurns: 1, sourceSkillId: defender.general.id });
        results.push({ type: 'counter_paralyze', source: defender.displayName, target: attacker.displayName });
      }
    }
  }

  // 追撃チェック
  _checkPursuit(unit, results) {
    for (const eff of unit.getEffects('pursuit')) {
      if (Math.random() * 100 < (eff.probability || 50)) {
        const target = this.selectTarget(unit, 'enemy_single');
        if (!target) return;
        const dmg = Math.floor(calcNormalAttackDamage(unit, target) * ((eff.value || 100) / 100));
        const res = target.applyDamage(Math.max(1, dmg));
        unit.stats.damageDealt += res.actualDmg;
        target.stats.damageTaken += res.actualDmg;
        results.push({ type: 'pursuit', source: unit.displayName, target: target.displayName, amount: res.actualDmg });
        this._checkCounterAttack(unit, target, results);
      }
    }
  }

  // 持続効果処理（行動開始時）
  processTurnStartEffects(unit) {
    const results = [];

    // 火計ダメージ
    for (const eff of unit.getEffects('burn')) {
      const source = this.allUnits.find(u => u.general.id === eff.sourceId);
      const dmg = calcBurnDamage(source, unit, eff.value || 50);
      const res = unit.applyDamage(dmg);
      unit.stats.damageTaken += res.actualDmg;
      results.push({ type: 'burn_damage', target: unit.displayName, amount: res.actualDmg });
    }

    // 持続回復
    for (const eff of unit.getEffects('regen')) {
      const healAmt = Math.floor((eff.value || 50) * 10);
      const healed = unit.applyHeal(healAmt);
      if (healed > 0) {
        results.push({ type: 'regen_heal', target: unit.displayName, amount: healed });
      }
    }

    return results;
  }

  // ユニットの行動実行
  executeUnitAction(unit) {
    if (!unit.isAlive()) return;

    // 1. 持続効果処理
    const startResults = this.processTurnStartEffects(unit);
    if (startResults.length > 0) {
      this.addLog(this.turn, 'effect', { unit: unit.displayName, army: unit.armyId, results: startResults });
    }
    if (!unit.isAlive()) return;

    // 2. 麻痺チェック
    if (unit.hasEffect('paralyze')) {
      this.addLog(this.turn, 'paralyze', { unit: unit.displayName, army: unit.armyId });
      return;
    }

    // 3. アクティブスキル判定
    let skillUsed = false;
    const activeSkills = unit.skills.filter(s => s.data.triggerType === 'active');
    for (const skill of activeSkills) {
      if (Math.random() * 100 < skill.data.probability) {
        const results = this.executeSkill(unit, skill);
        unit.stats.skillActivations++;
        this.addLog(this.turn, 'skill', {
          unit: unit.displayName,
          army: unit.armyId,
          skill: skill.data.name,
          results,
        });
        skillUsed = true;
        break; // 1スキルのみ発動
      }
    }

    // 4. スキル未発動なら通常攻撃
    if (!skillUsed) {
      const atkResults = this.executeNormalAttack(unit);
      this.addLog(this.turn, 'attack', { unit: unit.displayName, army: unit.armyId, results: atkResults });

      // 連撃チェック
      if (unit.hasEffect('double_attack') && unit.isAlive()) {
        const atkResults2 = this.executeNormalAttack(unit);
        this.addLog(this.turn, 'double_attack', { unit: unit.displayName, army: unit.armyId, results: atkResults2 });
      }

      // 追撃チェック
      this._checkPursuit(unit, atkResults);
    }

    // パッシブスキル（ターン開始型）
    const passiveSkills = unit.skills.filter(s => s.data.triggerType === 'passive' && s.data.trigger === 'turn_start');
    for (const skill of passiveSkills) {
      if (Math.random() * 100 < skill.data.probability) {
        const results = this.executeSkill(unit, skill);
        this.addLog(this.turn, 'passive', { unit: unit.displayName, army: unit.armyId, skill: skill.data.name, results });
      }
    }
  }

  // 準備フェーズ
  runPrepPhase() {
    this.addLog(0, 'phase', { message: '準備フェーズ開始' });

    // 始動スキル発動
    for (const unit of this.allUnits) {
      const startupSkills = unit.skills.filter(s => s.data.triggerType === 'startup');
      for (const skill of startupSkills) {
        if (Math.random() * 100 < skill.data.probability) {
          const results = this.executeSkill(unit, skill);
          this.addLog(0, 'startup', { unit: unit.displayName, army: unit.armyId, skill: skill.data.name, results });
        }
      }
    }
  }

  // メインフェーズ（1ターン分）
  runTurn() {
    this.turn++;
    this.addLog(this.turn, 'turn_start', { turn: this.turn });

    const sortedUnits = this.getSortedUnits();

    for (const unit of sortedUnits) {
      if (this.finished) break;
      this.executeUnitAction(unit);

      // 勝敗チェック
      if (this.checkVictory()) break;
    }

    // ターン終了処理
    if (!this.finished) {
      for (const unit of this.allUnits) {
        if (unit.isAlive()) {
          unit.processEndOfTurn();
          unit.tickEffects();
        }
      }
      // ターン上限チェック
      this.checkDraw();
    }
  }

  // 戦闘全体実行
  run() {
    this.runPrepPhase();

    while (!this.finished && this.turn < GAME.MAX_TURNS) {
      this.runTurn();
    }

    // 終了フェーズ
    for (const unit of this.allUnits) {
      unit.processBattleEnd();
    }

    this.addLog(this.turn, 'battle_end', {
      winner: this.winner,
      army1Soldiers: this.army1.reduce((s, u) => s + u.soldiers, 0),
      army2Soldiers: this.army2.reduce((s, u) => s + u.soldiers, 0),
    });

    return this.getResult();
  }

  // 結果取得
  getResult() {
    return {
      winner: this.winner,
      turns: this.turn,
      log: this.log,
      army1: this.army1.map(u => this._unitSummary(u)),
      army2: this.army2.map(u => this._unitSummary(u)),
    };
  }

  _unitSummary(unit) {
    return {
      name: unit.displayName,
      position: unit.position,
      soldiers: unit.soldiers,
      maxSoldiers: unit.maxSoldiers,
      wounded: unit.wounded,
      dead: unit.dead,
      stats: { ...unit.stats },
    };
  }
}

// 複数戦シミュレーション
export function runMultipleBattles(createUnits, count = 100) {
  const results = { army1Wins: 0, army2Wins: 0, draws: 0, details: [] };

  for (let i = 0; i < count; i++) {
    const { army1, army2 } = createUnits();
    const engine = new BattleEngine(army1, army2);
    const result = engine.run();

    if (result.winner === 'army1') results.army1Wins++;
    else if (result.winner === 'army2') results.army2Wins++;
    else results.draws++;

    results.details.push(result);
  }

  results.army1WinRate = (results.army1Wins / count * 100).toFixed(1);
  results.army2WinRate = (results.army2Wins / count * 100).toFixed(1);
  results.drawRate = (results.draws / count * 100).toFixed(1);

  return results;
}
