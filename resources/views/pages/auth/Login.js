import React, { Component } from 'react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, InputGroup } from 'reactstrap';
import {Link} from 'react-router-dom';
import { RawHttpRequest } from '../../services/http';
import { URL, IMAGES } from '../../config';
import { storeToken, storeUniqueId } from '../../storage';
import { FirebaseController } from '../../controllers';

export default class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email:'',
			password:'',
			error:'',
			token: ''
		}
		this.login = this.login.bind(this);
	}
	
	login = (e) =>{
		e.preventDefault();
		RawHttpRequest.post(URL.api.auth.login, {
			email:this.state.email,
			password:this.state.password
		}).then(res => {
			if(res.data.error){
				this.setState({error:'Invalid Email or Password'});
			} else {
				const { token } = res.data;
				this.setState({token});
				this.firebaseInit();
			}
		}).catch((err) => {
			console.log(err);
			this.setState({error:'Invalid Email or Password!'});
			console.log(err.response);
		})
	}

	firebaseInit = () => {
		FirebaseController.init(async() => {
			const {token} = this.state;
			storeToken(token);
			window.location.reload();
		}, () => {
			console.log('Firebase error');
			setTimeout(() => this.firebaseInit(), 1500);
		});
	}

	render(){
		return(
			<Container className="login-container d-flex align-items-center justify-content-center">
				<Row>
					<Col className="login-form text-center">
					{/* <h1>Tap Ads Server</h1> */}
					<img src={IMAGES.logo} className='app-logo'/>
					<Form onSubmit={this.login}>
						<FormGroup>
							<Label style={{padding:0}} for="email">Email Address</Label>
							<InputGroup>
								<span className="input-group-text"><i className="far fa-envelope"></i></span>
								<Input
								type="email"
								name="email"
								id="email"
								onChange = {(text) => this.setState({email:text.target.value})}
								value={this.state.email}
								required
								/>
							</InputGroup>
						</FormGroup>
						<FormGroup>
							<Label style={{padding:0}} for="password">Password</Label>
							<InputGroup>
								<span className="input-group-text"><i className="fas fa-lock"></i></span>
								<Input
								type="password"
								name="password"
								id="password"
								onChange = {(text) => this.setState({password:text.target.value})}
								value={this.state.password}
								required
								/>
							</InputGroup>
						</FormGroup>
						<span className="error">{this.state.error}</span>
						<Button>Log In</Button>
						<Link to={URL.signup}>Sign Up</Link>
						</Form>
					</Col>
				</Row>
			</Container>
		);
	}
}
