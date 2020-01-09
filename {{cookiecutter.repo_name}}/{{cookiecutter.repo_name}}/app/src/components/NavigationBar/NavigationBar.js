import React, {Fragment} from 'react';
import PropTypes from 'prop-types';

import {Container, Nav, Navbar, NavDropdown} from 'react-bootstrap';


class NavigationBar extends React.Component {
    static renderCMSDropdownMenus(menu) {
        const dropdownItems = [];
        const childrenMenus = menu.children[0];
        childrenMenus.forEach((item) => {
            dropdownItems.push(<NavDropdown.Item href={item.url}>{item.title}</NavDropdown.Item>);
        });

        return (
            <NavDropdown title={menu.title} href={menu.url}>
                {dropdownItems}
            </NavDropdown>
        );
    }

    static renderCMSItems(menus) {
        if (!menus) return false;
        const items = [];

        menus.forEach((item) => {
            if (item.children.length) {
                items.push(this.renderCMSDropdownMenus(item));
            } else {
                items.push(<Nav.Link href={item.url}>{item.title}</Nav.Link>);
            }
        });

        return (
            <Fragment>
                {items}
            </Fragment>
        );
    }

    static renderItemsLeft() {
        return (
            <Fragment>
                <Nav.Link href={DJ_CONST.SITE_URL}>Home</Nav.Link>
            </Fragment>
        );
    }

    static renderItemsRight() {
        return (
            <Fragment>
                { DJ_CONST.user ? <Nav.Link disabled>{DJ_CONST.user.name || DJ_CONST.user.email}</Nav.Link> : null }
                { DJ_CONST.user ? <Nav.Link href={DJ_CONST.LOGOUT_REVERSE_URL}>Log out</Nav.Link> : null }
                { !DJ_CONST.user ? <Nav.Link href={DJ_CONST.LOGIN_REVERSE_URL}>Log in</Nav.Link> : null }
            </Fragment>
        );
    }

    render() {
        return (
            <Navbar bg="dark" className="mb-4" variant="dark" expand="lg">
                <Container>
                    <Navbar.Brand>{DJ_CONST.PROJECT_TITLE}</Navbar.Brand>
                    <Navbar.Toggle aria-controls="headerNavigation" />
                    <Navbar.Collapse id="headerNavigation">
                        <Nav className="mr-auto">
                            {NavigationBar.renderItemsLeft()}
                            {NavigationBar.renderCMSItems(this.props.menus)}
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

NavigationBar.propTypes = {
    menus: PropTypes.arrayOf(PropTypes.shape({
        url: PropTypes.string,
        title: PropTypes.string,
    })),
};

NavigationBar.defaultProps = {
    menus: [],
};

export default NavigationBar;
