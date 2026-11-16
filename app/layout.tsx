import type { Metadata } from 'next'
import '../styles/globals.css'
import '../styles/home.css'
import { Toaster } from 'react-hot-toast';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { GoogleAnalytics } from '@next/third-parties/google';
import Link from 'next/link';
import Marquee from "react-fast-marquee";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: 'Jamia Madeenathunnoor',
  description: 'Jamia Madeenathunnoor epitomizes excellence, blending traditional Islamic studies with diverse academic disciplines...',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Toaster
  position="bottom-center"
  reverseOrder={false}
/>       <GoogleAnalytics gaId="G-1RVZZT4BY4" />
<NextTopLoader
          color="#b1882e"
          height={4}
          showSpinner={false}
          shadow="0 0 10px #b1882e,0 0 5px #b1882e"
        />
        <AntdRegistry>
          {children}
          </AntdRegistry>
      </body>
    </html>
  )
}
