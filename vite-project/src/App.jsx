import React, { useState } from 'react';
import ConnectorDemo from './ConnectorDemo.jsx';
import Taskbar from './Taskbar.jsx';
import './ConnectorDemo.css'; // Dùng chung file CSS
import { User, GraduationCap, Repeat } from 'lucide-react';

const MOCK_USER_STUDENT = {
  id: "SV0012345",
  role: "student",
  name: "Nguyễn Văn A",
  department: "KHOA_CNTT", // Sinh viên khoa Công nghệ thông tin
  subjects: [],
};

const MOCK_USER_TEACHER = {
  id: "GV000001",
  role: "teacher",
  name: "Trần Thị B",
  department: "KHOA_CNTT",
  subjects: ["CTDLGT", "OOP"], // Giảng viên này dạy 2 môn
};

function App() {
  const [currentUser, setCurrentUser] = useState(MOCK_USER_TEACHER);

  function toggleUser() {
    setCurrentUser(prevUser =>
      prevUser.role === "student" ? MOCK_USER_TEACHER : MOCK_USER_STUDENT
    );
  }

  return (
    <>
      <Taskbar />

      {/* <button onClick={toggleUser} className="user-toggle-btn" title="Chuyển đổi tài khoản GV/SV">
        <Repeat size={16} />
        Đổi tài khoản sang: {currentUser.role === 'student' ? 'Giảng viên' : 'Sinh viên'}
      </button> */}

      <ConnectorDemo currentUser={currentUser} />
    </>
  );
}

export default App;
