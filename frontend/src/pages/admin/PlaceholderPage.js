// src/pages/admin/PlaceholderPage.js
import React from 'react';

export default function PlaceholderPage({ title }) {
    return (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '100px 0' }}>
            <i className='bx bx-code-block' style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.2 }}></i>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{title}</h2>
            <p style={{ marginTop: '10px' }}>This module is currently under development for the Sentinel v2.4.0 update.</p>
        </div>
    );
}
