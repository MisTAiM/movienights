/* ========================================
   Notification.jsx - Toast Notification Component
   ======================================== */

import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import './Notification.css';

function Notification() {
  const { state } = useApp();
  const { notifications } = state;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
}

function NotificationItem({ notification }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`notification notification-${notification.type} ${isExiting ? 'notification-exit' : ''}`}
    >
      <span className="notification-icon">
        {notification.type === 'success' && '✓'}
        {notification.type === 'error' && '✕'}
        {notification.type === 'info' && 'ℹ'}
        {notification.type === 'warning' && '⚠'}
      </span>
      <span className="notification-message">{notification.message}</span>
    </div>
  );
}

export default Notification;
