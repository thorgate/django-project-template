import titleReducer, { setTitle } from './title';

describe('ducks/title', () => {
    test('initial state is defined', () => {
        const state = titleReducer(undefined, { type: 'TEST' });

        expect(state).toMatchObject({ title: '' });
    });
    test('setTitle works', () => {
        let state = titleReducer(undefined, { type: 'TEST' });

        state = titleReducer(state, setTitle('new title'));

        expect(state).toMatchObject({ title: 'new title' });
    });
});
