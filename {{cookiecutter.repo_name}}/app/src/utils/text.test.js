import { upperCaseFirst } from './text';

describe('text utils', () => {
    // eslint-disable-next-line jest/expect-expect
    test('upperCaseFirst test', () => {
        expect(upperCaseFirst('fasdASDASD ASD cada')).toBe(
            'Fasdasdasd asd cada',
        );
        expect(upperCaseFirst('')).toBe('');
    });
});
