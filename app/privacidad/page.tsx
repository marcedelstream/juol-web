import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function PrivacidadPage() {
  return (
    <>
      <SiteHeader />
      <main className="py-16">
        <div className="container-page max-w-3xl">
          <p className="text-[10px] font-black tracking-widest text-[#ff6b00]">LEGAL</p>
          <h1 className="mt-3 text-4xl font-black">Política de privacidad</h1>
          <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-600">
            <p>
              En Juol usamos tus datos para operar la aplicación y permitir que puedas crear una cuenta,
              completar tu perfil, encontrar partidos de fútbol cerca de tu ubicación, organizar partidos,
              confirmar asistencia y recibir comunicaciones esenciales relacionadas con el servicio.
            </p>

            <section className="space-y-2">
              <h2 className="text-lg font-black text-zinc-900">Datos que podemos recopilar</h2>
              <p>
                Podemos recopilar datos de cuenta, datos de perfil, ubicación aproximada o seleccionada,
                información de partidos, confirmaciones, preferencias dentro de la app y datos técnicos
                necesarios para seguridad, soporte y funcionamiento.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black text-zinc-900">Uso de ubicación</h2>
              <p>
                La ubicación se usa para mostrarte canchas y partidos disponibles cerca de vos, calcular
                distancias aproximadas y facilitar que puedas marcar o encontrar el lugar donde se jugará
                un partido. No vendemos tus datos personales.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black text-zinc-900">Conservación de datos</h2>
              <p>
                Conservamos los datos de cuenta y perfil mientras tu cuenta permanezca activa o mientras
                sean necesarios para prestarte el servicio. La información relacionada con partidos,
                confirmaciones y actividad dentro de Juol se conserva mientras sea necesaria para operar
                la app, mantener historial funcional, brindar soporte, prevenir abuso o cumplir
                obligaciones legales.
              </p>
              <p>
                Si solicitás la eliminación de tu cuenta, eliminaremos o anonimizaremos tus datos personales
                dentro de un plazo razonable, salvo aquellos que debamos conservar temporalmente por motivos
                legales, seguridad, prevención de fraude, resolución de disputas o copias de respaldo
                técnicas. Las copias de respaldo se sobrescriben o eliminan de acuerdo con nuestros ciclos
                técnicos de mantenimiento.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black text-zinc-900">Eliminación de cuenta</h2>
              <p>
                Podés solicitar la eliminación de tu cuenta desde la app, en la sección de perfil, o desde
                la página de eliminación de cuenta disponible en juol.lat. Al procesar la solicitud,
                eliminaremos o anonimizaremos los datos personales asociados a tu cuenta según lo indicado
                en esta política.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-black text-zinc-900">Contacto</h2>
              <p>
                Si necesitás ayuda o querés realizar una consulta sobre privacidad, podés contactarnos a
                través de los canales de soporte publicados por Juol.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
