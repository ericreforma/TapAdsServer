import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import {
  Button,
  Badge,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';
import {
  Header,
  SidebarNav,
  Footer,
  PageContent,
  Avatar,
  PageAlert,
  Page
} from '../components';
import nav from '../nav';
import routes from '../route';
import ContextProviders from '../components/utilities/ContextProviders';

//firebase
import { initializeFirebase } from '../firebase';

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

      currentLocation: '',
      newMessage: 0
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
    this.locationUpdated(this.props.location.pathname);

    this.unlisten = this.props.history.listen(location =>
      this.locationUpdated(location.pathname)
    );

    initializeFirebase();
  }

  locationUpdated = currentLocation => {
    this.setState({currentLocation});
    const date = new Date();
    const millis = date.getTime();
    console.log(millis);
    this.setState({ newMessage: millis });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    this.unlisten();
  }

  toggleSideCollapse = () => {
    this.setState(prevState => ({ sidebarCollapsed: !prevState.sidebarCollapsed }));
  };

  render() {
    const { sidebarCollapsed } = this.state;
    const sidebarCollapsedClass = sidebarCollapsed ? 'side-menu-collapsed' : '';
    return (
      <ContextProviders>
        <div className={`app ${sidebarCollapsedClass}`}>
          <PageAlert />
          <div className="app-body">
            <SidebarNav
              nav={nav}
              // logo={Logo}
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
                      component={props =>
                        <page.component
                          {...props}
                        />
                      }
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
          </Footer>
        </div>
      </ContextProviders>
    );
  }
}

function HeaderNav() {
  return (
    <React.Fragment>
      <NavItem>
        <form className="form-inline">
          <input className="form-control mr-sm-1" type="search" placeholder="Search" aria-label="Search" />
          <Button type="submit" className="d-none d-sm-block">
            <i className="fa fa-search" />
          </Button>
        </form>
      </NavItem>
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav caret>
          New
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem>Project</DropdownItem>
          <DropdownItem>User</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>
            Message <Badge color="primary">10</Badge>
          </DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
      <UncontrolledDropdown nav inNavbar>
        <DropdownToggle nav>
          <Avatar size="small" color="blue" initials="JS" />
        </DropdownToggle>
        <DropdownMenu right>
          <DropdownItem>Option 1</DropdownItem>
          <DropdownItem>Option 2</DropdownItem>
          <DropdownItem divider />
          <DropdownItem>Reset</DropdownItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    </React.Fragment>
  );
}