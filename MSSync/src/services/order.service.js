import axios from 'axios';
import { logger } from '../utils/logger.js';

export const getOrCreateCustomer = async (msToken, email) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Accept-Encoding': 'gzip',
    };

    try {
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/counterparty', {
            headers,
            params: { filter: `email=${email}` }
        });

        if (response.data.rows.length > 0) {
            logger.info({ email }, 'Customer found:');
            return response.data.rows[0];
        }

        const newCustomer = {
            name: email,
            email: email,
        };

        const createResponse = await axios.post('https://api.moysklad.ru/api/remap/1.2/entity/counterparty', newCustomer, {
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
        });

        logger.info({ email }, 'New customer created:');
        return createResponse.data;
    } catch (error) {
        logger.error({ message: error.message, stack: error.stack }, 'Error getting or creating customer:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ data: error.response.data }, 'Response data:');
        }
        throw error;
    }
};

export const getDefaultOrganization = async (msToken) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Accept-Encoding': 'gzip',
    };

    try {
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/organization', { headers });
        const organization = response.data.rows.length > 0 ? response.data.rows[0] : null;

        if (organization) {
            logger.info({ organization }, 'Default organization retrieved:');
        } else {
            logger.warn('No default organization found.');
        }

        return organization;
    } catch (error) {
        logger.error({ message: error.message, stack: error.stack }, 'Error getting organization:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ data: error.response.data }, 'Response data:');
        }
        throw error;
    }
};

export const getProductByCode = async (msToken, code) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Accept-Encoding': 'gzip',
    };

    try {
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/product', {
            headers,
            params: { filter: `code=${code}` }
        });

        if (response.data.rows.length > 0) {
            logger.info({ code }, 'Product found by code:');
            return response.data.rows[0];
        } else {
            throw new Error(`Product with code ${code} not found.`);
        }
    } catch (error) {
        logger.error({ message: error.message, stack: error.stack }, 'Error getting product by code:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ data: error.response.data }, 'Response data:');
        }
        throw error;
    }
};

export const createCustomerOrder = async (msToken, orderData) => {
    const url = 'https://api.moysklad.ru/api/remap/1.2/entity/customerorder';
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.post(url, orderData, { headers });
        logger.info({ orderId: response.data.id }, 'Customer order created:');
        return response.data;
    } catch (error) {
        logger.error({ message: error.message, stack: error.stack }, 'Error creating customer order:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ data: error.response.data }, 'Response data:');
        }
        throw error;
    }
};
