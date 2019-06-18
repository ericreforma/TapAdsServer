import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';

export default class Login extends Component {
  render(){
    return(
    <Container style={styles.container}>
      <Row>
        <Col sm="12" className="text-center">
        < h1>Tap Ads Server</h1>
        </Col>
      </Row>
    </Container>
    );
  }
}
const styles = {
  container:{
    height:'100%'
  }
}
