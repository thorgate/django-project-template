let assets;

// Cache in production
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    assets = require('fs').readFileSync(require('path').resolve('stats.json'));
    assets = JSON.parse(assets);
}


export default (imagePath) => {
    if (typeof window !== 'undefined') {
        throw new Error('image-resolver called on browser');
    }

    else {
        // Locally, load every request
        if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
            assets = require('fs').readFileSync(require('path').resolve('stats.json'));
            assets = JSON.parse(assets);
        }

        const images = assets.images;

        // Find the correct image
        const regex = new RegExp(`${imagePath}$`);
        const image = images.find(img => regex.test(img.original));

        // Serve image.
        if (image) {
            return image.compiled;
        }

        return '';
    }
};
