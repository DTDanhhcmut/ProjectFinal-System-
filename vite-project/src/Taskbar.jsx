import React from 'react';

export default function Taskbar() {
  return (
    <header className="navbar">
      <div className="logo">
        <img src="/images/hcmut.png" alt="BK Logo" />
      </div>
      <nav className="nav-links">
        <a href="#">Trang chủ</a>
        <a className="register-link" href="#">Đăng kí chương trình</a>
        <a href="#">Quản lý lịch</a>
        <a href="#">HCMUT_LIBRARY</a>
      </nav>
      <div className="user-icons">
        <button className="bell-button" aria-label="Thông báo" title="Thông báo" aria-pressed="false">
          <svg className="bell-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18.6 14.6V11a6 6 0 1 0-12 0v3.6c0 .538-.214 1.055-.595 1.395L4 17h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span className="visually-hidden">Thông báo</span>
        </button>
        <button className="avatar-button sso-button" aria-label="HCMUT SSO" title="HCMUT SSO" aria-expanded="false">
          <span className="sso-box">HCMUT_SSO</span>
        </button>
      </div>
    </header>
  );
}

