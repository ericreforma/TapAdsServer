import React from 'react';
import { BrowserRouter, Route, Switch, Link, Redirect } from 'react-router-dom';
import DashboardLayout from '../views/layout/Dashboard';
import LoginLayout from '../views/pages/Login';
import SignupLayout from '../views/pages/Signup';
//import Auth from '../views/functions/Authenticate';

export default function App() {
	return (
		<BrowserRouter>
			<Switch>
				<Route path="/login" component={LoginLayout} />
				<Route path="/signup" component={SignupLayout} />
				<Route component={DashboardLayout} />
				{/*<PrivateRoute path="/dashboard" component={DashboardLayout} />*/}
			</Switch>
		</BrowserRouter>
	);
}
{/*const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route {...rest} render={(props) => (
	  	Auth.isAuthenticated === true
		? <Component {...props} />
		: <Redirect to={{
			pathname: '/login',
			state: { from: props.location }
		  }} />
	)} />
		)*/}
