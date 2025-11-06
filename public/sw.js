// Versioning for caches
const SHELL_CACHE_NAME = 'ouma-ge-shell-v4';
const DATA_CACHE_NAME = 'ouma-ge-data-v1';

// App shell assets
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/logo.jpg',
  '/manifest.json',
  '/styles.css',
];

// Application logic files
const APP_LOGIC_CACHE = [
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/mockApi.ts',
  '/utils/audio.ts',
  '/utils/currency.ts',
  '/utils/db.ts',
  '/utils/geolocation.ts',
  '/utils/interaction.ts',
  '/utils/previews.ts',
  '/utils/qrCodeGenerator.ts',
  '/utils/transactions.ts',
  '/utils/hooks.ts',
  '/hooks/useSwipeToReply.ts',
  '/contexts/AppContext.tsx',
  '/contexts/CartContext.tsx',
  '/contexts/ThemeContext.tsx',
  '/components/AddAccountScreen.tsx',
  '/components/AddCardScreen.tsx',
  '/components/AddContactModal.tsx',
  '/components/AddInternationalAccountScreen.tsx',
  '/components/AddPaymentMethodScreen.tsx',
  '/components/AiActionCard.tsx',
  '/components/AiServiceRequestCard.tsx',
  '/components/AppLayout.tsx',
  '/components/AttachmentSheet.tsx',
  '/components/AudioCallScreen.tsx',
  '/components/Avatar.tsx',
  '/components/BillPaymentScreen.tsx',
  '/components/BillSplitBubble.tsx',
  '/components/BillSplitCreationModal.tsx',
  '/components/BookingModal.tsx',
  '/components/BottomNavBar.tsx',
  '/components/BudgetScreen.tsx',
  '/components/BusTicketScreen.tsx',
  '/components/CameraView.tsx',
  '/components/CartScreen.tsx',
  '/components/ChatLayout.tsx',
  '/components/ChatListScreen.tsx',
  '/components/ChatListSkeleton.tsx',
  '/components/ChatScreen.tsx',
  '/components/ComingSoonScreen.tsx',
  '/components/ConfirmDeliveryModal.tsx',
  '/components/ConfirmModal.tsx',
  '/components/CountrySelectModal.tsx',
  '/components/CreateDDListingScreen.tsx',
  '/components/CreateGroupChatScreen.tsx',
  '/components/CreateMomentScreen.tsx',
  '/components/CreateServiceRequestScreen.tsx',
  '/components/DarkDhakaScreen.tsx',
  '/components/DDListingDetailScreen.tsx',
  '/components/DepositWithdrawScreen.tsx',
  '/components/DesktopSidebar.tsx',
  '/components/DiscoverScreen.tsx',
  '/components/GalleryPicker.tsx',
  '/components/GiftFlowScreen.tsx',
  '/components/GlobalSearchScreen.tsx',
  '/components/GoogleMap.tsx',
  '/components/GroupInfoScreen.tsx',
  '/components/Header.tsx',
  '/components/icons.tsx',
  '/components/InternationalTransferScreen.tsx',
  '/components/KYCForm.tsx',
  '/components/LocationPickerModal.tsx',
  '/components/LoginScreen.tsx',
  '/components/LiveChatScreen.tsx',
  '/components/LoadingSpinner.tsx',
  '/components/MakeOfferModal.tsx',
  '/components/MarketDiscoveryScreen.tsx',
  '/components/MarketGridView.tsx',
  '/components/MarketMapView.tsx',
  '/components/MarketScreen.tsx',
  '/components/MessageActions.tsx',
  '/components/MobileRechargeScreen.tsx',
  '/components/MomentPostCard.tsx',
  '/components/MomentsDiscoveryScreen.tsx',
  '/components/MomentsScreen.tsx',
  '/components/MyJobsScreen.tsx',
  '/components/NewsPostCard.tsx',
  '/components/NewsScreen.tsx',
  '/components/PassportFeeScreen.tsx',
  '/components/PaymentGatewayModal.tsx',
  '/components/PaymentMethodsScreen.tsx',
  '/components/PaymentSuccessScreen.tsx',
  '/components/ProductDetailScreen.tsx',
  '/components/ProfileEditScreen.tsx',
  '/components/ProfileScreen.tsx',
  '/components/ProfileViewScreen.tsx',
  '/components/QrCodeModal.tsx',
  '/components/QrScanner.tsx',
  '/components/RecurringTasksScreen.tsx',
  '/components/RedEnvelopeBubble.tsx',
  '/components/ResultDisplay.tsx',
  '/components/ReviewModal.tsx',
  '/components/SavingsScreen.tsx',
  '/components/SearchResultItem.tsx',
  '/components/SearchResultSection.tsx',
  '/components/SecurityScreen.tsx',
  '/components/SelectRecipientScreen.tsx',
  '/components/SellItemScreen.tsx',
  '/components/SendMoneyModal.tsx',
  '/components/SendRedEnvelopeModal.tsx',
  '/components/ServiceDiscoveryScreen.tsx',
  '/components/ServiceProfileEditScreen.tsx',
  '/components/ServiceProfileViewScreen.tsx',
  '/components/ServiceRequestFeed.tsx',
  '/components/ServiceRequestScreen.tsx',
  '/components/ServiceRequestViewScreen.tsx',
  '/components/ServicesFeed.tsx',
  '/components/SettingsScreen.tsx',
  '/components/StarRating.tsx',
  '/components/StoryViewer.tsx',
  '/components/TaxCenterScreen.tsx',
  '/components/TaxLedgerScreen.tsx',
  '/components/ThemeToggle.tsx',
  '/components/TicketsScreen.tsx',
  '/components/ToggleSwitch.tsx',
  '/components/TransactionDetailScreen.tsx',
  '/components/TransactionHistory.tsx',
  '/components/TransactionIcon.tsx',
  '/components/TrainTicketScreen.tsx',
  '/components/UploadProgressModal.tsx',
  '/components/VideoCallScreen.tsx',
  '/components/VoiceMessagePlayer.tsx',
  '/components/WalletCard.tsx',
  '/components/WalletTabScreen.tsx',
];

// External assets
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/react-router-dom@6.23.1?deps=react@18.2.0',
  'https://esm.sh/lucide-react@0.395.0?deps=react@18.2.0',
  'https://esm.sh/markdown-it@14.1.0',
  'https://esm.sh/react-hot-toast@2.4.1?deps=react@18.2.0',
  'https://esm.sh/@google/genai@0.14.0',
  'https://esm.sh/@googlemaps/js-api-loader@1.16.6',
  'https://esm.sh/jsqr@1.4.0',
  'https://esm.sh/qrcode@1.5.3',
  'https://esm.sh/react-dom@18.2.0/',
  'https://esm.sh/react@18.2.0/',
  'https://esm.sh/react-window@1.8.10?deps=react@18.2.0',
  'https://esm.sh/react-virtualized-auto-sizer@1.0.24?deps=react@18.2.0',
];


// Install event: cache the application shell and activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE_NAME)
      .then((cache) => {
        // Cache local assets atomically
        const localAssets = [...CORE_ASSETS, ...APP_LOGIC_CACHE];
        const cacheLocalPromise = cache.addAll(localAssets);

        // Cache external assets individually to be resilient to CDN failures
        const cacheExternalPromise = Promise.all(
          EXTERNAL_ASSETS.map(url => {
            return cache.add(url).catch(err => {
              // Not logging error to keep console clean for production, but this is where you'd debug
            });
          })
        );
        
        return Promise.all([cacheLocalPromise, cacheExternalPromise]);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [SHELL_CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event: Network first for API, Cache first for assets
self.addEventListener('fetch', (event) => {
  const isApiCall = event.request.url.includes('https://picsum.photos') || event.request.url.includes('imgur.com');

  if (isApiCall) {
    // Network-first for API calls and external images
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
  } else {
    // Cache-first for app shell
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Message event listener from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Sync event for background message sending
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-new-messages') {
    event.waitUntil(
        self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
            clients.forEach(client => client.postMessage({ type: 'SYNC_MESSAGES' }));
        })
    );
  }
});

// Listen for messages from the client to trigger notifications (for simulation)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const data = event.data.payload;
    const title = data.title || 'Ouma-Ge Notification';
    const options = {
      body: data.body,
      icon: '/logo.jpg',
      badge: '/logo.jpg',
      vibrate: [200, 100, 200],
      tag: data.tag || 'ouma-ge-notification',
      data: {
        url: data.data.url || '/',
      },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});


// Push event for notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'New Message';
  const options = {
    body: data.body || 'You have a new message.',
    icon: '/logo.jpg',
    badge: '/logo.jpg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'ouma-ge-notification',
    data: {
      url: data.data.url || '/',
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        // If a window is already open at the target URL, focus it.
        // A simple equality check works for this app's routing.
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window.
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});