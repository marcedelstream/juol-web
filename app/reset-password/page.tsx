import { SiteHeader } from "@/components/SiteHeader";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return <><SiteHeader /><main className="container-page min-h-[75vh] py-16 text-center"><h1 className="text-4xl font-black tracking-tight">Cambiá tu contraseña</h1><p className="mx-auto mt-3 max-w-lg text-zinc-600">Usá el enlace que recibiste por correo para crear una contraseña nueva.</p><ResetPasswordForm /></main></>;
}
