import t from 'tcomb-form';
import {validateEmail, ValidationError} from 'validators';


export default t.subtype(t.Str, (n) => {
    try {
        validateEmail(n);

        return true;
    }

    catch(e) {
        if (e instanceof ValidationError) {
            return false;
        }

        throw e;
    }
});
