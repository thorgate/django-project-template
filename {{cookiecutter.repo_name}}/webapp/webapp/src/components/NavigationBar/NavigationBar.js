import React from 'react';
import ReactDOM from 'react-dom';

import { Container, Nav, Navbar } from 'react-bootstrap';

import { gettext } from '../../utils/text';
import reverseUrl from '../../utils/urls';

class NavigationBar extends React.Component {
    static renderItemsLeft() {
        return (
            <>
                <Nav.Link href={DJ_CONST.SITE_URL}>{gettext('Home')}</Nav.Link>
            </>
        );
    }

    static renderItemsRight() {
        return (
            <>
                {DJ_CONST.user ? (
                    <Nav.Link disabled>
                        {DJ_CONST.user.name || DJ_CONST.user.email}
                    </Nav.Link>
                ) : null}
                {DJ_CONST.user ? (
                    <Nav.Link href={reverseUrl('logout')}>
                        {gettext('Log out')}
                    </Nav.Link>
                ) : null}
                {!DJ_CONST.user ? (
                    <Nav.Link href={reverseUrl('login')}>
                        {gettext('Log in')}
                    </Nav.Link>
                ) : null}
            </>
        );
    }

    render() {
        return (
            <Navbar className="mb-4" bg="dark" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand href={reverseUrl('home')}>
                        {DJ_CONST.PROJECT_TITLE}
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="headerNavigation" />
                    <Navbar.Collapse id="headerNavigation">
                        <Nav className="mr-auto">
                            {NavigationBar.renderItemsLeft()}
                        </Nav>
                        <Nav className="ml-auto">
                            {NavigationBar.renderItemsRight()}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }
}

const renderNavigationBar = (containerID) => {
    const container = document.getElementById(containerID);

    if (container) {
        ReactDOM.render(<NavigationBar />, container);
    }
};

export default renderNavigationBar;
export { NavigationBar };
