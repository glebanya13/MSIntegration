import axios from 'axios';
import { logger } from '../utils/logger.js';

export const createWebhook = async (msToken, url, entityType, action) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
    };

    const data = {
        entityType,
        url,
        action,
    };

    try {
        logger.info('Creating webhook...');
        const response = await axios.post('https://api.moysklad.ru/api/remap/1.2/entity/webhook', data, { headers });
        logger.info({ webhook: response.data }, 'Webhook created:');
    } catch (error) {
        logger.error({ message: error.message }, 'Error creating webhook:');
        if (error.response) {
            logger.error( { data: error.response.data }, 'Response data:');
            logger.error( { data: error.response.data }, 'Response data:');
        }
        throw error;
    }
};

export const getWebhooks = async (msToken) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Accept-Encoding': 'gzip',
    };

    try {
        logger.info('Fetching webhooks...');
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/webhook', { headers });
        const webhooks = response.data.rows;
        const productWebhooks = webhooks.filter(webhook => webhook.entityType === 'product');
        logger.info({ productWebhooks }, 'Product Webhooks:');
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching webhooks:');
        if (error.response) {
            logger.error( { data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};
