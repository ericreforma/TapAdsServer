import React, { Component } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Table,
} from 'reactstrap';

export default class CampaignList extends Component {
  render() {
    return (
      <div>
        <Card>
          <CardHeader>List</CardHeader>
          <CardBody>
            <Table striped>

              <thead>
                <tr>
                  <td>Campaign Name</td>
                  <td>Date</td>
                  <td>Location</td>
                  <td>Slots</td>
                </tr>
              </thead>

            </Table>
          </CardBody>
        </Card>

      </div>
    );
  }
}
