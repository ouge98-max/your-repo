# Application Improvement Tasks

## Phase 1: Clean up debug code (console.log, console.error, alert calls)
- [ ] Remove console.log/error from services/mockApi.ts
- [ ] Remove console.error from components/QrScanner.tsx
- [ ] Remove console.error from components/LoginScreen.tsx
- [ ] Remove console.error from components/TaxCenterScreen.tsx
- [ ] Remove console.error from components/LiveChatScreen.tsx
- [ ] Remove console.error from components/ServiceProfileViewScreen.tsx
- [ ] Remove console.error from components/VideoCallScreen.tsx
- [ ] Remove console.error from components/MobileRechargeScreen.tsx
- [ ] Remove console.error from components/DDListingDetailScreen.tsx
- [ ] Remove console.error from components/SecurityScreen.tsx
- [ ] Remove console.error from components/AudioCallScreen.tsx
- [ ] Remove console.error from components/QrCodeModal.tsx
- [ ] Remove console.error from components/SettingsScreen.tsx
- [ ] Remove console.error from components/GoogleMap.tsx
- [ ] Remove console.error from components/DDMapView.tsx
- [ ] Remove console.error from components/TransactionHistory.tsx
- [ ] Remove console.error from components/MomentsScreen.tsx
- [ ] Remove alert() from components/ReviewModal.tsx
- [ ] Remove alert() from components/MakeOfferModal.tsx
- [ ] Remove alert() from components/SavingsScreen.tsx
- [ ] Remove console.error from components/ChatScreen.tsx
- [ ] Remove console.error from components/WalletTabScreen.tsx
- [ ] Remove console.error from components/ServiceProfileEditScreen.tsx
- [ ] Remove console.error from components/ProductDetailScreen.tsx
- [ ] Remove console.error from components/MomentPostCard.tsx
- [ ] Remove console.error from components/MarketMapView.tsx
- [ ] Remove console.error from components/InternationalTransferScreen.tsx
- [ ] Remove console.error from components/CameraView.tsx
- [ ] Remove console.error from components/GlobalSearchScreen.tsx
- [ ] Remove console.error from components/TransactionDetailScreen.tsx
- [ ] Remove console.error from utils/notifications.ts
- [ ] Remove console.error from utils/db.ts
- [ ] Remove console.error from utils/qrCodeGenerator.ts

## Phase 2: Set up testing framework (Jest, React Testing Library)
- [ ] Install Jest and React Testing Library dependencies
- [ ] Configure Jest for TypeScript and React
- [ ] Set up test scripts in package.json
- [ ] Create test utilities and setup files

## Phase 3: Implement tests for core components (App, Login, Chat)
- [ ] Write tests for App.tsx (routing, authentication)
- [ ] Write tests for LoginScreen.tsx
- [ ] Write tests for ChatScreen.tsx
- [ ] Write tests for key utilities and hooks

## Phase 4: Improve error handling and accessibility
- [ ] Add component-level error boundaries
- [ ] Implement proper error messages and user feedback
- [ ] Add ARIA labels and accessibility attributes
- [ ] Test keyboard navigation

## Phase 5: Address security concerns in mock API
- [ ] Remove hardcoded OTP validation
- [ ] Implement proper input validation
- [ ] Add rate limiting simulation
- [ ] Sanitize user inputs

## Phase 6: Performance optimizations
- [ ] Implement code splitting beyond lazy loading
- [ ] Add caching strategies
- [ ] Optimize images and assets
- [ ] Bundle analysis and optimization

## Followup: Run tests, verify fixes, update documentation
- [ ] Run test suite and ensure all tests pass
- [ ] Verify all debug code removed
- [ ] Update README with testing instructions
- [ ] Update SECURITY.md with implemented security measures

# Landing Page Layout Fix TODO

## Tasks
- [ ] Remove unnecessary circle bubbles (keep only play and ride video bubbles)
- [ ] Simplify bubble cluster positioning
- [ ] Ensure responsive layout works properly
- [ ] Test the updated layout
