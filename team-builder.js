// 部隊編成UIモジュール
import { GENERALS } from '../data/generals.js';
import { SKILLS } from '../data/skills.js';
import { WEAPON_TYPES, FACTIONS, RARITIES, GENERAL_TYPES, GAME } from '../data/constants.js';

export class TeamBuilder {
  constructor(armyId, containerEl) {
    this.armyId = armyId;
    this.container = containerEl;
    this.slots = [
      { position: 'main', general: null, skillIds: ['', '', ''], skillLevels: [10, 10, 10] },
      { position: 'sub1', general: null, skillIds: ['', '', ''], skillLevels: [10, 10, 10] },
      { position: 'sub2', general: null, skillIds: ['', '', ''], skillLevels: [10, 10, 10] },
    ];
    this.weaponType = 'cavalry';
    this.morale = 100;
    this.soldiers = 10000;
    this.costLimit = 20;
    this.facilityLevel = 0;
    this.weaponFacilityLevel = 0;

    this.onChangeCallback = null;
    this.render();
  }

  // 現在の総コスト
  get totalCost() {
    return this.slots.reduce((sum, s) => sum + (s.general?.cost || 0), 0);
  }

  // 変更通知
  onChange(cb) {
    this.onChangeCallback = cb;
  }

  _notifyChange() {
    if (this.onChangeCallback) this.onChangeCallback();
  }

  // 武将セット
  setGeneral(slotIndex, general) {
    this.slots[slotIndex].general = general;
    // 固有スキルを自動セット
    if (general?.uniqueSkill) {
      this.slots[slotIndex].skillIds[0] = general.uniqueSkill;
    }
    this.render();
    this._notifyChange();
  }

  // 武将除去
  removeGeneral(slotIndex) {
    this.slots[slotIndex].general = null;
    this.slots[slotIndex].skillIds = ['', '', ''];
    this.render();
    this._notifyChange();
  }

  // 使用中の武将ID一覧
  getUsedGeneralIds() {
    return this.slots.filter(s => s.general).map(s => s.general.id);
  }

  // 編成データ取得
  getConfig() {
    return {
      armyId: this.armyId,
      weaponType: this.weaponType,
      morale: this.morale,
      soldiers: this.soldiers,
      facilityLevel: this.facilityLevel,
      weaponFacilityLevel: this.weaponFacilityLevel,
      slots: this.slots.filter(s => s.general).map(s => ({
        generalId: s.general.id,
        position: s.position,
        skillIds: s.skillIds.filter(id => id),
        skillLevels: s.skillLevels,
      })),
    };
  }

  // レンダリング
  render() {
    const posLabels = { main: '主将', sub1: '副将1', sub2: '副将2' };
    const isOverCost = this.totalCost > this.costLimit;

    this.container.innerHTML = `
      <div class="army-panel-header">
        <span class="army-label">${this.armyId === 'army1' ? '攻撃側' : '防御側'}</span>
        <span class="army-cost">
          Cost: <span class="${isOverCost ? 'over' : ''}">${this.totalCost}</span> / ${this.costLimit}
        </span>
      </div>

      ${this.slots.map((slot, i) => this._renderSlot(slot, i, posLabels[slot.position])).join('')}

      <div class="army-settings">
        <div class="setting-group">
          <label class="setting-label">兵科</label>
          <select class="setting-select" data-setting="weapon">
            ${Object.entries(WEAPON_TYPES).map(([k, v]) =>
              `<option value="${k}" ${k === this.weaponType ? 'selected' : ''}>${v.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="setting-group">
          <label class="setting-label">士気</label>
          <input type="number" class="setting-input" data-setting="morale" value="${this.morale}" min="1" max="100">
        </div>
        <div class="setting-group">
          <label class="setting-label">兵数</label>
          <input type="number" class="setting-input" data-setting="soldiers" value="${this.soldiers}" min="100" max="30000" step="100">
        </div>
        <div class="setting-group">
          <label class="setting-label">施設Lv</label>
          <input type="number" class="setting-input" data-setting="facility" value="${this.facilityLevel}" min="0" max="20">
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _renderSlot(slot, index, label) {
    if (!slot.general) {
      return `
        <div class="general-slot" data-slot="${index}">
          <div class="slot-label">${label}</div>
          <div class="slot-empty">クリックして武将を選択</div>
        </div>
      `;
    }

    const g = slot.general;
    const faction = FACTIONS[g.faction];
    const rarity = RARITIES[g.rarity];

    return `
      <div class="general-slot filled" data-slot="${index}">
        <div class="slot-label">${label}</div>
        <button class="slot-remove" data-remove="${index}">&times;</button>
        <div class="slot-general-info">
          <div>
            <div class="general-name">${g.name}</div>
            <div class="general-meta">
              <span class="tag tag-rarity-${g.rarity}">${rarity.label}</span>
              <span class="tag tag-faction-${g.faction}">${faction.name}</span>
              <span>Cost ${g.cost}</span>
            </div>
          </div>
        </div>
        <div class="general-stats-mini">
          <div class="stat-item"><span class="stat-label">武</span><span class="stat-value">${g.baseStats.atk}</span></div>
          <div class="stat-item"><span class="stat-label">防</span><span class="stat-value">${g.baseStats.def}</span></div>
          <div class="stat-item"><span class="stat-label">計</span><span class="stat-value">${g.baseStats.strat}</span></div>
          <div class="stat-item"><span class="stat-label">速</span><span class="stat-value">${g.baseStats.spd}</span></div>
        </div>
        <div class="skill-slots">
          ${[0, 1, 2].map(si => this._renderSkillSlot(slot, index, si)).join('')}
        </div>
      </div>
    `;
  }

  _renderSkillSlot(slot, slotIndex, skillIndex) {
    const currentSkillId = slot.skillIds[skillIndex];
    const currentLevel = slot.skillLevels[skillIndex];
    const isUniqueSlot = skillIndex === 0 && slot.general?.uniqueSkill;

    return `
      <div class="skill-slot">
        <select class="skill-select" data-slot="${slotIndex}" data-skill-index="${skillIndex}"
          ${isUniqueSlot ? 'disabled' : ''}>
          <option value="">-- スキル${skillIndex + 1} --</option>
          ${SKILLS.map(s => `<option value="${s.id}" ${s.id === currentSkillId ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
        <input type="number" class="skill-level-input" data-slot="${slotIndex}" data-skill-level="${skillIndex}"
          value="${currentLevel}" min="1" max="10">
      </div>
    `;
  }

  _bindEvents() {
    // スロットクリック
    this.container.querySelectorAll('.general-slot').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.slot-remove') || e.target.closest('.skill-select') || e.target.closest('.skill-level-input')) return;
        const slotIndex = parseInt(el.dataset.slot);
        if (this._onSlotClick) this._onSlotClick(slotIndex);
      });
    });

    // 除去ボタン
    this.container.querySelectorAll('.slot-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeGeneral(parseInt(btn.dataset.remove));
      });
    });

    // 設定変更
    this.container.querySelectorAll('[data-setting]').forEach(el => {
      el.addEventListener('change', () => {
        const setting = el.dataset.setting;
        if (setting === 'weapon') this.weaponType = el.value;
        else if (setting === 'morale') this.morale = Math.max(1, Math.min(100, parseInt(el.value) || 100));
        else if (setting === 'soldiers') this.soldiers = Math.max(100, parseInt(el.value) || 10000);
        else if (setting === 'facility') this.facilityLevel = Math.max(0, Math.min(20, parseInt(el.value) || 0));
        this._notifyChange();
      });
    });

    // スキル選択
    this.container.querySelectorAll('.skill-select').forEach(sel => {
      sel.addEventListener('change', () => {
        const slotIdx = parseInt(sel.dataset.slot);
        const skillIdx = parseInt(sel.dataset.skillIndex);
        this.slots[slotIdx].skillIds[skillIdx] = sel.value;
        this._notifyChange();
      });
    });

    // スキルレベル
    this.container.querySelectorAll('.skill-level-input').forEach(inp => {
      inp.addEventListener('change', () => {
        const slotIdx = parseInt(inp.dataset.slot);
        const skillIdx = parseInt(inp.dataset.skillLevel);
        this.slots[slotIdx].skillLevels[skillIdx] = Math.max(1, Math.min(10, parseInt(inp.value) || 10));
        this._notifyChange();
      });
    });
  }

  // スロットクリック時のコールバック設定
  onSlotClick(cb) {
    this._onSlotClick = cb;
  }
}
