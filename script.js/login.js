const viewBtn = document.querySelector(".view-btn");
if (viewBtn) {
  viewBtn.addEventListener("click", () => {
    alert("Chức năng xem hướng dẫn sắp được thêm!");
  });
}

const nextBtn = document.querySelector(".next-btn");
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    alert("Chuyển sang slide kế tiếp!");
  });
}

const bellBtn = document.querySelector('.bell-button');
if (bellBtn) {
  bellBtn.addEventListener('click', (e) => {
    const isPressed = bellBtn.getAttribute('aria-pressed') === 'true';
    bellBtn.setAttribute('aria-pressed', String(!isPressed));
    bellBtn.classList.toggle('active');
    alert('Thông báo: hiện chưa có thông báo mới');
  });
}

// -- HCMUT_SSO mock login helpers and registration link handling --
// Mock login function exposed for login.html
window.hcmutMockLogin = function(next) {
  // set a simple flag in localStorage
  try {
    localStorage.setItem('hcmut_logged_in', 'true');
  } catch (e) {
    console.warn('localStorage not available', e);
  }
  // redirect to next page (default program.html)
  location.href = next || 'program.html';
};

// Helper to check login
function isHcmutLoggedIn() {
  try {
    return localStorage.getItem('hcmut_logged_in') === 'true';
  } catch (e) {
    return false;
  }
}

// Intercept clicks on register links
document.querySelectorAll('.register-link').forEach(link => {
  link.addEventListener('click', function (e) {
    // if logged in, allow navigation to program.html
    if (isHcmutLoggedIn()) return; // allow default
    // not logged in -> prevent default and redirect to signup page (SSO flow)
    e.preventDefault();
    const next = this.getAttribute('href') || 'program.html';
    // pass next as query param so signup page can redirect back
    location.href = 'role.html?next=' + encodeURIComponent(next);
  });
});

// Update auth-related UI: login-link text, role display, and visibility
function updateAuthUI() {
  const role = (function(){ try { return localStorage.getItem('hcmut_role'); } catch(e){return null;} })();
  const username = (function(){ try { return localStorage.getItem('hcmut_username'); } catch(e){return null;} })();
  const logged = isHcmutLoggedIn();

  // update SSO box label if present
  const ssoBox = document.querySelector('.sso-box');
  if (ssoBox) {
    if (logged) {
      const roleLabel = role ? (role === 'student' ? 'Sinh viên' : role === 'admin' ? 'Quản trị' : role) : 'Người dùng';
      ssoBox.textContent = `Xin chào, ${roleLabel} ${username}`;
    } else {
      ssoBox.textContent = 'HCMUT_SSO';
    }
  }

  // If there's a login-link element (older pages), update it too
  const loginLink = document.getElementById('login-link');
  if (!loginLink) return;
  if (logged) {
    const roleLabel = role ? (role === 'student' ? 'Sinh viên' : role === 'admin' ? 'Quản trị' : role) : 'Người dùng';
    loginLink.textContent = `Xin chào, ${roleLabel}`;
    loginLink.href = '#';
    loginLink.onclick = function(e){
      e.preventDefault();
      if (confirm('Bạn có muốn đăng xuất không?')) {
        try { localStorage.removeItem('hcmut_logged_in'); localStorage.removeItem('hcmut_role'); localStorage.removeItem('hcmut_username'); } catch(e){}
        updateAuthUI();
        location.reload();
      }
    };
  } else {
    loginLink.textContent = 'Đăng nhập';
    const next = location.pathname.substring(location.pathname.lastIndexOf('/')+1) || 'main.html';
    loginLink.href = 'signup.html?next=' + encodeURIComponent(next);
    loginLink.onclick = null;
  }
}

updateAuthUI();

// If on program.html, handle form submit to simulate registration saving
if (document.getElementById('program-form')) {
  const form = document.getElementById('program-form');
  const result = document.getElementById('register-result');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    const data = new FormData(form);
    const record = {
      subject: data.get('subject'),
      skill: data.get('skill'),
      description: data.get('description'),
      createdAt: new Date().toISOString()
    };
    // store registrations in localStorage array
    try {
      const existing = JSON.parse(localStorage.getItem('tutor_registrations') || '[]');
      existing.push(record);
      localStorage.setItem('tutor_registrations', JSON.stringify(existing));
      result.innerHTML = '<div style="padding:12px;background:#e6fffa;border:1px solid #bdecd6;border-radius:6px;color:#064e3b;">Đăng ký thành công!</div>';
      form.reset();
    } catch (err) {
      result.innerHTML = '<div style="padding:12px;background:#ffe6e6;border:1px solid #f5b0b0;border-radius:6px;color:#7a1f1f;">Lỗi khi lưu đăng ký.</div>';
      console.error(err);
    }
  });
  // cancel button
  const cancelBtn = document.getElementById('cancel-register');
  if (cancelBtn) cancelBtn.addEventListener('click', () => location.href = 'main.html');
}

// Hero search and CTA behavior on program page
const heroSearchBtn = document.getElementById('hero-search-btn');
if (heroSearchBtn) {
  heroSearchBtn.addEventListener('click', () => {
    const q = document.getElementById('hero-search').value.trim();
    if (!q) { alert('Vui lòng nhập từ khóa tìm kiếm.'); return; }
    // scroll to tutor list and set filter subject
    const subjectInput = document.getElementById('filter-subject');
    if (subjectInput) subjectInput.value = q;
    // trigger filter
    const fbtn = document.getElementById('filter-btn');
    if (fbtn) fbtn.click();
    // scroll into view
    const area = document.getElementById('tutor-area');
    if (area) area.scrollIntoView({ behavior: 'smooth' });
  });
}

const ctaFind = document.getElementById('cta-find');
if (ctaFind) ctaFind.addEventListener('click', () => {
  const area = document.getElementById('tutor-area');
  if (area) area.scrollIntoView({ behavior: 'smooth' });
});

const ctaBecome = document.getElementById('cta-become');
if (ctaBecome) ctaBecome.addEventListener('click', () => {
  // take to signup to pick tutor role
  const next = 'program.html';
  location.href = 'signup.html?next=' + encodeURIComponent(next);
});

// simple SSO button behavior: clicking SSO toggles login state for convenience
const ssoBtn = document.querySelector('.sso-button');
if (ssoBtn) {
  ssoBtn.addEventListener('click', () => {
    const logged = isHcmutLoggedIn();
    if (logged) {
      // logout
      if (confirm('Bạn có muốn đăng xuất không?')) {
        try { localStorage.removeItem('hcmut_logged_in'); localStorage.removeItem('hcmut_role'); } catch(e){}
        alert('Đã đăng xuất HCMUT_SSO');
        location.href = 'main.html';
      }
    } else {
      // redirect to signup to choose role and login, pass current page as next
      const next = location.pathname.substring(location.pathname.lastIndexOf('/')+1) || 'main.html';
      location.href = 'role.html?next=' + encodeURIComponent(next);
    }
  });
}

// -------------------- Tutor browsing (mock) --------------------
// Mock tutor dataset
const MOCK_TUTORS = [
  {id:1, name:'Nguyễn Văn A', dept:'CNTT', subjects:['Lập trình C++','Cấu trúc dữ liệu'], availability:'Chiều', bio:'Tutor chuyên về lập trình C++.'},
  {id:2, name:'Trần Thị B', dept:'Toán', subjects:['Toán rời rạc','Giải tích'], availability:'Sáng', bio:'Gia sư Toán, tập trung lý thuyết.'},
  {id:3, name:'Lê Văn C', dept:'CNTT', subjects:['Lập trình Python','Machine Learning'], availability:'Tối', bio:'Tutor ML và Python.'},
  {id:4, name:'Phạm D', dept:'Vật lý', subjects:['Vật lý đại cương'], availability:'Sáng', bio:'Giải bài tập và hướng dẫn thực hành.'}
];

function renderTutors(list) {
  const container = document.getElementById('tutor-list');
  const empty = document.getElementById('tutor-empty');
  container.innerHTML = '';
  if (!list || list.length === 0) {
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.forEach(t => {
    const card = document.createElement('div');
    card.className = 'tutor-card';
    card.innerHTML = `
      <div class="tutor-head">
        <h4>${t.name}</h4>
      </div>
      <div class="tutor-meta"><strong>Khoa:</strong> ${t.dept} &nbsp; <strong>Rảnh:</strong> ${t.availability}</div>
      <div class="tutor-subjects"><strong>Môn:</strong> ${t.subjects.join(', ')}</div>
      <div class="tutor-bio">${t.bio}</div>
      <div><button class="request-btn" data-id="${t.id}">Yêu cầu hỗ trợ</button></div>
    `;
    container.appendChild(card);
  });
}

function filterTutors(filters) {
  return MOCK_TUTORS.filter(t => {
    if (filters.dept && t.dept !== filters.dept) return false;
    if (filters.availability && t.availability !== filters.availability) return false;
    if (filters.subject) {
      const q = filters.subject.toLowerCase();
      const inSubjects = t.subjects.some(s => s.toLowerCase().includes(q));
      const inName = t.name.toLowerCase().includes(q);
      if (!inSubjects && !inName) return false;
    }
    return true;
  });
}

function initTutorArea() {
  const notRegisteredEl = document.getElementById('tutor-not-registered');
  const filterForm = document.getElementById('tutor-filter-form');
  const filterBtn = document.getElementById('filter-btn');
  const clearBtn = document.getElementById('clear-filter-btn');

  // Precondition: student has at least one registration saved
  let registrations = [];
  try { registrations = JSON.parse(localStorage.getItem('tutor_registrations') || '[]'); } catch(e) { registrations = []; }
  const registered = registrations.length > 0;
  if (!registered) {
    notRegisteredEl.style.display = 'block';
    filterForm.style.display = 'none';
    renderTutors([]); // show empty
    return;
  }

  notRegisteredEl.style.display = 'none';
  filterForm.style.display = 'flex';
  // initial render: all tutors
  renderTutors(MOCK_TUTORS);

  filterBtn.addEventListener('click', () => {
    const dept = document.getElementById('filter-dept').value;
    const subject = document.getElementById('filter-subject').value.trim();
    const availability = document.getElementById('filter-availability').value;
    const results = filterTutors({dept, subject, availability});
    renderTutors(results);
  });
  clearBtn.addEventListener('click', () => {
    document.getElementById('filter-dept').value = '';
    document.getElementById('filter-subject').value = '';
    document.getElementById('filter-availability').value = '';
    renderTutors(MOCK_TUTORS);
  });

  // delegate request support buttons
  document.getElementById('tutor-list').addEventListener('click', (ev) => {
    const btn = ev.target.closest('.request-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const tutor = MOCK_TUTORS.find(x => String(x.id) === String(id));
    if (tutor) {
      alert(`Yêu cầu hỗ trợ đã gửi cho ${tutor.name} (giả lập).`);
    }
  });
}

// Init tutor area if present on page
if (document.getElementById('tutor-area')) {
  initTutorArea();
}

// -------------------- end Tutor browsing --------------------
