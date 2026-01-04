import nodemailer from "nodemailer";
import { logger } from "#lib/logger";

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Envoie un email de vérification
export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Vérifiez votre adresse email",
      html: `
        <h1>Vérification de compte</h1>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre compte :</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Ce lien expire dans 24 heures.</p>
      `,
    });
    logger.info(`Email de vérification envoyé à ${email}`);
  } catch (error) {
    logger.error({ error }, "Erreur lors de l'envoi de l'email");
    throw error;
  }
}

// Envoie un email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Ce lien expire dans 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
      `,
    });
    logger.info(`Email de réinitialisation envoyé à ${email}`);
  } catch (error) {
    logger.error({ error }, "Erreur lors de l'envoi de l'email");
    throw error;
  }
}