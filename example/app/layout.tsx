import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata = { title: 'Calendar example' }

/**
 * The minimum a host has to provide, per the package README: the Archivo
 * variable font and a <Toaster>. Nothing else. If the calendar needs
 * anything beyond this, the package is coupled to its original host and
 * the example build is where that shows up.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62.5..125,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
