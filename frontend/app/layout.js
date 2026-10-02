import "./globals.css";
export const metadata = {
  title: "Teacher Jobs UZ — O‘qituvchilar uchun vakansiyalar",
  description: "O‘zbekistondagi o‘qituvchilar uchun vakansiyalarni bir joydan qidiring."
};
export default function RootLayout({children}) {
  return <html lang="uz"><body>{children}</body></html>;
}
