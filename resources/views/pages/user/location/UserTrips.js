import React, { Component } from 'react';
import {
    Table
} from 'reactstrap';

import { userTripDateFormat } from '../../../utils/dateUserTrip';

export default class UserTrips extends Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: [true]
        };
    }

    componentDidUpdate = (prevProps) => {
        var { userTrips } = this.props,
            checked = [true];

        if(prevProps.userTrips.trips !== userTrips.trips) {
            if(userTrips.trips.length !== 0) {
                checked = Array(userTrips.trips.length + 1).fill(true);
            }

            this.setState({checked});
        }
    }

    checkOnChange = (position, id, index) => (e) => {
        var { checked } = this.state;
        
        if(position) {
            checked[0] = !checked[0];
            checked = Array(checked.length).fill(checked[0] ? true : false);
        } else {
            checked[0] = false;
			checked[index + 1] = !checked[index + 1];
			
			var remainderArray = checked.slice(1),
				checkedValue = 0;

			for(var x = 0; x < checked.length; x++) {
				if(checked[x]) checkedValue++;
			}
				
			checked[0] = checkedValue == remainderArray.length ? true : checked[0];
        }

		this.setState({checked});
		this.props.replotHeatMap(checked);
	}

    render() {
        const { userTrips } = this.props,
            { checked } = this.state;

        return (
            <Table hover>
                <thead className="text-center">
                    <tr>
                        <th rowSpan="2">#</th>
                        <th colSpan="2" className="start-date">Start</th>
                        <th colSpan="2" className="end-date">End</th>
						<th colSpan="2" className="traveled">Traveled (Km)</th>
                        <th rowSpan="2" onClick={this.checkOnChange(true)}>
                            <input
                                type="checkbox"
                                checked={checked[0]}
                                onChange={this.checkOnChange(true)}
                            />
                        </th>
                    </tr>

                    <tr>
                        {/* <th>Address</th> */}
                        <th>Date</th>
                        <th>Lat / Long</th>
                        {/* <th>Address</th> */}
                        <th>Date</th>
                        <th>Lat / Long</th>
						<th>Campaign</th>
						<th>Trip</th>
                    </tr>
                </thead>
                <tbody>
                    {userTrips.trips.length !== 0 ? (
                        userTrips.trips.map((t, tIdx) =>
                            <tr key={tIdx} onClick={this.checkOnChange(false, t.id, tIdx)}>
                                <td className="text-center">{tIdx + 1}</td>
                                {/* <td>{t.location_start_address}</td> */}
                                <td>{t.started ? userTripDateFormat(t.started) : ''}</td>
                                <td>{t.location_start_lat && t.location_start_long ? `${t.location_start_lat} / ${t.location_start_long}` : null}</td>
                                {/* <td>{t.location_end_address}</td> */}
                                <td>{t.ended ? userTripDateFormat(t.ended) : ''}</td>
                                <td>{t.location_end_lat && t.location_end_long ? `${t.location_end_lat} / ${t.location_end_long}` : null}</td>
                                <td>{t.campaign_traveled}</td>
								<td>{t.trip_traveled}</td>
								<td className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={checked[tIdx + 1]}
                                        onChange={this.checkOnChange(false, t.id, tIdx)}
                                    />
                                </td>
                            </tr>
                        )
                    ) : (
                        <tr>
                            <td colSpan="2" className="text-center">
                                <small className="text-muted">
                                    <i>-- No trips available --</i>
                                </small>
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        )
    }
}
