import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
    /**
     * Sends a branded welcome email to the user.
     * Designed to be non-blocking and fail silently.
     */
    async sendWelcomeEmail(email: string, fullName: string): Promise<void> {
        const name = fullName ? fullName.split(' ')[0] : email.split('@')[0];

        const subject = 'Welcome to Docley';
        const body = `
      Hi ${name},

      Welcome to Docley! We're thrilled to have you join our community of students and researchers.

      Docley is your intelligent companion for document editing, helping you transform drafts into professional, high-impact academic papers with ease. Whether you're working on an essay, research project, or thesis, our AI-powered tools are here to ensure your work meets the highest standards of clarity and tone.

      You can start using the editor immediately. You have full access to our drafting tools right now.

      Note: To unlock premium features like PDF/Word exports and advanced AI upgrades, please verify your email by clicking the link we sent earlier.

      Happy writing,
      The Docley Team
    `;

        try {
            // LOGGING FOR VERIFICATION (Since no SMTP provider is configured yet)
            console.log('--- SENDING WELCOME EMAIL ---');
            console.log(`To: ${email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body: ${body}`);
            console.log('------------------------------');

            // TODO: Integrate with a real provider (Resend, SendGrid, etc.)
            // Example: await this.resend.emails.send({ ... });

        } catch (error) {
            console.error('[MailService] Non-blocking welcome email failed:', error);
            // Fails silently as per requirements
        }
    }
}
