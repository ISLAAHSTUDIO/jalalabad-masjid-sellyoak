interface Env {
  RESEND_API_KEY?: string;
  CONTACT_EMAIL?: string;
  FROM_EMAIL?: string;
}

interface EventContext<Env, P extends string, Data> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<any>) => void;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
  env: Env;
  params: Record<P, string | string[]>;
  data: Data;
}

type PagesFunction<Env = unknown, P extends string = string, Data extends Record<string, unknown> = Record<string, unknown>> = (
  context: EventContext<Env, P, Data>
) => Response | Promise<Response>;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { request, env } = context;
    const apiKey = env.RESEND_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Email service is not yet configured. Please set RESEND_API_KEY in Cloudflare environment variables.' 
        }), 
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const body: any = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required.' }), 
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const recipient = env.CONTACT_EMAIL || 'info@jalalabadmosque.org';
    const fromAddress = env.FROM_EMAIL || 'Jalalabad Mosque <noreply@jalalabadmosque.org>';

    // Send email using Resend HTTP REST API directly
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [recipient],
        reply_to: email,
        subject: `[Website Inquiry] ${subject || 'General'} - from ${name}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
            <div style="background: linear-gradient(135deg, #047857, #065f46); color: #ffffff; padding: 24px; text-align: center;">
              <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">New Website Inquiry</h2>
              <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Jalalabad Mosque & Islamic Centre</p>
            </div>
            
            <div style="padding: 24px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 110px;"><strong>Sender Name:</strong></td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
                    <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #047857; text-decoration: none; font-weight: 600;">${email}</a></td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Phone:</strong></td>
                    <td style="padding: 6px 0;"><a href="tel:${phone}" style="color: #047857; text-decoration: none; font-weight: 600;">${phone}</a></td>
                  </tr>` : ''}
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Subject:</strong></td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">${subject || 'General Inquiry'}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-top: 16px;">
                <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Message Body:</p>
                <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-left: 4px solid #047857; padding: 16px; border-radius: 8px; font-size: 14px; white-space: pre-wrap; color: #1e293b;">
${message}
                </div>
              </div>

              <div style="margin-top: 28px; padding-top: 16px; border-t: 1px solid #e2e8f0; text-align: center;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                  Click <strong>Reply</strong> in your email client to respond directly to ${name} (${email}).
                </p>
              </div>
            </div>
          </div>
        `,
      }),
    });

    const resData: any = await resendResponse.json();

    if (!resendResponse.ok) {
      return new Response(
        JSON.stringify({ error: resData.message || 'Resend error while dispatching email.' }), 
        {
          status: resendResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: resData.id }), 
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
