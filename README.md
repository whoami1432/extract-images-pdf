# extract-pdf-images

## Overview

`extractImagesFromPDF` is a utility function that extracts images from a PDF document and saves them to a specified folder. It returns a promise that resolves to an array of objects, each containing the page number and a list of image file paths extracted from that page.

``` bash

const { extractImagesFromPDF } = require('extract-pdf-images');

extractImagesFromPDF('path/to/source.pdf', 'path/to/destination/folder')
   .then(result => {
        result.forEach(page => {
            console.log(`Page ${page.pageNumber} has images:`);
            page.images.forEach(imagePath => {
                console.log(imagePath);
            });
        });
    })
   .catch(error => {
        console.error('Error extracting images:', error);
    });
```