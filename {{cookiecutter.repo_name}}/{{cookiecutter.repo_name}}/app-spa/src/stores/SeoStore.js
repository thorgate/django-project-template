import is from 'is';

import {createStore} from '../alt';
import SeoActions from '../actions/SeoActions';


const titleSeparator = '|';

function joinTitle(arr) {
    return arr.slice().reverse().join(` ${titleSeparator} `);
}


class SeoStore {
    constructor() {
        this.title = [];
        this.ogTitle = [];
        this.ogImage = [];

        this.desc = [];
        this.ogDesc = [];

        this.bindActions(SeoActions);
        this.exportPublicMethods({
            getMeta: this.getMeta,
            getOG: this.getOG
        });
    }

    /**
     * Set active sub-title.
     *
     * Note: If the next view does not set a new sub-title the old will remain active.
     *        To get over this one should always add titles to their views or use popTitle action
     *        in conjunction with willTransitionFrom to remove sub-title when navigating away from
     *        the current view.
     *
     * @param titlePart
     * @private Must only be called via actions.
     */
    onPushTitle(titlePart) {
        let idx = 1;
        if (is.array(titlePart)) {
            idx = titlePart[1] || 1;
            titlePart = titlePart[0];
        }

        this.title[idx] = titlePart;

        // Also refresh the ogTitle
        this.ogTitle = this.title.slice();
    }

    /**
     * Set the full title of the current page.
     *
     * WARNING: This should usually only be called inside initApplication
     *
     * @param newTitle
     * @private Must only be called via actions.
     */
    onSetTitle(newTitle) {
        if (!is.array(newTitle)) {
            newTitle = [newTitle];
        }

        this.title = newTitle;

        // Also refresh the ogTitle
        this.ogTitle = this.title.slice();
    }

    /**
     * Explicitly cleanup if sub-titles are not used for all routes
     *
     * @param index
     * @private Must only be called via actions.
     */
    onPopTitle(index) {
        if (!index) {
            this.title.pop();
        } else {
            this.title.splice(index, 1);
        }

        // Also refresh the ogTitle
        this.ogTitle = this.title.slice();
    }

    /**
     * This can be used to set a views og:title to a
     *  custom value instead of using the page title.
     *
     * Note: Should always be after updating page title
     *
     * @param newTitle
     * @private Must only be called via actions.
     */
    onSetOgTitle(newTitle) {
        if (!is.array(newTitle)) {
            newTitle = [newTitle];
        }

        this.ogTitle = newTitle;
    }

    /**
     * Set default og:image.
     *
     * WARNING: This should usually only be called inside initApplication
     *
     * @param newImage
     * @private Must only be called via actions.
     */
    onSetOgImage(newImage) {
        if (!is.array(newImage)) {
            newImage = [newImage];
        }

        this.ogImage = newImage;
    }

    /**
     * Can be used to set a per-view og:image
     *
     * Note: One must use popOgImage to cleanup after
     *        themselves via willTransitionFrom
     *
     * @param newImage
     * @private Must only be called via actions.
     */
    onPushOgImage(newImage) {
        this.ogImage.push(newImage);
    }

    /**
     * Should be used to cleanup after per-view og:images via willTransitionFrom
     *
     * @private Must only be called via actions.
     */
    onPopOgImage() {
        this.ogImage.pop();
    }

    /**
     * Set default meta description.
     *
     * WARNING: This should usually only be called inside initApplication
     *
     * @param desc
     * @private Must only be called via actions.
     */
    onSetDesc(desc) {
        if (!is.array(desc)) {
            desc = [desc];
        }

        this.desc = desc;

        // Also refresh the ogDesc
        this.ogDesc = this.desc.slice();
    }

    /**
     * Can be used to set a per-view meta description
     *
     * Note: One must use popDesc to cleanup after
     *        themselves via willTransitionFrom
     *
     * @param desc
     * @private Must only be called via actions.
     */
    onPushDesc(desc) {
        this.desc.push(desc);

        // Also refresh the ogDesc
        this.ogDesc = this.desc.slice();
    }

    /**
     * Should be used to cleanup after per-view meta descriptions via willTransitionFrom
     *
     * @private Must only be called via actions.
     */
    onPopDesc() {
        this.desc.pop();

        // Also refresh the ogDesc
        this.ogDesc = this.desc.slice();
    }

    /**
     * This can be used to set a views og:description to a
     *  custom value instead of using the page description.
     *
     * Note: Should always be after updating page description
     *
     * @param newDesc
     * @private Must only be called via actions.
     */
    onSetOgDesc(newDesc) {
        if (!is.array(newDesc)) {
            newDesc = [newDesc];
        }

        this.ogDesc = newDesc;
    }

    /**
     * Set default meta keywords.
     *
     * WARNING: This should usually only be called inside initApplication
     *
     * @param keywords
     * @private Must only be called via actions.
     */
    onSetKeywords(keywords) {
        if (!is.array(keywords)) {
            keywords = [keywords];
        }

        this.keywords = keywords;
    }

    /**
     * Can be used to set a per-view meta keywords
     *
     * Note: One must use popKeywords to cleanup after
     *        themselves via willTransitionFrom
     *
     * @param keywords
     * @private Must only be called via actions.
     */
    onPushKeywords(keywords) {
        this.keywords.push(keywords);
    }

    /**
     * Should be used to cleanup after per-view meta keywords via willTransitionFrom
     *
     * @private Must only be called via actions.
     */
    onPopKeywords() {
        this.keywords.pop();
    }

    /**
     * Get full title string based on current store state
     *
     * @public
     */
    getMeta() {
        const state = this.getState();

        return {
            title: joinTitle(state.title),
            description: state.desc && state.desc.length ? state.desc[state.desc.length - 1] : null,
            keywords: state.keywords && state.keywords.length ? state.keywords[state.keywords.length - 1] : null
        };
    }

    /**
     * Get full og:title string based on current store state
     *
     * @public
     */
    getOG() {
        const state = this.getState();

        return {
            title: joinTitle(state.ogTitle),
            image: state.ogImage && state.ogImage.length ? state.ogImage[state.ogImage.length - 1] : null,
            description: state.ogDesc && state.ogDesc.length ? state.ogDesc[state.ogDesc.length - 1] : null
        };
    }
}

export default createStore(SeoStore, 'SeoStore', module);

