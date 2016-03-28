import alt from '../alt';


class SeoActions {
    constructor() {
        this.generateActions(
            'setTitle', 'pushTitle', 'popTitle', 'setOgTitle',
            'setKeywords', 'pushKeywords', 'popKeywords',
            'setOgImage', 'pushOgImage', 'popOgImage',
            'setDesc', 'pushDesc', 'popDesc', 'setOgDesc'
        );
    }
}

export default alt.createActions(SeoActions);
