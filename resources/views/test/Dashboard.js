import React, { Component } from 'react';
import { Route, Switch, NavLink } from 'react-router-dom';

export default class Dashboard extends Component {
    render() {
        return (
            <div>
                <h3>Main page</h3>

                <NavLink to="/" className="btn btn-secondary text-dark">Home</NavLink>
                <NavLink to="/about" className="btn btn-secondary text-dark">About</NavLink>

                <Switch>
                    <Route path="/" render={props => <Home />} />
                    <Route path="/about" render={props => <About />} />
                    <Route component={Error404} />
                </Switch>
            </div>
        )
    }
}

class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            test:'Home'
        }
    }

    onClickButton = (e) => {
        console.log('Home: ', this.state.test);
    }

    render() {
        return (
            <div>
                <span>this is about page</span>
                <button type="button" onClick={this.onClickButton}>Hey</button>
            </div>
        )
    }
}

class About extends Component {
    constructor(props) {
        super(props);

        this.state = {
            test:'About'
        }
    }

    onClickButton = (e) => {
        console.log('About: ', this.state.test);
    }

    render() {
        return (
            <div>
                <span>this is about page</span>
                <button type="button" onClick={this.onClickButton}>Hey</button>
            </div>
        )
    }
}

class Error404 extends Component {
    render() {
        return (
            <span>error 404</span>
        )
    }
}
