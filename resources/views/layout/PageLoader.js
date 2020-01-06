import React, { Component } from 'react';
import { Loader } from '../components';

export default class PageLoader extends Component {
  render() {
    if(this.props.loading) {
			return <Loader type="puff" small={this.props.small} />;
    } else {
      return this.props.children;
    }
  }
}