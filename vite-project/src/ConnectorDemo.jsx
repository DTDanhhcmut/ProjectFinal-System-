import React, { useEffect, useMemo, useState } from "react";
import "./ConnectorDemo.css";
import {
  GraduationCap, UserRoundCog, Search, FileText, Eye,
  Download, Link, CheckCircle, Lock, ShieldCheck, Loader2,
  AlertTriangle, Info, X // Import thêm icon X
} from "lucide-react";

// ------------------------ MOCK DATA & CẤU TRÚC MỚI ------------------------
// Danh sách môn học
const SUBJECTS = [
  { code: "CTDLGT", name: "CTDLGT – Cấu trúc dữ liệu & Giải thuật" },
  { code: "OOP", name: "OOP – Hướng đối tượng" },
  { code: "DB", name: "Cơ sở dữ liệu" },
  { code: "SE", name: "Công nghệ phần mềm" },
  { code: "KTPM", name: "Kiến trúc phần mềm" }, // Thêm môn mới
];

// Danh mục tài liệu (CATALOG) với cấu trúc data mới
// ĐÃ XÓA "restriction"
// THÊM "department" (khoa) và "isVisible" (cho phép SV xem)
const CATALOG = [
  { id: "ctdl01", title: "CTDLGT - Lecture 01: Introduction", subject: "CTDLGT", department: "KHOA_CNTT", size: "1.2 MB", isVisible: true, url: "#" },
  { id: "ctdl02", title: "CTDLGT - Lecture 02: Linked List", subject: "CTDLGT", department: "KHOA_CNTT", size: "980 KB", isVisible: true, url: "#" },
  { id: "ctdl03", title: "CTDLGT - Bài tập (Tài liệu cũ)", subject: "CTDLGT", department: "KHOA_CNTT", size: "300 KB", isVisible: false, url: "#" }, // SV sẽ không thấy file này
  { id: "oop01", title: "OOP - SOLID Principles", subject: "OOP", department: "KHOA_CNTT", size: "1.8 MB", isVisible: true, url: "#" },
  { id: "db01", title: "DB - Normalization (For Teachers)", subject: "DB", department: "KHOA_CNTT", size: "1.0 MB", isVisible: false, url: "#" }, // GV khoa CNTT vẫn thấy, SV không thấy
  { id: "se01", title: "SE - UML Activity & Sequence", subject: "SE", department: "KHOA_DIEN", size: "2.0 MB", isVisible: true, url: "#" }, // SV/GV khoa CNTT sẽ không thấy
  { id: "ktpm01", title: "KTPM - Design Patterns", subject: "KTPM", department: "KHOA_CNTT", size: "2.5 MB", isVisible: true, url: "#" }, // GV (dạy KTPM) sẽ thấy, SV khoa CNTT sẽ thấy
];
// ------------------------ HẾT MOCK DATA ------------------------


/* ===== LOGIC LỌC TÀI LIỆU MỚI ===== */
/**
 * Kiểm tra xem user có quyền xem tài liệu hay không
 * @param {object} item - Tài liệu
 * @param {object} user - Tài khoản giả (currentUser)
 */
function canView(item, user) {
  if (!item || !user) return false;

  if (user.role === "student") {
    // Logic cho Sinh viên:
    // 1. Phải đúng khoa (department)
    // 2. Tài liệu phải được GV cho phép (isVisible: true)
    return item.department === user.department && item.isVisible === true;
  }

  if (user.role === "teacher") {
    // Logic cho Giảng viên:
    // 1. Phải đúng môn (subject) mà GV đó dạy
    // (GV có thể xem mọi tài liệu của môn mình dạy, kể cả file isVisible: false)
    return (user.subjects || []).includes(item.subject);
  }

  return false;
}


/* ====== Component chính ====== */
export default function ConnectorDemo({ currentUser }) {
  const role = currentUser.role;
  const indexID = currentUser.id;

  // 1. Lọc ra danh sách tài liệu MÀ USER CÓ QUYỀN XEM
  const visibleCatalog = useMemo(() => {
    return CATALOG.filter(item => canView(item, currentUser));
  }, [currentUser]);

  /* ===== State ===== */
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);

  // State `items` giờ được khởi tạo từ `visibleCatalog`
  const [items, setItems] = useState(visibleCatalog);

  const [toast, setToast] = useState(null);
  const [attachments, setAttachments] = useState([]); // chỉ dùng cho GV

  // Reset lại danh sách tìm kiếm khi user thay đổi
  useEffect(() => {
    setItems(visibleCatalog);
    setQ("");
    setSubject("");
  }, [visibleCatalog]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  async function runSearch() {
    setLoading(true);
    const kw = q.trim().toLowerCase();

    // 2. Chỉ tìm kiếm trên danh sách ĐÃ ĐƯỢC LỌC QUYỀN
    const res = visibleCatalog.filter((d) => {
      const byS = subject ? d.subject === subject : true;
      const byK = kw ? (d.title + d.subject).toLowerCase().includes(kw) : true;
      return byS && byK;
    });

    await new Promise((r) => setTimeout(r, 250));
    setItems(res);
    setLoading(false);
  }

  // 3. Hàm xem file (giờ không cần check quyền, vì đã lọc từ đầu)
  function onView(item) {
    window.open(item.url, "_blank", "noopener,noreferrer");
  }

  function onAttach(item) {
    if (attachments.some((x) => x.id === item.id)) return;
    setAttachments((prev) => [...prev, item]);
    setToast({ kind: "success", text: "Đã đính kèm vào buổi tư vấn." });
  }

  // 4. HÀM MỚI: Xóa file đính kèm
  function onRemoveAttachment(itemId) {
    setAttachments(prev => prev.filter(att => att.id !== itemId));
    setToast({ kind: "info", text: "Đã gỡ tài liệu." });
  }

  // Lọc ra danh sách môn học mà user này có thể xem (để điền vào select box)
  const userSubjects = useMemo(() => {
    const subjectCodes = new Set(visibleCatalog.map(item => item.subject));
    return SUBJECTS.filter(s => subjectCodes.has(s.code));
  }, [visibleCatalog]);

  return (
    <div className="light-page">
      <header className="topbar">
        <div className="brand"><span className="dot" /><b>Library Connect</b></div>
        <div className="id-pill" title={currentUser.name || 'Mã định danh'}>
          {role === "student" ? <GraduationCap size={14} /> : <UserRoundCog size={14} />}
          <span>{indexID}</span>
        </div>
      </header>

      <main className="container">
        {role === "student" ? (
          <StudentView
            currentUser={currentUser}
            q={q} setQ={setQ}
            subject={subject} setSubject={setSubject}
            items={items} loading={loading}
            onSearch={runSearch} onView={onView}
            SUBJECTS={userSubjects} // Chỉ đưa những môn SV có thể xem
          />
        ) : (
          <TeacherView
            currentUser={currentUser}
            q={q} setQ={setQ}
            subject={subject} setSubject={setSubject}
            items={items} loading={loading}
            onSearch={runSearch} onView={onView}
            attachments={attachments}
            onAttach={onAttach}
            onRemoveAttachment={onRemoveAttachment} // Truyền hàm xóa
            SUBJECTS={userSubjects} // Chỉ đưa những môn GV có thể xem
          />
        )}
      </main>

      <footer className="footer"><span>© 2025 HCMUT Library Demo</span></footer>
      <Toast kind={toast?.kind || "info"} text={toast?.text} onClose={() => setToast(null)} />
    </div>
  );
}

/* ========= Sub-components ========= */

function StudentView({ currentUser, q, setQ, subject, setSubject, items, loading, onSearch, onView, SUBJECTS }) {
  return (
    <div className="panel">
      <div className="panel-hd"><GraduationCap size={18} /><h2>Sinh viên (Khoa: {currentUser.department})</h2></div>
      <ReadonlyId label="MSSV" value={currentUser.id} />

      <SearchBar
        q={q} setQ={setQ}
        subject={subject} setSubject={setSubject}
        onSubmit={onSearch} loading={loading}
        placeholder="VD: Cấu trúc dữ liệu, OOP…"
        SUBJECTS={SUBJECTS}
      />

      <DocList
        items={items}
        currentUser={currentUser}
        onView={onView}
      />
    </div>
  );
}

function TeacherView({ currentUser, q, setQ, subject, setSubject, items, loading, onSearch, onView, attachments, onAttach, onRemoveAttachment, SUBJECTS }) {
  return (
    <div className="panel">
      <div className="panel-hd"><UserRoundCog size={18} /><h2>Giảng viên (Môn: {currentUser.subjects.join(', ')})</h2></div>
      <ReadonlyId label="MSGV" value={currentUser.id} />

      <SearchBar
        q={q} setQ={setQ}
        subject={subject} setSubject={setSubject}
        onSubmit={onSearch} loading={loading}
        placeholder="Tìm và đính kèm tài liệu cho buổi tư vấn…"
        SUBJECTS={SUBJECTS}
      />

      <DocList
        items={items}
        currentUser={currentUser}
        onView={onView}
        onAttach={onAttach}
        attachments={attachments}
        asTeacher // Flag để biết đây là view của GV
      />

      <AttachPanel
        attachments={attachments}
        onRemoveAttachment={onRemoveAttachment}
      />
    </div>
  );
}

// Panel đính kèm (tách riêng)
function AttachPanel({ attachments, onRemoveAttachment }) {
  return (
    <div className="panel-attach">
      <div className="panel-hd small"><ShieldCheck size={16} /><h3>Tài liệu đã đính kèm</h3></div>
      {!attachments.length ? (
        <div className="empty small"><Link size={20} /><p>Chưa có tài liệu nào.</p></div>
      ) : (
        <ul className="attach-list">
          {attachments.map((it) => (
            <li key={it.id}>
              <FileText size={14} />
              <span className="t" title={it.title}>{it.title}</span>
              <span className="s">{it.subject}</span>
              {/* NÚT XÓA MỚI */}
              <button
                className="btn-remove-attach"
                title="Gỡ"
                onClick={() => onRemoveAttachment(it.id)}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="note">* Sinh viên chỉ nhìn thấy tài liệu nếu phù hợp điều kiện truy cập (đúng khoa & được cho phép).</p>
    </div>
  );
}


function ReadonlyId({ label, value }) {
  return (
    <div className="idrow">
      <label className="field">
        <span>{label}</span>
        <input value={value} readOnly disabled />
      </label>
    </div>
  );
}

function SearchBar({ q, setQ, subject, setSubject, onSubmit, loading, placeholder, SUBJECTS }) {
  return (
    <form className="searchbar" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      <div className="input-icon">
        <Search size={16} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder || "Từ khóa…"} />
      </div>
      <select value={subject} onChange={(e) => setSubject(e.target.value)}>
        <option value="">Tất cả môn</option>
        {SUBJECTS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
      </select>
      <button className="btn btn-primary" disabled={loading}>
        {loading ? <Loader2 className="spin" size={16} /> : <Search size={16} />}
        <span>{loading ? "Đang tìm…" : "Tìm kiếm"}</span>
      </button>
    </form>
  );
}

function DocList({ items, currentUser, onView, onAttach, attachments, asTeacher }) {
  if (!items.length) return <div className="empty"><FileText size={28} /><p>Không có tài liệu nào phù hợp.</p></div>;

  return (
    <ul className="doc-list">
      {items.map((it) => {
        // Logic `allowed` và `restricted` đã bị xóa, vì `items` đã được lọc trước

        // Chỉ dùng cho GV
        const attached = attachments?.some?.((x) => x.id === it.id);

        // Logic ẩn file đã được chuyển lên `visibleCatalog`
        // Sinh viên sẽ không thấy file bị hạn chế

        return (
          <li className="doc" key={it.id}>
            <div className="doc-main">
              {/* Xóa logic thumb-lock */}
              <div className="thumb">
                <FileText size={16} />
              </div>
              <div className="meta">
                <div className="title">{it.title}</div>
                <div className="sub">
                  <span>Môn: <b>{it.subject}</b></span><span>•</span>
                  <span>Kích thước: {it.size}</span>
                  {/* XÓA BADGE "GIỚI HẠN" */}
                  {!it.isVisible && asTeacher && (
                    <>
                      <span>•</span>
                      <span className="badge-hidden">Đang ẩn với SV</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="doc-actions">
              {asTeacher ? (
                // Giao diện nút cho Giảng viên
                <>
                  <button
                    className={`btn ${attached ? "btn-done" : "btn-ghost"}`}
                    onClick={() => onAttach(it)}
                    disabled={attached}
                  >
                    {attached ? <CheckCircle size={16} /> : <Link size={16} />}
                    <span>{attached ? "Đã đính kèm" : "Đính kèm"}</span>
                  </button>
                  <button className="btn btn-ghost" onClick={() => onView(it)}>
                    <Eye size={16} />
                    <span>Xem/Tải</span>
                  </button>
                </>
              ) : (
                // Giao diện nút cho Sinh viên
                // ĐÃ XÓA NÚT BỊ VÔ HIỆU HÓA
                <button className="btn btn-ghost" onClick={() => onView(it)}>
                  <Download size={16} />
                  <span>Xem/Tải</span>
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}


/* ===== Toast ===== */
function Toast({ kind = "info", text, onClose }) {
  if (!text) return null;
  return (
    <div className={`toast toast-${kind}`}>
      {kind === "success" && <CheckCircle size={16} />}
      {kind === "error" && <AlertTriangle size={16} />}
      {kind === "info" && <Info size={16} />}
      <span>{text}</span>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}
