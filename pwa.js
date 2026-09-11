// ===== SWARNA SPA PWA CONTROLLER =====
(function() {
  'use strict';

  let deferredPrompt = null;
  const BANNER_DISMISSED_KEY = 'swarna_pwa_install_dismissed';

  // 1. Service Worker Registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ [PWA] Service Worker registered with scope:', registration.scope);

          // Check for service worker updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('⚡ [PWA] New version available! Reloading...');
                  if (typeof toast === 'function') {
                    toast('✨ App updated! Refresh to see the latest features.', 'info');
                  }
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('⚠️ [PWA] Service Worker registration failed:', err);
        });
    });
  }

  // 2. Check if already installed in Standalone Mode
  function isRunningStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    );
  }

  // 3. Check if iOS Safari
  function isIosDevice() {
    const ua = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(ua) && !window.MSStream;
  }

  // 4. In-App Install Prompt Handling (Android, Chrome, Edge, Desktop)
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default browser mini-infobar
    e.preventDefault();
    deferredPrompt = e;

    // Check if dismissed recently (within 3 days)
    const dismissedTime = localStorage.getItem(BANNER_DISMISSED_KEY);
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 3 * 24 * 60 * 60 * 1000) {
      return;
    }

    if (!isRunningStandalone()) {
      showInstallBanner();
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    hideInstallBanner();
    if (typeof toast === 'function') {
      toast('🎉 Swarna Spa installed successfully!', 'success');
    }
    console.log('✅ [PWA] App successfully installed!');
  });

  function showInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.add('visible');
    }
  }

  function hideInstallBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
  }

  // 5. Setup event listeners once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    const installBtn = document.getElementById('pwa-install-btn');
    const dismissBtn = document.getElementById('pwa-dismiss-btn');
    const iosCloseBtn = document.getElementById('ios-install-close');

    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('[PWA] User response to install:', outcome);
          deferredPrompt = null;
          hideInstallBanner();
        } else if (isIosDevice()) {
          // Open iOS manual instructions modal
          const iosModal = document.getElementById('ios-install-modal');
          if (iosModal) iosModal.classList.add('active');
          hideInstallBanner();
        } else {
          if (typeof toast === 'function') {
            toast('To install, tap your browser menu (⋮) and select "Install app" or "Add to Home Screen".', 'info');
          }
        }
      });
    }

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        hideInstallBanner();
        localStorage.setItem(BANNER_DISMISSED_KEY, Date.now().toString());
      });
    }

    if (iosCloseBtn) {
      iosCloseBtn.addEventListener('click', () => {
        const iosModal = document.getElementById('ios-install-modal');
        if (iosModal) iosModal.classList.remove('active');
      });
    }

    // Show banner on iOS if not in standalone mode and not dismissed
    if (isIosDevice() && !isRunningStandalone()) {
      const dismissedTime = localStorage.getItem(BANNER_DISMISSED_KEY);
      if (!dismissedTime || Date.now() - parseInt(dismissedTime, 10) > 5 * 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          showInstallBanner();
        }, 3000);
      }
    }
  });

  // 6. Online / Offline status toasts
  window.addEventListener('online', () => {
    if (typeof toast === 'function') {
      toast('🟢 You are back online! Syncing latest data...', 'success');
    }
    if (typeof syncDataWithServer === 'function') {
      syncDataWithServer();
    }
  });

  window.addEventListener('offline', () => {
    if (typeof toast === 'function') {
      toast('⚡ You are currently offline. Local data is active.', 'warning');
    }
  });

  // Expose manual prompt trigger (e.g. for a button in settings or menu)
  window.triggerPwaInstall = function() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
    } else if (isIosDevice()) {
      const iosModal = document.getElementById('ios-install-modal');
      if (iosModal) iosModal.classList.add('active');
    } else if (isRunningStandalone()) {
      if (typeof toast === 'function') toast('App is already installed!', 'info');
    } else {
      if (typeof toast === 'function') {
        toast('To install, tap your browser menu (⋮) and choose "Install app" or "Add to Home screen".', 'info');
      }
    }
  };

})();
