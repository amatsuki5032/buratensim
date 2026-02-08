// 武将選択モーダル
import { GENERALS } from '../data/generals.js';
import { FACTIONS, RARITIES, GENERAL_TYPES } from '../data/constants.js';

export class GeneralSelector {
  constructor(modalEl) {
    this.modal = modalEl;
    this.filters = { faction: 'all', rarity: 'all' };
    this.disabledIds = new Set();
    this.onSelectCallback = null;
    this._render();
    this._bindClose();
  }

  // 選択コールバック
  onSelect(cb) {
    this.onSelectCallback = cb;
  }

  // モーダルを開く
  open(disabledIds = []) {
    this.disabledIds = new Set(disabledIds);
    this.modal.classList.add('open');
    this._renderList();
    // フォーカストラップ用
    document.addEventListener('keydown', this._escHandler);
  }

  // モーダルを閉じる
  close() {
    this.modal.classList.remove('open');
    document.removeEventListener('keydown', this._escHandler);
  }

  _escHandler = (e) => {
    if (e.key === 'Escape') this.close();
  }

  _render() {
    this.modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">武将選択</span>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-filters">
          <div class="filter-group" data-filter="faction">
            <button class="filter-btn active" data-value="all">全て</button>
            ${Object.entries(FACTIONS).map(([k, v]) =>
              `<button class="filter-btn" data-value="${k}">${v.name}</button>`
            ).join('')}
          </div>
          <div class="filter-group" data-filter="rarity">
            <button class="filter-btn active" data-value="all">全て</button>
            ${Object.entries(RARITIES).map(([k, v]) =>
              `<button class="filter-btn" data-value="${k}">${v.label}</button>`
            ).join('')}
          </div>
        </div>
        <div class="modal-body">
          <div class="general-list" id="general-list"></div>
        </div>
      </div>
    `;
    this._bindFilters();
  }

  _bindClose() {
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal || e.target.closest('.modal-close')) {
        this.close();
      }
    });
  }

  _bindFilters() {
    this.modal.querySelectorAll('.filter-group').forEach(group => {
      const filterType = group.dataset.filter;
      group.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.filters[filterType] = btn.dataset.value;
          this._renderList();
        });
      });
    });
  }

  _renderList() {
    const listEl = this.modal.querySelector('#general-list');
    if (!listEl) return;

    let filtered = [...GENERALS];

    if (this.filters.faction !== 'all') {
      filtered = filtered.filter(g => g.faction === this.filters.faction);
    }
    if (this.filters.rarity !== 'all') {
      filtered = filtered.filter(g => g.rarity === parseInt(this.filters.rarity));
    }

    // レアリティ降順 → コスト降順
    filtered.sort((a, b) => b.rarity - a.rarity || b.cost - a.cost);

    listEl.innerHTML = filtered.map(g => {
      const disabled = this.disabledIds.has(g.id);
      const faction = FACTIONS[g.faction];
      const rarity = RARITIES[g.rarity];
      return `
        <div class="general-card ${disabled ? 'disabled' : ''}" data-general-id="${g.id}">
          <div class="card-header">
            <span class="card-name">${g.name}</span>
            <span class="card-cost">${g.cost}</span>
          </div>
          <div class="card-tags">
            <span class="tag tag-rarity-${g.rarity}">${rarity.label}</span>
            <span class="tag tag-faction-${g.faction}">${faction.name}</span>
          </div>
          <div class="card-stats">
            <span>武${g.baseStats.atk}</span>
            <span>防${g.baseStats.def}</span>
            <span>計${g.baseStats.strat}</span>
            <span>速${g.baseStats.spd}</span>
          </div>
        </div>
      `;
    }).join('');

    // カードクリック
    listEl.querySelectorAll('.general-card:not(.disabled)').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.generalId;
        const general = GENERALS.find(g => g.id === id);
        if (general && this.onSelectCallback) {
          this.onSelectCallback(general);
          this.close();
        }
      });
    });
  }
}
