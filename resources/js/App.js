import React from 'react';
import {
	BrowserRouter,
	Route,
	Switch,
	Link,
	Redirect
} from 'react-router-dom';
import DashboardLayout from '../views/layout/Dashboard';
import LoginLayout from '../views/pages/auth/Login';
import SignupLayout from '../views/pages/auth/Signup';
import LogoutLayout from '../views/pages/auth/Logout';
import PrivacyPolicy from '../views/pages/terms/PrivacyPolicy';
import TermsOfUse from '../views/pages/terms/TermsOfUse';
import { URL } from '../views/config/route';
import { getToken } from '../views/storage';
//import Auth from '../views/functions/Authenticate';

export default function App() {
	return (
		<BrowserRouter basename={URL.basePath}>
		{/* <BrowserRouter> */}
			<Switch>
				<AuthRoutes path={URL.login} component={LoginLayout} />
				<AuthRoutes path={URL.signup} component={SignupLayout} />
				<AuthRoutes path={URL.termsAndCondition.privacyPolicy} component={PrivacyPolicy} />
				<AuthRoutes path={URL.termsAndCondition.termsOfUse} component={TermsOfUse} />
				<Route path={URL.logout} component={LogoutLayout} />
				<PrivateRoute component={DashboardLayout} />
			</Switch>
		</BrowserRouter>
	);
}

const PrivateRoute = ({ component: Component, ...rest }) => (
	<Route {...rest} render={(props) => (
	  	getToken() !== null
		? <Component {...props} />
		: <Redirect to={{
			pathname: URL.login
		  }} />
	)} />
);

const AuthRoutes = ({ component: Component, ...rest }) => (
	<Route
		{...rest}
		render={(props) => (
			getToken() !== null
			? <Redirect to={{pathname: URL.dashboard}} />
			: <Component {...props} />
		)}
	/>
);
