import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

// Define the handler function
export default async function handler(req, res) {
    // CORS setup for testing locally if needed
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { email, name, role, formAnswers } = req.body;

    if (!email || !name || !role) {
        return res.status(400).json({ message: 'Missing required fields: email, name, or role.' });
    }

    // Check for the Resend API Key
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
        console.error("Missing RESEND_API_KEY environment variable.");
        return res.status(500).json({ message: "Server configuration error: Missing email provider credentials." });
    }

    const resend = new Resend(RESEND_API_KEY);

    try {
        // 1. Determine which HTML template to load based on the role
        const templateFileName = role === 'artist' ? 'artist-confirmation.html' : 'fan-confirmation.html';

        // We construct the path to the emails directory. 
        // In Vercel serverless functions, files outside the api folder might need specific include paths or we can just read them if included in the build.
        // Assuming standard Vercel structure where `src` is at the root:
        const templatePath = path.join(process.cwd(), 'src', 'emails', templateFileName);

        let htmlContent = '';
        try {
            htmlContent = fs.readFileSync(templatePath, 'utf8');
        } catch (fsError) {
            console.error("Error reading HTML template:", fsError);
            return res.status(500).json({ message: "Error loading email template." });
        }

        // 2. Inject dynamic variables into the HTML template
        const firstName = name.split(' ')[0] || name;

        // Create a mock referral link using the email or timestamp for demonstration
        const uniqueId = Buffer.from(email).toString('base64').substring(0, 8);
        const referralLink = `https://xplit.music/invite/${uniqueId}`;

        htmlContent = htmlContent.replace(/{{first_name}}/g, firstName);
        htmlContent = htmlContent.replace(/{{referral_link}}/g, referralLink);

        // 3. Send the email using Resend
        const subject = role === 'artist'
            ? "Welcome to the future of music funding 🚀"
            : "You're on the list 🎵 Start owning your music";

        // Use a verified domain or testing email for `from`
        // If you don't have a custom domain on Resend yet, you must use their testing `onboarding@resend.dev`
        // and you can ONLY send to your own registered email address during testing.
        const toAddress = 'juanjosetrade@gmail.com'; // Resend Test Mode Restriction - Must send to verified owner

        console.log(`Sending ${role} confirmation email to ${toAddress}`);

        const { data, error } = await resend.emails.send({
            from: 'XPLIT Music <onboarding@resend.dev>', // Use the dev address
            to: [toAddress],
            subject: subject,
            html: htmlContent,
            // You can also use react email templates here if you preferred, but we are using raw HTML
        });

        if (error) {
            console.error("Resend API Error:", error);
            return res.status(400).json({ message: "Failed to send email", error });
        }

        return res.status(200).json({
            success: true,
            message: 'Confirmation email sent successfully!',
            id: data?.id
        });

    } catch (error) {
        console.error("Unexpected error sending email:", error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
