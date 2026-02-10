import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-ibm-plex-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RefurbAI - سوقك الذكي للمستعمل والخردة",
  description: "وفر فلوسك وساهم في حماية البيئة. منصة ذكية لبيع المستعمل والخردة في مصر مدعومة بالذكاء الاصطناعي",
  keywords: "بيع مستعمل، خردة، مصر، ذكاء اصطناعي، سوق، marketplace, refurb, sustainable",
  authors: [{ name: "RefurbAI Team" }],

  openGraph: {
    title: "RefurbAI - سوقك الذكي للمستعمل والخردة",
    description: "منصة ذكية لبيع المستعمل والخردة في مصر",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cairo.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
