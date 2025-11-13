const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} options.text - Email plain text content
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <h1>Bienvenue sur WiFi Zone, ${user.firstname}!</h1>
    <p>Merci de vous être inscrit sur notre plateforme.</p>
    <p>Veuillez vérifier votre email en cliquant sur le lien ci-dessous:</p>
    <a href="${verificationUrl}">Vérifier mon email</a>
    <p>Ce lien expirera dans 24 heures.</p>
    <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Bienvenue sur WiFi Zone - Vérifiez votre email',
    html,
    text: `Bienvenue sur WiFi Zone! Vérifiez votre email: ${verificationUrl}`,
  });
};

/**
 * Send email verification
 */
const sendEmailVerification = async (user, verificationToken) => {
  const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <h1>Vérification d'email</h1>
    <p>Bonjour ${user.firstname},</p>
    <p>Veuillez vérifier votre email en cliquant sur le lien ci-dessous:</p>
    <a href="${verificationUrl}">Vérifier mon email</a>
    <p>Ce lien expirera dans 24 heures.</p>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Vérification de votre email',
    html,
    text: `Vérifiez votre email: ${verificationUrl}`,
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <h1>Réinitialisation de mot de passe</h1>
    <p>Bonjour ${user.firstname},</p>
    <p>Vous avez demandé une réinitialisation de mot de passe.</p>
    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
    <a href="${resetUrl}">Réinitialiser mon mot de passe</a>
    <p>Ce lien expirera dans 1 heure.</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe',
    html,
    text: `Réinitialisez votre mot de passe: ${resetUrl}`,
  });
};

/**
 * Send KYC status update email
 */
const sendKycStatusEmail = async (user, status, reason = null) => {
  let html = `<h1>Mise à jour de votre vérification KYC</h1>`;
  let subject = '';

  if (status === 'verified') {
    subject = 'Votre KYC a été approuvé';
    html += `
      <p>Bonjour ${user.firstname},</p>
      <p>Votre vérification KYC a été approuvée avec succès!</p>
      <p>Vous pouvez maintenant effectuer des retraits sur votre compte.</p>
    `;
  } else if (status === 'rejected') {
    subject = 'Votre KYC a été rejeté';
    html += `
      <p>Bonjour ${user.firstname},</p>
      <p>Malheureusement, votre vérification KYC a été rejetée.</p>
      ${reason ? `<p>Raison: ${reason}</p>` : ''}
      <p>Veuillez soumettre de nouveaux documents.</p>
    `;
  }

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send withdrawal status email
 */
const sendWithdrawalStatusEmail = async (user, withdrawal, status) => {
  let html = `<h1>Mise à jour de votre retrait</h1>`;
  let subject = '';

  if (status === 'completed') {
    subject = 'Votre retrait a été traité';
    html += `
      <p>Bonjour ${user.firstname},</p>
      <p>Votre retrait de ${withdrawal.netAmount.toLocaleString()} FCFA a été traité avec succès.</p>
      <p>Les fonds ont été envoyés vers votre numéro ${withdrawal.phoneNumber}.</p>
    `;
  } else if (status === 'rejected') {
    subject = 'Votre retrait a été rejeté';
    html += `
      <p>Bonjour ${user.firstname},</p>
      <p>Votre retrait de ${withdrawal.netAmount.toLocaleString()} FCFA a été rejeté.</p>
      ${withdrawal.rejectionReason ? `<p>Raison: ${withdrawal.rejectionReason}</p>` : ''}
      <p>Le montant a été recrédité sur votre compte.</p>
    `;
  }

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Send sale notification email
 */
const sendSaleNotificationEmail = async (user, ticket, zone) => {
  const html = `
    <h1>Nouvelle vente!</h1>
    <p>Bonjour ${user.firstname},</p>
    <p>Un ticket a été vendu sur votre zone "${zone.name}".</p>
    <p>Montant: ${ticket.plan.price.toLocaleString()} FCFA</p>
    <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Nouvelle vente de ticket',
    html,
  });
};

/**
 * Send stock alert email
 */
const sendStockAlertEmail = async (user, zone, availableTickets) => {
  const html = `
    <h1>Alerte de stock</h1>
    <p>Bonjour ${user.firstname},</p>
    <p>Votre zone "${zone.name}" a un stock faible de tickets.</p>
    <p>Tickets disponibles: ${availableTickets}</p>
    <p>Veuillez générer de nouveaux tickets.</p>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Alerte de stock - Tickets faibles',
    html,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendKycStatusEmail,
  sendWithdrawalStatusEmail,
  sendSaleNotificationEmail,
  sendStockAlertEmail,
};
