import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import DashboardLayout from '../views/layout/Dashboard';
import LoginLayout from '../views/pages/auth/Login';
import SignupLayout from '../views/pages/auth/Signup';
//import Auth from '../views/functions/Authenticate';

export default function App() {
	return (
		/* <BrowserRouter basename={"/tapads/public"}> */
		<BrowserRouter>
			<Switch>
				<Route path={`/login`} component={LoginLayout} />
				<Route path={`/signup`} component={SignupLayout} />
				{/* <Route component={DashboardLayout} /> */}
				<PrivateRoute component={DashboardLayout} />
			</Switch>
		</BrowserRouter>
	);
}
const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route {...rest} render={(props) => (
	  	localStorage.getItem('client_token') !== null
		? <Component {...props} />
		: <Redirect to={{
			pathname: '/login'
		  }} />
	)} />
)
