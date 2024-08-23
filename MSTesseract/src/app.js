import Tesseract from 'tesseract.js';
import { preload, getPath } from './utils/preload.js';
import { logger } from './utils/logger.js';

const input = getPath('./assets/input.jpg');
const output = getPath('./assets/output.jpg');

const run = async (input) => {
    await preload(input, output);

    return Tesseract.recognize(
        output,
        'rus',
        {
            logger: info => logger.info(info.status)
        }
    ).then(({ data: { text } }) => {
        let ignoreNext = false;
        console.log(text);

        const lines = text.split('\n');

        const amounts = [];

        const priceWithRRegex = /[+-]?\d+(?:[\s,]\d{3})*(?:[.,]\d+)?\s*Р/g;

        for (const line of lines) {
            if (line.includes('Вчера') || line.includes('Сегодня')) {
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
        }

        const total = amounts.reduce((acc, curr) => acc + curr, 0);

        return {
            amounts,
            total
        };
    }).catch(error => {
        logger.info(error);
        throw error;
    });
}

run(input).then(result => {
    logger.info(result, 'Result: ');
});
