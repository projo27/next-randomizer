import { Header } from "@/components/header";

export default function PrivacyPolicyPage() {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 pt-12 md:pt-16">
            <Header />
            <main className="w-full max-w-4xl mx-auto mt-6 bg-card text-card-foreground p-6 md:p-10 rounded-lg shadow-md prose dark:prose-invert">
                <h1>Privacy Policy for Randomizer.fun</h1>
                <p><em>Last Updated: October 11, 2025</em></p>
                <p>This Privacy Policy explains how Randomizer.fun ("We," "Us," or "Our") collects, uses, and discloses your information in connection with your use of our website.</p>
                
                <h2>1. Information We Collect</h2>
                <p>We collect the following data when you use our services:</p>

                <h3>A. Data Collected via Firebase Authentication</h3>
                <p>When you choose to log in using Google or any other third-party authentication provider (via Firebase Auth), we collect the following personally identifiable information:</p>
                <ul>
                    <li><strong>Basic Identity:</strong> Your display name and email address.</li>
                    <li><strong>Account Identity:</strong> Your unique user ID (UID) and profile picture (if provided by the service provider).</li>
                </ul>
                <p>We use this data exclusively to identify you within our application, grant you access to registered features, and personalize your experience.</p>
                
                <h3>B. User Preference Data (Firestore)</h3>
                <p>We use Google Cloud Firestore to store specific preferences you set within the application, including:</p>
                <ul>
                    <li><strong>Theme Settings:</strong> Your preference between the light or dark theme.</li>
                    <li><strong>Other Application Settings:</strong> Any other configurations or preferences you save within protected features.</li>
                </ul>
                <p>This data is linked solely to your unique user ID (UID) and helps maintain a consistent user experience across sessions.</p>

                <h2>2. How We Use Your Information</h2>
                <p>We use the data we collect for the following purposes:</p>
                <ul>
                    <li><strong>Service Provision:</strong> To authenticate and authorize your access to registered features (such as the protected YouTube tab).</li>
                    <li><strong>Enhancing User Experience:</strong> To load your personal preferences (such as your theme) every time you use the application.</li>
                    <li><strong>Account Maintenance:</strong> To manage your user account and respond to customer service inquiries.</li>
                </ul>

                <h2>3. Data Disclosure and Sharing</h2>
                <p>We do not sell, trade, or rent your personally identifiable information to external parties. We only disclose your personal information under the following circumstances:</p>
                <ul>
                    <li><strong>Service Providers:</strong> We use third-party service providers (specifically Google Firebase) for authentication management and database storage. These parties are bound by confidentiality obligations.</li>
                    <li><strong>Legal Compliance:</strong> If required to do so by law or valid court order.</li>
                </ul>

                <h2>4. Data Security</h2>
                <p>We take reasonable and appropriate measures to protect your personal data from unauthorized access, disclosure, alteration, or destruction. It must be noted, however, that no method of data transmission over the internet is 100% secure.</p>

                <h2>5. Your Choices and Rights</h2>
                <ul>
                    <li><strong>Access and Correction:</strong> You can access and update your basic information through your authentication service provider (e.g., your Google Account).</li>
                    <li><strong>Data Deletion:</strong> If you wish to delete your account and all associated data from Randomizer.fun, please contact us via the contact details provided below.</li>
                </ul>

                <h2>6. Changes to This Privacy Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

                <h2>7. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at:</p>
                <p>Email: [Your active email address, e.g., support@randomizer.fun]</p>
            </main>
        </div>
    );
}
