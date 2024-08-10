import axios from 'axios';
import { logger } from '../utils/logger.js';

export const getProjects = async (msToken) => {
    const headers = {
        'Authorization': `Bearer ${msToken}`,
        'Accept-Encoding': 'gzip',
    };

    try {
        logger.info('Fetching projects...');
        const response = await axios.get('https://api.moysklad.ru/api/remap/1.2/entity/project', { headers });
        const projects = response.data.rows;
        logger.info({ projects }, 'Projects retrieved:');
        return projects;
    } catch (error) {
        logger.error({ message: error.message }, 'Error getting projects:');
        if (error.response) {
            logger.error( { data: error.response.data }, 'Response data:');
            logger.error({ status: error.response.status }, 'Response status:');
        }
        throw error;
    }
};
