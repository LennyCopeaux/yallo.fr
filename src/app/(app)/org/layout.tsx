import { InstantNav } from "@/components/ui/instant-nav";

export default function OrgLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <InstantNav>{children}</InstantNav>;
}
