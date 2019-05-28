import React,{Component} from 'react';
import {Link} from 'react-router-dom';

export default class Authenticate extends Component {
    constructor(props){
        super(props);
        this.state={
            redirectToReferrer: false,
        }
    }
    /*authenticate = () =>{
        const token = localStorage.getItem('client_token');
        console.log(token);
        if(token){
            this.props.history.push("/dashboard");
        }else{
            this.props.history.push("/login");
        }
    }*/
    authenticate = () => {
        this.isAuthenticated = true
        setTimeout(cb, 100)
    }
    signout = (cb) = () => {
        this.isAuthenticated = false
        setTimeout(cb, 100)
    }
    render () {
        return(
            <Authenticate authenticate={this.authenticate} />
        );
    }
}

