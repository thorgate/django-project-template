import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';

import styles from './NavigationBar.scss';
import { gettext } from '../../utils/text';
import reverseUrl from '../../utils/urls';

class NavigationBar extends React.Component {
    static renderSubMenu(menu) {
        const childrenMenus = menu.children[0] || [];

        return (
            <ul className="list-group list-group-flush">
                {childrenMenus.map(item => (
                    <li className="list-group-item" key={item.url}>
                        <a href={item.url}>{item.title}</a>
                        {NavigationBar.renderSubMenu(item)}
                    </li>
                ))}
            </ul>
        );
    }

    static renderCMSDropdownMenus(menu) {
        const dropdownItems = [];
        const childrenMenus = menu.children[0];
        childrenMenus.forEach(item => {
            let children;

            if (item.children.length) {
                children = NavigationBar.renderSubMenu(item);
            }

            dropdownItems.push(
                <NavDropdown.Item key={item.url} href={item.url}>
                    {item.title}
                    {children}
                </NavDropdown.Item>,
            );
        });

        return (
            <NavDropdown
                className={styles['tg-menu']}
                key={menu.url}
                title={menu.title}
                href={menu.url}
            >
                {dropdownItems}
            </NavDropdown>
        );
    }

    static renderCMSItems(menus) {
        if (!menus) return false;
        const items = [];

        menus.forEach(item => {
            if (item.children.length) {
                items.push(this.renderCMSDropdownMenus(item));
            } else {
                items.push(
                    <Nav.Link key={item.url} href={item.url}>
                        {item.title}
                    </Nav.Link>,
                );
            }
        });

        return <Fragment>{items}</Fragment>;
    }

    static renderItemsLeft() {
        return (
            <Fragment>
                <Nav.Link href={DJ_CONST.SITE_URL}>{gettext('Home')}</Nav.Link>
            </Fragment>
        );
    }

    static renderItemsRight() {
        return (
            <Fragment>
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
    menus: PropTypes.arrayOf(
        PropTypes.shape({
            url: PropTypes.string,
            title: PropTypes.string,
        }),
    ),
};

NavigationBar.defaultProps = {
    menus: [],
};

const childrenMatches = (elem, selector) =>
    Array.prototype.filter.call(elem.children, child =>
        child.matches(selector),
    );

const getMenus = element => {
    const menus = [];
    element.forEach(item => {
        const childUl = childrenMatches(item, 'ul');
        const menu = {
            title: item.firstElementChild.text,
            url: item.firstElementChild.href,
            children: [],
        };

        if (childUl.length) {
            const nestChild = [...childUl[0].children];
            const result = getMenus(nestChild);

            menu.children.push(result);
        }

        menus.push(menu);
    });

    return menus;
};

const renderNavigationBar = (containerID, menuId) => {
    const container = document.getElementById(containerID);
    const cmsMenus = Array.from(document.getElementById(menuId).children);

    const menus = getMenus(cmsMenus);

    if (container) {
        ReactDOM.render(<NavigationBar menus={menus} />, container);
    }
};

export default renderNavigationBar;
export { NavigationBar };
