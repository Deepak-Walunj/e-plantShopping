import React from "react";

export default function UnknownPage() {
    return (
        <section className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '15px' }}>
                    ❓ Oops! The page you're looking for does not exist. ❓
                </h1>
                <p>Please check the URL or go back to the home page.</p>
            </div>
        </section>
    )
}