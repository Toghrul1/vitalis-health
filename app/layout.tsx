import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Vitalis Health | Care that puts you first',description:'Discover personalized healthcare, find a specialist, and book an in-person or video appointment with Vitalis Health.'};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
