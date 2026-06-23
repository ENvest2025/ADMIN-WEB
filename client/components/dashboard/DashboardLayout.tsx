import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

export default function DashboardLayout() {
    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            <Sidebar />
            <div className="flex-1 flex flex-col ml-64 overflow-hidden">
                <TopNav />
                <main className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
