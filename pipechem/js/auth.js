/* ============================================================
   PIPE CHEM — Auth JavaScript
   ============================================================ */

// ── Tab Switching ──
function switchTab(tab) {
  const loginForm = document.getElementById('form-login');
  const regForm = document.getElementById('form-register');
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-register');

  clearAlerts();

  if (tab === 'login') {
    loginForm.classList.add('active');
    regForm.classList.remove('active');
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    tabLogin.setAttribute('aria-selected', 'true');
    tabReg.setAttribute('aria-selected', 'false');
  } else {
    regForm.classList.add('active');
    loginForm.classList.remove('active');
    tabReg.classList.add('active');
    tabLogin.classList.remove('active');
    tabReg.setAttribute('aria-selected', 'true');
    tabLogin.setAttribute('aria-selected', 'false');
  }
}

// ── Password Toggle ──
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ── Show Alert ──
function showAlert(alertId, type, msg) {
  const el = document.getElementById(alertId);
  el.className = `auth-alert show ${type}`;
  el.innerHTML = `${type === 'error' ? '⚠️' : '✅'} ${msg}`;
}
function clearAlerts() {
  ['login-alert', 'register-alert'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = 'auth-alert';
  });
  document.querySelectorAll('.field-error').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.auth-input').forEach(e => e.classList.remove('error'));
}

// ── Validation Helpers ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhone(phone) {
  return /^[+]?[\d\s\-()]{8,15}$/.test(phone);
}
function showFieldErr(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) input.classList.add('error');
  if (err) err.classList.add('show');
}
function clearFieldErr(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  if (input) input.classList.remove('error');
  if (err) err.classList.remove('show');
}

// ── LOGIN ──
function handleLogin() {
  clearAlerts();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  let valid = true;

  if (!email || !isValidEmail(email)) {
    showFieldErr('login-email', 'login-email-err');
    valid = false;
  }
  if (!password) {
    showFieldErr('login-password', 'login-pw-err');
    valid = false;
  }
  if (!valid) return;

  // Admin shortcut
  if (email === 'admin@pipechem.com' && password === 'admin123') {
    window.location.href = 'admin.html';
    return;
  }

  // Look up in localStorage users
  const users = JSON.parse(localStorage.getItem('pipechem_users') || '[]');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (!user) {
    showAlert('login-alert', 'error', 'Invalid email or password. Please try again.');
    return;
  }

  // Store current session
  sessionStorage.setItem('pipechem_session', JSON.stringify({ uid: user.id, name: user.firstName, email: user.email }));

  // Update last login
  user.lastLogin = new Date().toISOString();
  const idx = users.findIndex(u => u.id === user.id);
  users[idx] = user;
  localStorage.setItem('pipechem_users', JSON.stringify(users));

  showAlert('login-alert', 'success', `Welcome back, ${user.firstName}! Redirecting...`);
  setTimeout(() => { window.location.href = 'index.html'; }, 1200);
}

// ── REGISTER ──
function handleRegister() {
  clearAlerts();

  const firstName = document.getElementById('reg-fname').value.trim();
  const lastName  = document.getElementById('reg-lname').value.trim();
  const company   = document.getElementById('reg-company').value.trim();
  const phone     = document.getElementById('reg-phone').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const industry  = document.getElementById('reg-industry').value;
  const password  = document.getElementById('reg-password').value;
  const confirm   = document.getElementById('reg-confirm').value;

  let valid = true;

  if (!firstName) { showFieldErr('reg-fname', 'reg-fname-err'); valid = false; }
  if (!lastName)  { showFieldErr('reg-lname', 'reg-lname-err'); valid = false; }
  if (!phone || !isValidPhone(phone)) { showFieldErr('reg-phone', 'reg-phone-err'); valid = false; }
  if (!email || !isValidEmail(email)) { showFieldErr('reg-email', 'reg-email-err'); valid = false; }
  if (!password || password.length < 6) { showFieldErr('reg-password', 'reg-pw-err'); valid = false; }
  if (password !== confirm) { showFieldErr('reg-confirm', 'reg-confirm-err'); valid = false; }

  if (!valid) return;

  // Check if email already exists
  const users = JSON.parse(localStorage.getItem('pipechem_users') || '[]');
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    showAlert('register-alert', 'error', 'This email address is already registered. Please login instead.');
    return;
  }

  // Create user object
  const newUser = {
    id: 'USR-' + Date.now(),
    registeredAt: new Date().toISOString(),
    lastLogin: null,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    company: company || '—',
    phone,
    email,
    industry: industry || '—',
    password,  // Note: In production, always hash passwords server-side
    status: 'Active',
  };

  users.push(newUser);
  localStorage.setItem('pipechem_users', JSON.stringify(users));

  // Auto-login
  sessionStorage.setItem('pipechem_session', JSON.stringify({ uid: newUser.id, name: newUser.firstName, email: newUser.email }));

  showAlert('register-alert', 'success', `Account created successfully! Welcome, ${firstName}! Redirecting...`);
  setTimeout(() => { window.location.href = 'index.html'; }, 1500);
}

// ── Forgot Password ──
function forgotPassword() {
  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    showAlert('login-alert', 'error', 'Please enter your email address in the field above, then click Forgot Password.');
    return;
  }
  const users = JSON.parse(localStorage.getItem('pipechem_users') || '[]');
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    showAlert('login-alert', 'error', 'No account found with this email address.');
    return;
  }
  showAlert('login-alert', 'success', `Password reset instructions sent to ${email}. (For demo: password is stored in browser storage.)`);
}

// ── Live field validation ──
document.addEventListener('DOMContentLoaded', () => {
  const loginEmail = document.getElementById('login-email');
  const loginPw    = document.getElementById('login-password');
  if (loginEmail) loginEmail.addEventListener('input', () => {
    if (isValidEmail(loginEmail.value.trim())) clearFieldErr('login-email', 'login-email-err');
  });
  if (loginPw) loginPw.addEventListener('input', () => {
    if (loginPw.value) clearFieldErr('login-password', 'login-pw-err');
  });

  // Register live validation
  ['reg-fname', 'reg-lname', 'reg-phone', 'reg-email', 'reg-password', 'reg-confirm'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => {
      if (el.value.trim()) {
        el.classList.remove('error');
        const errEl = document.getElementById(id + '-err');
        if (errEl) errEl.classList.remove('show');
      }
    });
  });

  // Enter key on login
  [loginEmail, loginPw].forEach(el => {
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') handleLogin(); });
  });
});
