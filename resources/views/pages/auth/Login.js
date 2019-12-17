import React, { Component } from 'react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, InputGroup } from 'reactstrap';
import {Link} from 'react-router-dom';
import { RawHttpRequest } from '../../services/http';
import { URL, IMAGES } from '../../config';
import { storeToken } from '../../storage';

export default class Login extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email:'',
			password:'',
			error:''
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
			}else{
				storeToken(res.data.token);
				window.location.reload();
			}
		}).catch((err) => {
			console.log(err);
			this.setState({error:'Invalid Email or Password!'});
			console.log(err.response);
		})
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
