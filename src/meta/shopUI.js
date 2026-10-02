// DOM for the shop overlay. Kept apart from the save/purchase logic in shop.js
// so this file only ever deals with rendering and click handling.

let shopTab = 'powerups';

// Renders the coin balance, the active tab's rows, and the affordability of
// every button. Cheap enough to call after each purchase.
function renderShop() {
  const goldLabel = document.getElementById('shop-gold');
  if (goldLabel) goldLabel.textContent = getGold();

  for (const tab of document.querySelectorAll('#shop-tabs .shop-tab')) {
    tab.classList.toggle('active', tab.dataset.tab === shopTab);
  }

  const list = document.getElementById('shop-list');
  if (!list) return;

  if (shopTab === 'powerups') {
    list.innerHTML = SHOP_POWERUPS.map((entry) => {
      const owned = isPowerupOwned(entry.id);
      const affordable = !owned && getGold() >= entry.cost;
      const kindLabel = entry.kind === 'weapon' ? 'Weapon' : 'Passive';
      const stateClass = owned ? 'owned' : (affordable ? 'affordable' : 'locked');
      const action = owned
        ? '<span class="shop-owned-tag">OWNED</span>'
        : `<button class="shop-buy" data-buy-powerup="${entry.id}" ${affordable ? '' : 'disabled'}>`
          + `<span class="shop-cost">🪙 ${entry.cost}</span>BUY</button>`;
      return `
        <div class="shop-row ${stateClass}">
          <span class="shop-icon">${entry.icon}</span>
          <span class="shop-text">
            <span class="shop-name">${entry.name} <em>${kindLabel}</em></span>
            <span class="shop-desc">${entry.desc}</span>
          </span>
          ${action}
        </div>`;
    }).join('');
    return;
  }

  list.innerHTML = SHOP_RELICS.map((relic) => {
    const level = getRelicLevel(relic.id);
    const maxed = isMaxedRelic(relic.id);
    const cost = getRelicCost(relic.id);
    const affordable = !maxed && getGold() >= cost;
    const pips = Array.from({ length: relic.maxLevel }, (_, i) =>
      `<span class="shop-pip${i < level ? ' on' : ''}"></span>`).join('');
    const action = maxed
      ? '<span class="shop-owned-tag">MAXED</span>'
      : `<button class="shop-buy" data-buy-relic="${relic.id}" ${affordable ? '' : 'disabled'}>`
        + `<span class="shop-cost">🪙 ${cost}</span>BUY</button>`;
    return `
      <div class="shop-row ${maxed ? 'owned' : (affordable ? 'affordable' : 'locked')}">
        <span class="shop-icon">${relic.icon}</span>
        <span class="shop-text">
          <span class="shop-name">${relic.name} <em>Lv ${level}/${relic.maxLevel}</em></span>
          <span class="shop-desc">${relic.desc}</span>
          <span class="shop-pips">${pips}</span>
        </span>
        ${action}
      </div>`;
  }).join('');
}

function openShop() {
  audio.init();
  renderShop();
  document.getElementById('start-screen').style.display = 'none';
  document.getElementById('shop-panel').classList.add('show');
}

function closeShop() {
  document.getElementById('shop-panel').classList.remove('show');
  document.getElementById('start-screen').style.display = 'flex';
}

document.getElementById('menu-shop').addEventListener('click', openShop);

document.getElementById('shop-back-btn').addEventListener('click', closeShop);

document.getElementById('shop-tabs').addEventListener('click', (event) => {
  const tab = event.target.closest('.shop-tab');
  if (!tab) return;
  shopTab = tab.dataset.tab;
  renderShop();
});

// One delegated listener covers both tabs' BUY buttons, including rows that
// were just re-rendered.
document.getElementById('shop-list').addEventListener('click', (event) => {
  const button = event.target.closest('.shop-buy');
  if (!button || button.disabled) return;

  if (button.dataset.buyPowerup) {
    const entry = findShopPowerup(button.dataset.buyPowerup);
    if (buyPowerup(button.dataset.buyPowerup) && entry) audio.play('levelup');
  } else if (button.dataset.buyRelic) {
    if (buyRelic(button.dataset.buyRelic)) audio.play('levelup');
  }
  renderShop();
});

document.getElementById('shop-reset-btn').addEventListener('click', () => {
  if (!confirm('Reforge the shrine? All relics and power-ups are lost. Your gold is kept.')) return;
  resetPurchases();
  renderShop();
});
