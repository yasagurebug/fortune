import "./globals.css";

export const metadata = {
  title: "今日のトンチキ占い",
  description: "JST基準で毎日ひとつ、同じ人には同じ文言が届くトンチキ占い。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
