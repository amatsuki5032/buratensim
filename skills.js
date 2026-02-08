// スキルデータベース
// effectType: damage_atk, damage_strat, heal_def, heal_strat, buff, debuff, status, passive
// triggerType: active, passive, startup
// target: enemy_single, enemy_all, enemy_random, ally_single, ally_all, self, self_army

export const SKILLS = [
  // ===== 武力系アクティブスキル =====
  { id: 'sk_power_strike', name: '豪撃', category: 'attack',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'damage_atk', target: 'enemy_single', power: 180, baseStat: 'atk' }],
    levelScaling: { powerMin: 130, powerMax: 180 },
    description: '敵単体に武力180%ダメージ' },

  { id: 'sk_fierce_slash', name: '烈斬', category: 'attack',
    triggerType: 'active', probability: 30,
    effects: [{ type: 'damage_atk', target: 'enemy_single', power: 220, baseStat: 'atk' }],
    levelScaling: { powerMin: 160, powerMax: 220 },
    description: '敵単体に武力220%ダメージ' },

  { id: 'sk_aoe_strike', name: '全軍突撃', category: 'attack',
    triggerType: 'active', probability: 25,
    effects: [{ type: 'damage_atk', target: 'enemy_all', power: 120, baseStat: 'atk' }],
    levelScaling: { powerMin: 85, powerMax: 120 },
    description: '敵全体に武力120%ダメージ' },

  { id: 'sk_double_strike', name: '双撃', category: 'attack',
    triggerType: 'active', probability: 30,
    effects: [
      { type: 'damage_atk', target: 'enemy_single', power: 130, baseStat: 'atk' },
      { type: 'damage_atk', target: 'enemy_single', power: 130, baseStat: 'atk' },
    ],
    levelScaling: { powerMin: 95, powerMax: 130 },
    description: '敵単体に武力130%ダメージ×2回' },

  // ===== 計略系アクティブスキル =====
  { id: 'sk_fire_attack', name: '火計', category: 'strategy',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_strat', target: 'enemy_single', power: 150, baseStat: 'strat' },
      { type: 'status', target: 'enemy_single', status: 'burn', duration: 3, power: 50 },
    ],
    levelScaling: { powerMin: 110, powerMax: 150 },
    description: '敵単体に計略150%ダメージ+火計(3T)' },

  { id: 'sk_strategy_attack', name: '策略', category: 'strategy',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'damage_strat', target: 'enemy_single', power: 180, baseStat: 'strat' }],
    levelScaling: { powerMin: 130, powerMax: 180 },
    description: '敵単体に計略180%ダメージ' },

  { id: 'sk_aoe_strategy', name: '火炎計', category: 'strategy',
    triggerType: 'active', probability: 25,
    effects: [{ type: 'damage_strat', target: 'enemy_all', power: 110, baseStat: 'strat' }],
    levelScaling: { powerMin: 80, powerMax: 110 },
    description: '敵全体に計略110%ダメージ' },

  { id: 'sk_confusion', name: '惑乱', category: 'strategy',
    triggerType: 'active', probability: 30,
    effects: [{ type: 'status', target: 'enemy_single', status: 'confusion', duration: 2 }],
    levelScaling: {},
    description: '敵単体に混乱(2T)を付与' },

  { id: 'sk_paralyze', name: '麻痺撃', category: 'strategy',
    triggerType: 'active', probability: 30,
    effects: [
      { type: 'damage_strat', target: 'enemy_single', power: 120, baseStat: 'strat' },
      { type: 'status', target: 'enemy_single', status: 'paralyze', duration: 1 },
    ],
    levelScaling: { powerMin: 85, powerMax: 120 },
    description: '敵単体に計略120%ダメージ+麻痺(1T)' },

  // ===== 回復系 =====
  { id: 'sk_heal_strat', name: '治療', category: 'heal',
    triggerType: 'active', probability: 40,
    effects: [{ type: 'heal_strat', target: 'ally_single', power: 150, baseStat: 'strat' }],
    levelScaling: { powerMin: 110, powerMax: 150 },
    description: '味方単体を計略依存で回復(150%)' },

  { id: 'sk_heal_all', name: '全体治療', category: 'heal',
    triggerType: 'active', probability: 30,
    effects: [{ type: 'heal_strat', target: 'ally_all', power: 100, baseStat: 'strat' }],
    levelScaling: { powerMin: 70, powerMax: 100 },
    description: '味方全体を計略依存で回復(100%)' },

  { id: 'sk_heal_def', name: '堅守回復', category: 'heal',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'heal_def', target: 'self_army', power: 130, baseStat: 'def' }],
    levelScaling: { powerMin: 95, powerMax: 130 },
    description: '自部隊を防御依存で回復(130%)' },

  { id: 'sk_regen', name: '持続回復', category: 'heal',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'status', target: 'ally_single', status: 'regen', duration: 3, power: 80 }],
    levelScaling: { powerMin: 55, powerMax: 80 },
    description: '味方単体に持続回復(3T)を付与' },

  // ===== 補助系バフ =====
  { id: 'sk_atk_buff', name: '鼓舞', category: 'support',
    triggerType: 'active', probability: 40,
    effects: [{ type: 'buff', target: 'ally_all', stat: 'atk', value: 30, duration: 3 }],
    levelScaling: { valueMin: 20, valueMax: 30 },
    description: '味方全体の武力+30(3T)' },

  { id: 'sk_def_buff', name: '堅陣', category: 'support',
    triggerType: 'active', probability: 40,
    effects: [{ type: 'buff', target: 'ally_all', stat: 'def', value: 30, duration: 3 }],
    levelScaling: { valueMin: 20, valueMax: 30 },
    description: '味方全体の防御+30(3T)' },

  { id: 'sk_spd_buff', name: '神速', category: 'support',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'buff', target: 'self_army', stat: 'spd', value: 40, duration: 3 }],
    levelScaling: { valueMin: 25, valueMax: 40 },
    description: '自部隊の速度+40(3T)' },

  { id: 'sk_strat_buff', name: '知略', category: 'support',
    triggerType: 'active', probability: 40,
    effects: [{ type: 'buff', target: 'ally_all', stat: 'strat', value: 30, duration: 3 }],
    levelScaling: { valueMin: 20, valueMax: 30 },
    description: '味方全体の計略+30(3T)' },

  // ===== 妨害系デバフ =====
  { id: 'sk_atk_debuff', name: '武力低下', category: 'debuff',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'debuff', target: 'enemy_all', stat: 'atk', value: -25, duration: 3 }],
    levelScaling: { valueMin: -18, valueMax: -25 },
    description: '敵全体の武力-25(3T)' },

  { id: 'sk_def_debuff', name: '防御低下', category: 'debuff',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'debuff', target: 'enemy_single', stat: 'def', value: -35, duration: 3 }],
    levelScaling: { valueMin: -25, valueMax: -35 },
    description: '敵単体の防御-35(3T)' },

  { id: 'sk_spd_debuff', name: '足止め', category: 'debuff',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'debuff', target: 'enemy_all', stat: 'spd', value: -30, duration: 3 }],
    levelScaling: { valueMin: -20, valueMax: -30 },
    description: '敵全体の速度-30(3T)' },

  { id: 'sk_heal_block', name: '回復無効', category: 'debuff',
    triggerType: 'active', probability: 30,
    effects: [{ type: 'status', target: 'enemy_single', status: 'heal_block', duration: 3 }],
    levelScaling: {},
    description: '敵単体に回復無効(3T)を付与' },

  // ===== 守護系 =====
  { id: 'sk_provoke', name: '挑発', category: 'guard',
    triggerType: 'active', probability: 40,
    effects: [{ type: 'status', target: 'enemy_all', status: 'provoke', duration: 2, sourceRef: true }],
    levelScaling: {},
    description: '敵全体に挑発(2T)を付与' },

  { id: 'sk_counter_atk', name: '武力反撃', category: 'guard',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'status', target: 'self', status: 'counter_atk', duration: 3, power: 230, probability: 50 }],
    levelScaling: { powerMin: 170, powerMax: 230 },
    description: '被攻撃時50%で武力230%反撃(3T)' },

  { id: 'sk_counter_paralyze', name: '麻痺反撃', category: 'guard',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'status', target: 'self', status: 'counter_paralyze', duration: 3, probability: 40 }],
    levelScaling: {},
    description: '被攻撃時40%で麻痺付与(3T)' },

  { id: 'sk_pursuit', name: '追撃', category: 'guard',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'status', target: 'self', status: 'pursuit', duration: 3, power: 100, probability: 50 }],
    levelScaling: { powerMin: 70, powerMax: 100 },
    description: '攻撃後50%で追撃(3T)' },

  { id: 'sk_double_attack', name: '連撃付与', category: 'guard',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'status', target: 'self', status: 'double_attack', duration: 3 }],
    levelScaling: {},
    description: '通常攻撃2回(3T)' },

  // ===== パッシブスキル =====
  { id: 'sk_passive_counter', name: '反骨', category: 'guard',
    triggerType: 'passive', probability: 30,
    trigger: 'on_damaged',
    effects: [{ type: 'damage_atk', target: 'attacker', power: 150, baseStat: 'atk' }],
    levelScaling: { powerMin: 110, powerMax: 150 },
    description: '被攻撃時30%で武力150%反撃' },

  { id: 'sk_passive_heal', name: '自己治癒', category: 'heal',
    triggerType: 'passive', probability: 40,
    trigger: 'turn_start',
    effects: [{ type: 'heal_def', target: 'self_army', power: 80, baseStat: 'def' }],
    levelScaling: { powerMin: 55, powerMax: 80 },
    description: 'ターン開始時40%で自部隊回復' },

  // ===== 始動スキル =====
  { id: 'sk_startup_atk_buff', name: '開戦鼓舞', category: 'support',
    triggerType: 'startup', probability: 100,
    effects: [{ type: 'buff', target: 'ally_all', stat: 'atk', value: 20, duration: 3 }],
    levelScaling: { valueMin: 12, valueMax: 20 },
    description: '戦闘開始時味方全体武力+20(3T)' },

  { id: 'sk_startup_def_buff', name: '開戦堅守', category: 'support',
    triggerType: 'startup', probability: 100,
    effects: [{ type: 'buff', target: 'ally_all', stat: 'def', value: 20, duration: 3 }],
    levelScaling: { valueMin: 12, valueMax: 20 },
    description: '戦闘開始時味方全体防御+20(3T)' },

  { id: 'sk_startup_spd_buff', name: '先手必勝', category: 'support',
    triggerType: 'startup', probability: 100,
    effects: [{ type: 'buff', target: 'self_army', stat: 'spd', value: 30, duration: 2 }],
    levelScaling: { valueMin: 18, valueMax: 30 },
    description: '戦闘開始時自部隊速度+30(2T)' },

  // ===== ★5武将固有スキル（代表例） =====
  { id: 'sk_souso_unique', name: '覇王の威光', category: 'support',
    triggerType: 'active', probability: 40,
    effects: [
      { type: 'buff', target: 'ally_all', stat: 'atk', value: 25, duration: 3 },
      { type: 'buff', target: 'ally_all', stat: 'def', value: 25, duration: 3 },
    ],
    levelScaling: { valueMin: 15, valueMax: 25 },
    description: '味方全体の武力・防御+25(3T)', isUnique: true },

  { id: 'sk_kannu_unique', name: '義絶の一閃', category: 'attack',
    triggerType: 'active', probability: 35,
    effects: [{ type: 'damage_atk', target: 'enemy_single', power: 280, baseStat: 'atk' }],
    levelScaling: { powerMin: 200, powerMax: 280 },
    description: '敵単体に武力280%ダメージ', isUnique: true },

  { id: 'sk_shokatsu_unique', name: '臥龍の計', category: 'strategy',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_strat', target: 'enemy_all', power: 160, baseStat: 'strat' },
      { type: 'debuff', target: 'enemy_all', stat: 'strat', value: -20, duration: 2 },
    ],
    levelScaling: { powerMin: 115, powerMax: 160 },
    description: '敵全体に計略160%ダメージ+計略-20(2T)', isUnique: true },

  { id: 'sk_ryofu_unique', name: '無双の武', category: 'attack',
    triggerType: 'active', probability: 30,
    effects: [
      { type: 'damage_atk', target: 'enemy_single', power: 320, baseStat: 'atk' },
      { type: 'buff', target: 'self', stat: 'atk', value: 20, duration: 2 },
    ],
    levelScaling: { powerMin: 230, powerMax: 320 },
    description: '敵単体に武力320%ダメージ+自身武力+20(2T)', isUnique: true },

  { id: 'sk_shuyu_unique', name: '赤壁の炎', category: 'strategy',
    triggerType: 'active', probability: 30,
    effects: [
      { type: 'damage_strat', target: 'enemy_all', power: 140, baseStat: 'strat' },
      { type: 'status', target: 'enemy_all', status: 'burn', duration: 3, power: 60 },
    ],
    levelScaling: { powerMin: 100, powerMax: 140 },
    description: '敵全体に計略140%ダメージ+火計(3T)', isUnique: true },

  { id: 'sk_chohi_unique', name: '万夫不当', category: 'attack',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_atk', target: 'enemy_single', power: 260, baseStat: 'atk' },
      { type: 'status', target: 'enemy_single', status: 'paralyze', duration: 1 },
    ],
    levelScaling: { powerMin: 185, powerMax: 260 },
    description: '敵単体に武力260%ダメージ+麻痺(1T)', isUnique: true },

  { id: 'sk_choun_unique', name: '龍胆一騎', category: 'attack',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_atk', target: 'enemy_single', power: 240, baseStat: 'atk' },
      { type: 'buff', target: 'self', stat: 'spd', value: 25, duration: 2 },
    ],
    levelScaling: { powerMin: 170, powerMax: 240 },
    description: '敵単体に武力240%ダメージ+自身速度+25(2T)', isUnique: true },

  { id: 'sk_ryubi_unique', name: '仁君の慈愛', category: 'heal',
    triggerType: 'active', probability: 40,
    effects: [
      { type: 'heal_strat', target: 'ally_all', power: 120, baseStat: 'strat' },
      { type: 'buff', target: 'ally_all', stat: 'def', value: 15, duration: 2 },
    ],
    levelScaling: { powerMin: 85, powerMax: 120 },
    description: '味方全体回復+防御+15(2T)', isUnique: true },

  { id: 'sk_kakoton_unique', name: '隻眼の覇気', category: 'attack',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_atk', target: 'enemy_single', power: 250, baseStat: 'atk' },
      { type: 'status', target: 'self', status: 'counter_atk', duration: 2, power: 200, probability: 50 },
    ],
    levelScaling: { powerMin: 180, powerMax: 250 },
    description: '敵単体に武力250%ダメージ+反撃(2T)', isUnique: true },

  { id: 'sk_shibai_unique', name: '深謀遠慮', category: 'strategy',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_strat', target: 'enemy_single', power: 200, baseStat: 'strat' },
      { type: 'debuff', target: 'enemy_all', stat: 'spd', value: -20, duration: 2 },
    ],
    levelScaling: { powerMin: 145, powerMax: 200 },
    description: '敵単体に計略200%ダメージ+敵全体速度-20(2T)', isUnique: true },

  { id: 'sk_sonsaku_unique', name: '小覇王の武', category: 'attack',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_atk', target: 'enemy_single', power: 260, baseStat: 'atk' },
      { type: 'status', target: 'self', status: 'double_attack', duration: 2 },
    ],
    levelScaling: { powerMin: 185, powerMax: 260 },
    description: '敵単体に武力260%ダメージ+連撃(2T)', isUnique: true },

  { id: 'sk_sonken_unique', name: '紫髯碧眼', category: 'support',
    triggerType: 'active', probability: 40,
    effects: [
      { type: 'buff', target: 'ally_all', stat: 'def', value: 30, duration: 3 },
      { type: 'heal_strat', target: 'ally_all', power: 80, baseStat: 'strat' },
    ],
    levelScaling: { valueMin: 20, valueMax: 30 },
    description: '味方全体防御+30(3T)+回復', isUnique: true },

  { id: 'sk_rikuson_unique', name: '火計連環', category: 'strategy',
    triggerType: 'active', probability: 30,
    effects: [
      { type: 'damage_strat', target: 'enemy_all', power: 130, baseStat: 'strat' },
      { type: 'status', target: 'enemy_all', status: 'burn', duration: 3, power: 50 },
      { type: 'debuff', target: 'enemy_all', stat: 'def', value: -15, duration: 2 },
    ],
    levelScaling: { powerMin: 95, powerMax: 130 },
    description: '敵全体に計略130%ダメージ+火計(3T)+防御-15(2T)', isUnique: true },

  { id: 'sk_choryo_unique', name: '遼来来', category: 'attack',
    triggerType: 'active', probability: 35,
    effects: [
      { type: 'damage_atk', target: 'enemy_all', power: 170, baseStat: 'atk' },
      { type: 'buff', target: 'self', stat: 'spd', value: 30, duration: 2 },
    ],
    levelScaling: { powerMin: 120, powerMax: 170 },
    description: '敵全体に武力170%ダメージ+自身速度+30(2T)', isUnique: true },

  { id: 'sk_chosen_unique', name: '傾国の舞', category: 'debuff',
    triggerType: 'active', probability: 40,
    effects: [
      { type: 'debuff', target: 'enemy_all', stat: 'atk', value: -30, duration: 3 },
      { type: 'status', target: 'enemy_single', status: 'confusion', duration: 2 },
    ],
    levelScaling: { valueMin: -20, valueMax: -30 },
    description: '敵全体武力-30(3T)+敵単体混乱(2T)', isUnique: true },
];

export const SKILLS_BY_ID = Object.fromEntries(SKILLS.map(s => [s.id, s]));
