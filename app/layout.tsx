import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import Toasts from "@/components/toasts";
import {Providers} from "@/app/providers";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Family Tree",
    description: "Generate your family tree",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <Providers>
            {children}
            <Toasts></Toasts>
        </Providers>
        </body>
        </html>
    );
}
