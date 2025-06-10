// src/components/ChatLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const ChatLayout: React.FC = () => {
  return (
    <div className="flex h-full">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default ChatLayout;
