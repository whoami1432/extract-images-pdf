const Path = require('node:path');
const { getDocument, OPS } = require('pdfjs-dist');
const sharp = require('sharp');

function exportImagesEvents(src, dst = '.') {
	return getDocument(src).promise.then(doc => processDoc(doc, dst));
}

/**
 * Extracts images from a PDF document and saves them to a specified folder.
 *
 * @param {string} pdfSourcePath - The file path of the source PDF document.
 * @param {string} destination - The directory path where the extracted images will be saved.
 * @returns {Promise<Array<{pageNumber: number, images: string[]}>>} A promise that resolves to an array of objects
 * 
 * each containing the page number and a list of image file paths extracted from that page.
 *
 * @example
 * 
 * extractImagesFromPDF('path/to/source.pdf', 'path/to/destination/folder')
 *   .then(result => {
 *     result.forEach(page => {
 *       console.log(`Page ${page.pageNumber} has images:`);
 *       page.images.forEach(imagePath => {
 *         console.log(imagePath);
 *       });
 *     });
 *   })
 *   .catch(error => {
 *     console.error('Error extracting images:', error);
 *   });
 */
const extractImagesFromPDF = async (pdfSourcePath, destination = '.') => {
    if (!pdfSourcePath.endsWith('.pdf')) {
        throw new Error('Not a valid file, Please upload correct file format (PDF)')
    }

    if (!destination || destination === '.') {
        throw new Error('Not a valid folder, Please give correct folder extract images')
    }

	return await exportImagesEvents(pdfSourcePath, destination);
}

async function processDoc(doc, dst) {
	const pageCount = doc._pdfInfo.numPages;
    const pageWithExtractedPDFData = [];
	for (let p = 1; p <= pageCount; p++) {
		const page = await doc.getPage(p);
        const pageImages = [];
		/* Get the page images */
		const ops = await page.getOperatorList();
		for (let i = 0; i < ops.fnArray.length; i++) {
			try {
				/* Image extraction */
				if (ops.fnArray[i] === OPS.paintImageXObject || ops.fnArray[i] === OPS.paintInlineImageXObject) {
					const name = ops.argsArray[i][0];
					const common = await page.commonObjs.has(name);
					const img = await (common ? page.commonObjs.get(name) : page.objs.get(name));
					const { width, height, kind } = img;
					const bytes = img.data.length;
					const channels = bytes / width / height;
					if (!(channels === 1 || channels === 2 || channels === 3 || channels === 4)) {
						throw new Error(`Invalid image channel: ${channels} for image ${name} on page ${page}`);
					}
					const file = Path.join(dst, `${name}.png`);

					/* Save as image in our local  directory */
					await sharp(img.data, {
						raw: { width, height, channels: 3, kind }
					})
						.png({ quality: 50 })
						.toFile(file);
                    
                    pageImages.push(file)
				}
			} catch (error) {
				throw new Error(error)
			}
		}
        pageWithExtractedPDFData.push({pageNumber: p, images: pageImages});
	}
    return pageWithExtractedPDFData;
}

module.exports = { extractImagesFromPDF }
