
import React, { Component } from 'react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import {Link} from 'react-router-dom';
import axios from 'axios';

export default class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name:'',
            business_name:'',
            business_nature:'',     
            email:'',
            password:'',
            confpassword:'',
            contact_number:''
        }
        this.signup = this.signup.bind(this);
    }

    signup = (e) =>{
        e.preventDefault();
        var token = document.head.querySelector('meta[name="csrf-token"]');
        var data = {
            name:this.state.name,
            business_name:this.state.business_name,
            business_nature:this.state.business_nature,
            contact_number:this.state.contact_number, 
            email:this.state.email,
            password:this.state.password
        }
        var headers = {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': token.content,
            'X-Requested-With': 'XMLHttpRequest',
            "Access-Control-Allow-Origin": "*",
        }
        axios.post('/api/client/register',data,headers
        ).then( (res) => {
            if(res.data.token){
                localStorage.setItem('client_token',res.data.token);
                this.props.history.push("/dashboard");
            }else{

            }
            console.log(res);
        }).catch(error => {
            console.log(error.response.data.errors);
            if(error.status==422){
                alert(error);
            }
            //console.log(err.response);
        })
    }
    render(){
        return(
            <Container className="signup-container d-flex align-items-center justify-content-center">
                <Row>
                <Col className="signup-form text-center">
                    <img src="/images/app-logo.png" className='app-logo'/>
                    <Form
                        onSubmit={this.signup}
                    >
                    <FormGroup>
                        <Label style={{padding:0}} for="name">Name</Label>
                        <Input 
                            type="text" 
                            name="name" 
                            id="name" 
                            onChange = {(text) => this.setState({name:text.target.value})}
                            value={this.state.name}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{padding:0}} for="business_name">Business Name</Label>
                        <Input 
                            type="text" 
                            name="business_name" 
                            id="business_name" 
                            onChange = {(text) => this.setState({business_name:text.target.value})}
                            value={this.state.business_name}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{padding:0}} for="business_nature">Business Nature</Label>
                        <Input 
                            type="text" 
                            name="business_nature" 
                            id="business_nature" 
                            onChange = {(text) => this.setState({business_nature:text.target.value})}
                            value={this.state.business_nature}
                            required
                        />
                    </FormGroup>    
                    <FormGroup>
                        <Label style={{padding:0}} for="email">Email</Label>
                        <Input 
                            type="email" 
                            name="email" 
                            id="email" 
                            onChange = {(text) => this.setState({email:text.target.value})}
                            value={this.state.email}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{padding:0}} for="email">Contact Number</Label>
                        <Input 
                            type="number" 
                            name="contact_number" 
                            id="contact_number" 
                            onChange = {(num) => this.setState({contact_number:num.target.value})}
                            value={this.state.contact_number}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{padding:0}} for="password">Password</Label>
                        <Input 
                            type="password" 
                            name="password" 
                            id="password" 
                            onChange = {(text) => this.setState({password:text.target.value})}
                            value={this.state.password}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label style={{padding:0}} for="password">Confirm Password</Label>
                        <Input 
                            type="password" 
                            name="confpassword" 
                            id="confpassword" 
                            onChange = {(text) => this.setState({confpassword:text.target.value})}
                            value={this.state.confpassword}
                            required
                        />
                    </FormGroup>
                    <Button>Sign Up</Button>
                    <Link to="/login">Log In</Link>
                    </Form>
                </Col>
                </Row>
            </Container>
        );
    }
}
