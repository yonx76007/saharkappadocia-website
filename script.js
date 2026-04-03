/* ================================================
   SAHAR CAPPADOCIA — ADMIN SYSTEM
   script.js · Authentication + Dashboard Logic
   ================================================ */

'use strict';

/* ── Constants ──────────────────────────────── */
const AUTH_KEY = 'sahar_admin_auth';
const STORAGE_KEY = 'sahar_bookings';
const IS_LOGIN = document.querySelector('.login-page') !== null;
const IS_DASHBOARD = document.querySelector('.admin-layout') !== null;

/* ── Fake bookings dataset ──────────────────── */
const SEED_BOOKINGS = [
  { id:'SC-2847', guest:'Isabelle Mercier',   email:'isabelle.m@email.fr',    phone:'+33 6 12 34 56 78', package:'Dawn Balloon Voyage',              date:'2025-04-20', guests:2, status:'confirmed', amount:960,  nat:'French',  notes:'' },
  { id:'SC-2846', guest:'James & Priya Lawton',email:'j.lawton@gmail.com',    phone:'+44 7700 900123',   package:'Full Cappadocia Experience',        date:'2025-04-18', guests:4, status:'confirmed', amount:5600, nat:'British', notes:'Vegetarian meals required.' },
  { id:'SC-2845', guest:'Kenji Watanabe',      email:'k.watanabe@corp.jp',    phone:'+81 90 1234 5678',  package:'Luxury Cave Suite — 5 nights',     date:'2025-04-15', guests:2, status:'confirmed', amount:3800, nat:'Japanese',notes:'Honeymoon couple. Rose petals.' },
  { id:'SC-2844', guest:'Elena Fontaine',      email:'e.fontaine@mail.com',   phone:'+33 7 98 76 54 32', package:'Rose Valley at Twilight',           date:'2025-04-14', guests:1, status:'pending',   amount:340,  nat:'French',  notes:'' },
  { id:'SC-2843', guest:'Marco Bianchi',       email:'m.bianchi@gmail.it',    phone:'+39 340 123 4567',  package:'Private Valley Trek',               date:'2025-04-13', guests:3, status:'confirmed', amount:1020, nat:'Italian', notes:'Photography group.' },
  { id:'SC-2842', guest:'Aisha Al-Rashid',     email:'aisha.r@outlook.com',   phone:'+971 50 123 4567',  package:'Underground Kingdoms',              date:'2025-04-12', guests:2, status:'pending',   amount:440,  nat:'Emirati', notes:'' },
  { id:'SC-2841', guest:'Sophie Williams',     email:'s.williams@icloud.com', phone:'+1 310 555 0187',   package:'Dawn Balloon Voyage',               date:'2025-04-11', guests:2, status:'pending',   amount:960,  nat:'American',notes:'Anniversary surprise.' },
  { id:'SC-2840', guest:'Lena Müller',         email:'l.mueller@web.de',      phone:'+49 172 345 6789',  package:'Luxury Cave Suite — 3 nights',     date:'2025-04-10', guests:2, status:'confirmed', amount:2400, nat:'German',  notes:'' },
  { id:'SC-2839', guest:'Carlos Reyes',        email:'c.reyes@gmail.mx',      phone:'+52 55 1234 5678',  package:'Full Cappadocia Experience',        date:'2025-04-08', guests:2, status:'cancelled', amount:2800, nat:'Mexican', notes:'Cancelled by guest.' },
  { id:'SC-2838', guest:'Yuki Tanaka',         email:'y.tanaka@docomo.ne.jp', phone:'+81 80 9876 5432',  package:'Rose Valley at Twilight',           date:'2025-04-07', guests:2, status:'confirmed', amount:680,  nat:'Japanese',notes:'' },
  { id:'SC-2837', guest:'Fatima Al-Zahraa',    email:'fatima.z@mail.sa',      phone:'+966 55 234 5678',  package:'Underground Kingdoms',              date:'2025-04-05', guests:4, status:'confirmed', amount:880,  nat:'Saudi',   notes:'Family with children.' },
  { id:'SC-2836', guest:'Thomas Bergmann',     email:'t.bergmann@gmail.de',   phone:'+49 151 234 5678',  package:'Dawn Balloon Voyage',               date:'2025-04-04', guests:3, status:'confirmed', amount:1440, nat:'German',  notes:'' },
];

/* ── App State ──────────────────────────────── */
const state = {
  bookings: [],
  filter: 'all',
  search: '',
  sortField: 'date',
  sortDir: 'desc',
  page: 1,
  perPage: 8,
  sidebarCollapsed: false,
};

/* ================================================
   AUTH
   ================================================ */
function getAuth() {
  const raw = sessionStorage.getItem(AUTH_KEY) || localStorage.getItem(AUTH_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function setAuth(user, remember) {
  const data = JSON.stringify(user);
  sessionStorage.setItem(AUTH_KEY, data);
  if (remember) localStorage.setItem(AUTH_KEY, data);
}

function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(AUTH_KEY);
}

/* ── Redirect guards ── */
if (IS_LOGIN  && getAuth()) location.href = 'dashboard.html';
if (IS_DASHBOARD && !getAuth()) location.href = 'login.html';


/* ================================================
   LOGIN PAGE
   ================================================ */
if (IS_LOGIN) {
  const form     = document.getElementById('login-form');
  const errEl    = document.getElementById('login-error');
  const errText  = document.getElementById('error-text');
  const btn      = document.getElementById('login-btn');
  const eyeBtn   = document.getElementById('eye-toggle');
  const passInput= document.getElementById('password');

  /* Toggle password visibility */
  eyeBtn.addEventListener('click', () => {
    const show = passInput.type === 'password';
    passInput.type = show ? 'text' : 'password';
    eyeBtn.innerHTML = show
      ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
      : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });

  /* Form submit */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value;
    const rem   = document.getElementById('remember').checked;

    errEl.classList.remove('show');

    /* Basic validation */
    if (!email || !pass) {
      errText.textContent = 'Please fill in both fields.';
      errEl.classList.add('show');
      return;
    }
    if (!email.includes('@')) {
      errText.textContent = 'Please enter a valid email address.';
      errEl.classList.add('show');
      return;
    }
    if (pass.length < 4) {
      errText.textContent = 'Password must be at least 4 characters.';
      errEl.classList.add('show');
      return;
    }

    /* Simulate login */
    btn.classList.add('loading');
    setTimeout(() => {
      const nameFromEmail = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      setAuth({ name: nameFromEmail, email, role: 'Super Admin' }, rem);
      location.href = 'dashboard.html';
    }, 900);
  });
}


/* ================================================
   DASHBOARD
   ================================================ */
if (IS_DASHBOARD) {

  /* ── Init ── */
  const auth = getAuth();

  function init() {
    populateUserUI();
    setGreeting();
    loadBookings();
    renderStats();
    renderChart();
    renderActivity();
    renderTable();
    bindEvents();
    countUpStats();
    drawSparklines();
  }

  /* ── User UI ── */
  function populateUserUI() {
    const initials = auth.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const nameShort = auth.name.split(' ')[0];
    document.getElementById('sidebar-avatar-initials').textContent = initials;
    document.getElementById('sidebar-user-name').textContent = auth.name;
    document.getElementById('topnav-avatar-initials').textContent = initials;
    document.getElementById('topnav-user-name').textContent = nameShort;
    document.getElementById('greeting-name').textContent = nameShort;
  }

  function setGreeting() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    document.getElementById('greeting-eyebrow').textContent = greet;
    document.getElementById('today-date').textContent =
      new Date().toLocaleDateString('en-GB', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  }

  /* ── Bookings data ── */
  function loadBookings() {
    const stored = localStorage.getItem(STORAGE_KEY);
    state.bookings = stored ? JSON.parse(stored) : [...SEED_BOOKINGS];
    if (!stored) saveBookings();
  }

  function saveBookings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bookings));
  }

  function nextId() {
    const nums = state.bookings.map(b => parseInt(b.id.replace('SC-',''),10));
    return 'SC-' + (Math.max(...nums, 2847) + 1);
  }

  /* ── Stats ── */
  function renderStats() {
    const totalAmt = state.bookings.reduce((s,b) => s + b.amount, 0);
    // Update revenue card display with real total
    const revenueCard = document.querySelector('[data-count="486200"]');
    if (revenueCard) revenueCard.dataset.count = totalAmt;
    // Pending badge
    const pendingCount = state.bookings.filter(b => b.status === 'pending').length;
    const badge = document.getElementById('pending-badge');
    if (badge) badge.textContent = pendingCount;
  }

  /* ── Count-up animation ── */
  function countUpStats() {
    document.querySelectorAll('[data-count]').forEach(el => {
      const target  = parseInt(el.dataset.count, 10);
      const prefix  = el.dataset.prefix  || '';
      const isCurr  = el.dataset.format === 'currency';
      const dur     = 1600;
      const start   = performance.now();

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        const val  = Math.floor(ease * target);
        el.textContent = prefix + (isCurr ? formatCurrency(val) : val.toLocaleString());
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function formatCurrency(n) {
    if (n >= 1000) return (n/1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'K';
    return n.toString();
  }

  /* ── Sparklines ── */
  function drawSparklines() {
    const datasets = {
      bookings: [65,72,68,80,75,88,92],
      revenue:  [58,62,70,65,78,82,90],
      guests:   [40,45,50,44,58,62,68],
      pending:  [20,16,22,18,14,20,18],
    };
    const colors = {
      bookings: 'var(--gold)',
      revenue:  'var(--green)',
      guests:   'var(--blue)',
      pending:  'var(--amber)',
    };

    document.querySelectorAll('canvas[data-spark]').forEach(canvas => {
      const key  = canvas.dataset.spark;
      const data = datasets[key] || [];
      const W = canvas.offsetWidth || 100;
      const H = canvas.offsetHeight || 48;
      canvas.width  = W * window.devicePixelRatio;
      canvas.height = H * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;
      const step  = W / (data.length - 1);

      const pts = data.map((v,i) => ({
        x: i * step,
        y: H - ((v - min) / range) * (H - 6) - 3,
      }));

      /* Area fill */
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, key === 'bookings' ? 'rgba(201,168,76,0.35)' :
                           key === 'revenue'  ? 'rgba(76,184,125,0.35)' :
                           key === 'guests'   ? 'rgba(78,143,232,0.35)' :
                                               'rgba(232,164,40,0.35)');
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(pts[0].x, H);
      pts.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(pts[pts.length-1].x, H);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      /* Line */
      ctx.beginPath();
      pts.forEach((p,i) => i === 0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
      ctx.strokeStyle = colors[key];
      ctx.lineWidth   = 2;
      ctx.lineJoin    = 'round';
      ctx.lineCap     = 'round';
      ctx.stroke();
    });
  }

  /* ── Revenue chart (SVG) ── */
  function renderChart() {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const values = [8400, 12600, 9800, 15200, 18600, 24800, 21400];
    const svg = document.getElementById('revenue-chart');
    const W = 700, H = 180, PAD = { top:10, right:10, bottom:10, left:10 };
    const min = 0, max = Math.max(...values) * 1.1;
    const scaleX = i => PAD.left + (i / (values.length-1)) * (W - PAD.left - PAD.right);
    const scaleY = v => H - PAD.bottom - ((v - min) / (max - min)) * (H - PAD.top - PAD.bottom);

    const pts = values.map((v,i) => `${scaleX(i)},${scaleY(v)}`).join(' ');
    const area = `${scaleX(0)},${H-PAD.bottom} ${pts} ${scaleX(values.length-1)},${H-PAD.bottom}`;

    svg.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="rgba(201,168,76,0.4)"/>
          <stop offset="100%" stop-color="rgba(201,168,76,0)"/>
        </linearGradient>
      </defs>
      ${[1,2,3,4].map(i => {
        const y = scaleY(max / 4 * i);
        return `<line x1="${PAD.left}" y1="${y}" x2="${W-PAD.right}" y2="${y}" stroke="rgba(201,168,76,0.07)" stroke-width="1"/>`;
      }).join('')}
      <polygon points="${area}" fill="url(#chartGrad)"/>
      <polyline points="${pts}" fill="none" stroke="var(--gold)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${values.map((v,i) => `
        <circle cx="${scaleX(i)}" cy="${scaleY(v)}" r="4" fill="var(--bg-card)" stroke="var(--gold)" stroke-width="2"/>
      `).join('')}
    `;

    const labelWrap = document.getElementById('chart-labels');
    labelWrap.innerHTML = days.map(d => `<span>${d}</span>`).join('');
  }

  /* ── Activity feed ── */
  function renderActivity() {
    const items = [
      { color:'var(--green)', desc:'<strong>James Lawton</strong> confirmed booking <strong>#SC-2846</strong>', time:'2 min ago' },
      { color:'var(--gold)',  desc:'New booking request from <strong>Aisha Al-Rashid</strong>', time:'18 min ago' },
      { color:'var(--red)',   desc:'Booking <strong>#SC-2839</strong> was cancelled by guest', time:'1 hour ago' },
      { color:'var(--blue)',  desc:'<strong>Kenji Watanabe</strong> sent a special request message', time:'3 hours ago' },
      { color:'var(--amber)', desc:'Payment reminder sent for <strong>Elena Fontaine</strong>', time:'5 hours ago' },
      { color:'var(--green)', desc:'Review received from <strong>Isabelle Mercier</strong> — 5 stars', time:'Yesterday' },
    ];

    document.getElementById('activity-feed').innerHTML = items.map(item => `
      <div class="activity-item">
        <div class="activity-dot" style="background:${item.color}"></div>
        <div class="activity-text">
          <div class="activity-desc">${item.desc}</div>
          <div class="activity-time">${item.time}</div>
        </div>
      </div>
    `).join('');
  }

  /* ── Table ── */
  function getFilteredBookings() {
    let list = [...state.bookings];

    if (state.filter !== 'all') {
      list = list.filter(b => b.status === state.filter);
    }
    if (state.search) {
      const q = state.search.toLowerCase();
      list = list.filter(b =>
        b.guest.toLowerCase().includes(q)   ||
        b.id.toLowerCase().includes(q)      ||
        b.package.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q)
      );
    }

    /* Sort */
    list.sort((a, b) => {
      let va = a[state.sortField], vb = b[state.sortField];
      if (state.sortField === 'amount') { va = +va; vb = +vb; }
      if (state.sortField === 'guests') { va = +va; vb = +vb; }
      if (va < vb) return state.sortDir === 'asc' ? -1 : 1;
      if (va > vb) return state.sortDir === 'asc' ?  1 : -1;
      return 0;
    });

    return list;
  }

  function renderTable() {
    const list = getFilteredBookings();
    const total = list.length;
    const start = (state.page - 1) * state.perPage;
    const page  = list.slice(start, start + state.perPage);

    const tbody = document.getElementById('bookings-tbody');
    const empty = document.getElementById('empty-state');

    if (page.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      tbody.innerHTML = page.map((b, idx) => `
        <tr style="animation-delay:${idx * 0.04}s">
          <td class="td-id">${b.id}</td>
          <td>
            <div class="guest-cell">
              <div class="guest-avatar">${b.guest.split(' ').map(w=>w[0]).join('').slice(0,2)}</div>
              <div>
                <div class="guest-name">${b.guest}</div>
                <div class="guest-email">${b.email}</div>
              </div>
            </div>
          </td>
          <td class="truncate" style="max-width:180px" title="${b.package}">${b.package}</td>
          <td>${formatDate(b.date)}</td>
          <td style="text-align:center">${b.guests}</td>
          <td><span class="badge badge-${b.status}">${capitalize(b.status)}</span></td>
          <td class="td-amount">€${b.amount.toLocaleString()}</td>
          <td>
            <div class="row-actions">
              <div class="action-btn" title="View" onclick="viewBooking('${b.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </div>
              <div class="action-btn" title="Confirm" onclick="changeStatus('${b.id}', 'confirmed')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div class="action-btn delete" title="Delete" onclick="deleteBooking('${b.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              </div>
            </div>
          </td>
        </tr>
      `).join('');
    }

    /* Pagination */
    const totalPages = Math.max(1, Math.ceil(total / state.perPage));
    const pInfo = document.getElementById('pagination-info');
    pInfo.textContent = total === 0
      ? 'No results'
      : `Showing ${start+1}–${Math.min(start+state.perPage, total)} of ${total}`;

    const pCtrl = document.getElementById('pagination-controls');
    let btns = '';
    btns += `<button class="page-btn" onclick="goPage(${state.page-1})" ${state.page===1?'disabled':''}>‹</button>`;
    for (let i=1; i<=totalPages; i++) {
      btns += `<button class="page-btn ${i===state.page?'active':''}" onclick="goPage(${i})">${i}</button>`;
    }
    btns += `<button class="page-btn" onclick="goPage(${state.page+1})" ${state.page===totalPages?'disabled':''}>›</button>`;
    pCtrl.innerHTML = btns;

    /* Sort header highlights */
    document.querySelectorAll('thead th[data-sort]').forEach(th => {
      th.classList.toggle('sort-active', th.dataset.sort === state.sortField);
      const icon = th.querySelector('.sort-icon');
      if (icon) icon.textContent = th.dataset.sort !== state.sortField ? '↕' : state.sortDir === 'asc' ? '↑' : '↓';
    });
  }

  /* Pagination handler */
  window.goPage = function(p) {
    const total = getFilteredBookings().length;
    const pages = Math.ceil(total / state.perPage);
    if (p < 1 || p > pages) return;
    state.page = p;
    renderTable();
  };

  /* ── Booking actions ── */
  window.viewBooking = function(id) {
    const b = state.bookings.find(x => x.id === id);
    if (!b) return;
    showToast(`Viewing booking ${b.id} — ${b.guest}`, 'info');
  };

  window.changeStatus = function(id, status) {
    const b = state.bookings.find(x => x.id === id);
    if (!b) return;
    if (b.status === status) { showToast(`Already ${status}.`); return; }
    b.status = status;
    saveBookings();
    renderStats();
    renderTable();
    showToast(`Booking ${id} marked as ${status}.`, 'success');
  };

  window.deleteBooking = function(id) {
    if (!confirm(`Delete booking ${id}? This cannot be undone.`)) return;
    state.bookings = state.bookings.filter(b => b.id !== id);
    saveBookings();
    if ((state.page - 1) * state.perPage >= getFilteredBookings().length) {
      state.page = Math.max(1, state.page - 1);
    }
    renderStats();
    renderTable();
    showToast(`Booking ${id} deleted.`, 'success');
  };

  /* ── Modal ── */
  window.openModal = function() {
    document.getElementById('modal-overlay').classList.add('open');
    document.getElementById('f-date').min = new Date().toISOString().split('T')[0];
    document.body.style.overflow = 'hidden';
  };

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    document.getElementById('booking-form').reset();
    document.getElementById('f-amount-display').value = '';
    document.body.style.overflow = '';
  }

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-overlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* Auto-calculate amount */
  function recalcAmount() {
    const pkg    = document.getElementById('f-package');
    const guests = parseInt(document.getElementById('f-guests').value, 10) || 1;
    const opt    = pkg.options[pkg.selectedIndex];
    const price  = opt ? parseInt(opt.dataset.price || 0, 10) : 0;
    const total  = price * guests;
    document.getElementById('f-amount-display').value = total ? `€${total.toLocaleString()}` : '';
  }

  document.getElementById('f-package').addEventListener('change', recalcAmount);
  document.getElementById('f-guests').addEventListener('input', recalcAmount);

  /* Submit modal form */
  document.getElementById('modal-submit').addEventListener('click', () => {
    const name  = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const pkg   = document.getElementById('f-package').value;
    const date  = document.getElementById('f-date').value;
    const guests= parseInt(document.getElementById('f-guests').value, 10) || 1;

    if (!name || !email || !pkg || !date) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const opt    = document.getElementById('f-package').options[document.getElementById('f-package').selectedIndex];
    const price  = parseInt(opt?.dataset.price || 480, 10);
    const status = document.getElementById('f-status').value;

    const booking = {
      id: nextId(),
      guest:   name,
      email:   email,
      phone:   document.getElementById('f-phone').value.trim(),
      package: pkg,
      date,
      guests,
      status,
      amount:  price * guests,
      nat:     document.getElementById('f-nationality').value.trim(),
      notes:   document.getElementById('f-notes').value.trim(),
    };

    state.bookings.unshift(booking);
    saveBookings();
    state.page = 1;
    closeModal();
    renderStats();
    renderTable();
    countUpStats();
    showToast(`Booking ${booking.id} created for ${name}.`, 'success');
  });

  /* ── Export ── */
  window.exportData = function() {
    const list = getFilteredBookings();
    const headers = ['ID','Guest','Email','Package','Date','Guests','Status','Amount'];
    const rows = list.map(b => [b.id, b.guest, b.email, b.package, b.date, b.guests, b.status, b.amount]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `sahar-bookings-${Date.now()}.csv`;
    a.click();
    showToast('Bookings exported as CSV.', 'success');
  };

  /* ── Sidebar ── */
  document.getElementById('collapse-btn').addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    document.getElementById('sidebar').classList.toggle('collapsed', state.sidebarCollapsed);
    document.getElementById('main-wrap').classList.toggle('collapsed', state.sidebarCollapsed);
  });

  document.getElementById('menu-btn').addEventListener('click', () => {
    const sidebar  = document.getElementById('sidebar');
    const overlay  = document.getElementById('sidebar-overlay');
    const isOpen   = sidebar.classList.contains('mobile-open');
    sidebar.classList.toggle('mobile-open', !isOpen);
    overlay.classList.toggle('show', !isOpen);
  });

  document.getElementById('sidebar-overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebar-overlay').classList.remove('show');
  });

  /* Nav items */
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const page = item.dataset.page;
      if (page !== 'dashboard') showToast(`${capitalize(page)} — coming soon!`, 'info');
      /* Close mobile sidebar */
      document.getElementById('sidebar').classList.remove('mobile-open');
      document.getElementById('sidebar-overlay').classList.remove('show');
    });
  });

  /* ── User dropdown ── */
  document.getElementById('user-menu-btn').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('user-dropdown').classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('user-dropdown').classList.remove('open');
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    clearAuth();
    location.href = 'login.html';
  });

  /* ── Table filter/search/sort ── */
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.filter = tab.dataset.filter;
      state.page = 1;
      renderTable();
    });
  });

  let searchTimeout;
  document.getElementById('table-search').addEventListener('input', e => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      state.search = e.target.value;
      state.page = 1;
      renderTable();
    }, 250);
  });

  document.getElementById('global-search').addEventListener('input', e => {
    state.search = e.target.value;
    state.page = 1;
    /* Switch to bookings tab if not already */
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.filter-tab[data-filter="all"]').classList.add('active');
    state.filter = 'all';
    document.getElementById('table-search').value = state.search;
    renderTable();
  });

  document.querySelectorAll('thead th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      if (state.sortField === th.dataset.sort) {
        state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortField = th.dataset.sort;
        state.sortDir = 'asc';
      }
      renderTable();
    });
  });

  /* ── Boot ── */
  init();

} /* end IS_DASHBOARD */


/* ================================================
   TOAST NOTIFICATIONS
   ================================================ */
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('leaving');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
};


/* ================================================
   HELPERS
   ================================================ */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
