// supabase/functions/welcome-email/index.ts
// Triggered by a Database Webhook on INSERT to waitlist_leads
// Sends a branded HTML confirmation email via Resend

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL     = 'BE4T <noreply@be4t.co>';
const REPLY_TO       = 'hola@be4t.co';

interface WaitlistLead {
  full_name:    string;
  email:        string;
  profile_type: string;
  country?:     string;
}

interface WebhookPayload {
  type:   'INSERT' | 'UPDATE' | 'DELETE';
  table:  string;
  record: WaitlistLead;
  schema: string;
}

const PROFILE_LABELS: Record<string, string> = {
  inversionista: 'Inversionista',
  artista:       'Artista',
  sello:         'Sello Discográfico',
  fan:           'Fan',
};

function buildEmail(lead: WaitlistLead): { subject: string; html: string } {
  const firstName     = lead.full_name.split(' ')[0] ?? lead.full_name;
  const profileLabel  = PROFILE_LABELS[lead.profile_type] ?? lead.profile_type;

  const subject = 'Bienvenido a la Revolución Musical | BE4T';

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body  { background: #0a0a14; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
    a     { color: #00D4FF; text-decoration: none; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a14; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background:#0f0f1e; border-radius:20px; border:1px solid rgba(139,92,246,0.25); overflow:hidden;">

          <!-- HEADER gradient bar -->
          <tr>
            <td style="height:4px; background:linear-gradient(90deg, #00D4FF, #8B5CF6);"></td>
          </tr>

          <!-- LOGO -->
          <tr>
            <td align="center" style="padding: 36px 40px 24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:-apple-system,sans-serif; font-size:26px; font-weight:900; letter-spacing:-0.04em; background:linear-gradient(90deg,#00D4FF,#8B5CF6); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">
                    BE4T
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding: 0 40px 40px;">

              <!-- Status badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.3); border-radius:100px; padding:6px 16px; font-size:11px; font-weight:700; color:#c4b5fd; letter-spacing:1.5px; text-transform:uppercase;">
                    Acceso Early Beta — Confirmado
                  </td>
                </tr>
              </table>

              <!-- Headline -->
              <p style="font-size:24px; font-weight:900; letter-spacing:-0.03em; line-height:1.2; margin-bottom:16px; color:#ffffff;">
                Hola ${firstName},<br/>ya estás en la lista.
              </p>

              <!-- Body copy -->
              <p style="font-size:15px; color:rgba(255,255,255,0.6); line-height:1.7; margin-bottom:24px;">
                Prepárate para invertir en los próximos hits mundiales.<br/>
                En BE4T convertimos regalías musicales en activos reales — y tú serás de los primeros en acceder cuando abramos las puertas.
              </p>

              <!-- Profile pill -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="font-size:12px; color:rgba(255,255,255,0.4); margin-bottom:6px; display:block; letter-spacing:0.5px;">
                    Perfil registrado
                  </td>
                </tr>
                <tr>
                  <td style="border:1px solid rgba(0,212,255,0.3); border-radius:8px; padding:10px 18px; font-size:14px; font-weight:600; color:#00D4FF;">
                    ${profileLabel}${lead.country ? ' · ' + lead.country : ''}
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="height:1px; background:rgba(255,255,255,0.07);"></td>
                </tr>
              </table>

              <!-- What to expect -->
              <p style="font-size:12px; font-weight:700; color:rgba(255,255,255,0.4); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:16px;">
                Qué esperar
              </p>

              ${[
                ['Acceso prioritario', 'Serás notificado antes de la apertura general.'],
                ['Comisión 0%', 'En tu primera operación de inversión.'],
                ['Datos exclusivos', 'Recibirás análisis de tendencias musicales antes del lanzamiento.'],
              ].map(([title, desc]) => `
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
                <tr>
                  <td style="width:3px; border-radius:2px; background:linear-gradient(180deg,#00D4FF,#8B5CF6); padding-right:0;">&nbsp;</td>
                  <td style="padding:10px 16px; background:rgba(255,255,255,0.04); border-radius:0 10px 10px 0;">
                    <p style="font-size:13px; font-weight:700; color:#ffffff; margin-bottom:2px;">${title}</p>
                    <p style="font-size:12px; color:rgba(255,255,255,0.5); margin:0;">${desc}</p>
                  </td>
                </tr>
              </table>`).join('')}

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="https://be4t.co" style="display:inline-block; background:linear-gradient(135deg,#7c3aed,#a855f7,#06b6d4); color:#ffffff; font-weight:800; font-size:15px; padding:14px 36px; border-radius:12px; text-decoration:none; letter-spacing:-0.01em;">
                      Explorar el Marketplace
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 40px; border-top:1px solid rgba(255,255,255,0.06);">
              <p style="font-size:11px; color:rgba(255,255,255,0.25); text-align:center; line-height:1.6;">
                Recibiste este correo porque dejaste tus datos en BE4T.<br/>
                <a href="https://be4t.co/unsubscribe" style="color:rgba(255,255,255,0.3);">Cancelar suscripción</a>
                &nbsp;·&nbsp;
                <a href="https://be4t.co/privacidad" style="color:rgba(255,255,255,0.3);">Privacidad</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

Deno.serve(async (req: Request) => {
  // Health check
  if (req.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', fn: 'welcome-email' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Only act on INSERT to waitlist_leads
  if (payload.type !== 'INSERT' || payload.table !== 'waitlist_leads') {
    return new Response('Ignored', { status: 200 });
  }

  const lead = payload.record;
  if (!lead?.email || !lead?.full_name) {
    return new Response('Missing required fields', { status: 422 });
  }

  const { subject, html } = buildEmail(lead);

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from:     FROM_EMAIL,
      to:       [lead.email],
      reply_to: REPLY_TO,
      subject,
      html,
    }),
  });

  const resendBody = await resendRes.json();

  if (!resendRes.ok) {
    console.error('Resend error:', resendBody);
    return new Response(JSON.stringify({ error: resendBody }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  console.log(`Welcome email sent to ${lead.email} (id: ${resendBody.id})`);
  return new Response(JSON.stringify({ success: true, id: resendBody.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
