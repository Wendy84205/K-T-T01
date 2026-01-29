import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ManageHomePage() {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Welcome, {user?.firstName}!</h2>
                <p className="text-slate-600 mt-2">
                    Management Portal. You can review documents and generate reports here.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-100">
                    <h3 className="text-emerald-800 font-semibold mb-2">Pending Documents</h3>
                    <p className="text-3xl font-bold text-emerald-900">12</p>
                </div>
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h3 className="text-blue-800 font-semibold mb-2">Approved This Week</h3>
                    <p className="text-3xl font-bold text-blue-900">45</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
                    <h3 className="text-purple-800 font-semibold mb-2">System Alerts</h3>
                    <p className="text-3xl font-bold text-purple-900">0</p>
                </div>
            </div>
        </div>
    );
}
