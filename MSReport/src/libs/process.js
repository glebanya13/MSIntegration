import Tesseract from 'tesseract.js';
import pica from 'pica';
import { keywords } from './keywords.js';

export const process = async (input) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(input);

        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const scaleFactor = 1200 / img.width;
                canvas.width = 1200;
                canvas.height = img.height * scaleFactor;

                ctx.filter = 'grayscale(100%)';
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const picaInstance = pica();
                const outputCanvas = document.createElement('canvas');
                outputCanvas.width = canvas.width;
                outputCanvas.height = canvas.height;

                await picaInstance.resize(canvas, outputCanvas);

                outputCanvas.toBlob(async (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create blob'));
                        return;
                    }

                    try {
                        const { data: { text } } = await Tesseract.recognize(blob, 'rus', {
                            logger: info => console.log(info.status)
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

                        resolve(amounts);
                    } catch (error) {
                        reject(new Error('Error recognizing text: ' + error.message));
                    }
                }, 'image/jpeg');
            } catch (error) {
                reject(new Error('Error processing image: ' + error.message));
            }
        };

        img.onerror = (error) => {
            reject(new Error('Error loading image: ' + error.message));
        };
    });
};
