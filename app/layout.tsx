import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const viewport: Viewport = {
  themeColor: '#0F1729',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'MN Brand — Global CRM',
  description: 'International Lead Generation & WhatsApp CRM Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MN Brand CRM',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('mn_brand_theme');
                if (theme) {
                  var p = JSON.parse(theme);
                  if (p.primaryColor) document.documentElement.style.setProperty('--mn-navy', p.primaryColor);
                  if (p.accentColor) document.documentElement.style.setProperty('--mn-gold', p.accentColor);
                }
                var mode = localStorage.getItem('mn_theme_mode');
                if (mode === 'dark') {
                  document.documentElement.classList.add('dark');
                }
                function purgeNetlifyBadge() {
                  var targets = document.querySelectorAll('#netlify-drawer-container, netlify-drawer, #netlify-badge, .netlify-badge, [data-netlify-badge], iframe[src*="netlify"], a[href*="netlify.com"]');
                  targets.forEach(function(el) { el.remove(); });
                }
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', purgeNetlifyBadge);
                  window.addEventListener('load', purgeNetlifyBadge);
                  var observer = new MutationObserver(function() { purgeNetlifyBadge(); });
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-50 selection:bg-[#C9A84C] selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
