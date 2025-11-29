// HCMUT DATACORE - Hệ Thống Quản Lý Người Dùng

class UserManagementSystem {
    constructor() {
        this.users = this.loadUsers();
        // Chỉ khởi tạo event listeners và display nếu đang ở trang admin
        if (document.getElementById('userTableBody')) {
            this.initializeEventListeners();
            this.displayUsers();
        }
    }

    // Xử lý email bằng cách bỏ đuôi @hcmut.edu.vn
    processUsername(email) {
        return email.replace(/@hcmut\.edu\.vn$/, '');
    }

    // Tải danh sách người dùng từ localStorage
    loadUsers() {
        const storedUsers = localStorage.getItem('hcmut_users');
        return storedUsers ? JSON.parse(storedUsers) : [];
    }

    // Lưu danh sách người dùng vào localStorage
    saveUsers() {
        localStorage.setItem('hcmut_users', JSON.stringify(this.users));
    }

    // Thêm người dùng mới
    addUser(username, password, role, fullname, additionalInfo = {}) {
        const processedUsername = this.processUsername(username);
        const now = new Date();
        const newUser = {
            fullname: fullname,
            username: processedUsername,
            originalEmail: username, // Lưu email gốc
            password: this.hashPassword(password), // Lưu mật khẩu đã được mã hóa
            role: role,
            registrationDate: now.toISOString(), // Ngày đăng ký (ISO format)
            registrationTime: now.toLocaleTimeString('vi-VN'), // Giờ đăng ký (HH:mm:ss)
            registrationHour: now.getHours(), // Giờ đăng ký (0-23)
            registrationDateTime: now.toLocaleString('vi-VN'), // Ngày và giờ đăng ký (dd/mm/yyyy, HH:mm:ss)
            id: Date.now().toString(),
            ...additionalInfo // Thêm các thông tin bổ sung (availableTime, etc.)
        };
        this.users.push(newUser);
        this.saveUsers();
        // Chỉ hiển thị nếu đang ở trang admin
        if (document.getElementById('userTableBody')) {
            this.displayUsers();
        }
    }

    // Mã hóa mật khẩu đơn giản 
    hashPassword(password) {
        return btoa(password); // Mã hóa Base64 cho mục đích demo
    }

    // Xóa người dùng
    deleteUser(userId) {
        this.users = this.users.filter(user => user.id !== userId);
        this.saveUsers();
        // Chỉ hiển thị nếu đang ở trang admin
        if (document.getElementById('userTableBody')) {
            this.displayUsers();
        }
    }

    // Hiển thị danh sách người dùng trong bảng
    displayUsers() {
        const tableBody = document.getElementById('userTableBody');
        if (!tableBody) return; // Nếu không có bảng thì bỏ qua
        
        tableBody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            // Hiển thị ngày và giờ đăng ký nếu có
            const regDate = user.registrationDateTime || 
                          (user.registrationDate ? new Date(user.registrationDate).toLocaleString('vi-VN') : 
                          new Date(user.registrationDate).toLocaleDateString());
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>${regDate}</td>
                <td>
                    <button class="btn btn-info btn-sm view-user" data-id="${user.id}">Xem</button>
                    <button class="btn btn-danger btn-sm delete-user" data-id="${user.id}">Xóa</button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Gắn lại các sự kiện cho bảng
        this.attachRowEventListeners();
    }

    // Khởi tạo các sự kiện lắng nghe
    initializeEventListeners() {
        const tableBody = document.getElementById('userTableBody');
        if (!tableBody) return; // Nếu không có bảng thì bỏ qua
        
        // Ủy quyền sự kiện cho các phần tử được thêm động
        tableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-user')) {
                this.viewUser(e.target.dataset.id);
            } else if (e.target.classList.contains('delete-user')) {
                if (confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
                    this.deleteUser(e.target.dataset.id);
                }
            }
        });
    }

    // Gắn sự kiện cho các hàng trong bảng
    attachRowEventListeners() {
        const viewButtons = document.querySelectorAll('.view-user');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.viewUser(button.dataset.id);
            });
        });
    }

    // Xem chi tiết người dùng
    viewUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            document.getElementById('username').value = user.username;
            document.getElementById('role').value = user.role;
            // Hiển thị ngày và giờ đăng ký đầy đủ nếu có
            const regDate = user.registrationDateTime || 
                          (user.registrationDate ? new Date(user.registrationDate).toLocaleString('vi-VN') : 
                          new Date(user.registrationDate).toLocaleString());
            document.getElementById('regDate').value = regDate;
            
            const userModal = new bootstrap.Modal(document.getElementById('userModal'));
            userModal.show();
        }
    }

    // Lấy thông tin người dùng theo tên đăng nhập
    getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }

    // Xác thực thông tin đăng nhập
    verifyCredentials(username, password) {
        const processedUsername = this.processUsername(username);
        const user = this.getUserByUsername(processedUsername);
        if (user && user.password === this.hashPassword(password)) {
            return user;
        }
        return null;
    }
}

// Khởi tạo hệ thống
const userSystem = new UserManagementSystem();

// Hàm đăng ký người dùng (được gọi từ form đăng ký)
window.registerUser = function(username, password, role, fullname, additionalInfo = {}) {
    userSystem.addUser(username, password, role, fullname, additionalInfo);
}

// Hàm xác thực đăng nhập
window.verifyLogin = function(username, password) {
    return userSystem.verifyCredentials(username, password);
}

// Xuất hệ thống để sử dụng ở các file khác
window.HCMUT_DATACORE = userSystem;