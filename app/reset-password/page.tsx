import { SiteHeader } from "@/components/SiteHeader";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-[80vh] items-center justify-center px-5 py-16">
        <div className="w-full max-w-md text-center">
          <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">CUENTA JUOL</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">Nueva contraseña</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
            Abriste el enlace de recuperación. Ingresá tu nueva contraseña para volver a Juol.
          </p>
          <ResetPasswordForm />
        </div>
      </main>
    </>
  );
}
