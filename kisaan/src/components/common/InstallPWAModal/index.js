import React from 'react';
import './installPWAModal.css';

const InstallPWAModal = ({ platform, onInstall, onDismiss }) => {
  const { isIOS } = platform;

  return (
    <div className="pwa-modal-overlay" onClick={onDismiss}>
      <div className="pwa-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pwa-modal-handle" />

        <div className="pwa-modal-header">
          <img
            src="/khetihat.png"
            alt="Khetihat"
            className="pwa-modal-app-icon"
          />
          <div className="pwa-modal-app-info">
            <p className="pwa-modal-app-name">Khetihat</p>
            <p className="pwa-modal-app-tagline">Agricultural Marketplace</p>
          </div>
          <button className="pwa-modal-close" onClick={onDismiss} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="pwa-modal-divider" />

        {isIOS ? <IOSInstructions onDismiss={onDismiss} /> : <AndroidInstall onInstall={onInstall} onDismiss={onDismiss} />}
      </div>
    </div>
  );
};

function AndroidInstall({ onInstall, onDismiss }) {
  return (
    <div className="pwa-modal-body">
      <div className="pwa-modal-benefits">
        <div className="pwa-benefit-item">
          <span className="pwa-benefit-icon">⚡</span>
          Faster load times — works even on slow networks
        </div>
        <div className="pwa-benefit-item">
          <span className="pwa-benefit-icon">📵</span>
          Browse listings offline
        </div>
        <div className="pwa-benefit-item">
          <span className="pwa-benefit-icon">🏠</span>
          Quick access from your home screen
        </div>
      </div>

      <button className="pwa-modal-install-btn" onClick={onInstall}>
        <span>⬇</span> Add to Home Screen
      </button>
      <button className="pwa-modal-skip" onClick={onDismiss}>
        Not now
      </button>
    </div>
  );
}

function IOSInstructions({ onDismiss }) {
  return (
    <div className="pwa-ios-steps">
      <p className="pwa-ios-intro">
        Install Khetihat on your iPhone for quick access — no App Store needed.
      </p>

      <div className="pwa-ios-step">
        <div className="pwa-ios-step-num">1</div>
        <p className="pwa-ios-step-text">
          Tap the <strong>Share</strong> button{' '}
          <i className="pwa-ios-step-icon">⎙</i> at the bottom of your browser
        </p>
      </div>

      <div className="pwa-ios-step">
        <div className="pwa-ios-step-num">2</div>
        <p className="pwa-ios-step-text">
          Scroll down and tap <strong>"Add to Home Screen"</strong>
        </p>
      </div>

      <div className="pwa-ios-step">
        <div className="pwa-ios-step-num">3</div>
        <p className="pwa-ios-step-text">
          Tap <strong>"Add"</strong> in the top-right corner to confirm
        </p>
      </div>

      <div className="pwa-ios-arrow">⬇</div>

      <button className="pwa-ios-got-it" onClick={onDismiss}>
        Got it
      </button>
    </div>
  );
}

export default InstallPWAModal;
