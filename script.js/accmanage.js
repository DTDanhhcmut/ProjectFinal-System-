// -------------------- Account Management --------------------


function initAccountForm() {
  const username = localStorage.getItem('hcmut_username');
  const role = localStorage.getItem('hcmut_role');
  
  const form = document.getElementById('account-form');
  if (!form) return; 

  if (!username) {
    form.innerHTML = '<p class="error-msg">Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.</p>';
    return;
  }

 
  document.getElementById('acc-username').value = username;
  document.getElementById('acc-role').value = (role || 'N/A').charAt(0).toUpperCase() + (role || 'N/A').slice(1); // Viết hoa chữ đầu

  
  try {
    const db = JSON.parse(localStorage.getItem('HCMUT_DATACORE') || '[]');
    const userRecord = db.find(u => u.username === username);
    if (userRecord) {
      
      
      const idLabel = document.getElementById('acc-id-label');
      const idValueInput = document.getElementById('acc-id-value');
      
      if (userRecord.role === 'student') {
        idLabel.textContent = 'MSSV (Mã số sinh viên)'; 
        idValueInput.value = userRecord.mssv || 'N/A'; 
      } else if (userRecord.role === 'tutor') {
        idLabel.textContent = 'MSCB (Mã số cán bộ)'; 
        idValueInput.value = userRecord.mscb || 'N/A'; 
      } else {
        idLabel.textContent = 'Mã số';
        idValueInput.value = 'N/A';
      }
      
      document.getElementById('acc-status').value = userRecord.status || 'Không xác định';
      
      document.getElementById('acc-fullname').value = userRecord.fullname || '';
      document.getElementById('acc-bio').value = userRecord.bio || '';
      document.getElementById('acc-department').value = userRecord.department || '';
      document.getElementById('acc-major').value = userRecord.major || '';
      document.getElementById('acc-email').value = userRecord.email || '';
      document.getElementById('acc-phone').value = userRecord.phone || '';
      document.getElementById('acc-website').value = userRecord.website || '';
      
      if (userRecord.avatar) {
        document.getElementById('acc-avatar-preview').src = userRecord.avatar;
      } else {
        document.getElementById('acc-avatar-preview').src = 'images/default-avatar.png';
      }
    } else {
      
      document.getElementById('account-result').innerHTML = '<div class="error-msg">Lỗi: Không tìm thấy hồ sơ cho tài khoản ' + username + '.</div>';
    }
  } catch (e) {
    console.error('Failed to load profile', e);
    document.getElementById('account-result').innerHTML = '<div class="error-msg">Lỗi khi tải hồ sơ.</div>';
  }
}


(function setupAccountForm() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAccountForm);
        return;
    }

    const form = document.getElementById('account-form');
    if (!form) return; 

    const resultEl = document.getElementById('account-result');
    const avatarInput = document.getElementById('acc-avatar-input');
    const avatarPreview = document.getElementById('acc-avatar-preview');
    const avatarRemoveBtn = document.getElementById('acc-avatar-remove');

    
    let newAvatarDataUrl = null; 
    let avatarRemoved = false;
    
    window.reloadAfterSave = false; 

    
    initAccountForm();

    // Handle avatar file selection
    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
        if (file.size > 800 * 1024) { // Giới hạn 800Kb
            resultEl.innerHTML = '<div class="error-msg">Lỗi: Kích thước ảnh quá lớn (Tối đa 800Kb).</div>';
            avatarInput.value = ''; // Xóa file
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            avatarPreview.src = e.target.result; w
            newAvatarDataUrl = e.target.result; 
            avatarRemoved = false;
            resultEl.innerHTML = ''; 
        };
        reader.readAsDataURL(file); 
        }
    });

    // Handle remove avatar
    avatarRemoveBtn.addEventListener('click', () => {
        avatarPreview.src = 'images/default-avatar.png';
        avatarInput.value = '';
        newAvatarDataUrl = null;
        avatarRemoved = true;
    });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = localStorage.getItem('hcmut_username');
        if (!username) {
        resultEl.innerHTML = '<div class="error-msg">Lỗi: Phiên đăng nhập hết hạn.</div>';
        return;
        }

        // Lấy tất cả giá trị từ form
        const profileData = {
        fullname: document.getElementById('acc-fullname').value,
        bio: document.getElementById('acc-bio').value,
        department: document.getElementById('acc-department').value,
        major: document.getElementById('acc-major').value,
        email: document.getElementById('acc-email').value,
        phone: document.getElementById('acc-phone').value,
        website: document.getElementById('acc-website').value,
        };

        // Hàm này thực hiện việc lưu vào CSDL (localStorage)
        const performSave = () => {
        try {
            const db = JSON.parse(localStorage.getItem('HCMUT_DATACORE') || '[]');
            const userIndex = db.findIndex(u => u.username === username);
            if (userIndex === -1) {
            resultEl.innerHTML = '<div class="error-msg">Lỗi: không tìm thấy tài khoản trong CSDL.</div>';
            return;
            }

            
            const updatedUser = { ...db[userIndex], ...profileData };
            db[userIndex] = updatedUser;


            
            if (avatarRemoved) {
              db[userIndex].avatar = ''; 
            } else if (newAvatarDataUrl) {
              db[userIndex].avatar = newAvatarDataUrl; 
            }

            
            localStorage.setItem('HCMUT_DATACORE', JSON.stringify(db));
            
            
            newAvatarDataUrl = null;
            avatarRemoved = false;
            avatarInput.value = '';
            
            
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }

            
            if (window.reloadAfterSave) {
            window.reloadAfterSave = false; 
            location.reload(); 
            } else {
            resultEl.innerHTML = '<div class="success-msg">Cập nhật thông tin thành công!</div>';
            window.scrollTo(0, 0); 
            }

        } catch (err) {
            resultEl.innerHTML = '<div class="error-msg">Lỗi khi lưu thông tin: ' + err.message + '</div>';
            console.error(err);
            window.reloadAfterSave = false; 
        }
        };
        
        const avatarFile = avatarInput.files[0];
        if (avatarFile && !newAvatarDataUrl) { 
        const reader = new FileReader();
        reader.onload = (e) => {
            newAvatarDataUrl = e.target.result; 
            performSave();                      
        };
        reader.onerror = () => {
            resultEl.innerHTML = '<div class="error-msg">Lỗi khi đọc file ảnh.</div>';
            window.reloadAfterSave = false;
        };
        reader.readAsDataURL(avatarFile);
        } else {
        performSave();
        }
    });

    // Cancel button
    const cancelBtn = document.getElementById('cancel-account');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('Bạn có chắc muốn hủy bỏ các thay đổi và tải lại thông tin đã lưu?')) {
            location.reload(); 
            }
        });
    }
})();
// -------------------- end Account Management --------------------


//---------------------------Test data--------------------------
(function initMockData() {
  // Chỉ chạy nếu 'HCMUT_DATACORE' chưa tồn tại trong localStorage
  if (!localStorage.getItem('HCMUT_DATACORE')) {
    console.log('Khởi tạo HCMUT_DATACORE (CSDL giả lập) lần đầu...');

    const mockDataCore = [
      {
        "username": "tutor.001",
        "role": "tutor",
        "createdAt": "2024-10-28T10:00:00Z",
        "fullname": "Nguyễn Văn A (Tutor)",
        "bio": "Tutor chuyên ngành Khoa học Máy tính, có kinh nghiệm 2 năm với Python và Java. Thích giúp đỡ các bạn sinh viên vượt qua các môn học cơ sở.",
        "department": "Khoa học và kỹ thuật máy tính",
        "major": "Khoa học Máy tính",
        "email": "tutor.a@hcmut.edu.vn",
        "phone": "0901234567",
        "website": "github.com/nguyenvana",
        "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzI5YjZmMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHN0eWxlPSJmb250LXNpemU6NDBweDtzdHJva2U6I2ZmZjtmb250LWZhbWlyeTpBcmlhbDt0ZXh0LWFuY2hvcjptaWRkbGU7IiBmaWxsPSIjZmZmIj5UQVTwvdGV4dD48L3N2Zz4=",
        "mssv": null,
        "mscb": "GV12345", 
        "status": "Đang giảng dạy" 
      },
      {
        "username": "student.001",
        "role": "student",
        "createdAt": "2024-10-28T11:00:00Z",
        "fullname": "Trần Thị B (Sinh viên)",
        "bio": "Sinh viên năm 2, đang tìm hiểu về Lập trình Web và AI.",
        "department": "Khoa học và kỹ thuật máy tính",
        "major": "Kỹ thuật Máy tính",
        "email": "student.b@hcmut.edu.vn",
        "phone": "0987654321",
        "website": "",
        "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NSIgZmlsbD0iIzE5NzZkMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjM1ZW0iIHN0eWxlPSJmb250LXNpemU6NDBweDtzdHJva2U6I2ZmZjtmb250LWZhbWlyeTpBcmlhbDt0ZXh0LWFuY2hvcjptaWRkbGU7IiBmaWxsPSIjZmZmIj5TVDwvdGV4dD48L3N2Zz4=",
        "mssv": "2112345", 
        "mscb": null,
        "status": "Còn học" 
      }
    ];

    try {
      localStorage.setItem('HCMUT_DATACORE', JSON.stringify(mockDataCore));
      alert('Đã khởi tạo CSDL giả lập. Vui lòng đăng nhập bằng "student.001" hoặc "tutor.001" để test.');
    } catch (e) {
      console.error('Không thể khởi tạo CSDL giả lập:', e);
    }
  }
})();