const pages = document.querySelectorAll('.page-view');
const btnTutor = document.getElementById('btn-tutor');
const btnStudent = document.getElementById('btn-student');
const headerSubtitle = document.getElementById('header-subtitle');
const roleButtonsContainer = document.getElementById('role-buttons-container'); 

// Lấy thông tin người dùng từ localStorage (Lấy từ code demo/login.html)
// Giả định rằng userRole là 'student' hoặc 'tutor' sau khi đăng nhập
const isLoggedIn = localStorage.getItem('hcmut_logged_in') === 'true';
const userRole = localStorage.getItem('hcmut_role') || 'guest';
const username = localStorage.getItem('hcmut_username') || '';

// Khởi tạo Modal Bootstrap
const addTimeSlotModal = new bootstrap.Modal(document.getElementById('addTimeSlotModal'));
const confirmConsultationModal = new bootstrap.Modal(document.getElementById('confirmConsultationModal'));
const cancelConsultationModal = new bootstrap.Modal(document.getElementById('cancelConsultationModal'));
const cancelStudentBookingModal = new bootstrap.Modal(document.getElementById('cancelStudentBookingModal'));
const confirmStudentBookingModal = new bootstrap.Modal(document.getElementById('confirmStudentBookingModal'));
const addNoteModal = new bootstrap.Modal(document.getElementById('addNoteModal'));

const changeConsultationModal = new bootstrap.Modal(document.getElementById('changeConsultationModal'));

let currentChangeConsultationId = null;

function saveScheduleData() {
    try {
        const payload = {
            nextConsultationId,
            nextSlotId,
            currentSelectedDate,
            tutorConsultations,
            tutorAvailabilitySlots,
            studentUpcomingConsultations,
            studentHistoryConsultations
        };
        localStorage.setItem('cnpm_schedule', JSON.stringify(payload));
    } catch (e) {
        console.error('Không thể lưu dữ liệu lịch', e);
    }
}

function loadScheduleData() {
    try {
        const raw = localStorage.getItem('cnpm_schedule');
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data) return;
        nextConsultationId = data.nextConsultationId || nextConsultationId;
        nextSlotId = data.nextSlotId || nextSlotId;
        currentSelectedDate = data.currentSelectedDate || currentSelectedDate;
        tutorConsultations = Array.isArray(data.tutorConsultations) ? data.tutorConsultations : tutorConsultations;
        tutorAvailabilitySlots = Array.isArray(data.tutorAvailabilitySlots) ? data.tutorAvailabilitySlots : tutorAvailabilitySlots;
        studentUpcomingConsultations = Array.isArray(data.studentUpcomingConsultations) ? data.studentUpcomingConsultations : studentUpcomingConsultations;
        studentHistoryConsultations = Array.isArray(data.studentHistoryConsultations) ? data.studentHistoryConsultations : studentHistoryConsultations;
    } catch (e) {
        console.error('Không thể đọc dữ liệu lịch', e);
    }
}

let currentNoteConsultationId = null;

// --- Dữ liệu Mẫu (Mô phỏng Database) ---
let nextConsultationId = 6; 
let nextSlotId = 3;
let currentSelectedDate = '27/10/2025'; // Giả lập ngày đang chọn trên lịch
/*
// Dữ liệu Tutor
let tutorConsultations = [
    { id: 1, student: 'Trần Thị B', subject: 'Tiếng Anh', date: '26/10/2025', time: '14:00 - 15:00', status: 'confirmed' },
    { id: 2, student: 'Nguyễn Văn A', subject: 'Toán học', date: '27/10/2025', time: '09:00 - 10:00', status: 'pending' },
    { id: 3, student: 'Lê Văn C', subject: 'Vật lý', date: '26/10/2025', time: '10:00 - 11:00', status: 'completed' },
];
*/
let tutorAvailabilitySlots = [
    { id: 1, time: '16:00 - 17:00', date: '27/10/2025' }, 
    { id: 2, time: '14:00 - 15:00', date: '27/10/2025' }
];

// Dữ liệu Sinh viên
let studentUpcomingConsultations = [];
let studentHistoryConsultations = [];

let tutorConsultations = [];

// ---Helper Functions---
const getStatusDisplay = (status) => {
    switch(status) {
        case 'pending': return 'Chờ xác nhận';
        case 'confirmed': return 'Đã xác nhận';
        case 'completed': return 'Hoàn thành';
        case 'cancelled': return 'Đã hủy';
        default: return status;
    }
};

function isValidTimeComponent(value, type) {
    if (!value) return false;
    const num = parseInt(value, 10);
    if (isNaN(num)) return false;

    if (type === 'hour') {
        return num >= 0 && num <= 23;
    } else if (type === 'minute') {
        return num >= 0 && num <= 59;
    }
    return false;
}

const padTwoDigits = (num) => String(num).padStart(2, '0');

function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

function displayDateToISO(display) {
    // display '27/10/2025' -> '2025-10-27'
    if (!display) return '';
    const parts = display.split('/');
    if (parts.length !== 3) return '';
    const [d, m, y] = parts;
    return `${y.padStart(4,'0')}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

function isoToDisplayDate(iso) {
    // '2025-10-27' -> '27/10/2025'
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return '';
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
}

function isOverlap(newStart, newEnd, existingSlotTime) {
    const [existStartStr, existEndStr] = existingSlotTime.split(' - ');
    
    const newStartMin = timeToMinutes(newStart);
    const newEndMin = timeToMinutes(newEnd);
    const existStartMin = timeToMinutes(existStartStr);
    const existEndMin = timeToMinutes(existEndStr);

    return (newStartMin < existEndMin && newEndMin > existStartMin);
}

function setupTimeInputs() {
    const hourInputs = document.querySelectorAll('.time-hour');
    const minuteInputs = document.querySelectorAll('.time-minute');

    hourInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 2);
            if (e.target.value.length === 2) {
                const minuteInput = e.target.nextElementSibling.nextElementSibling;
                if (minuteInput) minuteInput.focus();
            }
        });
        
        input.addEventListener('blur', (e) => {
            if (e.target.value.length === 1) {
                e.target.value = padTwoDigits(e.target.value);
            }
        });
    });

    minuteInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '').substring(0, 2);
        });
        
        input.addEventListener('blur', (e) => {
            if (e.target.value.length === 1) {
                e.target.value = padTwoDigits(e.target.value);
            }
        });
    });
}


// ---Render Functions---

function renderTutorConsultations() {
    const container = document.getElementById('tutor-consultations-container');
    if (!container) return;

    tutorConsultations = [];
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    tutorReq.forEach(req => {
        if(req.tutorUsername === username) {
            // Tìm tên sinh viên 
            const studentUser = JSON.parse(localStorage.getItem('hcmut_users') || '[]').find(u => u.username === req.studentUsername);
            if (!studentUser) return;
             // Tính giờ tư vấn
            const begin = parseInt(req.timeSlot) + 5;
            const end = begin + 1;
            const time = `${begin}:00 - ${end}:00`;
            // Tính ngày tư vấn (3 ngày sau ngày tạo yêu cầu)
            const date = new Date(req.createdAt);
            date.setDate(date.getDate() + 3);
            const yyyy = date.getUTCFullYear();
            const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
            const dd = String(date.getUTCDate()).padStart(2, "0");
            const consultationDate = `${yyyy}-${mm}-${dd}`;
            tutorConsultations.push({
                id: req.id,
                student: studentUser.fullname,
                subject: req.subject,
                date: consultationDate,
                time: time,
                status: req.status
            })
        }
    }) 

    const sortedConsultations = tutorConsultations.sort((a, b) => {
        const order = { pending: 1, confirmed: 2, completed: 3, cancelled: 4 };
        return order[a.status] - order[b.status];
    });

    const html = sortedConsultations.map(c => {
        let actionButtons = '';

        if (c.status === 'pending') {
            actionButtons = `
                <div class="mt-2">
                    <button class="btn btn-sm btn-primary btn-action-sm" onclick="confirmConsultation('${c.id}')">
                        <i class="fas fa-check me-1"></i> Xác nhận
                    </button>
                    <button class="btn btn-sm btn-outline-secondary btn-action-sm" onclick="changeConsultation(${c.id})">
                        <i class="fas fa-edit me-1"></i> Thay đổi
                    </button>
                    <button class="btn btn-sm btn-outline-danger-custom btn-action-sm" onclick="cancelTutorConsultation(${c.id})">
                        <i class="fas fa-times me-1"></i> Hủy
                    </button>
                </div>`;
        } else if (c.status === 'confirmed') {
            actionButtons = `
                <div class="mt-2">
                    <button class="btn btn-sm btn-success btn-action-sm" onclick="markConsultationCompleted(${c.id})">
                        <i class="fas fa-check-double me-1"></i> Hoàn thành
                    </button>
                    <button class="btn btn-sm btn-outline-secondary btn-action-sm" onclick="changeConsultation(${c.id})">
                        <i class="fas fa-edit me-1"></i> Thay đổi
                    </button>
                    <button class="btn btn-sm btn-outline-danger-custom btn-action-sm" onclick="cancelTutorConsultation(${c.id})">
                        <i class="fas fa-times me-1"></i> Hủy
                    </button>
                </div>`;
        } else if (c.status === 'completed') {
            actionButtons = `
                <div class="mt-2">
                    <button class="btn btn-sm btn-outline-primary btn-action-sm" onclick="openAddNoteModal(${c.id})">
                        <i class="fas fa-sticky-note me-1"></i> Ghi chú
                    </button>
                </div>`;
        } else {
            const text = c.status === 'cancelled' ? 'Buổi học đã bị hủy' : getStatusDisplay(c.status);
            const badgeClass = c.status === 'cancelled' ? 'bg-light text-danger' : 'bg-light text-muted';
            actionButtons = `
                <div class="mt-2">
                    <span class="badge ${badgeClass} p-2">${text}</span>
                </div>`;
        }

        const notePreview = c.note ? `<div class="note-preview small text-muted mt-2">Ghi chú: ${c.note.length > 120 ? c.note.slice(0, 120) + '...' : c.note}</div>` : '';

        return `
            <div class="consultation-item" data-id="${c.id}">
                <div class="consultation-details">
                    <h6>${c.student}</h6>
                    <small>${c.subject}</small>
                    <div class="consultation-meta small text-muted">
                        <i class="far fa-calendar-alt"></i> ${c.date}
                        <i class="far fa-clock ms-3"></i> ${c.time}
                    </div>
                    ${actionButtons}
                    ${notePreview}
                </div>
                <div class="consultation-status">
                    <span class="status-badge status-${c.status}">${getStatusDisplay(c.status)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = html || '<p class="text-center text-muted mt-3">Không có buổi tư vấn nào.</p>';
}

function renderTutorAvailability() {
    const container = document.getElementById('tutor-availability-slots-container');
    const dateDisplay = document.querySelector('#tutor-availability h6 .small');
    if (!container) return;
    
    if (dateDisplay) {
        dateDisplay.textContent = currentSelectedDate;
    }

    const filteredSlots = tutorAvailabilitySlots.filter(slot => slot.date === currentSelectedDate);
    
    const sortedSlots = filteredSlots.sort((a, b) => a.time.localeCompare(b.time));

    const html = sortedSlots.map(slot => `
        <div class="time-slot-item" data-slot-id="${slot.id}">
            <span>${slot.time}</span>
            <button onclick="deleteTimeSlot(${slot.id})"><i class="fas fa-trash-alt"></i></button>
        </div>
    `).join('');

    container.innerHTML = html || '<p class="text-center text-muted mt-3">Chưa có khung giờ rảnh nào được thêm.</p>';
}


function renderStudentView() {
    const availableContainer = document.getElementById('student-available-slots-container');
    if(availableContainer) {
        const dateDisplay = document.querySelector('#student-booking .col-md-7 .card:nth-child(1) .small');
        if (dateDisplay) dateDisplay.textContent = currentSelectedDate;

        const filteredSlots = tutorAvailabilitySlots.filter(slot => slot.date === currentSelectedDate);
        const sortedSlots = filteredSlots.sort((a, b) => a.time.localeCompare(b.time));
        
        const slotsHtml = sortedSlots.map(slot => `
            <div class="time-slot-item border-bottom-0" data-slot-id="${slot.id}">
                <span>${slot.time}</span>
                <button class="btn btn-primary btn-sm btn-book" onclick="bookTimeSlot(${slot.id}, '${slot.time}', '${slot.date}')">Đặt lịch</button>
            </div>
        `).join('');
        availableContainer.innerHTML = slotsHtml;
    }
    studentUpcomingConsultations = [];
    studentHistoryConsultations = [];
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    tutorReq.forEach(req => {
        if(req.studentUsername === username) {
            // Tính giờ tư vấn
            const begin = parseInt(req.timeSlot) + 5;
            const end = begin + 1;
            const time = `${begin}:00 - ${end}:00`;
            // Tính ngày tư vấn (3 ngày sau ngày tạo yêu cầu)
            const date = new Date(req.createdAt);
            date.setDate(date.getDate() + 3);
            const yyyy = date.getUTCFullYear();
            const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
            const dd = String(date.getUTCDate()).padStart(2, "0");
            const consultationDate = `${yyyy}-${mm}-${dd}`;
            if (req.status === 'pending' || req.status === 'confirmed') {
                studentUpcomingConsultations.push({
                    id: req.id,
                    subject: req.subject,
                    date: consultationDate,
                    time: time,
                    status: req.status
                })
            } else {
                studentHistoryConsultations.push({
                    id: req.id,
                    subject: req.subject,
                    date: consultationDate,
                    time: time,
                    status: req.status
                })
            }
        }
    }) 

    const upcomingContainer = document.getElementById('student-upcoming-consultations-container');
    if (upcomingContainer) {
        const upcomingHtml = studentUpcomingConsultations.map(c => `
            <div class="consultation-item d-block" data-consultation-id="${c.id}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">${c.subject}</h6>
                    <span class="status-${c.status} small">${getStatusDisplay(c.status)}</span>
                </div>
                <div class="consultation-meta small text-muted mb-3">
                    <i class="far fa-calendar-alt"></i> ${c.date}
                    <i class="far fa-clock ms-3"></i> ${c.time}
                </div>
                <button class="btn-danger-lg-custom btn-cancel" onclick="cancelStudentConsultation('${c.id}')">
                    <i class="fas fa-times me-1"></i> Hủy buổi học
                </button>
            </div>
        `).join('');
        upcomingContainer.innerHTML = upcomingHtml || '<p class="text-center text-muted mt-3">Bạn chưa có buổi học nào sắp tới.</p>';
    }

    const historyContainer = document.getElementById('student-history-container');
    if (historyContainer) {
        // sort history: newest -> oldest by date, then by time
        const sortedHistory = (Array.isArray(studentHistoryConsultations) ? studentHistoryConsultations.slice() : []).sort((a, b) => {
            const aIso = displayDateToISO(a.date) || '';
            const bIso = displayDateToISO(b.date) || '';
            if (aIso === bIso) {
                // fallback to time compare (e.g. '09:00 - 10:00') -> compare start time
                const aStart = (a.time || '').split(' - ')[0] || '';
                const bStart = (b.time || '').split(' - ')[0] || '';
                return bStart.localeCompare(aStart);
            }
            return bIso.localeCompare(aIso);
        });

        const historyHtml = sortedHistory.map(c => `
            <div class="consultation-item">
                <div class="consultation-details">
                    <h6>${c.subject}</h6>
                    <div class="consultation-meta small text-muted">
                        <i class="far fa-calendar-alt"></i> ${c.date}
                        <i class="far fa-clock ms-3"></i> ${c.time}
                    </div>
                </div>
                <div class="consultation-status">
                    <span class="status-badge status-${c.status}">${getStatusDisplay(c.status)}</span>
                </div>
            </div>
        `).join('');
        historyContainer.innerHTML = historyHtml || '<p class="text-center text-muted mt-3">Không có lịch sử.</p>';
    }
}

// --- Calendar Widget ---
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function clampMonthYear(month, year) {
    // ensure within Jan 2025 .. Dec 2026
    if (year < 2025) return { month: 0, year: 2025 };
    if (year > 2026) return { month: 11, year: 2026 };
    if (year === 2025 && month < 0) return { month: 0, year: 2025 };
    if (year === 2026 && month > 11) return { month: 11, year: 2026 };
    return { month, year };
}

function CalendarWidget(opts) {
    this.containerId = opts.containerId;
    this.titleId = opts.titleId;
    this.prevId = opts.prevId;
    this.nextId = opts.nextId;
    this.onDateSelect = opts.onDateSelect;

    // initialize to currentSelectedDate if valid, else Oct 2025 default
    let initYear = 2025, initMonth = 9; // October 2025
    if (currentSelectedDate) {
        const parts = currentSelectedDate.split('/');
        if (parts.length === 3) {
            initYear = parseInt(parts[2], 10) || initYear;
            initMonth = (parseInt(parts[1],10) - 1) || initMonth;
        }
    }
    const clamped = clampMonthYear(initMonth, initYear);
    this.year = clamped.year;
    this.month = clamped.month;

    this.container = document.getElementById(this.containerId);
    this.titleEl = document.getElementById(this.titleId);
    this.prevEl = document.getElementById(this.prevId);
    this.nextEl = document.getElementById(this.nextId);
    this.monthSelEl = opts.monthSelectId ? document.getElementById(opts.monthSelectId) : null;
    this.yearSelEl = opts.yearSelectId ? document.getElementById(opts.yearSelectId) : null;

    this._setupControls();
    this.render();
}

CalendarWidget.prototype._setupControls = function() {
    if (this.prevEl) this.prevEl.addEventListener('click', () => this.changeMonth(-1));
    if (this.nextEl) this.nextEl.addEventListener('click', () => this.changeMonth(1));
    if (this.titleEl) this.titleEl.addEventListener('click', (e) => this.openMonthPicker(e));
    // if explicit selects are present, populate and wire them
    if (this.monthSelEl && this.yearSelEl) {
        // populate month options if empty
        if (this.monthSelEl.options.length === 0) {
            MONTH_NAMES.forEach((n, i) => { const o = document.createElement('option'); o.value = i; o.text = n; this.monthSelEl.appendChild(o); });
        }
        if (this.yearSelEl.options.length === 0) {
            [2025,2026].forEach(y => { const o = document.createElement('option'); o.value = y; o.text = y; this.yearSelEl.appendChild(o); });
        }

        this.monthSelEl.value = this.month;
        this.yearSelEl.value = this.year;

        this.monthSelEl.addEventListener('change', () => {
            const m = parseInt(this.monthSelEl.value, 10);
            const clamped = clampMonthYear(m, this.year);
            this.month = clamped.month; this.year = clamped.year;
            this.render();
        });

        this.yearSelEl.addEventListener('change', () => {
            const y = parseInt(this.yearSelEl.value, 10);
            const clamped = clampMonthYear(this.month, y);
            this.month = clamped.month; this.year = clamped.year;
            this.render();
        });
    }
};

CalendarWidget.prototype.changeMonth = function(delta) {
    let m = this.month + delta;
    let y = this.year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    const clamped = clampMonthYear(m, y);
    this.month = clamped.month; this.year = clamped.year;
    this.render();
};

CalendarWidget.prototype.openMonthPicker = function(event) {
    // simple inline picker element
    const existing = document.getElementById(this.titleId + '-picker');
    if (existing) { existing.remove(); return; }

    const picker = document.createElement('div');
    picker.id = this.titleId + '-picker';
    picker.className = 'calendar-picker';
    picker.style.position = 'absolute';
    picker.style.background = '#fff';
    picker.style.border = '1px solid #ddd';
    picker.style.padding = '8px';
    picker.style.zIndex = 9999;
    picker.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    const monthSel = document.createElement('select');
    MONTH_NAMES.forEach((n, i) => { const o = document.createElement('option'); o.value = i; o.text = n; if (i===this.month) o.selected = true; monthSel.appendChild(o); });
    const yearSel = document.createElement('select');
    [2025,2026].forEach(y => { const o = document.createElement('option'); o.value = y; o.text = y; if (y===this.year) o.selected = true; yearSel.appendChild(o); });
    const goBtn = document.createElement('button');
    goBtn.textContent = 'Chuyển';
    goBtn.className = 'btn btn-sm btn-primary ms-2';

    goBtn.addEventListener('click', () => {
        const m = parseInt(monthSel.value,10);
        const y = parseInt(yearSel.value,10);
        const clamped = clampMonthYear(m, y);
        this.month = clamped.month; this.year = clamped.year;
        picker.remove();
        this.render();
    });

    picker.appendChild(monthSel);
    picker.appendChild(yearSel);
    picker.appendChild(goBtn);

    // position near title
    const rect = this.titleEl.getBoundingClientRect();
    picker.style.left = (rect.left + window.scrollX) + 'px';
    picker.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    document.body.appendChild(picker);

    const onDocClick = (e) => { if (!picker.contains(e.target) && e.target !== this.titleEl) { picker.remove(); document.removeEventListener('click', onDocClick); } };
    document.addEventListener('click', onDocClick);
};

CalendarWidget.prototype.render = function() {
    if (!this.container) return;

    // update title
    if (this.titleEl) this.titleEl.textContent = `${MONTH_NAMES[this.month]} ${this.year}`;
    // also support a visible small title span if present
    const visibleTitle = document.getElementById(this.titleId);
    if (visibleTitle) visibleTitle.textContent = `${MONTH_NAMES[this.month]} ${this.year}`;
    if (this.monthSelEl) this.monthSelEl.value = this.month;
    if (this.yearSelEl) this.yearSelEl.value = this.year;

    // build grid: week headers + day cells
    const first = new Date(this.year, this.month, 1);
    const startWeekday = first.getDay(); // 0 Sun .. 6 Sat
    const daysInMonth = new Date(this.year, this.month + 1, 0).getDate();

    // create week header
    const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    let html = '<div class="calendar-weekdays">';
    weekdays.forEach(d => html += `<div class="calendar-weekday">${d}</div>`);
    html += '</div>';

    html += '<div class="calendar-days">';

    // blanks before first day
    for (let i=0;i<startWeekday;i++) html += '<div class="calendar-day empty"></div>';

    for (let d=1; d<=daysInMonth; d++) {
        const iso = `${this.year}-${String(this.month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const display = `${String(d).padStart(2,'0')}/${String(this.month+1).padStart(2,'0')}/${this.year}`;
        const selected = (display === currentSelectedDate) ? ' selected' : '';
        html += `<div class="calendar-day" data-iso="${iso}" data-display="${display}"><button class="calendar-day-btn${selected}">${d}</button></div>`;
    }

    html += '</div>';

    this.container.innerHTML = html;

    // attach day click handlers
    this.container.querySelectorAll('.calendar-day-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const parent = e.target.closest('.calendar-day');
            if (!parent) return;
            const display = parent.getAttribute('data-display');
            currentSelectedDate = display;
            if (typeof this.onDateSelect === 'function') this.onDateSelect(display);
            // re-render both calendars to update selected highlight
            if (window.tutorCalendar) window.tutorCalendar.render();
            if (window.studentCalendar) window.studentCalendar.render();
            // update availability and views
            renderTutorAvailability();
            renderStudentView();
        });
    });
    // update prev/next disabled state
    if (this.prevEl) this.prevEl.style.visibility = (this.year===2025 && this.month===0) ? 'hidden' : 'visible';
    if (this.nextEl) this.nextEl.style.visibility = (this.year===2026 && this.month===11) ? 'hidden' : 'visible';
};

// instantiate calendars for tutor and student
function initCalendars() {
    window.tutorCalendar = new CalendarWidget({
        containerId: 'tutor-calendar-grid',
        titleId: 'tutor-cal-title',
        prevId: 'tutor-cal-prev',
        nextId: 'tutor-cal-next',
        monthSelectId: 'tutor-cal-month',
        yearSelectId: 'tutor-cal-year',
        onDateSelect: (display) => {
            // callback already handled in CalendarWidget; keep for future hooks
        }
    });

    window.studentCalendar = new CalendarWidget({
        containerId: 'student-calendar-grid',
        titleId: 'student-cal-title',
        prevId: 'student-cal-prev',
        nextId: 'student-cal-next',
        monthSelectId: 'student-cal-month',
        yearSelectId: 'student-cal-year',
        onDateSelect: (display) => {}
    });
}


// ---Interaction Functions---

let currentBookingSlot = { id: null, time: null, date: null, subject: null };

window.bookTimeSlot = function(slotId, time, date) {
    if (userRole !== 'student' && userRole !== 'admin') {
        alert("Chỉ Sinh viên mới có thể đặt lịch.");
        return;
    }
    
    const [newStart, newEnd] = time.split(' - ');

    const isStudentOverlap = studentUpcomingConsultations.some(c => {
        if (c.date === date) {
            return isOverlap(newStart, newEnd, c.time);
        }
        return false;
    });

    if (isStudentOverlap) {
        alert("Khung giờ này bị chồng chéo với một buổi học sắp tới của bạn. Vui lòng chọn giờ khác!");
        return;
    }

    currentBookingSlot = { id: slotId, time: time, date: date, subject: null };
    document.getElementById('confirmStudentBookingTime').textContent = time;
    // reset subject selector to default
    const subjInput = document.getElementById('confirmStudentBookingSubjectInput');
    if (subjInput) subjInput.selectedIndex = 0;
    confirmStudentBookingModal.show();
}

document.getElementById('finalConfirmStudentBookingBtn').onclick = function() {
    const { id: slotId, time, date } = currentBookingSlot;

    const bookedSlot = tutorAvailabilitySlots.find(slot => slot.id === slotId);
    if (!bookedSlot) {
        confirmStudentBookingModal.hide();
        return;
    }

    // read chosen subject from modal
    const subjInput = document.getElementById('confirmStudentBookingSubjectInput');
    const subject = subjInput ? subjInput.value.trim() : 'Không xác định';

    tutorAvailabilitySlots = tutorAvailabilitySlots.filter(slot => slot.id !== slotId);
    
    const newConsultationId = nextConsultationId++;
    const newConsultation = { 
        id: newConsultationId, 
        subject: subject,
        date: date, 
        time: time, 
        status: 'pending' 
    };
    studentUpcomingConsultations.push(newConsultation);

    tutorConsultations.push({
        ...newConsultation,
        student: 'Sinh viên (Demo)'
    });

    saveScheduleData();

    confirmStudentBookingModal.hide();
    renderStudentView();
     window.NotificationSystem.add('Đặt lịch thành công', `Yêu cầu đặt lịch lúc ${time} ngày ${date} đã được gửi!`, 'success'); 
};

let currentConsultationId = null;

window.cancelStudentConsultation = function(consultationId) {
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    const consultation = tutorReq.find(c => c.id === consultationId);
    if (!consultation) return;

    currentConsultationId = consultationId;
    document.getElementById('cancelStudentBookingSubject').textContent = consultation.subject;

    cancelStudentBookingModal.show();
}

document.getElementById('finalCancelStudentBookingBtn').onclick = function() {
    const consultationId = currentConsultationId;
    
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    const index = tutorReq.findIndex(c => c.id === consultationId);
    if (index > -1) {
        tutorReq[index].status = 'cancelled';
        localStorage.setItem('tutor_requests', JSON.stringify(tutorReq));
        /*
        tutorAvailabilitySlots.push({ id: nextSlotId++, time: cancelled.time, date: cancelled.date });
        tutorAvailabilitySlots.sort((a, b) => a.time.localeCompare(b.time));

        const tutorIndex = tutorConsultations.findIndex(c => c.id === consultationId);
        if (tutorIndex > -1) {
             tutorConsultations.splice(tutorIndex, 1);
        }
        */
        renderTutorConsultations();
        renderStudentView(); 
        window.NotificationSystem.add('Đã hủy lịch', 'Bạn đã hủy buổi học thành công.', 'info');
    }
    cancelStudentBookingModal.hide();
    saveScheduleData();
};


window.confirmConsultation = function(consultationId) {
    if (userRole !== 'tutor' && userRole !== 'admin') {
        alert("Chỉ Tutor mới có thể xác nhận lịch.");
        return;
    }
    
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    const consultation = tutorReq.find(c => c.id === consultationId);
    if (!consultation) return;

    currentConsultationId = consultationId;
    document.getElementById('confirmConsultationStudentName').textContent = consultation.student;
    
    confirmConsultationModal.show();
}

document.getElementById('finalConfirmConsultationBtn').onclick = function() {
    const consultationId = currentConsultationId;
    
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    const index = tutorReq.findIndex(c => c.id === consultationId);
    
    if (index > -1) {
        tutorReq[index].status = 'confirmed';
        localStorage.setItem('tutor_requests', JSON.stringify(tutorReq));

        renderTutorConsultations();
        renderStudentView(); 
        window.NotificationSystem.add('Xác nhận thành công', 'Bạn đã chấp nhận yêu cầu dạy kèm.', 'success');
    }
    saveScheduleData();
    confirmConsultationModal.hide();
};


window.openAddNoteModal = function(consultationId) {
    if (userRole !== 'tutor' && userRole !== 'admin') return;
    const consultation = tutorConsultations.find(c => c.id === consultationId);
    if (!consultation) return;

    currentNoteConsultationId = consultationId;
    const textarea = document.getElementById('consultationNote');
    textarea.value = consultation.note || '';
    addNoteModal.show();
}

document.getElementById('finalSaveNoteBtn').onclick = function() {
    if (!currentNoteConsultationId) return;
    const note = document.getElementById('consultationNote').value.trim();
    const idx = tutorConsultations.findIndex(c => c.id === currentNoteConsultationId);
    if (idx > -1) {
        tutorConsultations[idx].note = note;

        const studentIdx = studentHistoryConsultations.findIndex(c => c.id === currentNoteConsultationId);
        if (studentIdx > -1) studentHistoryConsultations[studentIdx].note = note;
    }
    addNoteModal.hide();
    renderTutorConsultations();
    saveScheduleData();
}

window.markConsultationCompleted = function(consultationId) {
    if (userRole !== 'tutor' && userRole !== 'admin') {
        alert('Chỉ Tutor mới có thể đánh dấu hoàn thành.');
        return;
    }

    const tIdx = tutorConsultations.findIndex(c => c.id === consultationId);
    if (tIdx === -1) return;

    tutorConsultations[tIdx].status = 'completed';

    const sIdx = studentUpcomingConsultations.findIndex(c => c.id === consultationId);
    if (sIdx > -1) {
        const completed = studentUpcomingConsultations.splice(sIdx, 1)[0];
        studentHistoryConsultations.push({ ...completed, status: 'completed', note: tutorConsultations[tIdx].note });
    } else {
        // if not in upcoming, ensure history has it
        studentHistoryConsultations.push({ id: tutorConsultations[tIdx].id, subject: tutorConsultations[tIdx].subject || '', date: tutorConsultations[tIdx].date, time: tutorConsultations[tIdx].time, status: 'completed', note: tutorConsultations[tIdx].note });
    }

    renderTutorConsultations();
    renderStudentView();
    saveScheduleData();
}

window.changeConsultation = function(consultationId) {
    if (userRole !== 'tutor' && userRole !== 'admin') {
        alert('Chỉ Tutor mới có thể thay đổi buổi tư vấn.');
        return;
    }

    const consultation = tutorConsultations.find(c => c.id === consultationId);
    if (!consultation) return;

    currentChangeConsultationId = consultationId;
    const changeDate = document.getElementById('changeDate');
    const changeStartTime = document.getElementById('changeStartTime');
    const changeEndTime = document.getElementById('changeEndTime');

    changeDate.value = displayDateToISO(consultation.date) || '';
    const times = consultation.time ? consultation.time.split(' - ') : ['09:00','10:00'];
    changeStartTime.value = times[0] || '';
    changeEndTime.value = times[1] || '';

    changeConsultationModal.show();
}


window.cancelTutorConsultation = function(consultationId) {
    if (userRole !== 'tutor' && userRole !== 'admin') {
        alert("Chỉ Tutor mới có thể hủy lịch.");
        return;
    }
    
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    const consultation = tutorReq.find(c => c.id === consultationId);
    if (!consultation) return;

    currentConsultationId = consultationId;
    document.getElementById('cancelConsultationStudentName').textContent = consultation.student;
    
    cancelConsultationModal.show();
}

document.getElementById('finalCancelConsultationBtn').onclick = function() {
    const consultationId = currentConsultationId;
    
    const tutorReq = JSON.parse(localStorage.getItem('tutor_requests') || []);
    const index = tutorReq.findIndex(c => c.id === consultationId);
    if (index > -1) {
        tutorReq[index].status = 'cancelled';
        localStorage.setItem('tutor_requests', JSON.stringify(tutorReq));
        /*
        const studentIndex = studentUpcomingConsultations.findIndex(c => c.id === consultationId);
        if (studentIndex > -1) {
            const studentCancelled = studentUpcomingConsultations.splice(studentIndex, 1)[0];
            studentHistoryConsultations.push({ ...studentCancelled, status: 'cancelled' });
        }
        
        tutorAvailabilitySlots.push({ id: nextSlotId++, time: cancelled.time, date: cancelled.date });
        tutorAvailabilitySlots.sort((a, b) => a.time.localeCompare(b.time));
        */ 
        renderTutorConsultations();
        renderStudentView();
        window.NotificationSystem.add('Đã hủy lịch', 'Bạn đã hủy/từ chối buổi dạy kèm.', 'warning'); 
    }
    saveScheduleData();
    cancelConsultationModal.hide();
};

document.getElementById('finalChangeConsultationBtn').onclick = function() {
    if (!currentChangeConsultationId) return;
    const changeDate = document.getElementById('changeDate').value;
    const start = document.getElementById('changeStartTime').value;
    const end = document.getElementById('changeEndTime').value;

    if (!changeDate || !start || !end) { alert('Vui lòng nhập đầy đủ ngày và giờ.'); return; }
    if (start >= end) { alert('Giờ kết thúc phải sau giờ bắt đầu.'); return; }

    const consultation = tutorConsultations.find(c => c.id === currentChangeConsultationId);
    if (!consultation) return;

    // check overlap with confirmed sessions on same date (exclude current)
    const displayDate = isoToDisplayDate(changeDate);
    const overlap = tutorConsultations.filter(c => c.id !== currentChangeConsultationId && c.status === 'confirmed' && c.date === displayDate).some(c => isOverlap(start, end, c.time));
    if (overlap) { alert('Khung giờ mới chồng chéo với buổi tư vấn đã xác nhận khác.'); return; }

    consultation.date = displayDate;
    consultation.time = `${start} - ${end}`;
    consultation.status = 'pending';

    const sIdx = studentUpcomingConsultations.findIndex(c => c.id === currentChangeConsultationId);
    if (sIdx > -1) {
        studentUpcomingConsultations[sIdx].date = consultation.date;
        studentUpcomingConsultations[sIdx].time = consultation.time;
        studentUpcomingConsultations[sIdx].status = 'pending';
    }

    saveScheduleData();
    changeConsultationModal.hide();
    renderTutorConsultations();
    renderStudentView();
    alert('Đã thay đổi; hệ thống gửi yêu cầu xác nhận lại cho sinh viên (demo).');
};


window.addTimeSlot = function() {
    if (userRole !== 'tutor' && userRole !== 'admin') {
        alert("Chỉ Tutor mới có thể thêm khung giờ rảnh.");
        return;
    }
    
    document.getElementById('modal-subtitle').textContent = `Thêm khung giờ rảnh cho ngày ${currentSelectedDate}`;
    
    const startTimeHour = document.getElementById('startTimeHour');
    const startTimeMinute = document.getElementById('startTimeMinute');
    const endTimeHour = document.getElementById('endTimeHour');
    const endTimeMinute = document.getElementById('endTimeMinute');

    startTimeHour.value = '09';
    startTimeMinute.value = '00';
    endTimeHour.value = '10';
    endTimeMinute.value = '00';
    
    [startTimeHour, startTimeMinute, endTimeHour, endTimeMinute].forEach(input => input.classList.remove('is-invalid'));
    
    addTimeSlotModal.show();
}

window.handleAddTimeSlot = function() {
    if (userRole !== 'tutor' && userRole !== 'admin') { return; }
    
    const startTimeHour = document.getElementById('startTimeHour');
    const startTimeMinute = document.getElementById('startTimeMinute');
    const endTimeHour = document.getElementById('endTimeHour');
    const endTimeMinute = document.getElementById('endTimeMinute');
    
    const inputs = [
        { el: startTimeHour, type: 'hour' },
        { el: startTimeMinute, type: 'minute' },
        { el: endTimeHour, type: 'hour' },
        { el: endTimeMinute, type: 'minute' },
    ];
    
    let isValid = true;
    
    inputs.forEach(({ el, type }) => {
        el.classList.remove('is-invalid');
        const value = el.value;

        if (value.length !== 2 || !isValidTimeComponent(value, type)) {
            el.classList.add('is-invalid');
            isValid = false;
        }
    });

    if (!isValid) {
        return;
    }
    
    const startTime = `${startTimeHour.value}:${startTimeMinute.value}`;
    const endTime = `${endTimeHour.value}:${endTimeMinute.value}`;
    const timeSlot = `${startTime} - ${endTime}`;

    if (startTime >= endTime) {
        alert("Giờ kết thúc phải sau Giờ bắt đầu!");
        startTimeHour.classList.add('is-invalid');
        endTimeHour.classList.add('is-invalid');
        return;
    }
    
    const allUsedSlots = [
        ...tutorAvailabilitySlots.map(s => ({ time: s.time, date: s.date })),
        ...tutorConsultations.filter(c => c.status === 'confirmed').map(c => ({ time: c.time, date: c.date }))
    ];

    const isOverlapping = allUsedSlots.some(slot => {
        if (slot.date === currentSelectedDate) {
            return isOverlap(startTime, endTime, slot.time);
        }
        return false;
    });

    if (isOverlapping) {
        alert("Khung giờ bạn chọn bị chồng chéo với một lịch rảnh hoặc buổi tư vấn đã xác nhận khác!");
        startTimeHour.classList.add('is-invalid');
        endTimeHour.classList.add('is-invalid');
        return;
    }

    const newSlot = {
        id: nextSlotId++,
        time: timeSlot,
        date: currentSelectedDate
    };
    tutorAvailabilitySlots.push(newSlot);
    window.NotificationSystem.add('Thêm giờ rảnh', `Đã thêm khung giờ ${timeSlot} vào lịch.`, 'success');
    saveScheduleData();
    addTimeSlotModal.hide();
    renderTutorAvailability();
    renderStudentView(); 
}

window.deleteTimeSlot = function(slotId) {
    if (userRole !== 'tutor' && userRole !== 'admin') {
        alert("Chỉ Tutor mới có thể xóa khung giờ rảnh.");
        return;
    }
    if (!confirm("Bạn có muốn xóa khung giờ rảnh này không?")) return;
    
    tutorAvailabilitySlots = tutorAvailabilitySlots.filter(slot => slot.id !== slotId);
    saveScheduleData();
    renderTutorAvailability();
    renderStudentView(); 
}

function showPage(pageId) {
    pages.forEach(page => page.style.display = 'none');
    const pageElement = document.getElementById(pageId);
    if(pageElement) pageElement.style.display = 'block';
}

function setActiveRole(activeRole) {
    if (activeRole === 'tutor' && userRole !== 'tutor' && userRole !== 'admin') {
         alert("Truy cập bị từ chối: Chế độ Tutor chỉ dành cho Tutor/Admin.");
         return;
    }
    if (activeRole === 'student' && userRole !== 'student' && userRole !== 'admin') {
         alert("Truy cập bị từ chối: Chế độ Sinh viên chỉ dành cho Sinh viên/Admin.");
         return;
    }

    btnTutor.classList.remove('btn-outline-primary', 'btn-primary');
    btnStudent.classList.remove('btn-outline-primary', 'btn-primary');
    
    if (activeRole === 'tutor') {
        btnTutor.classList.add('btn-primary');
        btnStudent.classList.add('btn-outline-primary');
        headerSubtitle.textContent = 'Dành cho gia sư và tutor';
        showTutorConsultation();
    } else {
        btnTutor.classList.add('btn-outline-primary');
        btnStudent.classList.add('btn-primary');
        headerSubtitle.textContent = 'Đặt lịch học với tutor';
        showPage('student-booking');
        renderStudentView();
    }
}

function updateTutorTabs(activeId) {
    const tabSelectors = [
        document.querySelector('#tutor-consultation-list .nav-link:nth-child(1)'),
        document.querySelector('#tutor-consultation-list .nav-link:nth-child(2)'),
        document.querySelector('#tutor-availability .nav-link:nth-child(1)'),
        document.querySelector('#tutor-availability .nav-link:nth-child(2)')
    ].filter(Boolean);

    tabSelectors.forEach(tab => {
        tab.classList.remove('active', 'active-blue'); 
    });
    
    if (activeId === 'consultation') {
        tabSelectors.filter(t => t.textContent.includes('Buổi tư vấn')).forEach(t => t.classList.add('active', 'active-blue'));
    } else if (activeId === 'availability') {
        tabSelectors.filter(t => t.textContent.includes('Lịch rảnh')).forEach(t => t.classList.add('active', 'active-blue'));
    }
}

window.showTutorConsultation = function() {
    showPage('tutor-consultation-list');
    updateTutorTabs('consultation');
    renderTutorConsultations();
};

window.showTutorAvailability = function() {
    showPage('tutor-availability');
    updateTutorTabs('availability');
    renderTutorAvailability();
};
function initSchedulePage() {
    loadScheduleData();
    if (roleButtonsContainer && userRole !== 'admin') {
         if (userRole === 'tutor') {
            btnStudent.style.display = 'none'; 
         } else if (userRole === 'student') {
            btnTutor.style.display = 'none'; 
         }
    }

    if (btnTutor) btnTutor.addEventListener('click', () => setActiveRole('tutor'));
    if (btnStudent) btnStudent.addEventListener('click', () => setActiveRole('student'));
    setupTimeInputs(); 
    // initialize calendars (renders calendar UI and wires interactions)
    initCalendars();

    if (userRole === 'tutor' || userRole === 'admin') {
        setActiveRole('tutor');
    } else {
        setActiveRole('student');
    }
}

document.addEventListener('DOMContentLoaded', initSchedulePage);