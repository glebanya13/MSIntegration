import 'dotenv/config';
import { logger } from './utils/logger.js';
import { getAccessToken } from './services/auth.service.js';
import { addOrUpdateStrapiProduct, getModifications, getProductImages, getProducts } from './services/product.service.js';

const msToken = await getAccessToken()

if (msToken) {
    try {
        const msProducts = await getProducts(msToken);
        const msModifications = await getModifications(msToken);

        if (!msProducts || !msModifications) {
            logger.error('No products or modifications found.');
            return;
        }

        for (const product of msProducts) {
            const thisPrice = (product.salePrices[0]?.value / 100) || 0;
            const productAttributes = product.attributes || [];
            const attributeToCheck = productAttributes.find(attr => attr.name === 'Выгружать на Ridezone');

            if (!attributeToCheck) {
                logger.error('No products with this attribute name found.');
                return;
            }

            const thisImages = await getProductImages(msToken, product.id);
            const thisImage = thisImages.length > 0 ? thisImages[0]?.miniature?.downloadHref : 'n/a';

            const colorAttributes = [];
            let accessoryAttribute = false;

            for (const mod of msModifications) {
                if (mod.product.meta.href === product.meta.href) {
                    mod.characteristics.forEach(char => {
                        if (char.name === 'цвет' && char.value) {
                            colorAttributes.push(char.value);
                        }
                        if (char.name === 'аксессуар') {
                            accessoryAttribute = true;
                        }
                    });
                }
            }

            await addOrUpdateStrapiProduct(msToken, product.id.toString(), product.name, product.description, thisPrice.toString(), thisImage, colorAttributes, accessoryAttribute);
        }
    } catch (error) {
        logger.error({ message: error.message }, 'Error in start function:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
}