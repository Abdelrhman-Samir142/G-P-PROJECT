import type { Metadata } from "next";
/* REDESIGN: Distinctive font pairing — Playfair Display + Outfit + Cairo */
import { Playfair_Display, Outfit, Cairo } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

/* REDESIGN: Heading font */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

/* REDESIGN: English Body font */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

/* REDESIGN: Arabic font */
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "4Sale - سوقك الذكي للمستعمل والخردة",
  description: "وفر فلوسك وساهم في حماية البيئة. منصة ذكية لبيع المستعمل والخردة في مصر مدعومة بالذكاء الاصطناعي",
  keywords: "بيع مستعمل، خردة، مصر، ذكاء اصطناعي، سوق، marketplace, refurb, sustainable",
  authors: [{ name: "4Sale Team" }],

  openGraph: {
    title: "4Sale - سوقك الذكي للمستعمل والخردة",
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
        className={`${playfair.variable} ${outfit.variable} ${cairo.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
