import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Anunt.co.uk <notificari@anunt.co.uk>";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://anunt.co.uk";

function emailLayout(content: string, title: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#FAF7F2;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding:40px 20px;">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
              <tr>
                <td style="background:#2D6A4F;padding:24px 32px;border-radius:12px 12px 0 0;">
                  <a href="${BASE_URL}" style="text-decoration:none;">
                    <span style="font-family:Georgia,serif;font-size:24px;color:white;font-weight:700;">Anunt</span><span style="font-family:Georgia,serif;font-size:24px;color:#E36414;font-weight:700;">.co.uk</span>
                  </a>
                </td>
              </tr>
              <tr>
                <td style="background:white;padding:32px;border-radius:0 0 12px 12px;">
                  ${content}
                  <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;">
                  <p style="color:#999;font-size:12px;margin:0;">
                    Anunt.co.uk — Comunitatea romanilor din UK<br>
                    <a href="${BASE_URL}" style="color:#2D6A4F;">anunt.co.uk</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// 1. Email bun venit
export async function sendWelcomeEmail(to: string, name: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Bun venit pe Anunt.co.uk!",
    html: emailLayout(`
      <h2 style="color:#2D6A4F;margin:0 0 16px;">Bun venit, ${name}!</h2>
      <p style="color:#333;line-height:1.6;">Contul tau a fost creat cu succes. Acum poti:</p>
      <ul style="color:#333;line-height:2;">
        <li>Publica anunturi gratuit</li>
        <li>Trimite mesaje vanzatorilor</li>
        <li>Salva anunturile favorite</li>
        <li>Promova anunturile tale</li>
      </ul>
      <a href="${BASE_URL}/anunturi/nou" style="display:inline-block;background:#E36414;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:16px;">
        + Adauga primul anunt
      </a>
    `, "Bun venit"),
  });
}

// 2. Email anunt aprobat
export async function sendListingApprovedEmail(to: string, name: string, listingTitle: string, listingSlug: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Anuntul tau a fost aprobat!`,
    html: emailLayout(`
      <h2 style="color:#2D6A4F;margin:0 0 16px;">Anunt aprobat!</h2>
      <p style="color:#333;line-height:1.6;">Salut ${name},</p>
      <p style="color:#333;line-height:1.6;">Anuntul tau <strong>"${listingTitle}"</strong> a fost verificat si este acum activ pe Anunt.co.uk.</p>
      <div style="background:#E8F4EF;border-left:4px solid #2D6A4F;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="margin:0;color:#2D6A4F;font-weight:700;">✓ Anuntul este live!</p>
      </div>
      <a href="${BASE_URL}/anunturi/${listingSlug}" style="display:inline-block;background:#2D6A4F;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:8px;">
        Vezi anuntul
      </a>
      <p style="color:#666;font-size:14px;margin-top:16px;">Vrei mai multa vizibilitate? <a href="${BASE_URL}/profile/promovare" style="color:#E36414;">Promoveaza anuntul</a> si ajunge la mai multi romani din UK.</p>
    `, "Anunt aprobat"),
  });
}

// 3. Email anunt respins
export async function sendListingRejectedEmail(to: string, name: string, listingTitle: string, reason?: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Anuntul tau a fost respins`,
    html: emailLayout(`
      <h2 style="color:#E36414;margin:0 0 16px;">Anunt respins</h2>
      <p style="color:#333;line-height:1.6;">Salut ${name},</p>
      <p style="color:#333;line-height:1.6;">Din pacate, anuntul <strong>"${listingTitle}"</strong> nu a putut fi aprobat.</p>
      ${reason ? `
      <div style="background:#FFF0E6;border-left:4px solid #E36414;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="margin:0;color:#E36414;font-weight:700;">Motiv: ${reason}</p>
      </div>
      ` : ""}
      <p style="color:#333;line-height:1.6;">Poti modifica anuntul si il poti retrimite pentru aprobare.</p>
      <a href="${BASE_URL}/profile" style="display:inline-block;background:#2D6A4F;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:8px;">
        Mergi la profilul meu
      </a>
    `, "Anunt respins"),
  });
}

// 4. Email mesaj nou
export async function sendNewMessageEmail(to: string, toName: string, fromName: string, message: string, listingTitle?: string) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Mesaj nou de la ${fromName}`,
    html: emailLayout(`
      <h2 style="color:#2D6A4F;margin:0 0 16px;">Mesaj nou!</h2>
      <p style="color:#333;line-height:1.6;">Salut ${toName},</p>
      <p style="color:#333;line-height:1.6;"><strong>${fromName}</strong> ti-a trimis un mesaj${listingTitle ? ` despre <em>"${listingTitle}"</em>` : ""}:</p>
      <div style="background:#f9f9f9;border-left:4px solid #2D6A4F;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;">
        <p style="margin:0;color:#555;font-style:italic;">"${message}"</p>
      </div>
      <a href="${BASE_URL}/messages" style="display:inline-block;background:#2D6A4F;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:8px;">
        Raspunde mesajului
      </a>
    `, "Mesaj nou"),
  });
}