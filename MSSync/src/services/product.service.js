import axios from 'axios';
import { logger } from '../utils/logger.js';


export const getProducts = async (msToken) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/assortment', { headers, timeout: 2500 });
        return response.data.rows;
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching products:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const getProductImages = async (msToken, productID) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.get(`https://api.moysklad.ru/api/remap/1.2/entity/product/${productID}/images`, { headers, timeout: 2500 });
        return response.data.rows;
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching product images:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const getStrapiProductById = async (strapiKey, productID) => {
    const headers = {
        'Authorization': `Bearer ${strapiKey}`,
    };

    try {
        const response = await axios.get(`https://doinglist.ru/api/ride-zone-items?filters[product_id][$eq]=${productID}`, { headers, timeout: 2500 });
        return response.data.data.length > 0 ? response.data.data[0] : null;
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching Strapi product by ID:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const addOrUpdateStrapiProduct = async (strapiKey, id, title, description, price, image, colors, accessory) => {
    const headers = {
        'Authorization': `Bearer ${strapiKey}`,
        'Content-Type': 'application/json',
    };

    const existingProduct = await getStrapiProductById(id);

    const postData = {
        data: {
            product_id: id,
            Text: title,
            Description: description,
            Price: price,
            accessory: accessory,
            colors: JSON.stringify(colors),
            Img: image,
        }
    };

    try {
        if (existingProduct) {
            await axios.put(`https://doinglist.ru/api/ride-zone-items/${existingProduct.id}`, postData, { headers, timeout: 2500 });
        } else {
            await axios.post('https://doinglist.ru/api/ride-zone-items', postData, { headers, timeout: 2500 });
        }
        logger.info('Product added or updated successfully.');
        return true;
    } catch (error) {
        logger.error({ message: error.message }, 'Error adding or updating Strapi product:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const getModifications = async (msToken) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/letiant', { headers, timeout: 2500 });
        return response.data.rows;
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching modifications:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const getAttributeMetadata = async (msToken, attributeName) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        logger.info('Fetching attribute metadata...');
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/product/metadata/attributes', { headers });
        const attributes = response.data.rows;
        const attribute = attributes.find(attr => attr.name === attributeName);

        if (!attribute) {
            throw new Error(`Attribute "${attributeName}" not found.`);
        }

        logger.info({ meta: attribute.meta }, `Attribute metadata for "${attributeName}":`);
        return attribute.meta;
    } catch (error) {
        logger.error({ message: error.message }, 'Error fetching attribute metadata:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const createProduct = async (msToken, product) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        logger.info('Creating product...');
        const response = await axios.post('https://api.moysklad.ru/api/remap/1.2/entity/product', product, { headers });
        logger.info({ product: response.data }, 'Product created:');
        return response.data;
    } catch (error) {
        logger.error({ message: error.message }, 'Error creating product:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const updateProduct = async (msToken, productId, productData) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        logger.info(`Updating product with ID: ${productId}...`);
        const response = await axios.put(`https://api.moysklad.ru/api/remap/1.2/entity/product/${productId}`, productData, { headers });
        logger.info({ product: response.data }, 'Product updated:');
        return response.data;
    } catch (error) {
        logger.error({ message: error.message }, 'Error updating product:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};

export const findProductByCode = async (msToken, code) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Content-Type': 'application/json',
    };

    try {
        logger.info(`Finding product with code: ${code}...`);
        const response = await axios.get(`https://api.moysklad.ru/api/remap/1.2/entity/product?filter=code=${code}`, { headers });

        if (response.data.rows && response.data.rows.length > 0) {
            logger.info({ product: response.data.rows[0] }, 'Product found:');
            return response.data.rows[0];
        } else {
            throw new Error(`Product with code "${code}" not found.`);
        }
    } catch (error) {
        logger.error({ message: error.message }, 'Error finding product by code:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};
