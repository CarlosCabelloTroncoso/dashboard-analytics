import { redirect } from "next/navigation";

/**
 * Página raíz de la aplicación
 * Redirige a la página de login
 */

export default function Home() {
  redirect("/auth/login");
}