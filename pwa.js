// ===== SWARNA SPA PWA CONTROLLER =====
(function() {
  'use strict';

  let deferredPrompt = null;
  const BANNER_DISMISSED_KEY = 'swarna_pwa_install_dismissed';

  // ─────────────────────────────────────────────────────────────────────────
  // RELOAD GUARD — prevents an infinite-reload loop.
  // We store a flag in sessionStorage so if the page reloads and the new
  // service worker is immediately active on the second load, we don't reload
  // again indefinitely.
  // ─────────────────────────────────────────────────────────────────────────
  const RELOAD_KEY = 'swarna_sw_reload';

  function safeReload() {
    if (sessionStorage.getItem(RELOAD_KEY)) {
      // Already reloaded once this session — do not reload again.
      sessionStorage.removeItem(RELOAD_KEY);
      console.log('[PWA] Reload guard active — skipping second reload.');
      return;
    }
    sessionStorage.setItem(RELOAD_KEY, '1');
    console.log('[PWA] New SW activated — reloading to load fresh assets.');
    window.location.reload();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. Service Worker Registration + Update Wiring
  // ─────────────────────────────────────────────────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ [PWA] Service Worker registered with scope:', registration.scope);

          // ── 1a. Listen for the SW_ACTIVATED message the new worker sends
          //        after clients.claim(). This fires even when the page was
          //        already open when the new worker took control.
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SW_ACTIVATED') {
              console.log('[PWA] SW_ACTIVATED message received — triggering safe reload.');
              safeReload();
            }
          });

          // ── 1b. controllerchange fires when skipWaiting causes the waiting
          //        worker to become the active controller. Combined with 1a
          //        this covers all code-paths.
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] controllerchange event — new SW is now controller.');
            safeReload();
          });

          // ── 1c. Track new worker installation progress
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (!installingWorker) return;

            installingWorker.onstatechange = () => {
              console.log('[PWA] Installing worker state:', installingWorker.state);
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // A new worker is waiting. skipWaiting() inside sw.js will
                  // promote it; then the controllerchange / SW_ACTIVATED path
                  // above handles the reload.
                  console.log('[PWA] New SW installed and waiting — skipWaiting will promote it.');
                } else {
                  // First-ever install — no reload needed, just log.
                  console.log('[PWA] SW installed for the first time (no previous controller).');
                }
              }
            };
          };

          // ── 1d. Periodic update check every 60 seconds.
          //        Installed PWAs may run for hours without a navigation event,
          //        so the browser's built-in update trigger never fires.
          //        Calling registration.update() forces a network fetch of sw.js.
          setInterval(() => {
            registration.update()
              .then(() => console.log('[PWA] Periodic SW update check complete.'))
              .catch((err) => console.warn('[PWA] Periodic SW update check failed:', err));
          }, 60 * 1000); // 60 seconds
        })
        .catch((err) => {
          console.warn('⚠️ [PWA] Service Worker registration failed:', err);
        });
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Check if already installed in Standalone Mode
  // ─────────────────────────────────────────────────────────────────────────
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
