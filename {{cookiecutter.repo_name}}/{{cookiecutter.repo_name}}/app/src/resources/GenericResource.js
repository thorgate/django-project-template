import SingleObjectResource, {setConfig} from 'tg-resources';

import logger from '../logger';
import CurrentUserActions from '../actions/CurrentUserActions';

import {getExtraHeaders, getCookies} from './headers';


// Configure tg-resources
logger.debug('Configuring tg-resources');
setConfig('API_BASE', DJ_CONST.API_BASE);
setConfig('onSourceError', CurrentUserActions.pageFault);
setConfig('getExtraHeaders', getExtraHeaders);
setConfig('getCookies', getCookies);


export default SingleObjectResource;
export {InvalidResponseCode, ValidatonError} from 'tg-resources';
