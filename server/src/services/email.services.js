
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from '../config.js';


// Create transporter - if no EMAIL_USER is configured, emails will be logged to console
const transporter = EMAIL_USER 
    ? nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: Number(EMAIL_PORT) === 465,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    })
    : null;


const sendEmail = async (to, subject, html) => 
{
    try 
    {
        if (!transporter) 
        {
            console.log(`📧 [EMAIL LOG] To: ${to} | Subject: ${subject}`);
            console.log(`📧 [EMAIL LOG] Body preview: ${html.replace(/<[^>]*>/g, '').substring(0, 200)}...`);
            return;
        }

        await transporter.sendMail({
            from: EMAIL_FROM,
            to,
            subject,
            html,
        });

        console.log(`✅ Email enviado a ${to}: ${subject}`);
    } 
    catch (error) 
    {
        console.error(`❌ Error enviando email a ${to}:`, error.message);
    }
};


// ─── HTML Template Wrapper ───

const wrapTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0d0d0d; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width:600px; margin:0 auto; background-color:#1a1a1a; border-radius:12px; overflow:hidden; border:1px solid #2a2a2a; margin-top:20px; margin-bottom:20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #9933ff, #6600cc); padding:30px; text-align:center;">
            <h1 style="margin:0; color:#ffffff; font-size:28px; letter-spacing:2px;">🎬 CINEVERSE</h1>
            <p style="margin:5px 0 0; color:#e0c0ff; font-size:14px;">${title}</p>
        </div>
        
        <!-- Body -->
        <div style="padding:30px; color:#e0e0e0; line-height:1.6;">
            ${bodyContent}
        </div>
        
        <!-- Footer -->
        <div style="background-color:#111111; padding:20px; text-align:center; border-top:1px solid #2a2a2a;">
            <p style="margin:0; color:#666666; font-size:12px;">© ${new Date().getFullYear()} CineVerse — Tu experiencia cinematográfica</p>
            <p style="margin:5px 0 0; color:#555555; font-size:11px;">Este es un email automático, por favor no respondas.</p>
        </div>
    </div>
</body>
</html>
`;


// ─── Email Functions ───

export const sendWelcomeEmail = async (email, username) => 
{
    try 
    {
        const html = wrapTemplate('¡Bienvenido!', `
            <h2 style="color:#9933ff; margin-top:0;">¡Hola, ${username}! 👋</h2>
            <p>Tu cuenta en <strong>CineVerse</strong> ha sido creada exitosamente.</p>
            <p>Ahora podés:</p>
            <ul style="color:#cccccc;">
                <li>🎟️ Comprar entradas para las mejores películas</li>
                <li>🍿 Pedir snacks y combos desde tu asiento</li>
                <li>💺 Elegir tus asientos favoritos</li>
            </ul>
            <p style="margin-top:20px;">¡Disfrutá de la experiencia cinematográfica!</p>
        `);
        await sendEmail(email, '🎬 ¡Bienvenido a CineVerse!', html);
    } 
    catch (error) 
    {
        console.error('Error en sendWelcomeEmail:', error.message);
    }
};


export const sendLoginAlertEmail = async (email, username) => 
{
    try 
    {
        const now = new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
        const html = wrapTemplate('Inicio de sesión detectado', `
            <h2 style="color:#9933ff; margin-top:0;">Hola, ${username}</h2>
            <p>Se ha iniciado sesión en tu cuenta de CineVerse.</p>
            <div style="background-color:#222222; padding:15px; border-radius:8px; border-left:4px solid #9933ff; margin:15px 0;">
                <p style="margin:0; color:#cccccc;">📅 <strong>Fecha:</strong> ${now}</p>
            </div>
            <p style="color:#999999; font-size:13px;">Si no fuiste vos, te recomendamos cambiar tu contraseña inmediatamente.</p>
        `);
        await sendEmail(email, '🔐 Inicio de sesión en CineVerse', html);
    } 
    catch (error) 
    {
        console.error('Error en sendLoginAlertEmail:', error.message);
    }
};


export const sendOrderConfirmationEmail = async (email, username, order) => 
{
    try 
    {
        let itemsHtml = '';
        if (order.items && Array.isArray(order.items)) 
        {
            itemsHtml = order.items.map(item => `
                <tr>
                    <td style="padding:8px 12px; border-bottom:1px solid #333; color:#cccccc;">${item.name || item.type}</td>
                    <td style="padding:8px 12px; border-bottom:1px solid #333; color:#cccccc; text-align:center;">${item.quantity}</td>
                    <td style="padding:8px 12px; border-bottom:1px solid #333; color:#9933ff; text-align:right;">$${(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}</td>
                </tr>
            `).join('');
        }

        const html = wrapTemplate('Confirmación de pedido', `
            <h2 style="color:#9933ff; margin-top:0;">¡Gracias por tu compra, ${username}! 🎉</h2>
            <p>Tu pedido ha sido creado exitosamente.</p>
            
            <div style="background-color:#222222; padding:15px; border-radius:8px; margin:15px 0;">
                <p style="margin:0 0 10px; color:#ffffff;"><strong>Orden #${order.id}</strong></p>
                
                <table style="width:100%; border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:2px solid #9933ff;">
                            <th style="padding:8px 12px; text-align:left; color:#9933ff;">Item</th>
                            <th style="padding:8px 12px; text-align:center; color:#9933ff;">Cant.</th>
                            <th style="padding:8px 12px; text-align:right; color:#9933ff;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div style="margin-top:15px; padding-top:10px; border-top:2px solid #9933ff; text-align:right;">
                    <span style="color:#ffffff; font-size:18px; font-weight:bold;">Total: $${Number(order.total || 0).toFixed(2)}</span>
                </div>
            </div>
            
            <p style="color:#999999; font-size:13px;">Podés ver tus pedidos en tu perfil de CineVerse.</p>
        `);
        await sendEmail(email, `🎟️ Confirmación de pedido #${order.id} — CineVerse`, html);
    } 
    catch (error) 
    {
        console.error('Error en sendOrderConfirmationEmail:', error.message);
    }
};


export const sendOrderCancellationEmail = async (email, username, orderId, isAutomatic = false) => 
{
    try 
    {
        const title = isAutomatic ? 'Pedido expirado' : 'Pedido cancelado';
        const reasonHtml = isAutomatic 
            ? '<p style="margin:0; color:#ffaa00; margin-bottom: 8px;">Se ha sobrepasado el tiempo límite de 5 minutos estipulado para realizar el pago.</p><p style="margin:0; color:#cccccc;">Los asientos reservados han sido liberados y el stock de productos ha sido restaurado.</p>'
            : '<p style="margin:0; color:#cccccc;">Los asientos reservados han sido liberados y el stock de productos ha sido restaurado.</p>';

        const html = wrapTemplate(title, `
            <h2 style="color:#ff4444; margin-top:0;">${title}</h2>
            <p>Hola ${username}, tu pedido <strong>#${orderId}</strong> ha sido ${isAutomatic ? 'cancelado automáticamente' : 'cancelado'}.</p>
            <div style="background-color:#222222; padding:15px; border-radius:8px; border-left:4px solid #ff4444; margin:15px 0;">
                ${reasonHtml}
            </div>
            <p style="color:#999999; font-size:13px;">Si tenés alguna consulta, no dudes en contactarnos.</p>
        `);
        await sendEmail(email, `❌ Pedido #${orderId} ${isAutomatic ? 'expirado' : 'cancelado'} — CineVerse`, html);
    } 
    catch (error) 
    {
        console.error('Error en sendOrderCancellationEmail:', error.message);
    }
};


export const sendPasswordChangedEmail = async (email, username) => 
{
    try 
    {
        const html = wrapTemplate('Contraseña actualizada', `
            <h2 style="color:#9933ff; margin-top:0;">Contraseña actualizada</h2>
            <p>Hola ${username}, tu contraseña de CineVerse ha sido cambiada exitosamente.</p>
            <div style="background-color:#222222; padding:15px; border-radius:8px; border-left:4px solid #ffaa00; margin:15px 0;">
                <p style="margin:0; color:#cccccc;">⚠️ Si no realizaste este cambio, contactanos inmediatamente.</p>
            </div>
        `);
        await sendEmail(email, '🔑 Contraseña actualizada — CineVerse', html);
    } 
    catch (error) 
    {
        console.error('Error en sendPasswordChangedEmail:', error.message);
    }
};


export const sendProfileUpdatedEmail = async (email, username) => 
{
    try 
    {
        const html = wrapTemplate('Perfil actualizado', `
            <h2 style="color:#9933ff; margin-top:0;">Perfil actualizado ✅</h2>
            <p>Hola ${username}, los datos de tu perfil en CineVerse han sido actualizados correctamente.</p>
            <p style="color:#999999; font-size:13px;">Si no realizaste este cambio, contactanos inmediatamente.</p>
        `);
        await sendEmail(email, '👤 Perfil actualizado — CineVerse', html);
    } 
    catch (error) 
    {
        console.error('Error en sendProfileUpdatedEmail:', error.message);
    }
};


export const sendRefundEmail = async (email, username, orderId, amount) => 
{
    try 
    {
        const html = wrapTemplate('Reembolso procesado', `
            <h2 style="color:#33cc66; margin-top:0;">Reembolso procesado ✅</h2>
            <p>Hola ${username}, tu solicitud de reembolso ha sido procesada exitosamente.</p>
            <div style="background-color:#222222; padding:15px; border-radius:8px; border-left:4px solid #33cc66; margin:15px 0;">
                <p style="margin:5px 0; color:#cccccc;">📋 <strong>Orden:</strong> #${orderId}</p>
                <p style="margin:5px 0; color:#33cc66; font-size:18px; font-weight:bold;">💰 Monto reembolsado: $${Number(amount || 0).toFixed(2)}</p>
            </div>
            <p style="color:#999999; font-size:13px;">El reembolso puede tardar entre 5 y 10 días hábiles en reflejarse según tu medio de pago.</p>
        `);
        await sendEmail(email, `💰 Reembolso procesado — Orden #${orderId} — CineVerse`, html);
    } 
    catch (error) 
    {
        console.error('Error en sendRefundEmail:', error.message);
    }
};
