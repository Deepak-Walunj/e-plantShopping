import errorBg from "@assets/backgrounds/error_bg.jpg"; // Keep if you want, or remove if using global CSS

export default function UnderConstruction() {
    return (
        <section className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: `url(${errorBg})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(11, 12, 16, 0.7)', backdropFilter: 'blur(5px)', zIndex: -1 }}></div>
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '15px', color: 'var(--color-primary)' }}>
                    🚧 Under Construction 🚧
                </h1>
                <p>We are currently working on this feature. Please check back later!</p>
            </div>
        </section>
    )
}