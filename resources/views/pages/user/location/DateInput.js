import React, { Component } from 'react';
import {
    Label,
    Col,
    Row
} from 'reactstrap';

export default class DateInput extends Component {
    changeInput = (dateName) => (e) => {
        var { date } = this.props;
        date[dateName] = e.target.value;
        this.props.mainSetState({date});
    }

    render() {
        return (
            <Row>
                <Col md="6" className="pb-2">
                    <Label for="exampleSelect">Date From:</Label>
                    <input
                        type="date"
                        className="form-control"
                        onChange={this.changeInput('from')}
                        max={this.props.date.to}
                    />
                </Col>
                
                <Col md="6" className="pb-2">
                    <Label for="exampleSelect">Date To:</Label>
                    <input
                        type="date"
                        className="form-control"
                        onChange={this.changeInput('to')}
                        min={this.props.date.from}
                    />
                </Col>
            </Row>
        )
    }
}