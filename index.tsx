import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ClerkProvider } from '@clerk/clerk-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const SUBDOMAIN = import.meta.env.VITE_CLERK_SUBDOMAIN;

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const cleanKey = PUBLISHABLE_KEY ? PUBLISHABLE_KEY.trim() : '';
const isLiveKey = cleanKey.startsWith('pk_live_');
const isProductionDomain = typeof window !== 'undefined' && (
  window.location.hostname === 'kitabuddy.dpdns.org' || 
  window.location.hostname.endsWith('.kitabuddy.dpdns.org')
);

// Hanya aktifkan Clerk di persekitaran pratonton jika ia adalah Test Key,
// atau jika ia Live Key di domain produksi yang sah bagi mengelakkan ralat CORS Clerk.
const shouldEnableClerk = !!(
  cleanKey.startsWith('pk_') && 
  (!isLiveKey || isProductionDomain)
);

if (shouldEnableClerk) {
  const clerkSubdomain = SUBDOMAIN && SUBDOMAIN.trim() ? SUBDOMAIN.trim() : undefined;
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={cleanKey} subdomain={clerkSubdomain}>
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
