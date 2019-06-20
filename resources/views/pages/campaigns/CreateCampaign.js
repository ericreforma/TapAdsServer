import React, { Component } from 'react';

import {
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    InputGroup,
    InputGroupAddon
} from 'reactstrap';

export default class CreateCampainpage extends Component {
  constructor(props) {
    super(props);

    this.state = {
        name: '',
        description: '',
        location: '',
        slots: '',
        pay_additional: 0,
        pay_additional_km: 0,
        pay_basic: 0,
        vehicle_type: 0,
        facebook: true,
        twitter: false
    };
  }

  render() {
    return (
        <div className="create-campaign-form">
            <Card>
                <CardHeader>
                    <h2>Create Campaign Form</h2>
                </CardHeader>
                <CardBody>
                    <Form>
                        <FormGroup>
                            <Label for="name">Campaign Name</Label>
                            <Input
                                type="text"
                                name="name"
                                id="name"
                                onChange = {(text) => this.setState({name:text.target.value})}
                                value={this.state.email}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label for="description">Campaign Description</Label>
                            <Input
                                type="textarea"
                                name="description"
                                id="description"
                                onChange = {(text) => this.setState({description:text.target.value})}
                                value={this.state.description}
                                required
                            />
                        </FormGroup>
                        <Row>
                            <Col md={4} sm={12}>
                                <FormGroup>
                                    <Label for="description">Location</Label>
                                    <Input
                                        type="text"
                                        name="location"
                                        id="location"
                                        onChange = {(text) => this.setState({location:text.target.value})}
                                        value={this.state.location}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={4} sm={12}>
                                <FormGroup>
                                    <Label for="vehicle_type">Vehicle Type</Label>
                                    <Input
                                        type="select"
                                        name="vehicle_type"
                                        id="vehicle_type"
                                        onChange = {(text) => this.setState({vehicle_type:text.target.value})}
                                        value={this.state.vehicle_type}
                                        required
                                    >
                                        <option value={0}>Private</option>
                                        <option value={1}>Public</option>
                                        <option value={2}>Mixed</option>
                                    </Input>
                                </FormGroup>
                            </Col>
                            <Col md={4} sm={12}>
                                <FormGroup>
                                    <Label for="slots">Slots</Label>
                                    <Input
                                        type="number"
                                        name="slots"
                                        id="slots"
                                        onChange = {(text) => this.setState({slots:text.target.value})}
                                        value={this.state.slots}
                                        required
                                    />
                                </FormGroup>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6} sm={12}>
                                <FormGroup>
                                    <Label for="pay_additional">Additional Payment Price</Label>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">‎₱</InputGroupAddon>
                                        <Input
                                            type="number"
                                            name="pay_additional"
                                            id="pay_additional"
                                            onChange = {(text) => this.setState({pay_additional:text.target.value})}
                                            value={this.state.pay_additional}
                                            required
                                        />
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                            <Col md={6} sm={12}>
                                <FormGroup>
                                    <Label for="pay_additional_km">Additional Payment Distance</Label>
                                    <InputGroup>
                                        <Input
                                            type="number"
                                            name="pay_additional_km"
                                            id="pay_additional_km"
                                            onChange = {(text) => this.setState({pay_additional_km:text.target.value})}
                                            value={this.state.pay_additional_km}
                                            required
                                        />
                                        <InputGroupAddon addonType="append">‎km</InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                            </Col>
                        </Row>
                        <FormGroup>
                                <Label for="pay_basic">Basic Payment</Label>
                                <InputGroup>
                                    <InputGroupAddon addonType="prepend">‎₱</InputGroupAddon>
                                    <Input
                                        type="number"
                                        name="pay_basic"
                                        id="pay_basic"
                                        onChange = {(text) => this.setState({pay_basic:text.target.value})}
                                        value={this.state.pay_basic}
                                        required
                                    />
                                </InputGroup>
                        </FormGroup>
                        <Button>Create</Button>
                    </Form>
                </CardBody>
            </Card>
        </div>
    );
  }
}
