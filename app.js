// メインアプリケーション
import { GENERALS_BY_ID } from './data/generals.js';
import { Unit } from './engine/unit.js';
import { BattleEngine, runMultipleBattles } from './engine/battle-engine.js';
import { TeamBuilder } from './ui/team-builder.js';
import { GeneralSelector } from './ui/general-modal.js';
import { BattleViewer } from './ui/battle-viewer.js';

class App {
  constructor() {
    this.army1Builder = new TeamBuilder('army1', document.getElementById('army1-panel'));
    this.army2Builder = new TeamBuilder('army2', document.getElementById('army2-panel'));
    this.generalSelector = new GeneralSelector(document.getElementById('general-modal'));
    this.battleViewer = new BattleViewer(
      document.getElementById('battle-result'),
      document.getElementById('battle-log')
    );

    this._currentSlotTarget = null; // { builder, slotIndex }

    this._setupEvents();
    this._setupThemeToggle();
    this._setupTabs();
  }

  _setupEvents() {
    // 武将スロットクリック → モーダルを開く
    this.army1Builder.onSlotClick((slotIndex) => {
      this._currentSlotTarget = { builder: this.army1Builder, slotIndex };
      const allUsed = [
        ...this.army1Builder.getUsedGeneralIds(),
        ...this.army2Builder.getUsedGeneralIds(),
      ];
      this.generalSelector.open(allUsed);
    });

    this.army2Builder.onSlotClick((slotIndex) => {
      this._currentSlotTarget = { builder: this.army2Builder, slotIndex };
      const allUsed = [
        ...this.army1Builder.getUsedGeneralIds(),
        ...this.army2Builder.getUsedGeneralIds(),
      ];
      this.generalSelector.open(allUsed);
    });

    // 武将選択完了
    this.generalSelector.onSelect((general) => {
      if (this._currentSlotTarget) {
        this._currentSlotTarget.builder.setGeneral(
          this._currentSlotTarget.slotIndex,
          general
        );
        this._currentSlotTarget = null;
      }
    });

    // 1戦実行
    document.getElementById('btn-battle-single').addEventListener('click', () => {
      this._runSingleBattle();
    });

    // N戦実行
    document.getElementById('btn-battle-multi').addEventListener('click', () => {
      this._runMultiBattle();
    });
  }

  // ユニット生成
  _createUnits(config) {
    return config.slots.map(slot => {
      const general = GENERALS_BY_ID[slot.generalId];
      if (!general) return null;
      return new Unit({
        general,
        position: slot.position,
        armyId: config.armyId,
        weaponType: config.weaponType,
        morale: config.morale,
        soldiers: config.soldiers,
        skillIds: slot.skillIds,
        skillLevels: slot.skillLevels,
        facilityLevel: config.facilityLevel,
        weaponFacilityLevel: config.weaponFacilityLevel,
      });
    }).filter(Boolean);
  }

  // バリデーション
  _validate() {
    const c1 = this.army1Builder.getConfig();
    const c2 = this.army2Builder.getConfig();

    if (c1.slots.length === 0) {
      this._showError('攻撃側に主将を配置してください');
      return null;
    }
    if (c2.slots.length === 0) {
      this._showError('防御側に主将を配置してください');
      return null;
    }
    if (!c1.slots.find(s => s.position === 'main')) {
      this._showError('攻撃側に主将を配置してください');
      return null;
    }
    if (!c2.slots.find(s => s.position === 'main')) {
      this._showError('防御側に主将を配置してください');
      return null;
    }
    return { c1, c2 };
  }

  _showError(msg) {
    document.getElementById('battle-result').innerHTML = `
      <div class="result-summary" style="text-align: center; color: var(--status-danger);">
        ${msg}
      </div>
    `;
  }

  // 1戦実行
  _runSingleBattle() {
    const configs = this._validate();
    if (!configs) return;

    const army1 = this._createUnits(configs.c1);
    const army2 = this._createUnits(configs.c2);

    const engine = new BattleEngine(army1, army2);
    const result = engine.run();

    // 結果タブに切替
    this._switchTab('result');
    this.battleViewer.showSingleResult(result);
  }

  // N戦実行
  _runMultiBattle() {
    const configs = this._validate();
    if (!configs) return;

    const countInput = document.getElementById('sim-count');
    const count = Math.max(1, Math.min(1000, parseInt(countInput.value) || 100));

    const createUnits = () => ({
      army1: this._createUnits(configs.c1),
      army2: this._createUnits(configs.c2),
    });

    const result = runMultipleBattles(createUnits, count);

    this._switchTab('result');
    this.battleViewer.showMultiResult(result);
  }

  // テーマ切替
  _setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    const saved = localStorage.getItem('braten-theme') || 'dark';
    if (saved === 'light') document.documentElement.dataset.theme = 'light';

    btn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme;
      const next = current === 'light' ? '' : 'light';
      document.documentElement.dataset.theme = next;
      localStorage.setItem('braten-theme', next || 'dark');
      btn.textContent = next === 'light' ? '☀' : '🌙';
    });
    btn.textContent = saved === 'light' ? '☀' : '🌙';
  }

  // タブ切替
  _setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._switchTab(btn.dataset.tab);
      });
    });
  }

  _switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabId));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tabId}`));
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  new App();
});
