/* ============================================================
   PIPE CHEM — Admin Panel JavaScript
   ============================================================ */

const ADMIN_EMAIL = 'admin@pipechem.com';
const ADMIN_PW    = 'admin123';

let allUsers = [];
let allInquiries = [];
let allAppointments = [];
let allContacts = [];

// ── Admin Login ──
function adminLogin() {
  const email = document.getElementById('admin-email-input').value.trim();
  const pw    = document.getElementById('admin-pw-input').value;
  const errEl = document.getElementById('admin-login-error');

  if (email !== ADMIN_EMAIL || pw !== ADMIN_PW) {
    errEl.textContent = '⚠️ Invalid credentials. Please check email and password.';
    errEl.classList.add('show');
    return;
  }

  sessionStorage.setItem('pipechem_admin', 'true');
  document.getElementById('admin-login-gate').style.display = 'none';
  document.getElementById('admin-shell').classList.add('visible');
  initAdmin();
}

// Enter key support
document.getElementById('admin-pw-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') adminLogin();
});

// Check if already logged in
if (sessionStorage.getItem('pipechem_admin') === 'true') {
  document.getElementById('admin-login-gate').style.display = 'none';
  document.getElementById('admin-shell').classList.add('visible');
  initAdmin();
}

function adminLogout() {
  sessionStorage.removeItem('pipechem_admin');
  location.reload();
}

// ── Init Admin ──
function initAdmin() {
  // Set topbar date
  const now = new Date();
  document.getElementById('topbar-date').textContent =
    now.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  // Populate appointment date default
  const apptDate = document.getElementById('appt-date');
  if (apptDate) apptDate.value = now.toISOString().split('T')[0];

  loadData();
  renderDashboard();
}

function refreshData() {
  loadData();
  const active = document.querySelector('.admin-panel.active');
  if (active) {
    const panelId = active.id.replace('panel-', '');
    switch (panelId) {
      case 'dashboard':     renderDashboard(); break;
      case 'users':         renderUsersTable(); break;
      case 'inquiries':     renderInquiriesTable(); break;
      case 'appointments':  renderAppointmentsTable(); break;
      case 'contacts':      renderContactsTable(); break;
      case 'reports':       renderReports(); break;
    }
  }
  adminToast('🔄 Data refreshed');
}

// ── Load Data from localStorage ──
function loadData() {
  allUsers         = JSON.parse(localStorage.getItem('pipechem_users')        || '[]');
  allInquiries     = JSON.parse(localStorage.getItem('pipechem_inquiries')    || '[]');
  allAppointments  = JSON.parse(localStorage.getItem('pipechem_appointments') || '[]');
  allContacts      = JSON.parse(localStorage.getItem('pipechem_contacts')     || '[]');
  updateBadges();
  populateCustomerDropdown();
}

function updateBadges() {
  setTxt('badge-users', allUsers.length);
  setTxt('badge-inquiries', allInquiries.filter(i => i.status === 'Pending').length);
  setTxt('badge-contacts', allContacts.length);
}

function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ── Panel Navigation ──
function switchPanel(panelId) {
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));

  const panel = document.getElementById('panel-' + panelId);
  const navEl = document.getElementById('nav-' + panelId);
  if (panel) panel.classList.add('active');
  if (navEl) navEl.classList.add('active');

  const titles = {
    dashboard:    ['Dashboard', 'Overview of PIPE CHEM operations'],
    users:        ['Users', 'Manage registered user accounts'],
    inquiries:    ['Inquiries', 'Customer chemical inquiries & quotes'],
    appointments: ['Appointments', 'Schedule and manage customer meetings'],
    contacts:     ['Messages / Queries', 'Customer contact form submissions'],
    reports:      ['Reports', 'Analytics and summary reports'],
  };
  const [title, sub] = titles[panelId] || ['Admin', ''];
  setTxt('topbar-title-text', title);
  setTxt('topbar-subtitle', sub);

  // Render on switch
  switch (panelId) {
    case 'dashboard':    renderDashboard();       break;
    case 'users':        renderUsersTable();      break;
    case 'inquiries':    renderInquiriesTable();  break;
    case 'appointments': renderAppointmentsTable(); break;
    case 'contacts':     renderContactsTable();   break;
    case 'reports':      renderReports();         break;
  }
}

// ════════════════════════════════════════════════════
//  DASHBOARD
// ════════════════════════════════════════════════════
function renderDashboard() {
  loadData();
  const pendingCount = allInquiries.filter(i => i.status === 'Pending').length;

  setTxt('kpi-users',      allUsers.length);
  setTxt('kpi-inquiries',  allInquiries.length);
  setTxt('kpi-appts',      allAppointments.length);
  setTxt('kpi-contacts',   allContacts.length);
  setTxt('kpi-pending',    pendingCount);

  // Recent inquiries (top 5)
  const recentInqWrap = document.getElementById('dashboard-recent-inquiries');
  if (allInquiries.length === 0) {
    recentInqWrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><h4>No inquiries yet</h4><p>Inquiries submitted from the website will appear here.</p></div>`;
  } else {
    const rows = allInquiries.slice(0, 5).map(inq => `
      <tr>
        <td>${inq.id}</td>
        <td>${escHtml(inq.name)}</td>
        <td>${escHtml(inq.chemical)}</td>
        <td>${escHtml(inq.quantity)}</td>
        <td><span class="status-badge ${inq.status.toLowerCase()}">${inq.status}</span></td>
        <td>${fmtDate(inq.submittedAt)}</td>
        <td>
          <button class="tbl-action-btn view" onclick="viewInquiry('${inq.id}')">👁 View</button>
          ${inq.status === 'Pending' ? `<button class="tbl-action-btn approve" onclick="confirmInquiry('${inq.id}')">✓ Confirm</button>` : ''}
        </td>
      </tr>
    `).join('');
    recentInqWrap.innerHTML = `
      <table class="data-table">
        <thead><tr><th>ID</th><th>Name</th><th>Chemical</th><th>Qty</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  // Recent users (top 5)
  const recentUsersWrap = document.getElementById('dashboard-recent-users');
  if (allUsers.length === 0) {
    recentUsersWrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👤</div><h4>No users registered yet</h4><p>Users who register will appear here.</p></div>`;
  } else {
    const rows = allUsers.slice(-5).reverse().map(u => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${u.firstName.charAt(0).toUpperCase()}</div>
            <div><div class="user-name-cell">${escHtml(u.fullName)}</div><div class="user-email-cell">${escHtml(u.email)}</div></div>
          </div>
        </td>
        <td>${escHtml(u.company)}</td>
        <td>${escHtml(u.phone)}</td>
        <td>${escHtml(u.industry)}</td>
        <td><span class="status-badge confirmed">${u.status}</span></td>
        <td>${fmtDate(u.registeredAt)}</td>
      </tr>
    `).join('');
    recentUsersWrap.innerHTML = `
      <table class="data-table">
        <thead><tr><th>User</th><th>Company</th><th>Phone</th><th>Industry</th><th>Status</th><th>Registered</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }
}

// ════════════════════════════════════════════════════
//  USERS TABLE
// ════════════════════════════════════════════════════
function renderUsersTable(filter = '') {
  const wrap = document.getElementById('users-table-wrap');
  const list = filter
    ? allUsers.filter(u =>
        (u.fullName + u.email + u.company + u.phone + u.industry).toLowerCase().includes(filter.toLowerCase())
      )
    : allUsers;

  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👤</div><h4>No users found</h4><p>${filter ? 'No users match your search.' : 'Users who register through the website will appear here.'}</p></div>`;
    return;
  }

  const rows = list.map(u => `
    <tr>
      <td>
        <div class="user-cell">
          <div class="user-avatar">${u.firstName.charAt(0).toUpperCase()}</div>
          <div><div class="user-name-cell">${escHtml(u.fullName)}</div><div class="user-email-cell">${u.id}</div></div>
        </div>
      </td>
      <td>${escHtml(u.email)}</td>
      <td>${escHtml(u.phone)}</td>
      <td>${escHtml(u.company)}</td>
      <td>${escHtml(u.industry)}</td>
      <td>${fmtDate(u.registeredAt)}</td>
      <td>${u.lastLogin ? fmtDate(u.lastLogin) : 'Never'}</td>
      <td><span class="status-badge confirmed">${u.status}</span></td>
      <td>
        <button class="tbl-action-btn view" onclick="viewUser('${u.id}')">👁 View</button>
        <button class="tbl-action-btn schedule" onclick="prefillAppt('${u.id}')">📅 Appt</button>
        <button class="tbl-action-btn delete" onclick="deleteUser('${u.id}')">🗑</button>
      </td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>Name</th><th>Email</th><th>Phone</th><th>Company</th><th>Industry</th>
          <th>Registered</th><th>Last Login</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function filterUsers() {
  const q = document.getElementById('users-search').value;
  renderUsersTable(q);
}

function viewUser(uid) {
  const u = allUsers.find(x => x.id === uid);
  if (!u) return;
  document.getElementById('user-modal-body').innerHTML = `
    <div class="detail-row"><span class="detail-key">Full Name</span><span class="detail-val">${escHtml(u.fullName)}</span></div>
    <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${escHtml(u.email)}</span></div>
    <div class="detail-row"><span class="detail-key">Phone</span><span class="detail-val">${escHtml(u.phone)}</span></div>
    <div class="detail-row"><span class="detail-key">Company</span><span class="detail-val">${escHtml(u.company)}</span></div>
    <div class="detail-row"><span class="detail-key">Industry</span><span class="detail-val">${escHtml(u.industry)}</span></div>
    <div class="detail-row"><span class="detail-key">User ID</span><span class="detail-val" style="font-size:.75rem;">${u.id}</span></div>
    <div class="detail-row"><span class="detail-key">Registered At</span><span class="detail-val">${fmtDate(u.registeredAt)}</span></div>
    <div class="detail-row"><span class="detail-key">Last Login</span><span class="detail-val">${u.lastLogin ? fmtDate(u.lastLogin) : 'Never'}</span></div>
    <div class="detail-row"><span class="detail-key">Status</span><span class="detail-val"><span class="status-badge confirmed">${u.status}</span></span></div>
    <div style="margin-top:1.2rem;display:flex;gap:.6rem;">
      <button class="tbl-action-btn schedule" onclick="prefillAppt('${u.id}');closeModal('user-modal');switchPanel('appointments');" style="flex:1;justify-content:center;">📅 Schedule Appointment</button>
    </div>
  `;
  openModal('user-modal');
}

function deleteUser(uid) {
  if (!confirm('Are you sure you want to delete this user account?')) return;
  allUsers = allUsers.filter(u => u.id !== uid);
  localStorage.setItem('pipechem_users', JSON.stringify(allUsers));
  renderUsersTable();
  updateBadges();
  adminToast('🗑️ User deleted.');
}

function exportUsers() {
  const headers = ['ID','Name','Email','Phone','Company','Industry','Registered','LastLogin','Status'];
  const rows = allUsers.map(u => [u.id, u.fullName, u.email, u.phone, u.company, u.industry, u.registeredAt, u.lastLogin || '', u.status]);
  downloadCSV(headers, rows, 'pipechem_users.csv');
}

// ════════════════════════════════════════════════════
//  INQUIRIES TABLE
// ════════════════════════════════════════════════════
function renderInquiriesTable(filterQ = '', filterStatus = '') {
  const wrap = document.getElementById('inquiries-table-wrap');
  let list = allInquiries;
  if (filterQ) list = list.filter(i => (i.chemical + i.name + i.phone + i.email + i.id + i.location).toLowerCase().includes(filterQ.toLowerCase()));
  if (filterStatus) list = list.filter(i => i.status === filterStatus);

  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📋</div><h4>No inquiries found</h4><p>${(filterQ || filterStatus) ? 'No inquiries match your filters.' : 'Chemical inquiries submitted through the website will appear here.'}</p></div>`;
    return;
  }

  const rows = list.map(inq => `
    <tr>
      <td style="font-size:.75rem;color:var(--text-muted);">${inq.id}</td>
      <td><strong>${escHtml(inq.name)}</strong><br/><span style="font-size:.75rem;color:var(--text-muted);">${escHtml(inq.phone)}</span></td>
      <td>${escHtml(inq.chemical)}</td>
      <td>${escHtml(inq.quantity)}</td>
      <td>${escHtml(inq.price)}</td>
      <td>${escHtml(inq.deliveryType)}<br/><span style="font-size:.75rem;color:var(--text-muted);">${escHtml(inq.location)}</span></td>
      <td><span class="status-badge ${inq.status.toLowerCase()}">${inq.status}</span></td>
      <td>${fmtDate(inq.submittedAt)}</td>
      <td>
        <button class="tbl-action-btn view" onclick="viewInquiry('${inq.id}')">👁 View</button>
        ${inq.status === 'Pending' ? `<button class="tbl-action-btn approve" onclick="confirmInquiry('${inq.id}')">✓</button>` : ''}
        ${inq.status !== 'Completed' ? `<button class="tbl-action-btn schedule" onclick="markComplete('${inq.id}')">✓✓</button>` : ''}
        <button class="tbl-action-btn delete" onclick="deleteInquiry('${inq.id}')">🗑</button>
      </td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <table class="data-table">
      <thead>
        <tr>
          <th>ID</th><th>Customer</th><th>Chemical</th><th>Qty</th><th>Price</th>
          <th>Delivery</th><th>Status</th><th>Date</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function filterInquiries() {
  const q = document.getElementById('inq-search').value;
  const s = document.getElementById('inq-filter-status').value;
  renderInquiriesTable(q, s);
}

function viewInquiry(iid) {
  const inq = allInquiries.find(x => x.id === iid);
  if (!inq) return;
  document.getElementById('inq-modal-body').innerHTML = `
    <div class="detail-row"><span class="detail-key">Inquiry ID</span><span class="detail-val" style="font-size:.75rem;">${inq.id}</span></div>
    <div class="detail-row"><span class="detail-key">Customer Name</span><span class="detail-val">${escHtml(inq.name)}</span></div>
    <div class="detail-row"><span class="detail-key">Phone</span><span class="detail-val">${escHtml(inq.phone)}</span></div>
    <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${escHtml(inq.email)}</span></div>
    <div class="detail-row"><span class="detail-key">Chemical</span><span class="detail-val">${escHtml(inq.chemical)}</span></div>
    <div class="detail-row"><span class="detail-key">Quantity</span><span class="detail-val">${escHtml(inq.quantity)}</span></div>
    <div class="detail-row"><span class="detail-key">Expected Price</span><span class="detail-val">${escHtml(inq.price)}</span></div>
    <div class="detail-row"><span class="detail-key">Delivery Type</span><span class="detail-val">${escHtml(inq.deliveryType)}</span></div>
    <div class="detail-row"><span class="detail-key">Location</span><span class="detail-val">${escHtml(inq.location)}</span></div>
    <div class="detail-row"><span class="detail-key">Notes</span><span class="detail-val" style="text-align:right;max-width:240px;">${escHtml(inq.message)}</span></div>
    <div class="detail-row"><span class="detail-key">Status</span><span class="detail-val"><span class="status-badge ${inq.status.toLowerCase()}">${inq.status}</span></span></div>
    <div class="detail-row"><span class="detail-key">Submitted</span><span class="detail-val">${fmtDate(inq.submittedAt)}</span></div>
    <div style="margin-top:1.2rem;display:flex;gap:.6rem;flex-wrap:wrap;">
      ${inq.status === 'Pending' ? `<button class="tbl-action-btn approve" onclick="confirmInquiry('${inq.id}');closeModal('inq-modal');" style="flex:1;justify-content:center;">✓ Confirm</button>` : ''}
      ${inq.status !== 'Completed' ? `<button class="tbl-action-btn schedule" onclick="markComplete('${inq.id}');closeModal('inq-modal');" style="flex:1;justify-content:center;">✓✓ Complete</button>` : ''}
      <button class="tbl-action-btn delete" onclick="deleteInquiry('${inq.id}');closeModal('inq-modal');" style="flex:1;justify-content:center;">🗑 Delete</button>
    </div>
  `;
  openModal('inq-modal');
}

function confirmInquiry(iid) {
  updateInquiryStatus(iid, 'Confirmed');
  adminToast('✅ Inquiry confirmed!');
}
function markComplete(iid) {
  updateInquiryStatus(iid, 'Completed');
  adminToast('✅ Inquiry marked as complete!');
}
function updateInquiryStatus(iid, status) {
  const idx = allInquiries.findIndex(i => i.id === iid);
  if (idx !== -1) {
    allInquiries[idx].status = status;
    localStorage.setItem('pipechem_inquiries', JSON.stringify(allInquiries));
    renderInquiriesTable();
    renderDashboard();
    updateBadges();
  }
}
function deleteInquiry(iid) {
  if (!confirm('Delete this inquiry?')) return;
  allInquiries = allInquiries.filter(i => i.id !== iid);
  localStorage.setItem('pipechem_inquiries', JSON.stringify(allInquiries));
  renderInquiriesTable();
  updateBadges();
  adminToast('🗑️ Inquiry deleted.');
}
function exportInquiries() {
  const headers = ['ID','Name','Phone','Email','Chemical','Quantity','Price','DeliveryType','Location','Status','Submitted'];
  const rows = allInquiries.map(i => [i.id,i.name,i.phone,i.email,i.chemical,i.quantity,i.price,i.deliveryType,i.location,i.status,i.submittedAt]);
  downloadCSV(headers, rows, 'pipechem_inquiries.csv');
}

// ════════════════════════════════════════════════════
//  APPOINTMENTS
// ════════════════════════════════════════════════════
function populateCustomerDropdown() {
  const sel = document.getElementById('appt-customer');
  if (!sel) return;
  const placeholder = '<option value="">-- Select Customer --</option>';
  sel.innerHTML = placeholder + allUsers.map(u =>
    `<option value="${u.id}">${escHtml(u.fullName)} (${escHtml(u.email)})</option>`
  ).join('');

  sel.addEventListener('change', () => {
    const u = allUsers.find(x => x.id === sel.value);
    if (u) {
      document.getElementById('appt-email').value = u.email;
      document.getElementById('appt-phone').value = u.phone;
    }
  });
}

function createAppointment() {
  const customerSel = document.getElementById('appt-customer').value;
  const email   = document.getElementById('appt-email').value.trim();
  const phone   = document.getElementById('appt-phone').value.trim();
  const date    = document.getElementById('appt-date').value;
  const time    = document.getElementById('appt-time').value;
  const type    = document.getElementById('appt-type').value;
  const mode    = document.getElementById('appt-mode').value;
  const notes   = document.getElementById('appt-notes').value.trim();

  if (!email) { adminToast('⚠️ Please enter customer email.'); return; }
  if (!date)  { adminToast('⚠️ Please select a date.'); return; }
  if (!time)  { adminToast('⚠️ Please select a time.'); return; }

  let customerName = 'Manual Entry';
  if (customerSel) {
    const u = allUsers.find(x => x.id === customerSel);
    if (u) customerName = u.fullName;
  }

  const appt = {
    id: 'APT-' + Date.now(),
    createdAt: new Date().toISOString(),
    customerId: customerSel || null,
    customerName,
    email,
    phone: phone || '—',
    date,
    time,
    type,
    mode,
    notes: notes || '—',
    status: 'Confirmed',
  };

  allAppointments.push(appt);
  localStorage.setItem('pipechem_appointments', JSON.stringify(allAppointments));
  renderAppointmentsTable();
  adminToast('📅 Appointment scheduled successfully!');

  // Reset form
  document.getElementById('appt-customer').value = '';
  document.getElementById('appt-email').value = '';
  document.getElementById('appt-phone').value = '';
  document.getElementById('appt-time').value = '';
  document.getElementById('appt-notes').value = '';
  updateBadges();
}

function renderAppointmentsTable() {
  const wrap = document.getElementById('appointments-table-wrap');
  if (allAppointments.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><h4>No appointments scheduled</h4><p>Use the form to schedule a new appointment.</p></div>`;
    return;
  }

  const sorted = [...allAppointments].sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
  const now = new Date();

  const rows = sorted.map(a => {
    const apptDt = new Date(a.date + 'T' + a.time);
    const isPast = apptDt < now;
    return `
      <tr>
        <td style="font-size:.75rem;color:var(--text-muted);">${a.id}</td>
        <td><strong>${escHtml(a.customerName)}</strong><br/><span style="font-size:.75rem;color:var(--text-muted);">${escHtml(a.email)}</span></td>
        <td>${a.date}</td>
        <td>${a.time}</td>
        <td>${escHtml(a.type)}</td>
        <td>${escHtml(a.mode)}</td>
        <td><span class="status-badge ${isPast ? 'completed' : 'confirmed'}">${isPast ? 'Past' : 'Upcoming'}</span></td>
        <td>
          <button class="tbl-action-btn view" onclick="viewAppointment('${a.id}')">👁 View</button>
          <button class="tbl-action-btn delete" onclick="deleteAppointment('${a.id}')">🗑</button>
        </td>
      </tr>`;
  }).join('');

  wrap.innerHTML = `
    <table class="data-table">
      <thead><tr><th>ID</th><th>Customer</th><th>Date</th><th>Time</th><th>Type</th><th>Mode</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function viewAppointment(aid) {
  const a = allAppointments.find(x => x.id === aid);
  if (!a) return;
  document.getElementById('appt-modal-body').innerHTML = `
    <div class="detail-row"><span class="detail-key">Appointment ID</span><span class="detail-val" style="font-size:.75rem;">${a.id}</span></div>
    <div class="detail-row"><span class="detail-key">Customer Name</span><span class="detail-val">${escHtml(a.customerName)}</span></div>
    <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${escHtml(a.email)}</span></div>
    <div class="detail-row"><span class="detail-key">Phone</span><span class="detail-val">${escHtml(a.phone)}</span></div>
    <div class="detail-row"><span class="detail-key">Date</span><span class="detail-val">${a.date}</span></div>
    <div class="detail-row"><span class="detail-key">Time</span><span class="detail-val">${a.time}</span></div>
    <div class="detail-row"><span class="detail-key">Meeting Type</span><span class="detail-val">${escHtml(a.type)}</span></div>
    <div class="detail-row"><span class="detail-key">Mode</span><span class="detail-val">${escHtml(a.mode)}</span></div>
    <div class="detail-row"><span class="detail-key">Notes</span><span class="detail-val" style="text-align:right;max-width:220px;">${escHtml(a.notes)}</span></div>
    <div class="detail-row"><span class="detail-key">Created At</span><span class="detail-val">${fmtDate(a.createdAt)}</span></div>
  `;
  openModal('appt-modal');
}

function deleteAppointment(aid) {
  if (!confirm('Delete this appointment?')) return;
  allAppointments = allAppointments.filter(a => a.id !== aid);
  localStorage.setItem('pipechem_appointments', JSON.stringify(allAppointments));
  renderAppointmentsTable();
  adminToast('🗑️ Appointment deleted.');
}

function prefillAppt(uid) {
  const u = allUsers.find(x => x.id === uid);
  if (!u) return;
  const sel = document.getElementById('appt-customer');
  if (sel) sel.value = uid;
  document.getElementById('appt-email').value = u.email;
  document.getElementById('appt-phone').value = u.phone;
}

function exportAppointments() {
  const headers = ['ID','CustomerName','Email','Phone','Date','Time','Type','Mode','Notes','CreatedAt'];
  const rows = allAppointments.map(a => [a.id,a.customerName,a.email,a.phone,a.date,a.time,a.type,a.mode,a.notes,a.createdAt]);
  downloadCSV(headers, rows, 'pipechem_appointments.csv');
}

// ════════════════════════════════════════════════════
//  CONTACTS / MESSAGES
// ════════════════════════════════════════════════════
function renderContactsTable(filter = '') {
  const wrap = document.getElementById('contacts-table-wrap');
  const list = filter
    ? allContacts.filter(c => (c.name + c.email + c.phone + c.subject + c.message).toLowerCase().includes(filter.toLowerCase()))
    : allContacts;

  if (list.length === 0) {
    wrap.innerHTML = `<div class="empty-state"><div class="empty-state-icon">💬</div><h4>No messages yet</h4><p>${filter ? 'No messages match your search.' : 'Contact form submissions will appear here.'}</p></div>`;
    return;
  }

  const rows = list.map(c => `
    <tr>
      <td style="font-size:.75rem;color:var(--text-muted);">${c.id}</td>
      <td><strong>${escHtml(c.name)}</strong><br/><span style="font-size:.75rem;color:var(--text-muted);">${escHtml(c.company)}</span></td>
      <td>${escHtml(c.email)}</td>
      <td>${escHtml(c.phone)}</td>
      <td>${escHtml(c.subject)}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(c.message)}</td>
      <td>${fmtDate(c.submittedAt)}</td>
      <td>
        <button class="tbl-action-btn view" onclick="viewContact('${c.id}')">👁 View</button>
        <button class="tbl-action-btn delete" onclick="deleteContact('${c.id}')">🗑</button>
      </td>
    </tr>
  `).join('');

  wrap.innerHTML = `
    <table class="data-table">
      <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Subject</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function filterContacts() {
  renderContactsTable(document.getElementById('con-search').value);
}

function viewContact(cid) {
  const c = allContacts.find(x => x.id === cid);
  if (!c) return;
  // reuse inq-modal for simplicity
  document.getElementById('inq-modal-body').innerHTML = `
    <div class="detail-row"><span class="detail-key">ID</span><span class="detail-val" style="font-size:.75rem;">${c.id}</span></div>
    <div class="detail-row"><span class="detail-key">Name</span><span class="detail-val">${escHtml(c.name)}</span></div>
    <div class="detail-row"><span class="detail-key">Company</span><span class="detail-val">${escHtml(c.company)}</span></div>
    <div class="detail-row"><span class="detail-key">Phone</span><span class="detail-val">${escHtml(c.phone)}</span></div>
    <div class="detail-row"><span class="detail-key">Email</span><span class="detail-val">${escHtml(c.email)}</span></div>
    <div class="detail-row"><span class="detail-key">Subject</span><span class="detail-val">${escHtml(c.subject)}</span></div>
    <div class="detail-row"><span class="detail-key">Message</span><span class="detail-val" style="text-align:right;max-width:240px;white-space:pre-wrap;">${escHtml(c.message)}</span></div>
    <div class="detail-row"><span class="detail-key">Submitted</span><span class="detail-val">${fmtDate(c.submittedAt)}</span></div>
  `;
  document.querySelector('#inq-modal .modal-header h3').textContent = '💬 Customer Message';
  openModal('inq-modal');
}

function deleteContact(cid) {
  if (!confirm('Delete this message?')) return;
  allContacts = allContacts.filter(c => c.id !== cid);
  localStorage.setItem('pipechem_contacts', JSON.stringify(allContacts));
  renderContactsTable();
  updateBadges();
  adminToast('🗑️ Message deleted.');
}

function exportContacts() {
  const headers = ['ID','Name','Company','Email','Phone','Subject','Message','Submitted'];
  const rows = allContacts.map(c => [c.id,c.name,c.company,c.email,c.phone,c.subject,c.message,c.submittedAt]);
  downloadCSV(headers, rows, 'pipechem_contacts.csv');
}

// ════════════════════════════════════════════════════
//  REPORTS
// ════════════════════════════════════════════════════
function renderReports() {
  renderChemicalsChart();
  renderDeliveryChart();
  renderIndustryChart();
  renderStatusChart();
  renderReportTable();
}

function renderChemicalsChart() {
  const el = document.getElementById('chart-chemicals');
  const counts = {};
  allInquiries.forEach(i => {
    const short = i.chemical.split(' (')[0].split(' –')[0].substring(0, 22);
    counts[short] = (counts[short] || 0) + 1;
  });
  renderBarChart(el, counts, 'navy');
}

function renderDeliveryChart() {
  const el = document.getElementById('chart-delivery');
  const counts = {};
  allInquiries.forEach(i => { counts[i.deliveryType] = (counts[i.deliveryType] || 0) + 1; });
  renderBarChart(el, counts, 'gold');
}

function renderIndustryChart() {
  const el = document.getElementById('chart-industry');
  const counts = {};
  allUsers.forEach(u => { const ind = u.industry || 'Unknown'; counts[ind] = (counts[ind] || 0) + 1; });
  renderBarChart(el, counts, 'green');
}

function renderStatusChart() {
  const el = document.getElementById('chart-status');
  const counts = {};
  allInquiries.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
  renderBarChart(el, counts, 'navy');
}

function renderBarChart(el, counts, colorClass) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    el.innerHTML = `<div class="empty-state" style="padding:1.5rem;"><div class="empty-state-icon" style="font-size:1.5rem;">📊</div><h4 style="font-size:.9rem;">No data yet</h4></div>`;
    return;
  }
  const max = Math.max(...entries.map(e => e[1]));
  el.innerHTML = entries.map(([label, val]) => `
    <div class="bar-row">
      <div class="bar-label" title="${label}">${label}</div>
      <div class="bar-track"><div class="bar-fill ${colorClass}" style="width:${(val/max*100).toFixed(1)}%"></div></div>
      <div class="bar-val">${val}</div>
    </div>
  `).join('');
}

function renderReportTable() {
  const el = document.getElementById('report-summary-table');
  const pendingCt  = allInquiries.filter(i => i.status === 'Pending').length;
  const confCt     = allInquiries.filter(i => i.status === 'Confirmed').length;
  const compCt     = allInquiries.filter(i => i.status === 'Completed').length;
  const totalQty   = allInquiries.reduce((sum, i) => sum + (parseFloat(i.quantity) || 0), 0);

  el.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Metric</th><th>Value</th></tr></thead>
      <tbody>
        <tr><td>Total Registered Users</td><td><strong>${allUsers.length}</strong></td></tr>
        <tr><td>Total Inquiries Received</td><td><strong>${allInquiries.length}</strong></td></tr>
        <tr><td>Pending Inquiries</td><td><span class="status-badge pending">${pendingCt}</span></td></tr>
        <tr><td>Confirmed Inquiries</td><td><span class="status-badge confirmed">${confCt}</span></td></tr>
        <tr><td>Completed Inquiries</td><td><span class="status-badge completed">${compCt}</span></td></tr>
        <tr><td>Total Appointments Scheduled</td><td><strong>${allAppointments.length}</strong></td></tr>
        <tr><td>Total Customer Messages</td><td><strong>${allContacts.length}</strong></td></tr>
      </tbody>
    </table>
  `;
}

function exportFullReport() {
  const headers = ['Metric','Value'];
  const pendingCt = allInquiries.filter(i => i.status === 'Pending').length;
  const rows = [
    ['Total Users', allUsers.length],
    ['Total Inquiries', allInquiries.length],
    ['Pending Inquiries', pendingCt],
    ['Total Appointments', allAppointments.length],
    ['Total Messages', allContacts.length],
  ];
  downloadCSV(headers, rows, 'pipechem_report.csv');
}

// ════════════════════════════════════════════════════
//  MODALS
// ════════════════════════════════════════════════════
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add('open');
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
  // restore inq modal title
  const inqTitle = document.querySelector('#inq-modal .modal-header h3');
  if (inqTitle) inqTitle.textContent = '📋 Inquiry Details';
}
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) closeModal(m.id); });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
});

// ════════════════════════════════════════════════════
//  UTILITIES
// ════════════════════════════════════════════════════
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
         ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function escHtml(str) {
  if (str === null || str === undefined) return '—';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function adminToast(msg, duration = 3000) {
  const t = document.getElementById('admin-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function downloadCSV(headers, rows, filename) {
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
