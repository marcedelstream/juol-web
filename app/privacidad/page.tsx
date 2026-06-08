import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function PrivacidadPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#0a0a0a] py-16 text-white">
          <div className="container-page">
            <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">LEGAL</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Política de privacidad</h1>
          </div>
        </section>
        <section className="py-16">
          <div className="container-page max-w-2xl space-y-8 text-sm leading-7 text-zinc-600">
            <p>
              En Juol usamos tus datos para operar la aplicación y permitir que puedas crear una cuenta,
              completar tu perfil, encontrar partidos de fútbol cerca de tu ubicación, organizar partidos,
              confirmar asistencia y recibir comunicaciones esenciales relacionadas con el servicio.
            </p>
            {[
              ["Datos que podemos recopilar", "Podemos recopilar datos de cuenta, datos de perfil, ubicación aproximada o seleccionada, información de partidos, confirmaciones, preferencias dentro de la app y datos técnicos necesarios para seguridad, soporte y funcionamiento."],
              ["Uso de ubicación", "La ubicación se usa para mostrarte canchas y partidos disponibles cerca de vos, calcular distancias aproximadas y facilitar que puedas marcar o encontrar el lugar donde se jugará un partido. No vendemos tus datos personales."],
              ["Conservación de datos", "Conservamos los datos de cuenta y perfil mientras tu cuenta permanezca activa o mientras sean necesarios para prestarte el servicio. Si solicitás la eliminación de tu cuenta, eliminaremos o anonimizaremos tus datos personales dentro de un plazo razonable, salvo aquellos que debamos conservar temporalmente por motivos legales o de seguridad."],
              ["Eliminación de cuenta", "Podés solicitar la eliminación de tu cuenta desde la app, en la sección de perfil, o desde la página de eliminación de cuenta disponible en juol.lat."],
              ["Contacto", "Si necesitás ayuda o querés realizar una consulta sobre privacidad, podés contactarnos a través de los canales de soporte publicados por Juol."],
            ].map(([title, text]) => (
              <section key={title} className="space-y-2 border-t border-zinc-100 pt-6">
                <h2 className="text-base font-black text-zinc-900">{title}</h2>
                <p>{text}</p>
              </section>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
