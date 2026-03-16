Application error: a client-side exception has occurred while loading ai.merch.ebiidesign.com (see the browser console for more information).import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard/shops");
}