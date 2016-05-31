import React, {Component} from 'react';
import {RouteHandler} from 'react-router';

import initApplication from '../utils/initApplication';
import PageError from '../views/PageError';


@initApplication(PageError)
class Wrapper extends Component {
    render() {
        return (
            <div>
                <RouteHandler {...this.props} />
            </div>
        );
    }
}

export default Wrapper;
