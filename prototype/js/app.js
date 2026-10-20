/**
 * GokKalkan Mobile Prototype Application Controller
 * High-precision interactions: Sliding Pill Navbar, 24h Risk Scrubber,
 * Circular Theme Wipe, 4 SVG Arc Gauges, Drawers & Live Modals.
 * SIFIR EMOJİ KURALI: Tüm UI elemanları GokIcons SVG vektörleri ile render edilir.
 */

document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initTheme();
  initNavigation();
  initScrubber();
  initArcGauges();
  initDailyForecast();
  initAlertsAndSwitches();
  initDrawers();
  initDesktopToolbar();
  initMapEngine();
});

/**
 * 1. ICON INJECTION HELPER
 * Replaces any element with data-icon="name" with clean vector SVG.
 */
function initIcons() {
  document.querySelectorAll('[data-icon]').forEach(el => {
    const iconName = el.getAttribute('data-icon');
    const size = parseInt(el.getAttribute('data-size') || '20', 10);
    const cls = el.getAttribute('data-class') || '';
    if (window.GokIcons && window.GokIcons[iconName]) {
      el.innerHTML = window.GokIcons[iconName](cls, size);
    }
  });
}

/**
 * 2. CIRCULAR THEME WIPE CONTROLLER
 * Smooth expanding circle transition based on click coordinates.
 */
function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const wipeOverlay = document.getElementById('themeWipeOverlay');
  const currentTheme = localStorage.getItem('gok_theme') || 'light';
  
  document.documentElement.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', (e) => {
      const rect = themeBtn.getBoundingClientRect();
      const clickX = e.clientX || (rect.left + rect.width / 2);
      const clickY = e.clientY || (rect.top + rect.height / 2);

      const oldTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = oldTheme === 'dark' ? 'light' : 'dark';

      if (wipeOverlay) {
        wipeOverlay.style.setProperty('--wipe-x', `${clickX}px`);
        wipeOverlay.style.setProperty('--wipe-y', `${clickY}px`);
        wipeOverlay.classList.add('active');

        setTimeout(() => {
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('gok_theme', newTheme);
          updateThemeIcon(newTheme);
        }, 220);

        setTimeout(() => {
          wipeOverlay.classList.remove('active');
        }, 580);
      } else {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('gok_theme', newTheme);
        updateThemeIcon(newTheme);
      }
    });
  }
}

function updateThemeIcon(theme) {
  const iconSpan = document.getElementById('themeToggleIcon');
  if (iconSpan && window.GokIcons) {
    iconSpan.innerHTML = theme === 'dark' 
      ? window.GokIcons.sun('', 19) 
      : window.GokIcons.moon('', 19);
  }
}

/**
 * 3. FLOATING NAVBAR & SLIDING PILL INDICATOR
 */
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const slidingPill = document.querySelector('.nav-sliding-pill');
  const tabViews = document.querySelectorAll('.tab-view');

  function updateSlidingPill(activeBtn) {
    if (!slidingPill || !activeBtn) return;
    const parentRect = activeBtn.parentElement.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    const leftOffset = btnRect.left - parentRect.left;
    slidingPill.style.transform = `translateX(${leftOffset}px)`;
    slidingPill.style.width = `${btnRect.width}px`;
  }

  function switchTab(tabId) {
    navItems.forEach(item => {
      const isTarget = item.getAttribute('data-tab') === tabId;
      item.classList.toggle('active', isTarget);
      if (isTarget) updateSlidingPill(item);
    });

    tabViews.forEach(view => {
      view.classList.toggle('active', view.id === `tab-${tabId}`);
    });

    // Special: init or resize map when switching to map tab
    if (tabId === 'harita' && window.gokMapInstance) {
      setTimeout(() => window.gokMapInstance.initCanvasSize(), 50);
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Action links from other cards (e.g. "Harita", "7 Günü Gör")
  document.querySelectorAll('[data-nav-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-nav-target');
      switchTab(target);
    });
  });

  // Initial tab resolution (from URL hash, parameter, or page filename)
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.replace('#', '').toLowerCase();
  let targetTab = 'bugun';

  if (hash && document.getElementById(`tab-${hash}`)) {
    targetTab = hash;
  } else if (path.includes('harita')) {
    targetTab = 'harita';
  } else if (path.includes('uyarilar')) {
    targetTab = 'uyarilar';
  } else if (path.includes('yedi-gun')) {
    targetTab = 'yedi-gun';
  } else if (path.includes('ayarlar')) {
    targetTab = 'ayarlar';
  }

  const initialActive = document.querySelector(`.nav-item[data-tab="${targetTab}"]`) || navItems[0];
  if (initialActive) {
    switchTab(targetTab);
    setTimeout(() => updateSlidingPill(initialActive), 80);
  }

  window.addEventListener('resize', () => {
    const active = document.querySelector('.nav-item.active');
    if (active) updateSlidingPill(active);
  });
}

/**
 * 4. 24-HOUR LIVE INTERACTIVE SCRUBBER
 * Hover/drag updates Hero temp, condition and Arc Gauges live.
 */
function initScrubber() {
  const trackWrapper = document.getElementById('scrubberBarsWrapper');
  const activePill = document.getElementById('scrubberActivePill');
  if (!trackWrapper || !window.GokData) return;

  const hours = window.GokData.hourly;
  trackWrapper.innerHTML = '';

  hours.forEach((item, index) => {
    const hourEl = document.createElement('div');
    hourEl.className = `scrubber-hour-item ${index === 10 ? 'active' : ''}`;
    hourEl.setAttribute('data-index', index);

    let riskClass = '';
    if (item.risk === 'caution') riskClass = 'risk-caution';
    else if (item.risk === 'warn') riskClass = 'risk-warn';

    const barHeightPercent = Math.max(18, Math.min(95, item.riskVal * 2.5 + 15));

    hourEl.innerHTML = `
      <div class="scrubber-bar">
        <div class="scrubber-bar-fill ${riskClass}" style="height: ${barHeightPercent}%;"></div>
      </div>
      <span class="scrubber-hour-label">${item.hour}</span>
    `;

    hourEl.addEventListener('mouseenter', () => selectScrubberHour(index));
    hourEl.addEventListener('click', () => selectScrubberHour(index));

    trackWrapper.appendChild(hourEl);
  });

  // Pointer scrub drag support
  const trackContainer = document.querySelector('.scrubber-track-container');
  if (trackContainer) {
    trackContainer.addEventListener('pointermove', (e) => {
      if (e.buttons === 1 || e.pointerType === 'touch') {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const hourItem = el?.closest('.scrubber-hour-item');
        if (hourItem) {
          const idx = parseInt(hourItem.getAttribute('data-index'), 10);
          selectScrubberHour(idx);
        }
      }
    });
  }

  // Auto select 10:00 AM (default now)
  selectScrubberHour(10);
}

function selectScrubberHour(index) {
  const data = window.GokData.hourly[index];
  if (!data) return;

  // Update active item in DOM
  document.querySelectorAll('.scrubber-hour-item').forEach((el, idx) => {
    el.classList.toggle('active', idx === index);
  });

  // Update Scrubber Header Pill
  const pill = document.getElementById('scrubberActivePill');
  if (pill) {
    pill.innerHTML = `${data.hour} · ${data.temp}° · ${data.condition}`;
  }

  // Update Hero Temperature & Condition
  const heroTemp = document.getElementById('heroTemp');
  const heroCond = document.getElementById('heroCondition');
  if (heroTemp) heroTemp.textContent = data.temp;
  if (heroCond) heroCond.textContent = data.condition;

  // Update Gauges
  updateArcGauges(data.rain, data.wind, data.hail, data.fire);
}

/**
 * 5. 4 SVG ARC GAUGES CONTROLLER
 * Circumference math for smooth SVG stroke-dashoffset animation.
 */
function initArcGauges() {
  // Initial draw with default data
  updateArcGauges(0, 10, 0, 25);
}

function updateArcGauges(rain, wind, hail, fire) {
  // SVG semicircle radius is 28, arc path length is exactly pi * 28 ~= 88px
  const fullDash = 88;

  // 1. Rain (% 0 - 100)
  const rainOffset = fullDash - (rain / 100) * fullDash;
  const rainArc = document.getElementById('arcValRain');
  const rainText = document.getElementById('valRainText');
  if (rainArc) rainArc.style.strokeDashoffset = rainOffset;
  if (rainText) rainText.textContent = `%${rain}`;

  // 2. Wind (0 - 50 km/h)
  const windPercent = Math.min(100, (wind / 50) * 100);
  const windOffset = fullDash - (windPercent / 100) * fullDash;
  const windArc = document.getElementById('arcValWind');
  const windText = document.getElementById('valWindText');
  if (windArc) windArc.style.strokeDashoffset = windOffset;
  if (windText) windText.textContent = `${wind}`;

  // 3. Hail & Lightning (% 0 - 100)
  const hailOffset = fullDash - (hail / 100) * fullDash;
  const hailArc = document.getElementById('arcValHail');
  const hailText = document.getElementById('valHailText');
  if (hailArc) hailArc.style.strokeDashoffset = hailOffset;
  if (hailText) hailText.textContent = `%${hail}`;

  // 4. Fire Risk (0 - 100)
  const fireOffset = fullDash - (fire / 100) * fullDash;
  const fireArc = document.getElementById('arcValFire');
  const fireText = document.getElementById('valFireText');
  if (fireArc) fireArc.style.strokeDashoffset = fireOffset;
  if (fireText) fireText.textContent = `${fire}`;
}

/**
 * 6. 7-DAY FORECAST & APPLE WEATHER RANGE BARS
 */
function initDailyForecast() {
  const container = document.getElementById('dailyForecastContainer');
  if (!container || !window.GokData) return;

  const days = window.GokData.daily;
  // Calculate global min/max for proportion
  let globalMin = 99;
  let globalMax = -99;
  days.forEach(d => {
    if (d.min < globalMin) globalMin = d.min;
    if (d.max > globalMax) globalMax = d.max;
  });

  const rangeSpan = globalMax - globalMin || 1;

  container.innerHTML = '';
  days.forEach((day, idx) => {
    const card = document.createElement('div');
    card.className = 'daily-row-card';

    // Range bar calculations
    const leftPercent = ((day.min - globalMin) / rangeSpan) * 100;
    const widthPercent = Math.max(14, ((day.max - day.min) / rangeSpan) * 100);

    // Current temp dot on Today's card
    const isToday = idx === 0;
    const currentTemp = window.GokData.currentLocation.currentTemp;
    const dotPosPercent = Math.max(5, Math.min(95, ((currentTemp - day.min) / (day.max - day.min)) * 100));

    const iconSvg = window.GokIcons[day.icon] ? window.GokIcons[day.icon]('', 22) : '';

    // Hourly snippet inside expanded card
    let hourlyHtml = '';
    if (day.hourlySnippet) {
      hourlyHtml = day.hourlySnippet.map(h => {
        const hIcon = window.GokIcons[h.icon] ? window.GokIcons[h.icon]('', 18) : '';
        return `
          <div class="daily-hour-cell">
            <span style="color:var(--text-muted);">${h.time}</span>
            <div>${hIcon}</div>
            <span style="font-weight:600;">${h.temp}°</span>
          </div>
        `;
      }).join('');
    }

    card.innerHTML = `
      <div class="daily-row-main">
        <div class="daily-day-label">
          <div>${day.day}</div>
          <div class="daily-date-sub">${day.date}</div>
        </div>

        <div class="daily-icon-col">
          ${iconSvg}
          ${day.rainProb > 0 ? `<span class="daily-rain-prob">%${day.rainProb}</span>` : ''}
        </div>

        <div class="daily-range-container">
          <span class="daily-temp-low">${day.min}°</span>
          <div class="daily-range-bar-track">
            <div class="daily-range-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
            ${isToday ? `<div class="daily-current-dot" style="left: ${leftPercent + (widthPercent * dotPosPercent / 100)}%;"></div>` : ''}
          </div>
          <span class="daily-temp-high">${day.max}°</span>
        </div>
      </div>

      <div class="daily-expanded-content">
        <div style="display:flex; justify-content:space-around; width:100%;">
          ${hourlyHtml}
        </div>
      </div>

      <div class="daily-meta-badges">
        <span class="daily-badge-chip">
          ${window.GokIcons.wheat ? window.GokIcons.wheat('', 12) : ''}
          ${day.agroStatus}
        </span>
        <span class="daily-badge-chip">
          ${window.GokIcons.anchor ? window.GokIcons.anchor('', 12) : ''}
          ${day.marineStatus}
        </span>
        <span class="daily-badge-chip">
          ${window.GokIcons.wind ? window.GokIcons.wind('', 12) : ''}
          ${day.wind}
        </span>
      </div>
    `;

    card.addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    container.appendChild(card);
  });
}

/**
 * 7. ALERTS & IOS TOGGLE SWITCHES
 */
function initAlertsAndSwitches() {
  const list = document.getElementById('alertRulesList');
  if (!list || !window.GokData) return;

  const rules = window.GokData.alertRules;
  list.innerHTML = '';

  rules.forEach(rule => {
    const card = document.createElement('div');
    card.className = 'alert-rule-card';
    card.innerHTML = `
      <div class="alert-rule-info">
        <div class="alert-rule-title">${rule.title}</div>
        <div class="alert-rule-desc">${rule.desc}</div>
        <div class="alert-rule-threshold">
          ${window.GokIcons.sliders ? window.GokIcons.sliders('', 12) : ''}
          Eşik: ${rule.threshold}
        </div>
      </div>
      <label class="ios-switch">
        <input type="checkbox" ${rule.active ? 'checked' : ''} data-rule-id="${rule.id}">
        <span class="ios-switch-slider"></span>
      </label>
    `;

    const checkbox = card.querySelector('input');
    checkbox.addEventListener('change', () => {
      rule.active = checkbox.checked;
      showToast(`${rule.title}: ${rule.active ? 'Aktif kılındı' : 'Kapatıldı'}`);
    });

    list.appendChild(card);
  });

  // Render past notification logs
  const logsContainer = document.getElementById('notifLogsList');
  if (logsContainer && window.GokData.notificationLogs) {
    logsContainer.innerHTML = window.GokData.notificationLogs.map(log => {
      const icon = window.GokIcons[log.icon] ? window.GokIcons[log.icon]('', 18) : '';
      return `
        <div class="notif-log-item">
          <div class="notif-log-icon ${log.severity}">
            ${icon}
          </div>
          <div class="notif-log-content">
            <div class="notif-log-top">
              <span class="notif-log-title">${log.title}</span>
              <span class="notif-log-time">${log.time}</span>
            </div>
            <div class="notif-log-body">${log.body}</div>
          </div>
        </div>
      `;
    }).join('');
  }
}

/**
 * 8. IOS BOTTOM SHEET DRAWERS & MODALS
 */
function initDrawers() {
  const backdrop = document.getElementById('drawerBackdrop');
  const sheet = document.getElementById('drawerSheet');
  const titleEl = document.getElementById('drawerTitle');
  const bodyEl = document.getElementById('drawerBody');
  const closeBtn = document.getElementById('drawerCloseBtn');

  function openDrawer(title, htmlContent) {
    if (!sheet || !backdrop) return;
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = htmlContent;
    initIcons(); // re-run icon injection for new dynamic content
    backdrop.classList.add('active');
    sheet.classList.add('active');
  }

  function closeDrawer() {
    if (!sheet || !backdrop) return;
    backdrop.classList.remove('active');
    sheet.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // Trigger: Tarlam
  const agroCard = document.getElementById('triggerAgroDrawer');
  if (agroCard) {
    agroCard.addEventListener('click', () => {
      const a = window.GokData.agriculture;
      const content = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--sentinel-bg); border:1px solid var(--sentinel-border); border-radius:18px; padding:14px;">
            <div style="font-size:11px; font-weight:700; color:var(--sentinel-text); text-transform:uppercase;">${a.locationName}</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-primary); margin-top:2px;">${a.riskStatus} - Tarımsal Şartlar Mükemmel</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">Toprak Nemi</div>
              <div style="font-size:22px; font-weight:700; color:var(--text-primary);">${a.soilMoisture}</div>
              <div style="font-size:10px; color:#10b981;">${a.soilMoistureStatus}</div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">Zirai Don Riski</div>
              <div style="font-size:22px; font-weight:700; color:#10b981;">${a.frostRisk}</div>
              <div style="font-size:10px; color:var(--text-secondary);">${a.frostRiskStatus}</div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">İlaçlama Uygunluğu</div>
              <div style="font-size:18px; font-weight:700; color:var(--accent-blue);">${a.sprayingSuitability}</div>
              <div style="font-size:10px; color:var(--text-secondary);">${a.sprayingDetail}</div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">Toprak Sıcaklığı</div>
              <div style="font-size:22px; font-weight:700; color:var(--text-primary);">${a.soilTemp}</div>
              <div style="font-size:10px; color:var(--text-secondary);">Buharlaşma: ${a.evapotranspiration}</div>
            </div>
          </div>

          <div style="background:var(--bg-secondary); border-radius:16px; padding:14px; font-size:12.5px; line-height:1.45; color:var(--text-secondary);">
            <strong style="color:var(--text-primary); display:block; margin-bottom:4px;">Zirai Tavsiye:</strong>
            ${a.recommendation}
          </div>
        </div>
      `;
      openDrawer("Tarlam (Zirai İzleme)", content);
    });
  }

  // Trigger: Denizde
  const marineCard = document.getElementById('triggerMarineDrawer');
  if (marineCard) {
    marineCard.addEventListener('click', () => {
      const m = window.GokData.marine;
      const content = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:rgba(2,132,199,0.12); border:1px solid rgba(2,132,199,0.3); border-radius:18px; padding:14px;">
            <div style="font-size:11px; font-weight:700; color:var(--accent-blue); text-transform:uppercase;">${m.locationName}</div>
            <div style="font-size:16px; font-weight:700; color:var(--text-primary); margin-top:2px;">Seyir Durumu: ${m.suitability}</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">Dalga Boyu & Periyot</div>
              <div style="font-size:20px; font-weight:700; color:var(--accent-blue);">${m.waveHeight}</div>
              <div style="font-size:10px; color:var(--text-secondary);">${m.wavePeriod} periyot</div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">Su Sıcaklığı</div>
              <div style="font-size:20px; font-weight:700; color:var(--text-primary);">${m.seaTemperature}</div>
              <div style="font-size:10px; color:#10b981;">Berraklık: ${m.waterClarity}</div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">Rüzgar Hamlesi</div>
              <div style="font-size:20px; font-weight:700; color:var(--text-primary);">${m.windGust}</div>
              <div style="font-size:10px; color:var(--text-secondary);">Gel-Git: ${m.tideStatus}</div>
            </div>

            <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:12px; text-align:center;">
              <div style="font-size:11px; color:var(--text-muted);">Boğaz Akıntısı</div>
              <div style="font-size:15px; font-weight:700; color:var(--text-primary);">${m.currentSpeed}</div>
              <div style="font-size:10px; color:#10b981;">Güvenli Geçiş</div>
            </div>
          </div>

          <div style="background:var(--bg-secondary); border-radius:16px; padding:14px; font-size:12.5px; line-height:1.45; color:var(--text-secondary);">
            <strong style="color:var(--text-primary); display:block; margin-bottom:4px;">Kaptan Notu:</strong>
            ${m.boatingAdvice}
          </div>
        </div>
      `;
      openDrawer("Denizde (Seyir ve Dalga)", content);
    });
  }

  // Trigger: Seismic Alert Setup
  const seismicBtn = document.getElementById('triggerSeismicModal');
  if (seismicBtn) {
    seismicBtn.addEventListener('click', () => {
      const eq = window.GokData.earthquake;
      const content = `
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="background:var(--seismic-bg); border:1px solid var(--seismic-border); border-radius:18px; padding:14px;">
            <div style="font-size:11px; font-weight:700; color:var(--seismic-accent); text-transform:uppercase;">Son Kayıt Edilen Deprem</div>
            <div style="font-size:22px; font-weight:800; color:var(--seismic-accent); margin-top:4px;">M ${eq.magnitude} - ${eq.location}</div>
            <div style="font-size:12px; color:var(--text-secondary); margin-top:2px;">Mesafe: ${eq.distance} · Derinlik: ${eq.depth} · ${eq.agency}</div>
          </div>

          <div style="font-size:13px; font-weight:600; color:var(--text-primary);">Sismik Erken Uyarı Parametreleri</div>
          
          <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:14px; font-weight:600;">Sesli Siren (Sesli Düdük)</div>
              <div style="font-size:11px; color:var(--text-muted);">M 3.5 üzeri yakın sarsıntılarda sessiz modu del</div>
            </div>
            <label class="ios-switch">
              <input type="checkbox" checked>
              <span class="ios-switch-slider"></span>
            </label>
          </div>

          <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:16px; padding:14px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:14px; font-weight:600;">Alarm Mesafe Yarıçapı</div>
              <div style="font-size:11px; color:var(--text-muted);">Çanakkale merkezli 150 km alan</div>
            </div>
            <span style="font-weight:700; font-size:13px; color:var(--accent-blue);">150 km</span>
          </div>

          <button onclick="window.closeGokDrawer()" style="width:100%; padding:12px; background:var(--text-primary); color:var(--bg-card-solid); border:none; border-radius:14px; font-size:13.5px; font-weight:700; cursor:pointer;">
            Ayarları Kaydet
          </button>
        </div>
      `;
      openDrawer("Deprem Erken Uyarı Sistemi", content);
    });
  }

  // Trigger: Share Modal
  document.querySelectorAll('[data-action="share"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const loc = window.GokData.currentLocation;
      const content = `
        <div style="text-align:center; padding:10px 0;">
          <div style="font-size:18px; font-weight:700; color:var(--text-primary);">${loc.display}</div>
          <div style="font-size:32px; font-weight:300; margin:10px 0;">${loc.currentTemp}° · ${loc.condition}</div>
          <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:20px;">
            "Bugün Barbaros'ta hava sakin ve açık. Rüzgar 2 km/sa KD, nem %96. Gökkalkan nöbette, risk yok!"
          </p>
          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
            <button onclick="window.shareFeedback('WhatsApp')" style="padding:12px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-glass); font-size:12px; font-weight:600; cursor:pointer;">WhatsApp</button>
            <button onclick="window.shareFeedback('Instagram')" style="padding:12px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-glass); font-size:12px; font-weight:600; cursor:pointer;">Hikaye</button>
            <button onclick="window.shareFeedback('Panoya')" style="padding:12px; border-radius:14px; background:var(--bg-card); border:1px solid var(--border-glass); font-size:12px; font-weight:600; cursor:pointer;">Bağlantıyı Kopyala</button>
          </div>
        </div>
      `;
      openDrawer("Hava Durumunu Paylaş", content);
    });
  });

  // Global drawer closure helper
  window.closeGokDrawer = closeDrawer;
  window.shareFeedback = (platform) => {
    closeDrawer();
    showToast(`${platform} ile paylaşıldı!`);
  };
}

/**
 * 9. TOAST NOTIFICATION HELPER
 */
function showToast(message) {
  let toast = document.getElementById('gokToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'gokToast';
    toast.style.cssText = `
      position: fixed;
      top: 50px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(18, 24, 38, 0.9);
      color: #ffffff;
      padding: 9px 18px;
      border-radius: 9999px;
      font-size: 12.5px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.2);
      z-index: 99999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
  }, 2200);
}

/**
 * 10. DESKTOP PREVIEW TOOLBAR (Mockup frame vs Fullscreen mode)
 */
function initDesktopToolbar() {
  const toggleFrameBtn = document.getElementById('toggleFrameBtn');
  const mockupWrapper = document.getElementById('mockupWrapper');

  if (toggleFrameBtn && mockupWrapper) {
    toggleFrameBtn.addEventListener('click', () => {
      mockupWrapper.classList.toggle('fullscreen-mode');
      const isFullscreen = mockupWrapper.classList.contains('fullscreen-mode');
      toggleFrameBtn.querySelector('.toolbar-lbl').textContent = isFullscreen ? 'Cihaz Çerçevesine Dön' : 'Tam Ekran Görünüm';
      if (window.gokMapInstance) {
        setTimeout(() => window.gokMapInstance.initCanvasSize(), 300);
      }
    });
  }
}

/**
 * 11. MAP ENGINE INITIALIZATION
 */
function initMapEngine() {
  if (window.GokMapEngine && document.getElementById('radarMapCanvas')) {
    window.gokMapInstance = new GokMapEngine('radarMapCanvas');

    // Layer chips
    document.querySelectorAll('.layer-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.layer-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const layer = chip.getAttribute('data-layer');
        window.gokMapInstance.setLayer(layer);
      });
    });

    // Timeline Slider
    const slider = document.getElementById('mapTimelineSlider');
    if (slider) {
      slider.addEventListener('input', (e) => {
        window.gokMapInstance.setTimelineStep(e.target.value);
      });
    }

    // Play/Pause button
    const playBtn = document.getElementById('mapPlayPauseBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        const isPlaying = window.gokMapInstance.togglePlay();
        playBtn.innerHTML = isPlaying 
          ? window.GokIcons.pause('', 18) 
          : window.GokIcons.play('', 18);
      });
    }

    // Zoom controls
    const zoomIn = document.getElementById('mapZoomIn');
    const zoomOut = document.getElementById('mapZoomOut');
    const resetCenter = document.getElementById('mapResetCenter');

    if (zoomIn) zoomIn.addEventListener('click', () => window.gokMapInstance.adjustZoom(0.2));
    if (zoomOut) zoomOut.addEventListener('click', () => window.gokMapInstance.adjustZoom(-0.2));
    if (resetCenter) resetCenter.addEventListener('click', () => window.gokMapInstance.resetCenter());
  }
}
