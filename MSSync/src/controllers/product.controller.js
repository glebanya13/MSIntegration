import { getAccessToken } from '../services/auth.service.js';
import { getAttributeMetadata, createProduct, updateProduct, findProductByCode } from '../services/product.service.js';
import { logger } from '../utils/logger.js';

export const afterCreate = async (event) => {
    const { result } = event;

    try {
        const msToken = await getAccessToken();
        if (!msToken) {
            throw new Error('Failed to obtain access token.');
        }

        const attributeMeta = await getAttributeMetadata(msToken, 'Выгружать на Ridezone');
        const { Text, Description, Price, Code } = result;

        const product = {
            name: Text,
            description: Description,
            salePrices: [{
                value: parseFloat(Price * 100),
                currency: {
                    meta: {
                        href: 'https://api.moysklad.ru/api/remap/1.2/entity/currency/b686bd62-aa1e-11ee-0a80-0f07002e6a62',
                        type: 'currency',
                        mediaType: 'application/json'
                    }
                },
                priceType: {
                    meta: {
                        href: 'https://api.moysklad.ru/api/remap/1.2/context/companysettings/pricetype/b686f8d2-aa1e-11ee-0a80-0f07002e6a63',
                        type: 'pricetype',
                        mediaType: 'application/json'
                    },
                }
            }],
            code: Code,
            attributes: [{
                meta: attributeMeta,
                value: true,
            }]
        };

        const createdProduct = await createProduct(msToken, product);
        logger.info({ product: createdProduct }, 'Product created in MoySklad:');
    } catch (error) {
        logger.error({ message: error.message }, 'Error creating product:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ data: error.response.data }, 'Response data:');
        }
        throw error;
    }
}

export const afterUpdate = async (event) => {
    const { result } = event;

    try {
        const msToken = await getAccessToken();
        if (!msToken) {
            throw new Error('Failed to obtain access token.');
        }

        const attributeMeta = await getAttributeMetadata(msToken, 'Выгружать на Ridezone');
        const { Text, Description, Price, Code } = result;

        const productData = {
            name: Text,
            description: Description,
            salePrices: [{
                value: parseFloat(Price * 100),
                currency: {
                    meta: {
                        href: 'https://api.moysklad.ru/api/remap/1.2/entity/currency/b686bd62-aa1e-11ee-0a80-0f07002e6a62',
                        type: 'currency',
                        mediaType: 'application/json'
                    }
                },
                priceType: {
                    meta: {
                        href: 'https://api.moysklad.ru/api/remap/1.2/context/companysettings/pricetype/b686f8d2-aa1e-11ee-0a80-0f07002e6a63',
                        type: 'pricetype',
                        mediaType: 'application/json'
                    },
                }
            }],
            code: Code,
            attributes: [{
                meta: attributeMeta,
                value: true,
            }]
        };

        const product = await findProductByCode(msToken, Code);
        if (!product) {
            throw new Error(`Product with code "${Code}" not found.`);
        }

        const updatedProduct = await updateProduct(msToken, product.id, productData);
        logger.info({ product: updatedProduct }, 'Product updated in MoySklad:');

    } catch (error) {
        logger.error({ message: error.message }, 'Error updating product:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ data: error.response.data }, 'Response data:');
        }
        throw error;
    }
}