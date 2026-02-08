// 戦闘結果表示モジュール

const STATUS_NAMES = {
  burn: '火計',
  paralyze: '麻痺',
  confusion: '混乱',
  provoke: '挑発',
  heal_block: '回復無効',
  double_attack: '連撃',
  counter_atk: '武力反撃',
  counter_paralyze: '麻痺反撃',
  pursuit: '追撃',
  regen: '持続回復',
};

const STAT_NAMES = {
  atk: '武力',
  def: '防御',
  strat: '計略',
  spd: '速度',
};

export class BattleViewer {
  constructor(resultEl, logEl) {
    this.resultEl = resultEl;
    this.logEl = logEl;
  }

  // 単戦結果を表示
  showSingleResult(result) {
    const winnerLabel = result.winner === 'army1' ? '攻撃側 勝利'
      : result.winner === 'army2' ? '防御側 勝利'
      : '引き分け';
    const winnerColor = result.winner === 'army1' ? 'log-army1'
      : result.winner === 'army2' ? 'log-army2' : '';

    this.resultEl.innerHTML = `
      <div class="result-summary">
        <div class="result-header">
          <div class="result-winner ${winnerColor}">${winnerLabel}</div>
          <div class="result-turns">${result.turns}ターンで決着</div>
        </div>
        <div class="result-armies">
          ${this._renderArmyResult('攻撃側', result.army1)}
          ${this._renderArmyResult('防御側', result.army2)}
        </div>
      </div>
    `;

    this._renderLog(result.log);
  }

  _renderArmyResult(label, units) {
    return `
      <div class="result-army">
        <h3>${label}</h3>
        ${units.map(u => this._renderUnitResult(u)).join('')}
      </div>
    `;
  }

  _renderUnitResult(u) {
    const total = u.maxSoldiers;
    const aliveW = (u.soldiers / total * 100).toFixed(1);
    const woundedW = (u.wounded / total * 100).toFixed(1);

    const posLabel = u.position === 'main' ? '主将' : u.position === 'sub1' ? '副将1' : '副将2';

    return `
      <div class="result-unit">
        <div class="result-unit-name">${posLabel} ${u.name}</div>
        <div class="result-unit-stats">
          <span>兵: ${u.soldiers.toLocaleString()} / ${u.maxSoldiers.toLocaleString()}</span>
          <span>負傷: ${u.wounded.toLocaleString()}</span>
          <span>死亡: ${u.dead.toLocaleString()}</span>
        </div>
        <div class="result-unit-stats">
          <span>与ダメ: ${u.stats.damageDealt.toLocaleString()}</span>
          <span>被ダメ: ${u.stats.damageTaken.toLocaleString()}</span>
          <span>回復: ${u.stats.healed.toLocaleString()}</span>
          <span>発動: ${u.stats.skillActivations}回</span>
        </div>
        <div class="hp-bar">
          <div class="hp-fill alive" style="width: ${aliveW}%; display: inline-block;"></div><div class="hp-fill wounded" style="width: ${woundedW}%; display: inline-block;"></div>
        </div>
      </div>
    `;
  }

  _renderLog(log) {
    this.logEl.innerHTML = log.map(entry => {
      switch (entry.type) {
        case 'phase':
          return `<div class="log-entry log-turn-marker">${entry.message}</div>`;
        case 'turn_start':
          return `<div class="log-entry log-turn-marker">── ターン${entry.turn} ──</div>`;
        case 'startup':
          return `<div class="log-entry">
            <span class="${entry.army === 'army1' ? 'log-army1' : 'log-army2'}">${entry.unit}</span>
            の始動スキル <span class="log-skill-name">${entry.skill}</span> が発動
            ${this._formatResults(entry.results)}
          </div>`;
        case 'skill':
          return `<div class="log-entry">
            <span class="${entry.army === 'army1' ? 'log-army1' : 'log-army2'}">${entry.unit}</span>
            が <span class="log-skill-name">${entry.skill}</span> を発動
            ${this._formatResults(entry.results)}
          </div>`;
        case 'attack':
          return `<div class="log-entry">
            <span class="${entry.army === 'army1' ? 'log-army1' : 'log-army2'}">${entry.unit}</span>
            の通常攻撃
            ${this._formatResults(entry.results)}
          </div>`;
        case 'double_attack':
          return `<div class="log-entry">
            <span class="${entry.army === 'army1' ? 'log-army1' : 'log-army2'}">${entry.unit}</span>
            の連撃
            ${this._formatResults(entry.results)}
          </div>`;
        case 'passive':
          return `<div class="log-entry">
            <span class="${entry.army === 'army1' ? 'log-army1' : 'log-army2'}">${entry.unit}</span>
            のパッシブ <span class="log-skill-name">${entry.skill}</span>
            ${this._formatResults(entry.results)}
          </div>`;
        case 'effect':
          return `<div class="log-entry">
            <span class="${entry.army === 'army1' ? 'log-army1' : 'log-army2'}">${entry.unit}</span>
            ${this._formatResults(entry.results)}
          </div>`;
        case 'paralyze':
          return `<div class="log-entry">
            <span class="${entry.army === 'army1' ? 'log-army1' : 'log-army2'}">${entry.unit}</span>
            は <span class="log-status">麻痺</span> で行動不能
          </div>`;
        case 'battle_end':
          return `<div class="log-entry log-turn-marker">── 戦闘終了 ──</div>`;
        default:
          return '';
      }
    }).join('');
  }

  _formatResults(results) {
    if (!results || results.length === 0) return '';
    return results.map(r => {
      switch (r.type) {
        case 'damage':
        case 'normal_attack':
          return `→ ${r.target} に <span class="log-damage">${r.amount.toLocaleString()}ダメージ</span>`;
        case 'heal':
        case 'regen_heal':
          return `→ ${r.target} を <span class="log-heal">${r.amount.toLocaleString()}回復</span>`;
        case 'buff':
          return `→ ${r.target} の <span class="log-buff">${STAT_NAMES[r.stat] || r.stat}+${r.value}(${r.duration}T)</span>`;
        case 'debuff':
          return `→ ${r.target} の <span class="log-debuff">${STAT_NAMES[r.stat] || r.stat}${r.value}(${r.duration}T)</span>`;
        case 'status':
          return `→ ${r.target} に <span class="log-status">${STATUS_NAMES[r.status] || r.status}(${r.duration}T)</span>`;
        case 'burn_damage':
          return `<span class="log-status">火計</span>で <span class="log-damage">${r.amount.toLocaleString()}ダメージ</span>`;
        case 'counter':
          return `→ ${r.source} が反撃 → ${r.target} に <span class="log-damage">${r.amount.toLocaleString()}</span>`;
        case 'counter_paralyze':
          return `→ ${r.source} が麻痺反撃 → ${r.target} が <span class="log-status">麻痺</span>`;
        case 'pursuit':
          return `→ ${r.source} の追撃 → ${r.target} に <span class="log-damage">${r.amount.toLocaleString()}</span>`;
        default:
          return '';
      }
    }).join('<br>');
  }

  // 100戦結果を表示
  showMultiResult(multiResult) {
    this.resultEl.innerHTML = `
      <div class="multi-result">
        <div class="result-header">
          <div class="result-winner">${multiResult.details.length}戦シミュレーション結果</div>
        </div>
        <div class="win-rate-bar">
          <div class="win-rate-segment win-rate-army1" style="width: ${multiResult.army1WinRate}%">
            ${multiResult.army1WinRate > 5 ? multiResult.army1WinRate + '%' : ''}
          </div>
          <div class="win-rate-segment win-rate-draw" style="width: ${multiResult.drawRate}%">
            ${multiResult.drawRate > 5 ? multiResult.drawRate + '%' : ''}
          </div>
          <div class="win-rate-segment win-rate-army2" style="width: ${multiResult.army2WinRate}%">
            ${multiResult.army2WinRate > 5 ? multiResult.army2WinRate + '%' : ''}
          </div>
        </div>
        <div class="multi-stats">
          <div>
            <div class="multi-stat-value log-army1">${multiResult.army1Wins}</div>
            <div class="multi-stat-label">攻撃側 勝利</div>
          </div>
          <div>
            <div class="multi-stat-value">${multiResult.draws}</div>
            <div class="multi-stat-label">引き分け</div>
          </div>
          <div>
            <div class="multi-stat-value log-army2">${multiResult.army2Wins}</div>
            <div class="multi-stat-label">防御側 勝利</div>
          </div>
        </div>
      </div>
    `;

    this.logEl.innerHTML = `<div class="log-entry" style="color: var(--text-muted);">
      100戦モードではログは省略されます。1戦モードでログを確認できます。
    </div>`;
  }

  // クリア
  clear() {
    this.resultEl.innerHTML = '';
    this.logEl.innerHTML = '';
  }
}
