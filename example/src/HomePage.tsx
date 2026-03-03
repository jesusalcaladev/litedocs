import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="litedocs-home">
      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-badge">⚡ Documentation Framework</span>
          <h1 className="hero-title">
            Build beautiful docs
            <span className="hero-highlight"> in minutes</span>
          </h1>
          <p className="hero-description">
            A modern, fast documentation framework built on Vite. File-system routing, 
            MDX support, syntax highlighting, and instant HMR out of the box.
          </p>
          <div className="hero-actions">
            <Link to="/docs/getting-startep" className="hero-btn hero-btn-primary">
              Get Started →
            </Link>
            <a href="https://github.com" className="hero-btn hero-btn-secondary" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">📁</span>
            <h3>File-System Routing</h3>
            <p>Drop .mdx files in your docs folder. Routes are created automatically.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚡</span>
            <h3>Instant HMR</h3>
            <p>Edit your docs and see changes instantly. No full page reloads needed.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🎨</span>
            <h3>Syntax Highlighting</h3>
            <p>Beautiful code blocks powered by Shiki with theme support.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">⚛️</span>
            <h3>React & MDX</h3>
            <p>Use React components inside your Markdown. Full MDX support.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Smart Sidebar</h3>
            <p>Auto-generated sidebar with grouping, collapsible sections, and ordering.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📑</span>
            <h3>Table of Contents</h3>
            <p>Auto-generated "On This Page" with scroll tracking for easy navigation.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
