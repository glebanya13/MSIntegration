import axios from 'axios';
import { logger } from '../utils/logger.js';

const msEmail = process.env.MS_EMAIL;
const msPass = process.env.MS_PASSWORD;

if (!msEmail || !msPass) {
    logger.error('MS_EMAIL or MS_PASSWORD environment variables are missing');
    process.exit(1);
}

export const getAccessToken = async () => {
    const auth64 = Buffer.from(`${msEmail}:${msPass}`).toString('base64');
    const headers = {
        'Authorization': `Basic ${auth64}`,
        'Accept-Encoding': 'gzip',
    };

    try {
        logger.info('Requesting access token...');
        const { data } = await axios.post('https://api.moysklad.ru/api/remap/1.2/security/token', null, { headers });
        logger.info({ accessToken: data.access_token }, 'Access token received');
        return data.access_token;
    } catch (error) {
        logger.error({ message: error.message }, 'Error getting access token');
        throw error;
    }
};
