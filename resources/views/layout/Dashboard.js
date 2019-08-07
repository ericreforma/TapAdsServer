import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { Button, Badge, NavItem, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Header, SidebarNav, Footer, PageContent, Avatar, Chat, PageAlert, Page } from '../components';
import Logo from '../../img/vibe-logo.svg';
import avatar1 from '../../img/avatar1.png';
import nav from '../nav';
import routes from '../route';
import ContextProviders from '../components/utilities/ContextProviders';
import ClientNotification from '../functions/notifications/ClientNotification.js';

import {HttpRequest} from '../services/http';
import config from '../config';

const MOBILE_SIZE = 992;

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn:false,
      clientEmail:'',
      sidebarCollapsed: false,
      isMobile: window.innerWidth <= MOBILE_SIZE,
      showChat1: true,
      nav: nav,
      messageNotif: 0
    };
  }

  handleResize = () => {
    if (window.innerWidth <= MOBILE_SIZE) {
      this.setState({ sidebarCollapsed: false, isMobile: true });
    } else {
      this.setState({ isMobile: false });
    }
  };

  componentDidUpdate(prev) {
    if (this.state.isMobile && prev.location.pathname !== this.props.location.pathname) {
      this.toggleSideCollapse();
    }
  }

  componentDidMount() {
	window.addEventListener('resize', this.handleResize);
	this.getMessageNotificationCount();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  toggleSideCollapse = () => {
    this.setState(prevState => ({ sidebarCollapsed: !prevState.sidebarCollapsed }));
  };

  closeChat = () => {
    this.setState({ showChat1: false });
  };

  changeMessageNotifCount = (messageNotif) => {
    var {nav} = this.state;
    nav.top = nav.top.map(n => {
      if(n.hasNotif) {
        n.notifCount = messageNotif;
      }

      return n;
    });
    this.setState({messageNotif, nav});
  }

  getMessageNotificationCount = () => {
    HttpRequest.get(config.api.getChat).then(response => {
      	if(response.data.status == 'success') {
			var {users} = response.data.message,
				totalNotifCount = users.filter(u => u.notif).map(u => u.notif).reduce((a, b) => a + b, 0);

			this.changeMessageNotifCount(totalNotifCount);
      	}
    }).catch(error => {
		setTimeout(() => this.getMessageNotificationCount(), 1000);
      	console.log(error);
    });
  }

  render() {
    const { sidebarCollapsed } = this.state;
    const sidebarCollapsedClass = sidebarCollapsed ? 'side-menu-collapsed' : '';
    
    return (
      <ContextProviders>
        <div className={`app ${sidebarCollapsedClass}`}>
          <PageAlert />

          <div className="app-body">
            <SidebarNav
              nav={this.state.nav}
              logo={Logo}
              logoText="TAP ADS"
              isSidebarCollapsed={sidebarCollapsed}
              toggleSidebar={this.toggleSideCollapse}
              {...this.props}
            />
            
            <Page>
              <Header
                toggleSidebar={this.toggleSideCollapse}
                isSidebarCollapsed={sidebarCollapsed}
                routes={routes}
                {...this.props}
              >
                <HeaderNav />
              </Header>

              <PageContent>
                <Switch>
                  {routes.map((page, key) => (
                    <Route
                      path={page.path}
                      render={props =>
                        <page.component
                          {...props}
                          changeMessageNotifCount={this.changeMessageNotifCount}
                        />}
                      key={key}
                  />
                  ))}
                  <Redirect from="/" to="/dashboard" />
                </Switch>
              </PageContent>
            </Page>
          </div>

          <Footer>
            <span>
              <a href="#!">Terms</a> | <a href="#!">Privacy Policy</a>
            </span>
            {/* <span className="ml-auto hidden-xs">
              Made with{' '}
              <span role="img" aria-label="taco">
                🌮  
              </span>
            </span> */}
          </Footer>
        </div>
      </ContextProviders>
    );
  }
}

function HeaderNav() {
  return (
    <React.Fragment>
      {/* <NavItem>
        <form className="form-inline">
          <input className="form-control mr-sm-1" type="search" placeholder="Search" aria-label="Search" />
          <Button type="submit" className="d-none d-sm-block">
            <i className="fa fa-search" />
          </Button>
        </form>
      </NavItem> */}
      <UncontrolledDropdown nav inNavbar>
        {/* <DropdownToggle nav caret>
          New
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem>Project</DropdownItem>
          <DropdownItem>User</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>
            Message <Badge color="primary">10</Badge>
          </DropdownItem>
        </DropdownMenu> */}
      </UncontrolledDropdown>
      <ClientNotification></ClientNotification>
      {/* <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav>
          <Avatar size="small" color="blue" initials="JS" />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem>Option 1</DropdownItem>
          <DropdownItem>Option 2</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Reset</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown> */}
    </React.Fragment>
  );
}
