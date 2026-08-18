import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"DENTAL MOTION / Portfolio",description:"Cinematic dental editor portfolio"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}