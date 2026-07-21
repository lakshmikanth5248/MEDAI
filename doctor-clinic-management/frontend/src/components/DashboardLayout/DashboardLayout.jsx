import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import ChatBot from '../ChatBot/ChatBot';
import './DashboardLayout.css';

export default function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <Navbar />
        <main className="dashboard-content">
          <Outlet />
        </main>
        <Footer />
      </div>
      <ChatBot />
    </div>
  );
}
