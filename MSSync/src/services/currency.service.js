import axios from 'axios';
import { logger } from '../utils/logger.js';

export const getCurrencies = async (msToken) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        logger.info('Fetching list of currencies...');
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/currency', { headers });
        const currencies = response.data.rows;

        logger.info('List of available currencies:');
        currencies.forEach(currency => {
            logger.info(`Name: ${currency.name}, Meta Href: ${currency.meta.href}`);
        });
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching currencies:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const getPriceTypes = async (msToken) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        logger.info('Fetching list of price types...');
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/context/companysettings/pricetype', { headers });

        if (response.data && response.data.rows) {
            const priceTypes = response.data.rows;

            logger.info('List of available price types:');
            priceTypes.forEach(priceType => {
                logger.info(`Name: ${priceType.name}, Meta Href: ${priceType.meta.href}`);
            });
        } else {
            logger.error('Unexpected response structure:', { response: response.data });
        }
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching price types:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};
