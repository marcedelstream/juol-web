import Image from "next/image";

export const metadata = {
  title: "Juol | Propuesta comercial",
  description: "Propuesta comercial para empresas interesadas en acompañar el crecimiento de Juol.",
};

const styles = `
:root {
  --commercial-orange: #ff6b00;
  --commercial-ink: #15120f;
  --commercial-muted: #6f6760;
  --commercial-line: #e9e0d8;
  --commercial-paper: #fffaf6;
  --commercial-white: #ffffff;
}

.commercial-page {
  color: var(--commercial-ink);
  background:
    radial-gradient(circle at 18% 10%, rgba(255, 107, 0, 0.16), transparent 28rem),
    linear-gradient(180deg, #fffaf6 0%, #ffffff 42%, #fffaf6 100%);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  min-height: 100vh;
}

.commercial-page * { box-sizing: border-box; }
.commercial-page a { color: inherit; text-decoration: none; }
.commercial-deck { width: min(1180px, calc(100% - 48px)); margin: 0 auto; }

.commercial-topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(18px);
  background: rgba(255, 250, 246, 0.82);
  border-bottom: 1px solid rgba(233, 224, 216, 0.85);
}

.commercial-topbar-inner {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.commercial-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.commercial-brand img,
.commercial-screen-logo {
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(255, 107, 0, 0.24);
}

.commercial-nav {
  display: flex;
  align-items: center;
  gap: 18px;
  color: var(--commercial-muted);
  font-size: 13px;
  font-weight: 750;
}

.commercial-pill {
  border: 1px solid var(--commercial-line);
  border-radius: 999px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.65);
  color: var(--commercial-ink);
}

.commercial-section {
  min-height: 86vh;
  display: grid;
  align-items: center;
  padding: 72px 0;
}

.commercial-hero {
  grid-template-columns: 1.05fr 0.95fr;
  gap: 54px;
  min-height: calc(100vh - 72px);
}

.commercial-eyebrow {
  color: var(--commercial-orange);
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin: 0 0 18px;
}

.commercial-page h1,
.commercial-page h2,
.commercial-page h3,
.commercial-page p { margin-top: 0; }

.commercial-page h1 {
  font-size: clamp(52px, 7vw, 92px);
  line-height: 0.92;
  letter-spacing: -0.07em;
  margin-bottom: 24px;
  font-weight: 950;
}

.commercial-page h2 {
  font-size: clamp(36px, 5vw, 66px);
  line-height: 0.96;
  letter-spacing: -0.055em;
  margin-bottom: 18px;
  font-weight: 950;
}

.commercial-page h3 {
  font-size: 22px;
  letter-spacing: -0.035em;
  margin-bottom: 10px;
  font-weight: 900;
}

.commercial-lead {
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.42;
  color: var(--commercial-muted);
  max-width: 680px;
  margin-bottom: 28px;
}

.commercial-hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 34px;
}

.commercial-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 15px 22px;
  background: var(--commercial-orange);
  color: white;
  font-weight: 950;
  box-shadow: 0 18px 36px rgba(255, 107, 0, 0.24);
}

.commercial-button.secondary {
  background: var(--commercial-white);
  color: var(--commercial-ink);
  border: 1px solid var(--commercial-line);
  box-shadow: none;
}

.commercial-phone-stage {
  position: relative;
  min-height: 620px;
  display: grid;
  place-items: center;
}

.commercial-field-panel {
  position: absolute;
  inset: 36px 0 auto 40px;
  height: 420px;
  border-radius: 36px;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255,255,255,0.18) 1px, transparent 1px),
    linear-gradient(135deg, #108a4e, #1fbe73);
  background-size: 54px 54px, 54px 54px, auto;
  box-shadow: 0 36px 86px rgba(20, 64, 38, 0.24);
  overflow: hidden;
}

.commercial-field-panel::before,
.commercial-field-panel::after {
  content: "";
  position: absolute;
  border: 2px solid rgba(255,255,255,0.58);
  pointer-events: none;
}

.commercial-field-panel::before { inset: 28px; border-radius: 24px; }
.commercial-field-panel::after {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.commercial-phone {
  position: relative;
  width: min(310px, 78vw);
  min-height: 590px;
  border-radius: 42px;
  background: #111;
  padding: 14px;
  box-shadow: 0 46px 100px rgba(21, 18, 15, 0.28);
  transform: rotate(2deg);
}

.commercial-screen {
  min-height: 562px;
  border-radius: 32px;
  background: #fffaf6;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.2);
}

.commercial-screen-head {
  padding: 26px 20px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.commercial-app-title {
  padding: 0 20px 18px;
  font-size: 26px;
  line-height: 1.02;
  letter-spacing: -0.05em;
  font-weight: 950;
}

.commercial-match-row {
  margin: 0 16px 12px;
  padding: 16px;
  border: 1px solid #eadfd6;
  border-radius: 18px;
  background: #fff;
}

.commercial-match-row b {
  display: block;
  font-size: 14px;
  letter-spacing: -0.02em;
  margin-bottom: 7px;
}

.commercial-meta {
  display: flex;
  gap: 10px;
  color: var(--commercial-muted);
  font-size: 12px;
  font-weight: 700;
}

.commercial-banner-preview {
  margin: 16px;
  padding: 18px;
  min-height: 116px;
  border-radius: 22px;
  background: linear-gradient(135deg, #ff6b00, #ff9b3d);
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-shadow: 0 20px 40px rgba(255, 107, 0, 0.26);
}

.commercial-banner-preview span {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-weight: 950;
  opacity: 0.82;
}

.commercial-banner-preview strong {
  font-size: 22px;
  letter-spacing: -0.04em;
  margin-top: 5px;
}

.commercial-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-top: 34px;
}

.commercial-plans {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 34px;
}

.commercial-stat {
  padding: 26px;
  border-top: 1px solid var(--commercial-line);
  border-bottom: 1px solid var(--commercial-line);
  background: rgba(255,255,255,0.58);
}

.commercial-stat strong {
  display: block;
  font-size: clamp(36px, 5vw, 62px);
  line-height: 0.95;
  letter-spacing: -0.07em;
  color: var(--commercial-orange);
  margin-bottom: 10px;
}

.commercial-stat span {
  color: var(--commercial-muted);
  font-size: 14px;
  line-height: 1.35;
  font-weight: 750;
}

.commercial-split {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  gap: 48px;
  align-items: center;
}

.commercial-plain-list { display: grid; gap: 18px; }
.commercial-plain-item { padding: 20px 0; border-bottom: 1px solid var(--commercial-line); }
.commercial-plain-item p {
  color: var(--commercial-muted);
  line-height: 1.55;
  margin: 0;
  font-size: 16px;
}

.commercial-plan {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 470px;
  padding: 24px;
  background: var(--commercial-white);
  border: 1px solid var(--commercial-line);
  border-radius: 8px;
}

.commercial-plan.featured {
  background: #15120f;
  color: white;
  border-color: #15120f;
  box-shadow: 0 30px 70px rgba(21, 18, 15, 0.22);
}

.commercial-tag {
  align-self: flex-start;
  border-radius: 999px;
  padding: 7px 10px;
  background: #fff2e8;
  color: var(--commercial-orange);
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 0.11em;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.featured .commercial-tag {
  background: rgba(255,107,0,0.18);
  color: #ffb170;
}

.commercial-price {
  font-size: 48px;
  line-height: 1;
  letter-spacing: -0.07em;
  font-weight: 950;
  margin: 12px 0 3px;
}

.commercial-period {
  color: var(--commercial-muted);
  font-weight: 750;
  font-size: 13px;
  margin-bottom: 22px;
}

.featured .commercial-period { color: rgba(255,255,255,0.62); }

.commercial-plan ul {
  padding: 0;
  margin: 0;
  list-style: none;
  display: grid;
  gap: 12px;
  color: var(--commercial-muted);
  line-height: 1.42;
  font-size: 14px;
  font-weight: 650;
}

.featured ul { color: rgba(255,255,255,0.75); }
.commercial-plan li { display: grid; grid-template-columns: 18px 1fr; gap: 8px; }
.commercial-plan li::before {
  content: "";
  width: 7px;
  height: 7px;
  margin-top: 7px;
  border-radius: 50%;
  background: var(--commercial-orange);
}

.commercial-scarcity {
  margin-top: auto;
  padding-top: 22px;
  color: var(--commercial-orange);
  font-size: 12px;
  font-weight: 950;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.commercial-investment {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--commercial-line);
  border-bottom: 1px solid var(--commercial-line);
  margin-top: 34px;
}

.commercial-investment div { padding: 26px; border-right: 1px solid var(--commercial-line); }
.commercial-investment div:last-child { border-right: none; }
.commercial-investment h3 { color: var(--commercial-orange); margin-bottom: 8px; }
.commercial-investment p {
  color: var(--commercial-muted);
  line-height: 1.45;
  margin: 0;
  font-weight: 650;
  font-size: 14px;
}

.commercial-closing { min-height: 72vh; text-align: center; place-items: center; }
.commercial-closing-inner { width: min(850px, 100%); margin: 0 auto; }
.commercial-closing .commercial-lead {
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}

.commercial-contract {
  margin-top: 26px;
  display: inline-flex;
  border: 1px solid var(--commercial-line);
  border-radius: 999px;
  padding: 12px 18px;
  background: rgba(255,255,255,0.72);
  color: var(--commercial-muted);
  font-weight: 850;
}

.commercial-footer {
  padding: 38px 0 52px;
  border-top: 1px solid var(--commercial-line);
  color: var(--commercial-muted);
  font-size: 13px;
  font-weight: 700;
}

.commercial-footer-inner {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 980px) {
  .commercial-hero,
  .commercial-split,
  .commercial-plans,
  .commercial-stats,
  .commercial-investment { grid-template-columns: 1fr; }
  .commercial-section { min-height: auto; padding: 58px 0; }
  .commercial-phone-stage { min-height: 520px; }
  .commercial-field-panel { left: 0; height: 330px; }
  .commercial-plan { min-height: auto; }
  .commercial-investment div { border-right: none; border-bottom: 1px solid var(--commercial-line); }
  .commercial-investment div:last-child { border-bottom: none; }
}

@media (max-width: 700px) {
  .commercial-deck,
  .commercial-topbar-inner,
  .commercial-footer-inner { width: min(100% - 28px, 1180px); }
  .commercial-nav { display: none; }
  .commercial-page h1 { font-size: 50px; }
  .commercial-page h2 { font-size: 40px; }
  .commercial-hero-actions { align-items: stretch; flex-direction: column; }
  .commercial-button { width: 100%; }
  .commercial-stat { padding: 20px 0; background: transparent; }
  .commercial-phone { transform: none; }
}
`;

export default function PropuestaComercialPage() {
  return (
    <div className="commercial-page">
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <header className="commercial-topbar">
        <div className="commercial-topbar-inner">
          <a className="commercial-brand" href="#inicio">
            <Image src="/juol-icon.png" alt="Juol" width={38} height={38} />
            <span>Juol</span>
          </a>
          <nav className="commercial-nav">
            <a href="#traccion">Tracción</a>
            <a href="#oportunidad">Oportunidad</a>
            <a href="#planes">Planes</a>
            <a className="commercial-pill" href="#cierre">Propuesta comercial</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="commercial-deck commercial-section commercial-hero">
          <div>
            <p className="commercial-eyebrow">Propuesta comercial para empresas</p>
            <h1>La cancha donde una marca puede entrar al juego.</h1>
            <p className="commercial-lead">
              Juol organiza el fútbol amateur desde el celular: jugadores, partidos, canchas y comunidad.
              Para marcas con visión, es una oportunidad temprana de presencia directa en un hábito masivo.
            </p>
            <div className="commercial-hero-actions">
              <a className="commercial-button" href="#planes">Ver planes mensuales</a>
              <a className="commercial-button secondary" href="#traccion">Ver tracción orgánica</a>
            </div>
          </div>

          <div className="commercial-phone-stage" aria-hidden="true">
            <div className="commercial-field-panel" />
            <div className="commercial-phone">
              <div className="commercial-screen">
                <div className="commercial-screen-head">
                  <Image className="commercial-screen-logo" src="/juol-icon.png" alt="" width={42} height={42} />
                  <span className="commercial-pill">En vivo</span>
                </div>
                <div className="commercial-app-title">Partidos cerca tuyo</div>
                <div className="commercial-banner-preview">
                  <span>Espacio destacado</span>
                  <strong>Tu marca en Juol</strong>
                </div>
                <div className="commercial-match-row">
                  <b>San Lorenzo, hoy 20:30</b>
                  <div className="commercial-meta"><span>8 confirmados</span><span>3.2 km</span></div>
                </div>
                <div className="commercial-match-row">
                  <b>Luque, mañana 19:00</b>
                  <div className="commercial-meta"><span>10 confirmados</span><span>5.1 km</span></div>
                </div>
                <div className="commercial-match-row">
                  <b>Asunción, viernes 21:00</b>
                  <div className="commercial-meta"><span>12 confirmados</span><span>7.4 km</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="traccion" className="commercial-deck commercial-section">
          <div>
            <p className="commercial-eyebrow">Tracción inicial</p>
            <h2>Crecimiento orgánico, sin pauta publicitaria.</h2>
            <p className="commercial-lead">
              Juol ya demostró señales tempranas de adopción sin inversión en anuncios.
              Con pauta, contenido y activaciones, el potencial de aceleración es considerable.
            </p>
            <div className="commercial-stats">
              <div className="commercial-stat"><strong>+750</strong><span>usuarios registrados por tráfico orgánico</span></div>
              <div className="commercial-stat"><strong>+50</strong><span>partidos organizados desde la comunidad</span></div>
              <div className="commercial-stat"><strong>+15</strong><span>partidos activos en distintas zonas del país</span></div>
              <div className="commercial-stat"><strong>2026</strong><span>año de Mundial y alta conversación futbolera</span></div>
            </div>
          </div>
        </section>

        <section id="oportunidad" className="commercial-deck commercial-section commercial-split">
          <div>
            <p className="commercial-eyebrow">Por qué ahora</p>
            <h2>El fútbol amateur mueve personas, grupos y decisiones.</h2>
            <p className="commercial-lead">
              Juol no interrumpe una audiencia: aparece dentro de una acción concreta. La persona entra para jugar,
              confirmar, compartir y moverse hacia una cancha.
            </p>
          </div>
          <div className="commercial-plain-list">
            <div className="commercial-plain-item">
              <h3>Presencia en contexto real</h3>
              <p>La marca acompaña el momento en que los jugadores organizan, confirman y viven el partido.</p>
            </div>
            <div className="commercial-plain-item">
              <h3>Comunidad con potencial viral</h3>
              <p>Cada partido invita a nuevos jugadores, genera conversación y puede transformarse en contenido social.</p>
            </div>
            <div className="commercial-plain-item">
              <h3>Escalable por ciudad y temporada</h3>
              <p>El modelo puede crecer por zonas, canchas, torneos, marcas aliadas y momentos de alta demanda deportiva.</p>
            </div>
          </div>
        </section>

        <section id="planes" className="commercial-deck commercial-section">
          <div>
            <p className="commercial-eyebrow">Planes mensuales</p>
            <h2>Tres niveles para entrar al ecosistema Juol.</h2>
            <p className="commercial-lead">
              Contrato mínimo de 6 meses con pago adelantado. Los cupos destacados se ordenan para cuidar la experiencia
              del usuario y el valor de cada marca.
            </p>

            <div className="commercial-plans">
              <article className="commercial-plan">
                <span className="commercial-tag">Destacado</span>
                <h3>Mayor visibilidad</h3>
                <div className="commercial-price">US$900</div>
                <div className="commercial-period">mensual</div>
                <ul>
                  <li>Banner destacado dentro de la app.</li>
                  <li>Presencia en redes sociales de Juol.</li>
                  <li>Activaciones de marca vinculadas a la comunidad.</li>
                  <li>Mayor exposición en momentos de uso recurrente.</li>
                </ul>
              </article>

              <article className="commercial-plan">
                <span className="commercial-tag">Impulso</span>
                <h3>Marca en movimiento</h3>
                <div className="commercial-price">US$2.000</div>
                <div className="commercial-period">mensual</div>
                <ul>
                  <li>Logo en flyers de redes sociales de Juol.</li>
                  <li>Banner destacado dentro de la app.</li>
                  <li>Activaciones de marca.</li>
                  <li>Videos promocionales y entrega de merch.</li>
                  <li>Mayor presencia en campañas de crecimiento.</li>
                </ul>
              </article>

              <article className="commercial-plan featured">
                <span className="commercial-tag">Exclusivo</span>
                <h3>Embajador del fútbol amateur</h3>
                <div className="commercial-price">US$4.500</div>
                <div className="commercial-period">mensual</div>
                <ul>
                  <li>Disponible para una sola empresa.</li>
                  <li>Presencia de logo al inicio de la app.</li>
                  <li>Logo en lugares estratégicos dentro de Juol.</li>
                  <li>Notificaciones de app asociadas a acciones relevantes.</li>
                  <li>Logo con mayor jerarquía en flyers.</li>
                  <li>Incluye todo lo del plan Impulso.</li>
                </ul>
                <div className="commercial-scarcity">Un solo cupo disponible</div>
              </article>
            </div>
          </div>
        </section>

        <section className="commercial-deck commercial-section">
          <div>
            <p className="commercial-eyebrow">Destino de los fondos</p>
            <h2>La inversión acelera producto, comunidad y alcance.</h2>
            <p className="commercial-lead">
              Los ingresos comerciales se destinan a fortalecer Juol y convertir la adopción orgánica inicial
              en crecimiento sostenido.
            </p>
            <div className="commercial-investment">
              <div><h3>Desarrollo</h3><p>Continuar mejorando la app, su estabilidad, automatizaciones, experiencia y escalabilidad.</p></div>
              <div><h3>Marketing</h3><p>Ejecutar pauta en redes y acelerar la adquisición de jugadores por zonas estratégicas.</p></div>
              <div><h3>Canchas</h3><p>Regalar horas de cancha en días clave para activar comunidades y generar uso real.</p></div>
              <div><h3>Contenido</h3><p>Recorrer lugares, documentar partidos, producir videos y convertir historias en alcance.</p></div>
            </div>
          </div>
        </section>

        <section id="cierre" className="commercial-deck commercial-section commercial-closing">
          <div className="commercial-closing-inner">
            <p className="commercial-eyebrow">Invitación</p>
            <h2>Ser parte de Juol ahora es entrar temprano en una comunidad con hambre de cancha.</h2>
            <p className="commercial-lead">
              La oportunidad no es solo anunciar: es acompañar la organización del fútbol amateur,
              construir cercanía con jugadores reales y posicionar la marca antes de que el mercado se ordene.
            </p>
            <div className="commercial-contract">Contrato mínimo: 6 meses · Pago adelantado</div>
          </div>
        </section>
      </main>

      <footer className="commercial-footer">
        <div className="commercial-footer-inner">
          <span>Juol · Propuesta comercial</span>
          <span>Fútbol amateur, comunidad y crecimiento orgánico.</span>
        </div>
      </footer>
    </div>
  );
}
