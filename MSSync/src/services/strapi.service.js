import axios from 'axios';
import { logger } from '../utils/logger.js';

export const getStrapiProductByCode = async (code, strapiKey) => {
    const headers = {
        'Authorization': `Bearer ${strapiKey}`,
    };

    try {
        logger.info(`Fetching Strapi product by code: ${code}...`);
        const response = await axios.get(`https://doinglist.ru/api/ride-zone-items?filters[Code][$eq]=${code}`, { headers, timeout: 2500 });
        const product = response.data.data.length > 0 ? response.data.data[0] : null;
        logger.info({ product }, 'Strapi product retrieved:');
        return product;
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching Strapi product by code:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const updateStrapiProduct = async (productId, price, strapiKey) => {
    const headers = {
        'Authorization': `Bearer ${strapiKey}`,
        'Content-Type': 'application/json',
    };

    try {
        const postData = {
            data: {
                product_id: productId,
                Price: (price / 100).toString(),
            }
        };

        logger.info(`Updating Strapi product with ID: ${productId}...`);
        await axios.put(`https://doinglist.ru/api/ride-zone-items/${productId}`, postData, { headers, timeout: 2500 });
        logger.info('Strapi product updated successfully.');
        return true;
    } catch (error) {
        logger.error({ message: error.message }, 'Error updating Strapi product:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        return false;
    }
};