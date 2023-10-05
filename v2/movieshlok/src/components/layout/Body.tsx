import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NextFont } from "next/dist/compiled/@next/font";

export default function Layout({
  children,
  inter,
}: {
  children: React.ReactNode;
  inter: NextFont;
}) {
  return (
    <body className={`${inter.className} relative min-h-screen`}>
      <Header />
      {children}
      <Footer />
    </body>
  );
}
