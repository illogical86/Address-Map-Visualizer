import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Address Map Visualizer',
  description: 'Upload your spreadsheet with addresses and visualize them on a map',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 
