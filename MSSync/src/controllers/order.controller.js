import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { getAccessToken } from '../services/auth.service.js';
import { getOrCreateCustomer, getDefaultOrganization, getProductByCode, createCustomerOrder } from '../services/order.service.js';

const afterCreate = async (event) => {
    const { result } = event;

    try {
        const msToken = await getAccessToken();
        if (!msToken) {
            throw new Error('Failed to obtain access token.');
        }

        const { name, surname, email, price, code } = result;
        const uniqueCode = uuidv4();

        const customer = await getOrCreateCustomer(msToken, email);
        logger.info({ email }, 'Customer retrieved or created:');

        const organization = await getDefaultOrganization(msToken);
        if (!organization) {
            throw new Error('No default organization found.');
        }
        logger.info({ organization }, 'Default organization retrieved:');

        const product = await getProductByCode(msToken, code);
        if (!product) {
            throw new Error(`Product with code ${code} not found.`);
        }
        logger.info({ code }, 'Product retrieved:');

        const orderPayload = {
            description: `Email: ${email || ''}\nИмя клиента: ${name || ''}\nФамилия клиента: ${surname || ''}`,
            code: uniqueCode,
            agent: {
                meta: {
                    href: customer.meta.href,
                    type: 'counterparty',
                    mediaType: 'application/json',
                }
            },
            organization: {
                meta: {
                    href: organization.meta.href,
                    type: 'organization',
                    mediaType: 'application/json',
                }
            },
            positions: [
                {
                    quantity: 1,
                    price: parseFloat(price) * 100,
                    assortment: {
                        meta: {
                            href: product.meta.href,
                            type: "product",
                            mediaType: "application/json"
                        }
                    },
                    reserve: 1
                }
            ],
            project: {
                meta: {
                    href: 'https://api.moysklad.ru/api/remap/1.2/entity/project/5c2fd2bb-b0a9-11ee-0a80-029a0016bfbb',
                    type: 'project',
                    mediaType: 'application/json'
                }
            }
        };

        logger.info({ orderPayload }, 'Creating customer order with data:');

        const orderResponse = await createCustomerOrder(msToken, orderPayload);

        if (orderResponse) {
            logger.info({ orderId: orderResponse.id }, 'Customer order successfully created:');
        }
    } catch (error) {
        logger.error({ message: error.message, stack: error.stack }, 'Error in afterCreate:');
        if (error.response) {
            logger.error({ data: error.response.data }, 'Response data:');
            logger.error({ data: error.response.data }, 'Response data:');
        }
        throw error;
    }
};

export default afterCreate;
