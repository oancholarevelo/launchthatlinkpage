import { 
  Inter, 
  Lato, 
  Source_Code_Pro, 
  Poppins, 
  Roboto_Mono, 
  Playfair_Display, 
  Lora 
} from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const lato = Lato({ subsets: ["latin"], weight: ['400', '700'], variable: '--font-lato' });
const sourceCodePro = Source_Code_Pro({ subsets: ["latin"], variable: '--font-source-code-pro' });
const poppins = Poppins({ subsets: ["latin"], weight: ['400', '600', '700'], variable: '--font-poppins' });
const robotoMono = Roboto_Mono({ subsets: ["latin"], variable: '--font-roboto-mono' });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair-display' });
const lora = Lora({ subsets: ["latin"], variable: '--font-lora' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${lato.variable} ${sourceCodePro.variable} ${poppins.variable} ${robotoMono.variable} ${playfairDisplay.variable} ${lora.variable} font-sans bg-slate-50`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}