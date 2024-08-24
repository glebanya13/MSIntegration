import Tesseract from 'tesseract.js';
import { preload, getPath } from './utils/preload.js';
import { logger } from './utils/logger.js';
import { keywords } from './keywords.js';

const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz6TDirBGr8Qf2uGXcNcAhrDlRH2jGZPsBYY7Yi8-HTzdMSXp_dooGpfnGjANv77N4Qbw/exec';

const input = getPath('./assets/input.jpg');
const output = getPath('./assets/output.jpg');

const run = async (input) => {
    await preload(input, output);

    try {
        const { data: { text } } = await Tesseract.recognize(output, 'rus', {
            logger: info => logger.info(info.status)
        });

        const amounts = [];
        const priceWithRRegex = /[+-]?\d+(?:[\s,]\d{3})*(?:[.,]\d+)?\s*Р/g;

        let ignoreNext = false;
        text.split('\n').forEach(line => {
            if (keywords.some(keyword => line.includes(keyword))) {
                ignoreNext = true;
            }

            if (!ignoreNext) {
                const priceMatches = line.match(priceWithRRegex);
                if (priceMatches) {
                    priceMatches.forEach(priceMatch => {
                        let price = priceMatch
                            .replace(/\s/g, '')
                            .replace(',', '.')
                            .replace('Р', '')
                            .trim();

                        if (!price.startsWith('+') && !price.startsWith('-')) {
                            price = '-' + price;
                        }

                        const numericPrice = parseFloat(price);
                        if (!isNaN(numericPrice)) {
                            amounts.push(numericPrice);
                        }
                    });
                }
            }

            if (ignoreNext) {
                ignoreNext = false;
            }
        });

        const username = 'gleb';
        const date = new Date().toLocaleDateString('ru-RU');
        const article = 'Сбербанк';

        for (const amount of amounts) {
            const newRow = {
                username,
                date,
                amount,
                article
            };

            await fetch(WEB_APP_URL, {
                redirect: "follow",
                method: "POST",
                body: JSON.stringify(newRow),
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
            });
        }
    } catch (error) {
        logger.info(error);
        throw error;
    }
};

run(input).then(() => {
    logger.info('OK!');
});
