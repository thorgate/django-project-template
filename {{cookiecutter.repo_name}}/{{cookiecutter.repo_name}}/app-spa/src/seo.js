import SeoStore from './stores/SeoStore';


const ogSelectors = {
    title: 'meta[property="og:title"]',
    image: 'meta[property="og:image"]',
    description: 'meta[property="og:description"]',
    url: 'meta[property="og:url"]'
};

function updateOgTag(key, ogTags) {
    let elem = document.head.querySelector(ogSelectors[key]);
    let value = ogTags[key];

    if (key === 'image' && value) {
        value = `${window.location.protocol}//${window.location.host}${value}`;
    }

    // Create the element if necessary
    if (!elem && value) {
        elem = document.createElement('meta');
        elem.setAttribute('property', 'og:' + key);
        elem.setAttribute('content', value);
        document.head.appendChild(elem);

        return true;
    } else if (elem.content !== value) {
        elem.content = value;

        return true;
    }

    return false;
}

export default function() {
    SeoStore.listen(() => {
        const seoMeta = SeoStore.getMeta();
        const ogTags = SeoStore.getOG();

        if (document.title !== seoMeta.title) {
            document.title = seoMeta.title;
        }

        const metaDesc = document.head.querySelector('meta[name="description"]');
        if (metaDesc && metaDesc.content !== seoMeta.description) {
            metaDesc.content = seoMeta.description;
        }

        const metaKeywords = document.head.querySelector('meta[name="keywords"]');
        if (metaKeywords && metaKeywords.content !== seoMeta.keywords) {
            metaKeywords.content = seoMeta.keywords;
        }

        let anyChanged = false;
        Object.keys(ogTags).forEach((key) => {
            anyChanged |= updateOgTag(key, ogTags);
        });

        if (anyChanged) {
            ogTags.url = window.location + '';
            updateOgTag('url', ogTags);
        }
    });
}
