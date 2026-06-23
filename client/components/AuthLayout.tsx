import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-900 bg-grid flex flex-col items-center pt-12 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    EnVest
                </h1>
            </div>

            <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
                    <p className="text-slate-500 text-sm">{subtitle}</p>
                </div>

                {children}
            </div>
        </div>
    );
}
