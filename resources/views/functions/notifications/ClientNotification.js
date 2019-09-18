import React, { Component } from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Badge } from 'reactstrap';
import { Loader } from '../../components';
import { Link } from 'react-router-dom';
import config from '../../config';
import { IMAGES } from '../../config/variable';
import { URL_ROUTES } from '../../config/route';

import { HttpRequest } from '../../services/http';

export default class ClientNotification extends Component {
    constructor(props){
        super(props);
		this.state = {
			loader: true,
            notifications:[],
            count:0,
            total:5
        }
        this.notifindex = [];
        this.notifexpand = this.notifexpand.bind(this);
	}
    componentWillMount(){
        this.getNotifications();
    }
    getNotifications = () => {
        HttpRequest.get(config.api.clientNotification).then( (res) => {
			this.setState({
				notifications:res.data
            });
            this.setState({
                count: this.state.notifications.length
            });
			this.setState({loader: false});
        }).catch(error => {
            // console.log(error);
			setTimeout(() => this.getNotifications(), 5000);
        });
    }
    formatDate = (dates, timeInclude) => {
        var today = new Date();
        var d = dates.split(' ')[0],
            time = dates.split(' ')[1],
            year = d.split('-')[0],
            month = parseInt(d.split('-')[1])-1,
            months = [
                'Jan', 'Feb', 'Mar', 'Apr',
                'May', 'Jun', 'Jul', 'Aug',
                'Sep', 'Oct', 'Nov', 'Dec'
            ],
            date = d.split('-')[2],
            hour = parseInt(time.split(':')[0]),
            min = time.split(':')[1],
            time = hour == 0 ? '12:' + min + ' AM' : (
                hour < 13 ? (hour.length < 10 ? '0' + hour.toString() : hour) + ':' + min + ' AM' : (
                    ((hour - 12) < 10 ? '0' + (hour - 12).toString() : (hour - 12)) + ':' + min + ' PM'
                )
            );
            
        var day = (today.getDate()==date && today.getMonth()==month && today.getFullYear()==year) ? 'Today': 
        (today.getMonth()==month && today.getFullYear()==year) ? ( (today.getDate() - date == 0) ? 'Yesterday':
        today.getDate() - date + 'Days ago') : months[month] +' '+ date;
        if(timeInclude) {
            return day + ' at ' + time ;
            //return months[month] + '. ' + date + ', ' + year + ' - ' +time ;
        } else {
            //return months[month] + '. ' + date + ', ' + year;
        }
    }
    notifexpand = () => {
        this.setState(
            { total : this.state.total+5 },
            () => this.notifindex[this.state.total-6].scrollIntoView({ behavior: "smooth" })
        );
    }
    render(){
        if(this.state.loader) {
            return (
                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav>
                        <i className="fa fa-bell" />
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem><Loader type="spin" small/></DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            );
		} else {
            return(
            <UncontrolledDropdown className="notifications-wrapper" nav inNavbar>
                <DropdownToggle nav>
                    <i className="fa fa-bell" />
                    {(this.state.count>0)?<Badge color="primary">{this.state.count}</Badge>:''}
                </DropdownToggle>
                <DropdownMenu right>
                    <div className="notif-board">
                    {this.state.notifications.length == 0 ? (
                        <div className="text-center">
                            <i><small className="text-muted">Hello! No notification for you :)</small></i>
                        </div>    
                    ) : (
                        <div>
                            {this.state.notifications.slice(0, this.state.total).map((notif,id) =>
                                <div key={id}  ref={(el) => this.notifindex[parseInt(id)] = el }>  
                                    <DropdownItem  tag={Link} to={{ pathname: '/campaign/requests/',
                                        state:{ r_status: 'Pending', c_name: notif.campaign_name}
                                    }}>
                                    <div className="notif-wrapper">
                                        <img src={notif.profile_picture ? `${URL_ROUTES.STORAGE_URL}/${notif.profile_picture}` : IMAGES.defaultAvatar}></img>
                                        <div className="notif-desc"><p><b>{notif.user_name}</b> is interested in your campaign: <b>{notif.campaign_name}</b><br/>{this.formatDate(notif.timestamp,true)}</p></div>
                                    </div>
                                    </DropdownItem>
                                    <DropdownItem divider></DropdownItem>
                                </div>
                            )}


                            {this.state.count>this.state.total ? (
                                <div>
                                    <DropdownItem divider></DropdownItem>
                                    <div className="notif-wrapper">
                                        <DropdownItem onClick={this.notifexpand} toggle={false} className="text-center">See More</DropdownItem>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )}
                    </div>
                </DropdownMenu>
            </UncontrolledDropdown>
            );
        }
    }
}