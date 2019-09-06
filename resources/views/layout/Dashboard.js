import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { UncontrolledDropdown } from 'reactstrap';
import { Header, SidebarNav, Footer, PageContent, PageAlert, Page } from '../components';
import {IMAGES} from '../config/variable';
import nav from '../nav';
import routes from '../route';
import ContextProviders from '../components/utilities/ContextProviders';
import ClientNotification from '../functions/notifications/ClientNotification.js';

import { Socket } from '../services/websocket';
import { HttpRequest } from '../services/http';
import config from '../config';

const MOBILE_SIZE = 992;
const Logo = IMAGES.logoWhite;

export default class Dashboard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoggedIn:false,
			clientEmail:'',
			sidebarCollapsed: false,
			isMobile: window.innerWidth <= MOBILE_SIZE,
			nav: nav,
			messageNotif: 0,

			//chat state values
			initialData: false,
			socketFunctions: {
				socket: [],
				newMessage: {},
				updatedFunction: ''
			},
			messages: {
				users: [],
				nonConvoUsers: [],
			}
			//end chat state values
		};
	}

	websocketFunctions = {
		onlineUsers: (data) => {
			var { socketFunctions,
				messages } = this.state,
				{ users } = messages,
				onlineIDs = data.map(d => d.id);

			messages.users = users.map(u => {
				u.online = onlineIDs.indexOf(u.id) !== -1 ? true : false;
				return u;
			});

			socketFunctions.updatedFunction = 'online users';
			this.setState({messages, socketFunctions});
		},
		onlineUser: (data) => {
			var { messages,
				socketFunctions } = this.state,
				{ users } = messages,
				{ id } = data;

			messages.users = users.map(u => {
				if(u.id == id) {
					u.online = true;
				}
				return u;
			});

			socketFunctions.updatedFunction = 'online user';
			this.setState({messages, socketFunctions});
		},
		disconnectedUser: (data) => {
			var { socketFunctions,
				messages } = this.state,
				{ users } = messages,
				{ id } = data;

			messages.users = users.map(u => {
				if(u.id == id) {
					u.online = false;
				}
				return u;
			});
			socketFunctions.updatedFunction = 'disconnected user';
			this.setState({messages, socketFunctions});
		},
		newMessage: (data) => {
			var { socketFunctions } = this.state,
				{ pathname } = window.location;

			if(pathname.indexOf('messages') === -1) {
				var { nav,
					messages,
					messageNotif } = this.state,
					{ users } = messages,
					messageNotif = parseInt(messageNotif) + 1,
					{ chat } = data,
					{ user_id,
					message,
					created_at } = chat,
					index = users.map(u => u.id).indexOf(user_id),
					newMessages = users.splice(index, 1);

				newMessages[0].message = message;
				newMessages[0].sender = 0;
				newMessages[0].created_at = created_at;
                newMessages[0].notif = newMessages[0].notif ? newMessages[0].notif + 1 : 1;
				users.unshift(newMessages[0]);
				messages.users = users;

				nav.top = nav.top.map(n => {
					if(n.hasNotif) {
						n.notifCount = messageNotif;
					}

					return n;
				});

				this.setState({
					messageNotif,
					nav,
					users
				});
			} else {
				socketFunctions.newMessage = data;
				socketFunctions.updatedFunction = 'new message';
				this.setState({socketFunctions});
			}
		},
	}

	socketConnection = (socket) => {
		Socket.onConnect(socket, () => {
			console.log('connected');
		});
		Socket.getOnlineUsers(socket, data => this.websocketFunctions.onlineUsers(data));
		Socket.newOnlineUser(socket, data => this.websocketFunctions.onlineUser(data));
		Socket.disconnectedUser(socket, data => this.websocketFunctions.disconnectedUser(data));
		Socket.newMessage(socket, data => this.websocketFunctions.newMessage(data));
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
		
		var { socketFunctions } = this.state,
			socket = Socket.connect();

		socketFunctions.socket = socket;
		this.socketConnection(socket);
		this.setState({socketFunctions});
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.handleResize);
	}

	toggleSideCollapse = () => {
		this.setState(prevState => ({ sidebarCollapsed: !prevState.sidebarCollapsed }));
	};

	changeMessageNotifCount = (messageNotif) => {
		var { nav } = this.state;
		nav.top = nav.top.map(n => {
			if(n.hasNotif) {
				n.notifCount = messageNotif;
			}

			return n;
		});

		this.receivedWebsocket();
		this.setState({
			messageNotif,
			nav
		});
	}

	getMessageNotificationCount = () => {
		HttpRequest.get(config.api.getChat).then(response => {
			if(response.data.status == 'success') {
				var {users,
					nonConvoUsers } = response.data.message,
					{ messages } = this.state,
					initialData = true,
					messageNotif = users.filter(u => u.notif).map(u => u.notif).reduce((a, b) => a + b, 0);
				messages.users = users;
				messages.nonConvoUsers = nonConvoUsers;

				this.setState({messages, initialData, messageNotif});
				this.changeMessageNotifCount(messageNotif);
			}
		}).catch(error => {
			setTimeout(() => this.getMessageNotificationCount(), 1000);
			console.log(error);
		});
	}

	receivedWebsocket = () => {
		var {socketFunctions} = this.state;
		socketFunctions.updatedFunction = '';
		this.setState({socketFunctions});
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
											exact
											path={page.path}
											render={props =>
												<page.component
													{...props}
													changeMessageNotifCount={this.changeMessageNotifCount}
													receivedWebsocket={this.receivedWebsocket}
													websocket={{
														socketFunctions: this.state.socketFunctions,
														messages: this.state.messages,
														messageNotif: this.state.messageNotif,
														initialData: this.state.initialData
													}}
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
			<UncontrolledDropdown nav inNavbar></UncontrolledDropdown>
			<ClientNotification></ClientNotification>
		</React.Fragment>
	);
}
