// Xử lý sự kiện khi nhấn nút "Xem" trong phần hướng dẫn
const viewBtn = document.querySelector(".view-btn");
if (viewBtn) {
  viewBtn.addEventListener("click", () => {
    alert("Chức năng xem hướng dẫn sắp được thêm!");
  });
}

// Xử lý sự kiện khi nhấn nút mũi tên để chuyển slide
const nextBtn = document.querySelector(".next-btn");
if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    alert("Chuyển sang slide kế tiếp!");
  });
}

// Xử lý nút thông báo (chuông)
const bellBtn = document.querySelector('.bell-button');
if (bellBtn) {
  bellBtn.addEventListener('click', (e) => {
    const isPressed = bellBtn.getAttribute('aria-pressed') === 'true';
    bellBtn.setAttribute('aria-pressed', String(!isPressed));
    bellBtn.classList.toggle('active');
    alert('Thông báo: hiện chưa có thông báo mới');
  });
}

// ---- Xử lý đăng nhập và xác thực người dùng HCMUT_SSO ----
// Hàm giả lập đăng nhập HCMUT_SSO (dùng cho trang login.html)
window.hcmutMockLogin = function(next) {
  // Lưu trạng thái đăng nhập vào localStorage
  try {
    localStorage.setItem('hcmut_logged_in', 'true');
  } catch (e) {
    console.warn('localStorage not available', e);
  }
  // Chuyển hướng đến trang tiếp theo (mặc định là program.html)
  location.href = next || 'program.html';
};

// Hàm kiểm tra trạng thái đăng nhập
function isHcmutLoggedIn() {
  try {
    const loggedIn = localStorage.getItem('hcmut_logged_in');
    // Chỉ cần kiểm tra flag đăng nhập là đủ
    // role và username có thể được set sau
    return loggedIn === 'true';
  } catch (e) {
    console.error('Lỗi khi kiểm tra đăng nhập:', e);
    return false;
  }
}

// Xử lý sự kiện click vào các liên kết đăng ký
document.querySelectorAll('.register-link').forEach(link => {
  link.addEventListener('click', function (e) {
    // Nếu đã đăng nhập, cho phép chuyển hướng đến program.html
    if (isHcmutLoggedIn()) return;
    // Nếu chưa đăng nhập, chuyển hướng đến trang đăng ký
    e.preventDefault();
    const next = this.getAttribute('href') || 'program.html';
    // Thêm tham số next để sau khi đăng nhập xong sẽ quay lại trang này
    location.href = 'role.html?next=' + encodeURIComponent(next);
  });
});

// Cập nhật giao diện người dùng dựa trên trạng thái đăng nhập
function updateAuthUI() {
  // Lấy thông tin vai trò và tên người dùng từ localStorage
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
  const loginLink = document.getElementById('sso-button');
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
    loginLink.textContent = 'HCMUT_SSO';
    const next = location.pathname.substring(location.pathname.lastIndexOf('/')+1) || 'main.html';
    loginLink.href = 'role.html?next=' + encodeURIComponent(next);
    loginLink.onclick = null;
  }
}

updateAuthUI();

  // Xử lý đăng ký chương trình trên trang program.html 
if (false && document.getElementById('program-form')) {
  const form = document.getElementById('program-form');
  const result = document.getElementById('register-result');
  const programSection = document.querySelector('.program-form') ? document.querySelector('.program-form').closest('main') : null;

  // Kiểm tra và hiển thị trạng thái đăng ký khi tải trang
  function checkRegistrationStatus() {
    const loggedIn = isHcmutLoggedIn();
    const role = localStorage.getItem('hcmut_role');
    const username = localStorage.getItem('hcmut_username');

    // Precondition: Phải đăng nhập và role phải là student
    if (!loggedIn || role !== 'student') {
      if (form) {
        form.style.display = 'none';
      }
      if (result) {
        result.innerHTML = `
          <div style="padding:20px; background:#fff3cd; border:1px solid #ffc107; border-radius:8px; text-align:center;">
            <h2 style="color:#856404; margin-bottom:12px;">⚠️ Chưa đăng nhập</h2>
            <p style="color:#856404; margin-bottom:16px;">Bạn cần đăng nhập với vai trò Sinh viên để đăng ký chương trình Tutor.</p>
            <button onclick="location.href='role.html?next=program.html'" style="padding:10px 20px; background:#0b72a8; color:white; border:none; border-radius:6px; cursor:pointer;">Đăng nhập</button>
          </div>
        `;
      }
      return false;
    }

    // Kiểm tra xem sinh viên đã đăng ký chương trình chưa
    try {
      const existing = JSON.parse(localStorage.getItem('tutor_registrations') || '[]');
      const userRegistration = existing.find(reg => reg.username === username);

      if (userRegistration) {
        // Exception flow: Đã đăng ký rồi
        if (form && programSection) {
          form.style.display = 'none';
          result.innerHTML = `
            <div style="padding:20px; background:#d4edda; border:1px solid #28a745; border-radius:8px; text-align:center;">
              <h2 style="color:#155724; margin-bottom:12px;">✅ Bạn đã tham gia chương trình Tutor</h2>
              <p style="color:#155724; margin-bottom:16px;">Thông tin đăng ký của bạn:</p>
              <div style="background:white; padding:16px; border-radius:6px; margin:12px 0; text-align:left;">
                <p><strong>Môn học / Lĩnh vực:</strong> ${userRegistration.subject || 'Chưa có'}</p>
                <p><strong>Kỹ năng cần hỗ trợ:</strong> ${userRegistration.skill || 'Chưa có'}</p>
                <p><strong>Thời gian đăng ký:</strong> ${userRegistration.timeSlotDisplay || userRegistration.timeSlot ? `Tiết ${userRegistration.timeSlot} (${userRegistration.timeRange || ''})` : 'Chưa có'}</p>
                <p><strong>Ngày đăng ký:</strong> ${new Date(userRegistration.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <p style="color:#155724; font-size:14px;">Bạn có thể duyệt danh sách Tutor ở phía trên.</p>
            </div>
          `;
        }
        return true; // Đã đăng ký
      }

      // Chưa đăng ký - hiển thị form
      if (form) form.style.display = 'block';
      if (result) result.innerHTML = '';
      return false; // Chưa đăng ký
    } catch (err) {
      console.error('Lỗi kiểm tra trạng thái đăng ký:', err);
      return false;
    }
  }

  // Kiểm tra khi tải trang
  checkRegistrationStatus();

  // Xử lý sự kiện khi form được gửi đi
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();

    // Precondition check: Phải đăng nhập và role phải là student
    const loggedIn = isHcmutLoggedIn();
    const role = localStorage.getItem('hcmut_role');
    const username = localStorage.getItem('hcmut_username');

    if (!loggedIn || role !== 'student') {
      alert('Vui lòng đăng nhập với vai trò Sinh viên để đăng ký chương trình.');
      location.href = 'role.html?next=program.html';
      return;
    }

    if (!username) {
      alert('Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
      location.href = 'role.html?next=program.html';
      return;
    }

    // Kiểm tra xem đã đăng ký chưa (exception flow)
    try {
      const existing = JSON.parse(localStorage.getItem('tutor_registrations') || '[]');
      const userRegistration = existing.find(reg => reg.username === username);

      if (userRegistration) {
        // Exception flow: Đã đăng ký rồi
        result.innerHTML = `
          <div style="padding:16px; background:#fff3cd; border:1px solid #ffc107; border-radius:6px; color:#856404;">
            <strong>⚠️ Bạn đã tham gia chương trình Tutor.</strong>
            <p style="margin:8px 0 0 0;">Bạn đã đăng ký chương trình trước đó. Vui lòng kiểm tra thông tin đăng ký của bạn.</p>
          </div>
        `;
        checkRegistrationStatus(); // Refresh UI
        return;
      }
    } catch (err) {
      console.error('Lỗi kiểm tra đăng ký:', err);
    }

    // Lấy dữ liệu từ form
    const data = new FormData(form);
    const subject = data.get('subject')?.trim();
    const skill = data.get('skill')?.trim();
    const timeSlot = data.get('timeSlot'); // Tiết học

    // Mapping tiết học sang giờ
    const timeSlotMap = {
      '2': '7:00 - 7:50',
      '3': '8:00 - 8:50',
      '4': '9:00 - 9:50',
      '5': '10:00 - 10:50',
      '6': '11:00 - 11:50',
      '7': '13:00 - 13:50',
      '8': '14:00 - 14:50',
      '9': '15:00 - 15:50',
      '10': '16:00 - 16:50',
      '11': '17:00 - 17:50',
      '12': '18:00 - 18:50',
      '13': '19:00 - 19:50'
    };

    // Validate dữ liệu
    if (!subject && !skill) {
      result.innerHTML = '<div style="padding:12px;background:#ffe6e6;border:1px solid #f5b0b0;border-radius:6px;color:#7a1f1f;">Vui lòng nhập ít nhất một thông tin (Môn học hoặc Kỹ năng).</div>';
      return;
    }

    if (!timeSlot) {
      result.innerHTML = '<div style="padding:12px;background:#ffe6e6;border:1px solid #f5b0b0;border-radius:6px;color:#7a1f1f;">Vui lòng chọn thời gian đăng ký (tiết học).</div>';
      return;
    }

    // Tạo record với thông tin user
    const record = {
      username: username,
      role: role,
      subject: subject || '',
      skill: skill || '',
      timeSlot: timeSlot, // Tiết học (2-13)
      timeSlotDisplay: `Tiết ${timeSlot} (${timeSlotMap[timeSlot]})`, // Hiển thị đẹp
      timeRange: timeSlotMap[timeSlot], // Khoảng thời gian
      description: data.get('description') || '',
      createdAt: new Date().toISOString(),
      status: 'registered' // Trạng thái đã đăng ký
    };

    // Lưu vào localStorage và HCMUT_DATACORE
    try {
      // Lưu vào tutor_registrations
      const existing = JSON.parse(localStorage.getItem('tutor_registrations') || '[]');
      existing.push(record);
      localStorage.setItem('tutor_registrations', JSON.stringify(existing));

      // Lưu vào HCMUT_DATACORE (cập nhật user info)
      const db = JSON.parse(localStorage.getItem('HCMUT_DATACORE') || '[]');
      const userIndex = db.findIndex(u => u.username === username);
      if (userIndex >= 0) {
        db[userIndex] = Object.assign(db[userIndex], {
          tutorProgramRegistered: true,
          tutorProgramRegistrationDate: record.createdAt,
          tutorProgramInfo: {
            subject: record.subject,
            skill: record.skill,
            timeSlot: record.timeSlot,
            timeSlotDisplay: record.timeSlotDisplay,
            timeRange: record.timeRange
          }
        });
      } else {
        // Nếu chưa có trong HCMUT_DATACORE, thêm mới
        db.push({
          username: username,
          role: role,
          tutorProgramRegistered: true,
          tutorProgramRegistrationDate: record.createdAt,
          tutorProgramInfo: {
            subject: record.subject,
            skill: record.skill,
            timeSlot: record.timeSlot,
            timeSlotDisplay: record.timeSlotDisplay,
            timeRange: record.timeRange
          },
          createdAt: record.createdAt
        });
      }
      localStorage.setItem('HCMUT_DATACORE', JSON.stringify(db));

      // Hiển thị thông báo thành công
      result.innerHTML = `
        <div style="padding:16px; background:#d4edda; border:1px solid #28a745; border-radius:6px; color:#155724;">
          <strong>✅ Đăng ký thành công!</strong>
          <p style="margin:8px 0 0 0;">Hồ sơ đăng ký của bạn đã được ghi nhận trong hệ thống. Bạn có thể duyệt danh sách Tutor ở phía trên.</p>
        </div>
      `;

      // Reset form và refresh UI
      form.reset();
      
      // Sau 1 giây, refresh để hiển thị trạng thái đã đăng ký
      setTimeout(() => {
        checkRegistrationStatus();
      }, 1000);

    } catch (err) {
      console.error('Lỗi khi lưu đăng ký:', err);
      result.innerHTML = '<div style="padding:12px;background:#ffe6e6;border:1px solid #f5b0b0;border-radius:6px;color:#7a1f1f;">Lỗi khi lưu đăng ký. Vui lòng thử lại.</div>';
    }
  });

  // cancel button
  const cancelBtn = document.getElementById('cancel-register');
  if (cancelBtn) cancelBtn.addEventListener('click', () => location.href = 'main.html');
}

// Xử lý tìm kiếm và các nút Call-to-Action (CTA) trên trang chương trình
const heroSearchBtn = document.getElementById('hero-search-btn');
if (heroSearchBtn) {
  // Xử lý sự kiện khi nhấn nút tìm kiếm
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

// -------------------- Dữ liệu và chức năng duyệt danh sách Tutor --------------------
// Dữ liệu mẫu danh sách Tutor - Chỉ hiển thị các Tutor còn trống lịch
const MOCK_TUTORS = [
  {id:1, name:'Nguyễn Văn Hải', dept:'Khoa học và kỹ thuật máy tính', subjects:['Lập trình C++','Cấu trúc dữ liệu'], availability:'Chiều', bio:'Tutor chuyên về lập trình C++.', available:true, timeSlots:['7','8','9'], major:'Kỹ thuật phần mềm'},
  {id:2, name:'Trần Thị Lan', dept:'Khoa học ứng dụng', subjects:['Toán rời rạc','Giải tích'], availability:'Sáng', bio:'Gia sư Toán, tập trung lý thuyết.', available:true, timeSlots:['2','3','4'], major:'Toán học'},
  {id:3, name:'Lê Văn Khải', dept:'Khoa học và kỹ thuật máy tính', subjects:['Lập trình Python','Machine Learning'], availability:'Tối', bio:'Tutor ML và Python.', available:true, timeSlots:['11','12','13'], major:'Trí tuệ nhân tạo'},
  {id:4, name:'Phạm Dương', dept:'Khoa học ứng dụng', subjects:['Vật lý đại cương'], availability:'Sáng', bio:'Giải bài tập và hướng dẫn thực hành.', available:true, timeSlots:['2','3','5'], major:'Vật lý'},
  {id:5, name:'Hoàng Thị Duyên', dept:'Điện - Điện tử', subjects:['Mạch điện','Vi điều khiển'], availability:'Chiều', bio:'Chuyên về điện tử và vi điều khiển.', available:true, timeSlots:['7','8','9'], major:'Điện tử'},
  {id:6, name:'Nguyễn Văn Thái', dept:'Xây dựng', subjects:['Cơ học kết cấu','Vật liệu xây dựng'], availability:'Tối', bio:'Tutor về xây dựng và kết cấu.', available:true, timeSlots:['10','11','12'], major:'Kết cấu công trình'}
];

// Hàm lấy danh sách Tutor còn trống lịch (Step 1)
function getAvailableTutors() {
  // Ưu tiên lấy từ HCMUT_DATACORE
  let tutorsFromDatacore = [];
  try {
    const datacore = JSON.parse(localStorage.getItem('HCMUT_DATACORE') || '[]');
    tutorsFromDatacore = datacore
      .filter(u => u.role === 'tutor' && u.fullname && (u.available !== false))
      .map(u => ({
        id: parseInt(u.id?.replace('tutor_', '') || u.username?.replace('tutor', '') || Math.random() * 1000),
        username: u.username,
        name: u.fullname,
        dept: u.dept || u.department || '',
        subjects: u.subjects || [],
        availability: u.availability || 'Linh hoạt',
        bio: u.bio || `${u.fullname} - ${u.dept || u.department || ''}`,
        available: u.available !== false,
        timeSlots: u.timeSlots || [],
        major: u.major || ''
      }));
  } catch (e) {
    console.error('Lỗi khi lấy tutor từ HCMUT_DATACORE:', e);
  }

  // Nếu có tutor từ HCMUT_DATACORE, dùng nó
  if (tutorsFromDatacore.length > 0) {
    return tutorsFromDatacore.filter(tutor => tutor.available === true);
  }

  // Fallback: Dùng MOCK_TUTORS nếu chưa có trong HCMUT_DATACORE
  return MOCK_TUTORS.filter(tutor => tutor.available === true);
}

// Hàm kiểm tra xem sinh viên đã đăng ký với Tutor chưa
function hasRegisteredWithTutor(tutorId) {
  const username = localStorage.getItem('hcmut_username');
  if (!username) return false;
  
  try {
    const requests = JSON.parse(localStorage.getItem('tutor_requests') || '[]');
    return requests.some(req => 
      req.studentUsername === username && 
      String(req.tutorId) === String(tutorId) &&
      req.status !== 'rejected'
    );
  } catch (e) {
    return false;
  }
}

// Hàm hiển thị danh sách Tutor lên giao diện
function renderTutors(list) {
  // Lấy các phần tử DOM cần thiết
  const container = document.getElementById('tutor-list');
  const empty = document.getElementById('tutor-empty');
  
  if (!container) {
    console.error('Không tìm thấy phần tử tutor-list');
    return;
  }
  
  // Xóa nội dung cũ
  container.innerHTML = '';
  
  // Exception flow: Không có Tutor phù hợp
  if (!list || list.length === 0) {
    container.style.display = 'none';
    if (empty) {
      empty.style.display = 'block';
    }
    console.log('Không có tutor để hiển thị');
    return;
  }
  
  // Post condition: Danh sách Tutor hiện ra
  if (empty) empty.style.display = 'none';
  container.style.display = 'grid';
  console.log('Đang render', list.length, 'tutor');
  
  const username = localStorage.getItem('hcmut_username');
  
  list.forEach(t => {
    // Kiểm tra xem đã đăng ký với Tutor này chưa
    const hasRegistered = hasRegisteredWithTutor(t.id);
    const card = document.createElement('div');
    card.className = 'tutor-card';
    card.style.cssText = 'background:white; border:1px solid #e0e0e0; border-radius:8px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.1); transition:transform 0.2s, box-shadow 0.2s;';
    
    // Hiển thị lịch rảnh với màu sắc rõ ràng
    const availabilityColors = {
      'Sáng': { color: '#28a745', bg: 'rgba(40, 167, 69, 0.1)' },
      'Chiều': { color: '#ffc107', bg: 'rgba(255, 193, 7, 0.1)' },
      'Tối': { color: '#17a2b8', bg: 'rgba(23, 162, 184, 0.1)' },
      'Linh hoạt': { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)' }
    };
    const availabilityStyle = availabilityColors[t.availability] || { color: '#6c757d', bg: 'rgba(108, 117, 125, 0.1)' };
    
    card.innerHTML = `
      <div class="tutor-head" style="margin-bottom:16px; border-bottom:2px solid #0b72a8; padding-bottom:12px;">
        <h4 style="margin:0; color:#0b72a8; font-size:20px; font-weight:600;">${t.name}</h4>
      </div>
      <div class="tutor-meta" style="margin-bottom:12px;">
        <div style="padding:12px; background:#f8f9fa; border-radius:6px; margin-bottom:8px;">
          <strong style="color:#333;">Khoa/Chuyên ngành:</strong> 
          <span style="color:#555; font-weight:500;">${t.dept}${t.major ? ' - ' + t.major : ''}</span>
        </div>
        <div style="padding:12px; background:${availabilityStyle.bg}; border-left:4px solid ${availabilityStyle.color}; border-radius:6px; margin-bottom:8px;">
          <strong style="color:#333; display:block; margin-bottom:4px;">⏰ Lịch rảnh:</strong>
          <span style="color:${availabilityStyle.color}; font-weight:600; font-size:16px;">${t.availability}</span>
          ${t.timeSlots && t.timeSlots.length > 0 ? `
            <div style="margin-top:8px; padding:6px 10px; background:white; border-radius:4px;">
              <strong style="font-size:12px; color:#666;">Các tiết rảnh:</strong>
              <span style="font-size:13px; color:#333; font-weight:500;"> Tiết ${t.timeSlots.join(', ')}</span>
            </div>
          ` : ''}
        </div>
        ${t.available ? '<div style="padding:8px; background:#d4edda; border-radius:6px; text-align:center;"><span style="color:#28a745; font-weight:600; font-size:14px;">✓ Còn trống lịch</span></div>' : ''}
      </div>
      <div class="tutor-subjects" style="margin-bottom:12px; padding:12px; background:#e7f3ff; border-left:3px solid #0b72a8; border-radius:4px;">
        <strong style="display:block; margin-bottom:6px; color:#0b72a8;">📚 Môn học:</strong>
        <div style="color:#333; line-height:1.8;">
          ${t.subjects.map(s => `<span style="display:inline-block; padding:4px 8px; margin:2px; background:white; border-radius:4px; font-size:13px;">${s}</span>`).join('')}
        </div>
      </div>
      <div class="tutor-bio" style="margin-bottom:16px; padding:12px; background:#fafafa; border-radius:6px; color:#666; font-size:14px; line-height:1.6;">
        <strong style="color:#333; display:block; margin-bottom:6px;">ℹ️ Giới thiệu:</strong>
        ${t.bio}
      </div>
      <div>
        <button class="request-btn register-tutor-btn" data-id="${t.id}" data-tutor-username="${t.username}" data-tutor-name="${t.name}" ${hasRegistered ? 'disabled' : ''} style="width:100%; padding:12px; ${hasRegistered ? 'background:#6c757d; cursor:not-allowed;' : 'background:#0b72a8; cursor:pointer;'} color:white; border:none; border-radius:6px; font-weight:600; transition:all 0.2s; font-size:15px; box-shadow:0 2px 8px rgba(11, 114, 168, 0.2);" ${hasRegistered ? '' : 'onmouseenter="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 4px 12px rgba(11, 114, 168, 0.3)\'" onmouseleave="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 2px 8px rgba(11, 114, 168, 0.2)\'"'}>
          ${hasRegistered ? '⏳ Chờ xác nhận' : '📝 Đăng ký'}
        </button>
      </div>
    `;
    
    // Hover effect (chỉ khi button không disabled)
    card.addEventListener('mouseenter', function() {
      if (!hasRegistered) {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        const btn = this.querySelector('.request-btn');
        if (btn && !btn.disabled) btn.style.background = '#0a84d6';
      }
    });
    card.addEventListener('mouseleave', function() {
      if (!hasRegistered) {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        const btn = this.querySelector('.request-btn');
        if (btn && !btn.disabled) btn.style.background = '#0b72a8';
      }
    });
    
    container.appendChild(card);
  });
}

// Hàm lọc danh sách Tutor theo các tiêu chí (Step 3)
function filterTutors(filters) {
  // Chỉ lọc trong danh sách Tutor còn trống lịch
  const availableTutors = getAvailableTutors();
  
  return availableTutors.filter(t => {
    // Chỉ lọc các Tutor còn trống lịch (available: true)
    if (!t.available) return false;
    
    // Lọc theo khoa/chuyên ngành (Step 2)
    if (filters.dept && t.dept !== filters.dept) return false;
    
    // Lọc theo chuyên ngành (nếu có)
    if (filters.major && t.major && !t.major.toLowerCase().includes(filters.major.toLowerCase())) return false;
    
    // Lọc theo thời gian rảnh - lịch rảnh (Step 2)
    if (filters.availability && t.availability !== filters.availability) return false;
    
    // Lọc theo môn học (chọn từ dropdown)
    if (filters.subject) {
      const selectedSubject = filters.subject.trim();
      if (selectedSubject) {
        // Kiểm tra xem Tutor có dạy môn học được chọn không
        const hasSubject = t.subjects.some(s => s === selectedSubject || s.toLowerCase().includes(selectedSubject.toLowerCase()));
        if (!hasSubject) return false;
      }
    }
    
    // Lọc theo tiết học cụ thể (nếu có) - Step 2
    if (filters.timeSlot && filters.timeSlot !== '') {
      if (!t.timeSlots || t.timeSlots.length === 0) return false;
      // So sánh cả string và number
      const hasTimeSlot = t.timeSlots.some(ts => 
        String(ts) === String(filters.timeSlot) || ts === filters.timeSlot
      );
      if (!hasTimeSlot) return false;
    }
    
    return true;
  });
}

// Khởi tạo khu vực hiển thị danh sách Tutor
function initTutorArea() {
  // Lấy các phần tử DOM cần thiết
  const notLoggedInEl = document.getElementById('tutor-not-logged-in');
  const notRegisteredEl = document.getElementById('tutor-not-registered');
  const filterForm = document.getElementById('tutor-filter-form');
  const filterBtn = document.getElementById('filter-btn');
  const clearBtn = document.getElementById('clear-filter-btn');

  // Kiểm tra đăng nhập và role
  const loggedIn = isHcmutLoggedIn();
  const role = localStorage.getItem('hcmut_role');
  
  console.log('Kiểm tra đăng nhập:', { loggedIn, role, hcmut_logged_in: localStorage.getItem('hcmut_logged_in') });
  
  if (!loggedIn || role !== 'student') {
    console.log('Chưa đăng nhập hoặc không phải student - ẩn form lọc');
    if (notLoggedInEl) notLoggedInEl.style.display = 'block';
    if (notRegisteredEl) notRegisteredEl.style.display = 'none';
    if (filterForm) filterForm.style.display = 'none';
    renderTutors([]);
    return;
  }
  
  console.log('Đã đăng nhập với role student - hiển thị form lọc');

  // Đã đăng nhập với role student - hiển thị bộ lọc
  if (notLoggedInEl) notLoggedInEl.style.display = 'none';
  if (notRegisteredEl) notRegisteredEl.style.display = 'none';
  if (filterForm) filterForm.style.display = 'block';
  
  // Step 1: Hiển thị danh sách tất cả Tutor còn trống lịch
  const availableTutors = getAvailableTutors();
  
  if (availableTutors.length === 0) {
    // Exception flow: Không có Tutor nào còn trống lịch
    const empty = document.getElementById('tutor-empty');
    renderTutors([]);
    if (empty) {
      empty.style.display = 'block';
      empty.innerHTML = `
        <div style="padding:40px; text-align:center; color:#666; background:#fff3cd; border:1px solid #ffc107; border-radius:8px;">
          <p style="font-size:18px; font-weight:600; margin:0 0 12px 0; color:#856404;">⚠️ Hiện tại không có Tutor nào còn trống lịch</p>
          <p style="font-size:14px; margin:0; color:#856404;">Tất cả Tutor hiện đang bận hoặc đã đầy lịch.</p>
          <p style="font-size:13px; margin-top:12px; color:#999;">Vui lòng thử lại sau hoặc liên hệ quản trị viên để biết thêm thông tin.</p>
        </div>
      `;
    }
    return;
  }
  
  // Post condition: Danh sách Tutor hiện ra
  renderTutors(availableTutors);

  // Step 2 & 3: Sinh viên chọn bộ lọc và hệ thống lọc kết quả
  if (filterBtn) {
    filterBtn.addEventListener('click', () => {
      // Lấy giá trị từ các bộ lọc (Khoa, Môn học, Thời gian)
      const dept = document.getElementById('filter-dept')?.value || '';
      const subject = document.getElementById('filter-subject')?.value || '';
      const timeSlot = document.getElementById('filter-timeSlot')?.value || '';
      
      console.log('Điều kiện lọc:', { dept, subject, timeSlot });
      
      // Lấy tất cả tutor có sẵn
      const allTutors = getAvailableTutors();
      console.log('Tổng số tutor có sẵn:', allTutors.length);
      
      // Nếu không có điều kiện lọc nào, hiển thị tất cả
      if (!dept && !subject && !timeSlot) {
        console.log('Không có điều kiện lọc - hiển thị tất cả tutor');
        renderTutors(allTutors);
        
        // Ẩn thông báo empty nếu có kết quả
        const empty = document.getElementById('tutor-empty');
        if (empty) empty.style.display = 'none';
        return;
      }
      
      // Lọc theo các tiêu chí: Khoa, Môn học, Thời gian
      const filters = {};
      if (dept) filters.dept = dept;
      if (subject) filters.subject = subject;
      if (timeSlot) filters.timeSlot = timeSlot;
      
      console.log('Filters object:', filters);
      
      const results = filterTutors(filters);
      
      // Post condition: Danh sách Tutor hiện ra
      console.log('Kết quả lọc:', results.length, 'tutor', results);
      renderTutors(results);
    
      // Exception flow: Không có Tutor phù hợp
      if (results.length === 0) {
        const empty = document.getElementById('tutor-empty');
        if (empty) {
          empty.style.display = 'block';
          empty.innerHTML = `
            <div style="padding:40px; text-align:center; color:#666; background:#fff3cd; border:2px solid #ffc107; border-radius:8px;">
              <p style="font-size:20px; font-weight:700; margin:0 0 12px 0; color:#856404;">⚠️ Không có gia sư phù hợp</p>
              <p style="font-size:15px; margin:0; color:#856404;">Không tìm thấy gia sư nào đáp ứng đủ điều kiện lọc của bạn.</p>
              <p style="font-size:14px; margin-top:12px; color:#999;">Vui lòng thử điều chỉnh bộ lọc hoặc xóa bộ lọc để xem tất cả gia sư.</p>
            </div>
          `;
        }
      } else {
        // Ẩn thông báo empty nếu có kết quả
        const empty = document.getElementById('tutor-empty');
        if (empty) empty.style.display = 'none';
      }
    });
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Xóa tất cả bộ lọc (Khoa, Môn học, Thời gian)
      const filterDept = document.getElementById('filter-dept');
      const filterSubject = document.getElementById('filter-subject');
      const filterTimeSlot = document.getElementById('filter-timeSlot');
      
      if (filterDept) filterDept.value = '';
      if (filterSubject) filterSubject.value = '';
      if (filterTimeSlot) filterTimeSlot.value = '';
      
      // Hiển thị lại tất cả Tutor còn trống lịch
      const availableTutors = getAvailableTutors();
      renderTutors(availableTutors);
      
      // Ẩn thông báo empty
      const empty = document.getElementById('tutor-empty');
      if (empty) empty.style.display = 'none';
    });
  }

  // Xử lý đăng ký Tutor (Step 4: Sinh viên chọn gia sư và nhấn đăng ký)
  const tutorListEl = document.getElementById('tutor-list');
  if (tutorListEl) {
    tutorListEl.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.request-btn');
      if (!btn || btn.disabled) return;
      
      const tutorId = btn.getAttribute('data-id');
      const tutorName = btn.getAttribute('data-tutor-name');
      const tutorUsername = btn.getAttribute('data-tutor-username');
      const tutor = MOCK_TUTORS.find(x => String(x.id) === String(tutorId));
      
      if (!tutor) return;
      
      // Kiểm tra đăng nhập
      const loggedIn = isHcmutLoggedIn();
      const role = localStorage.getItem('hcmut_role');
      const username = localStorage.getItem('hcmut_username');
      
      if (!loggedIn || role !== 'student' || !username) {
        alert('Vui lòng đăng nhập với vai trò Sinh viên để đăng ký Tutor.');
        location.href = 'role.html?next=program.html';
        return;
      }
      
      // Kiểm tra đã đăng ký chưa
      if (hasRegisteredWithTutor(tutorId)) {
        alert('Bạn đã đăng ký với Tutor này rồi.');
        return;
      }
      
      // Lấy giá trị bộ lọc hiện tại
      const filterDept = document.getElementById('filter-dept')?.value || '';
      const filterSubject = document.getElementById('filter-subject')?.value || '';
      const filterTimeSlot = document.getElementById('filter-timeSlot')?.value || '';
      
      // Tạo yêu cầu đăng ký
      const request = {
        id: 'req_' + Date.now(),
        studentUsername: username,
        tutorId: parseInt(tutorId),
        tutorName: tutorName,
        tutorUsername: tutorUsername,
        dept: filterDept || tutor.dept,
        subject: filterSubject || (tutor.subjects && tutor.subjects.length > 0 ? tutor.subjects[0] : ''),
        timeSlot: filterTimeSlot || (tutor.timeSlots && tutor.timeSlots.length > 0 ? tutor.timeSlots[0] : ''),
        status: 'pending', // pending, accepted, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        filterCriteria: {
          dept: filterDept,
          subject: filterSubject,
          timeSlot: filterTimeSlot
        }
      };
      
      try {
        // Lưu vào tutor_requests
        let requests = [];
        try {
          requests = JSON.parse(localStorage.getItem('tutor_requests') || '[]');
        } catch (e) {
          requests = [];
        }
        requests.push(request);
        localStorage.setItem('tutor_requests', JSON.stringify(requests));
        
        // Lưu vào HCMUT_DATACORE
        let datacore = [];
        try {
          datacore = JSON.parse(localStorage.getItem('HCMUT_DATACORE') || '[]');
        } catch (e) {
          datacore = [];
        }
        
        const userIndex = datacore.findIndex(u => u.username === username);
        if (userIndex >= 0) {
          if (!datacore[userIndex].tutorRequests) {
            datacore[userIndex].tutorRequests = [];
          }
          datacore[userIndex].tutorRequests.push({
            tutorId: request.tutorId,
            tutorName: request.tutorName,
            status: request.status,
            createdAt: request.createdAt
          });
        } else {
          datacore.push({
            username: username,
            role: role,
            tutorRequests: [{
              tutorId: request.tutorId,
              tutorName: request.tutorName,
              status: request.status,
              createdAt: request.createdAt
            }],
            createdAt: new Date().toISOString()
          });
        }
        localStorage.setItem('HCMUT_DATACORE', JSON.stringify(datacore));
        
        // Cập nhật UI: Đổi button thành "Chờ xác nhận"
        btn.disabled = true;
        btn.style.background = '#6c757d';
        btn.style.cursor = 'not-allowed';
        btn.style.transform = 'none';
        btn.style.boxShadow = 'none';
        btn.innerHTML = '⏳ Chờ xác nhận';
        
        // Thông báo thành công
        alert(`✅ Đã đăng ký thành công với ${tutorName}!\nYêu cầu đăng ký của bạn đã được gửi. Tutor sẽ xác nhận trong trang "Chương trình cho Tutor".`);
        
        // Re-render để đảm bảo UI đồng bộ
        setTimeout(() => {
          const currentFilters = {
            dept: filterDept,
            subject: filterSubject,
            timeSlot: filterTimeSlot
          };
          const filtered = filterTutors(currentFilters);
          renderTutors(filtered);
        }, 100);
        
      } catch (err) {
        console.error('Lỗi khi lưu yêu cầu đăng ký:', err);
        alert('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.');
      }
    });
  }
}

// Init tutor area if present on page
if (document.getElementById('tutor-area')) {
  // Đảm bảo hàm được gọi sau khi DOM và localStorage sẵn sàng
  const initTutorAreaSafely = () => {
    const loggedIn = isHcmutLoggedIn();
    const role = localStorage.getItem('hcmut_role');
    console.log('Init tutor area - loggedIn:', loggedIn, 'role:', role);
    initTutorArea();
  };
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTutorAreaSafely);
  } else {
    // DOM đã sẵn sàng, nhưng có thể localStorage chưa được set
    setTimeout(initTutorAreaSafely, 200);
  }
}

// -------------------- Khởi tạo dữ liệu Tutor trong HCMUT_DATACORE --------------------
(function initTutorsInDatacore() {
  // Kiểm tra xem đã có tutor nào trong HCMUT_DATACORE chưa
  let datacore = [];
  try {
    datacore = JSON.parse(localStorage.getItem('HCMUT_DATACORE') || '[]');
  } catch (e) {
    datacore = [];
  }

  // Kiểm tra xem đã có tutor nào chưa
  const hasTutors = datacore.some(u => u.role === 'tutor' && u.fullname);
  if (hasTutors) {
    console.log('Đã có dữ liệu tutor trong HCMUT_DATACORE');
    return;
  }

  // Dữ liệu tutor mẫu dựa trên MOCK_TUTORS
  const tutorData = [
    {
      username: 'nguyenvanhai.tutor',
      originalEmail: 'vanhai01@hcmut.edu.vn',
      password: btoa('1'), // Mật khẩu: tutor001
      role: 'tutor',
      fullname: 'Nguyễn Văn Hải',
      dept: 'Khoa học và kỹ thuật máy tính',
      subjects: ['Lập trình C++', 'Cấu trúc dữ liệu'],
      availability: 'Chiều',
      timeSlots: ['7', '8', '9'], // Tiết 7, 8, 9 (Chiều)
      bio: 'Tutor chuyên về lập trình C++.',
      major: 'Kỹ thuật phần mềm',
      available: true,
      registrationDate: new Date('2024-01-15').toISOString(),
      registrationDateTime: new Date('2024-01-15').toLocaleString('vi-VN'),
      id: 'tutor_001'
    },
    {
      username: 'tranthilan.tutor',
      originalEmail: 'tranlan1212@hcmut.edu.vn',
      password: btoa('1'),
      role: 'tutor',
      fullname: 'Trần Thị Lan',
      dept: 'Khoa học ứng dụng',
      subjects: ['Toán rời rạc', 'Giải tích'],
      availability: 'Sáng',
      timeSlots: ['2', '3', '4'], // Tiết 2, 3, 4 (Sáng)
      bio: 'Gia sư Toán, tập trung lý thuyết.',
      major: 'Toán học',
      available: true,
      registrationDate: new Date('2024-01-16').toISOString(),
      registrationDateTime: new Date('2024-01-16').toLocaleString('vi-VN'),
      id: 'tutor_002'
    },
    {
      username: 'khailevan75.tutor',
      originalEmail: 'khaivan75@hcmut.edu.vn',
      password: btoa('1'),
      role: 'tutor',
      fullname: 'Lê Văn Khải',
      dept: 'Khoa học và kỹ thuật máy tính',
      subjects: ['Lập trình Python', 'Machine Learning'],
      availability: 'Tối',
      timeSlots: ['11', '12', '13'], // Tiết 11, 12, 13 (Tối)
      bio: 'Tutor ML và Python.',
      major: 'Trí tuệ nhân tạo',
      available: true,
      registrationDate: new Date('2024-01-17').toISOString(),
      registrationDateTime: new Date('2024-01-17').toLocaleString('vi-VN'),
      id: 'tutor_003'
    },
    {
      username: 'phamduong.tutor',
      originalEmail: 'duongpham@hcmut.edu.vn',
      password: btoa('1'),
      role: 'tutor',
      fullname: 'Phạm Dương',
      dept: 'Khoa học ứng dụng',
      subjects: ['Vật lý đại cương'],
      availability: 'Sáng',
      timeSlots: ['2', '3', '5'], // Tiết 2, 3, 5 (Sáng)
      bio: 'Giải bài tập và hướng dẫn thực hành.',
      major: 'Vật lý',
      available: true,
      registrationDate: new Date('2024-01-18').toISOString(),
      registrationDateTime: new Date('2024-01-18').toLocaleString('vi-VN'),
      id: 'tutor_004'
    },
    {
      username: 'hoangduyen.tutor',
      originalEmail: 'htduyen@hcmut.edu.vn',
      password: btoa('1'),
      role: 'tutor',
      fullname: 'Hoàng Thị Duyên',
      dept: 'Điện - Điện tử',
      subjects: ['Mạch điện', 'Vi điều khiển'],
      availability: 'Chiều',
      timeSlots: ['7', '8', '9'], // Tiết 7, 8, 9 (Chiều)
      bio: 'Chuyên về điện tử và vi điều khiển.',
      major: 'Điện tử',
      available: true,
      registrationDate: new Date('2024-01-19').toISOString(),
      registrationDateTime: new Date('2024-01-19').toLocaleString('vi-VN'),
      id: 'tutor_005'
    },
    {
      username: 'vanthai.tutor',
      originalEmail: 'thainguyen@hcmut.edu.vn',
      password: btoa('1'),
      role: 'tutor',
      fullname: 'Nguyễn Văn Thái',
      dept: 'Xây dựng',
      subjects: ['Cơ học kết cấu', 'Vật liệu xây dựng'],
      availability: 'Tối',
      timeSlots: ['10', '11', '12'], // Tiết 10, 11, 12 (Tối)
      bio: 'Tutor về xây dựng và kết cấu.',
      major: 'Kết cấu công trình',
      available: true,
      registrationDate: new Date('2024-01-20').toISOString(),
      registrationDateTime: new Date('2024-01-20').toLocaleString('vi-VN'),
      id: 'tutor_006'
    }
  ];

  // Thêm các tutor vào HCMUT_DATACORE
  tutorData.forEach(tutor => {
    // Kiểm tra xem đã tồn tại chưa
    const exists = datacore.some(u => u.username === tutor.username || u.id === tutor.id);
    if (!exists) {
      datacore.push(tutor);
    }
  });

  // Lưu vào localStorage
  localStorage.setItem('HCMUT_DATACORE', JSON.stringify(datacore));
  
  // Cũng lưu vào hcmut_users để tương thích với hệ thống đăng nhập
  let hcmutUsers = [];
  try {
    hcmutUsers = JSON.parse(localStorage.getItem('hcmut_users') || '[]');
  } catch (e) {
    hcmutUsers = [];
  }

  tutorData.forEach(tutor => {
    const exists = hcmutUsers.some(u => u.username === tutor.username);
    if (!exists) {
      hcmutUsers.push({
        username: tutor.username,
        originalEmail: tutor.originalEmail,
        password: tutor.password,
        role: tutor.role,
        registrationDate: tutor.registrationDate,
        registrationDateTime: tutor.registrationDateTime,
        id: tutor.id
      });
    }
  });

  localStorage.setItem('hcmut_users', JSON.stringify(hcmutUsers));
  
  console.log('✅ Đã khởi tạo dữ liệu tutor trong HCMUT_DATACORE:', tutorData.length, 'tutor');
})();
// -------------------- end Tutor browsing --------------------
