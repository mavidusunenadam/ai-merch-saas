import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/builder?shop=demo-store.myshopify.com");
}