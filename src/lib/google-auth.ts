import { OAuth2Client } from 'google-auth-library';

export function getAuthenticatedClient(accessToken: string): OAuth2Client {
    const oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    return oauth2Client;
}
