import React, { Component } from 'react';
import ToggleSidebarButton from './components/ToggleSidebarButton';
import PageLoader from '../PageLoader/PageLoader';

import { Navbar, NavbarToggler, Collapse, Nav } from 'reactstrap';

export default class Header extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
    };
  }
  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  getPageTitle = () => {
    let name;
    this.props.routes.map(prop => {
      var r = prop.path.split('/'),
        rCur = this.props.location.pathname.split('/'),
        propPath, propPathname;
      
      if(r.indexOf(':id') !== -1) {
        var rIndex = r.indexOf(':id');
        r.splice(rIndex, 1);
        rCur.splice(rIndex, 1);
      }

      propPath = r.join('/');
      propPathname = rCur.join('/');
      
      if (propPath === propPathname) {
        name = prop.name;
      }
      return null;
    });
    return name;
  };

  render() {
    return (
      <header className="app-header">
        <SkipToContentLink focusId="primary-content" />
        <div className="top-nav">
          <Navbar color="faded" light expand="md">
            <ToggleSidebarButton
              toggleSidebar={this.props.toggleSidebar}
              isSidebarCollapsed={this.props.isSidebarCollapsed}
            />
            <div className="page-heading">{this.getPageTitle()}</div>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                {this.props.children}
              </Nav>
            </Collapse>
            <PageLoader />
          </Navbar>
        </div>
      </header>
    );
  }
}

const SkipToContentLink = ({ focusId }) => {
  return (
    <a href={`#${focusId}`} tabIndex="1" className="skip-to-content">
      Skip to Content
    </a>
  );
};
