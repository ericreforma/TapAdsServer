import React, { Component } from 'react';
import {
    Row,
    Col,
    Card,
    CardHeader,
    CardBody,
    Progress,
    Modal,
    ModalHeader,
    ModalBody,
    FormGroup,
    Input,
    Button,
    Pagination,
    PaginationItem,
    PaginationLink
} from 'reactstrap';
import { Doughnut, Line } from 'react-chartjs-2';
import axios from 'axios';
import { Loader } from '../../components';

import config from '../../config';

export default class CampaignDashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loaderShow: true,

            //icons
            vehicleClass: [
                '/images/icons/car_small_icon.png',
                '/images/icons/car_mid_icon.png',
                '/images/icons/car_large_icon.png',
                '/images/icons/motorcycle_icon.png'
            ],
            sortIcon: '/images/icons/sort_icon.png',
            chatIcon: '/images/icons/chat_icon.png',

            campaign: {},
            modalUserData: [],
            userData: [],
            geoLocation: [],
            totalUser: 0,

            // modal
            userModal: false,
            sorting: {
                name: false,
                distance: false,
            },
            userRateModal: false,
            currentUserID: 0,
            ratingOnMouseOver: 0,
            starRating: 0,
            commentValue: '',

            // modal pagination
            tableRowLength: 7,
            currentPage: 0,
            paginationLength: 0,
        };
    }

    componentWillMount = () => {
        const { id } = this.props.match.params;
        this.getCampaignData(id);
    }

    getCampaignData = (id) => {
        axios.get(config.api.campaignDashboard + id).then(response => {
            if(response.data.status == 'success') {
                var userData = [],
                    campaign = response.data.message.campaign,
                    basicPay = parseFloat(campaign.pay_basic),
                    basicPayKm = parseFloat(campaign.pay_basic_km),
                    addPay = parseFloat(campaign.pay_additional),
                    addPayKm = parseFloat(campaign.pay_additional_km),
                    userRating = response.data.message.userRating;

                userData = response.data.message.userData.map(user => {
                    var returnUser = user,
                        distance = parseFloat(user.distance_traveled),
                        totalCost = 0;
            
                    if(distance >= basicPayKm) {
                        var perKm = Math.floor(distance / addPayKm),
                            totalCost = (perKm * addPay) + basicPayKm;
                    }

                    var filteredRating = userRating.filter(rate => rate.user_id == user.user_id);
                    returnUser.rate = filteredRating.length !== 0 ? filteredRating[0].rate : null;
                    returnUser.totalCost = totalCost.toFixed(2);
                    return returnUser;
                });

                this.setState({
                    campaign: campaign,
                    userData: userData,
                    modalUserData: userData,
                    loaderShow: false,
                    geoLocation: response.data.message.geoLocation,
                    totalUser: response.data.message.totalUser,
                    paginationLength: Math.ceil(userData.length / this.state.tableRowLength),
                });
            } else {
                alert('Error occured please try again later');
                this.getCampaignData(id);
            }
        }).catch(error => {
            this.getCampaignData(id);
        });
    }

    // dashboard functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    userTotalCost = () => {
        var userData = this.state.userData,
            totalKm = 0,
            basicCost = 0,
            addCost = 0,
            basicPay = parseFloat(this.state.campaign.pay_basic),
            basicPayKm = parseFloat(this.state.campaign.pay_basic_km),
            addPay = parseFloat(this.state.campaign.pay_additional),
            addPayKm = parseFloat(this.state.campaign.pay_additional_km);

        userData.map(data => {
            var distance = parseFloat(data.distance_traveled);
            totalKm += distance;
            
            if(distance >= basicPayKm) {
                var perKm = Math.floor(distance / addPayKm);
                basicCost += basicPayKm;
                addCost += (perKm * addPay);
            }
        });

        return {
            km: Math.round(totalKm * 100) / 100,
            basicCost: Math.round(basicCost * 100) / 100,
            addCost: Math.round(addCost * 100) / 100,
            totalCost: Math.round((basicCost + addCost) * 100) / 100
        };
    }
    // end dashboard functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


    // modal functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    userModalToggle = () => {
        var {userData} = this.state;
        
        userData.sort((a, b) => { // ascending
            return parseFloat(a.id) - parseFloat(b.id);
        });

        this.setState({
            userModal: !this.state.userModal,
            sorting: {
                name: false,
                distance: false,
            },
            currentPage: 0,
            paginationLength: Math.ceil(this.state.userData.length / this.state.tableRowLength),
            modalUserData: userData,
            userData: userData
        });
    }

    paginationClick = (currentPage) => (e) => {
        this.setState({currentPage});
    }

    paginationNextPrev = (action) => (e) => {
        var currentPage = this.state.currentPage;

        if(action == 'next') {
            currentPage = currentPage == (this.state.paginationLength - 1) ? (this.state.paginationLength - 1) : currentPage + 1;
        } else if(action == 'previous') {
            currentPage = currentPage == 0 ? 0 : currentPage - 1;
        } else if(action == 'first') {
            currentPage = 0;
        } else if(action == 'last') {
            currentPage = this.state.paginationLength - 1;
        }

        this.setState({currentPage});
    }

    sortUserData = (sortName) => (e) => {
        var { modalUserData } = this.state;

        if(sortName == 'name') {
            if(!this.state.sorting.name || this.state.sorting.name == 'desc') {
                modalUserData.sort((a, b) => { // ascending
                    if(a.name < b.name) { return -1; }
                    if(a.name > b.name) { return 1; }
                    return 0;
                });
            } else {
                modalUserData.sort((a, b) => { // descending
                    if(a.name < b.name) { return 1; }
                    if(a.name > b.name) { return -1; }
                    return 0;
                });
            }

            this.setState({
                sorting: {
                    name: this.state.sorting.name ? (this.state.sorting.name == 'asc' ? 'desc' : 'asc') : 'asc',
                    distance: false,
                }
            });
        } else if(sortName == 'distance') {
            if(!this.state.sorting.distance || this.state.sorting.distance == 'desc') {
                modalUserData.sort((a, b) => { // ascending
                    return parseFloat(a.distance_traveled) - parseFloat(b.distance_traveled);
                });
            } else {
                modalUserData.sort((a, b) => { // descending
                    return parseFloat(b.distance_traveled) - parseFloat(a.distance_traveled);
                });
            }

            this.setState({
                sorting: {
                    name: false,
                    distance: this.state.sorting.distance ? (this.state.sorting.distance == 'asc' ? 'desc' : 'asc') : 'asc',
                }
            });
        }

        this.setState({modalUserData});
    }

    modalSearchInput = (text) => {
        var {
            userData,
            modalUserData } = this.state,
            searchValue = text.target.value;

        if(searchValue == '') {
            modalUserData = userData;
            var paginationLength = Math.ceil(this.state.userData.length / this.state.tableRowLength);
        } else {
            modalUserData = userData.filter(m => m.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1);
            var paginationLength = Math.ceil(modalUserData.length / this.state.tableRowLength);
        }
        
        this.setState({
            currentPage: 0,
            modalUserData: modalUserData,
            paginationLength: paginationLength
        });
    }

    userRateModalToggle = (uid) => {
        if(this.state.userModal) {
            this.userModalToggle();
        }

        this.setState({
            userRateModal: !this.state.userRateModal,
            currentUserID: uid,
            starRating: 0,
            commentValue: ''
        });
    }

    saveUserRating = (e) => {
        e.preventDefault();

        const {
            starRating,
            commentValue } = this.state,
            form = {
                rate: starRating,
                comment: commentValue,
                userId: this.state.currentUserID
            };

        var alertMessage = '',
            proceed = true;

        if(starRating == 0) {
            alertMessage = 'Rate user';
            proceed = false;
        }

        if(proceed) {
            axios.post(config.api.submitRateUser, form).then(response => {
                if(response.data.status == 'success') {
                    var userData = this.state.userData;

                    userData = userData.map(user => {
                        if(user.user_id == form.userId) {
                            user.rate = form.rate;
                        }
                        return user;
                    });

                    this.setState({
                        userData: userData,
                        modalUserData: userData
                    });
                }

                alert(response.data.message);
                this.userRateModalToggle();
            }).catch(error => {
                alert('Error occured try again later.');
                this.userRateModalToggle();
            });
        } else {
            alert(alertMessage);
        }
    }
     // end modal functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // addtional functions >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    reconstructDate = (dates, timeInclude) => {
        var d = dates.split(' ')[0],
            time = dates.split(' ')[1],
            year = d.split('-')[0],
            month = parseInt(d.split('-')[1]) - 1,
            date = d.split('-')[2],
            hour = parseInt(time.split(':')[0]),
            min = time.split(':')[1],
            months = [
                'JAN', 'FEB', 'MAR', 'APR',
                'MAY', 'JUN', 'JUL', 'AUG',
                'SEP', 'OCT', 'NOV', 'DEC'
            ],
            time = hour == 0 ? '12:' + min + ' AM' : (
                hour < 13 ? (hour.length < 10 ? '0' + hour.toString() : hour) + ':' + min + ' AM' : (
                    ((hour - 12) < 10 ? '0' + (hour - 12).toString() : (hour - 12)) + ':' + min + ' PM'
                )
            );
    
        if(timeInclude) {
            return time + ' - ' + months[month] + '. ' + date + ', ' + year;
        } else {
            return months[month] + '. ' + date + ', ' + year;
        }
    }

    numberWithCommas = (x) => {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    progressColor = (percentage) => {
        if(percentage <= 50) {
            return 'success';
        } else if(percentage <= 80) {
            return 'warning';
        } else {
            return 'danger';
        }
    }
    // end additional function >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    render() {
        const vehicleType = [
                'Private',
                'Public',
                'Mixed'
            ],
            stickerArea = [
                'Front',
                'Left',
                'Left - Front',
                'Left - Back',
                'Right',
                'Right - Front',
                'Right - Back',
                'Back',
                'Top'
            ],
            chartColors = {
                red: 'rgb(233, 30, 99)',
                danger: 'rgb(233, 30, 99)',
                dangerTransparent: 'rgba(233, 30, 99, .8)',
                orange: 'rgb(255, 159, 64)',
                yellow: 'rgb(255, 180, 0)',
                green: 'rgb(34, 182, 110)',
                blue: 'rgb(68, 159, 238)',
                primary: 'rgb(68, 159, 238)',
                primaryTransparent: 'rgba(68, 159, 238, .8)',
                purple: 'rgb(153, 102, 255)',
                grey: 'rgb(201, 203, 207)',
        
                primaryShade1: 'rgb(68, 159, 238)',
                primaryShade2: 'rgb(23, 139, 234)',
                primaryShade3: 'rgb(14, 117, 202)',
                primaryShade4: 'rgb(9, 85, 148)',
                primaryShade5: 'rgb(12, 70, 117)'
            },
            donutData = {
                labels: ['Q1', 'Q2', 'Q3'],
                datasets: [
                    {
                        data: [300, 50, 100],
                        backgroundColor: [
                        chartColors.primaryShade1,
                        chartColors.primaryShade2,
                        chartColors.primaryShade3
                        ],
                        hoverBackgroundColor: [
                        chartColors.primaryShade4,
                        chartColors.primaryShade4,
                        chartColors.primaryShade4
                        ]
                    }
                ]
            },
            line = {
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                    datasets: [
                        {
                            label: '# of Votes',
                            data: [3, 6, 4, 10, 8, 12],
                            borderColor: 'transparent',
                            backgroundColor: chartColors.primary,
                            pointBackgroundColor: 'rgba(0,0,0,0)',
                            pointBorderColor: 'rgba(0,0,0,0)',
                            borderWidth: 4
                        }
                    ]
                },
                options: {
                    scales: {
                        xAxes: [
                            {
                                display: false
                            }
                        ],
                        yAxes: [
                            {
                                display: false
                            }
                        ]
                    },
                    legend: {
                        display: false
                    },
                    tooltips: {
                        enabled: false
                    }
                }
            };
            
        if(this.state.loaderShow) {
            return (
                <Loader type="puff" />
            );
        } else {
            return (
                <div className="campaign-dashboard-section">

                    {/* user modal part */}
                    <Modal isOpen={this.state.userModal} toggle={this.userModalToggle} className="modal-xl">
                        <ModalHeader toggle={this.userModalToggle} className="modal-title-user-data">
                            <div className="h3">Users Data</div>
                            <Row>
                                <Col
                                    lg={6}
                                >
                                    <Input
                                        type="text"
                                        placeholder="Search user.."
                                        onChange={this.modalSearchInput}
                                    />
                                </Col>
                            </Row>
                        </ModalHeader>

                        <ModalBody>
                            <div style={{height: '700px'}}>
                                <table className="cds-campaign-table table-striped">
                                    <thead>
                                        <tr>
                                            <td></td>

                                            <td>
                                                <div className="d-flex align-items-center cds-sort-cursor" onClick={this.sortUserData('name')}>
                                                    <h5 className="mb-0">User Info</h5>
                                                    <img
                                                        className="cds-ct-sort-icons ml-2"
                                                        src={this.state.sortIcon}
                                                    />
                                                </div>
                                            </td>

                                            <td>
                                                <div className="d-flex align-items-center cds-sort-cursor" onClick={this.sortUserData('distance')}>
                                                    <h5 className="mb-0">Distance <small>(Km)</small></h5>
                                                    <img
                                                        className="cds-ct-sort-icons ml-2"
                                                        src={this.state.sortIcon}
                                                    />
                                                </div>
                                            </td>

                                            <td>
                                                <h5 className="mb-0">Completed <small>(min distance)</small></h5>
                                            </td>

                                            <td>
                                                <h5 className="mb-0">Total Cost <small>(PhP)</small></h5>
                                            </td>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {this.state.modalUserData.length !== 0 ? (
                                            this.state.modalUserData.map((user, index) =>
                                                (((this.state.currentPage + 1) * this.state.tableRowLength) > index
                                                    && (this.state.currentPage * this.state.tableRowLength) <= index) ? (
                                                    <tr key={user.id}>
                                                        <td align="center">
                                                            <img
                                                                className="cds-ct-user-image"
                                                                src={`/images/avatar${(index + 1) % 6 == 0 ? 6 : (index + 1) % 6}.jpeg`}
                                                            />
                                                        </td>

                                                        <td>
                                                            <span className="cds-ct-user-name">{user.name}</span>
                                                            {user.rate ? (
                                                                <div>
                                                                    {Array(5).fill('/images/icons/').map((star, starIndex) =>
                                                                        <img
                                                                            key={starIndex}
                                                                            className="cds-ct-user-rate"
                                                                            src={star + (starIndex < parseInt(user.rate) ? 'star_active.png' : 'star_inactive.png')}
                                                                        />
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <span
                                                                        className="cds-ct-user-rate-button text-primary"
                                                                        onClick={(e) => this.userRateModalToggle(user.user_id)}
                                                                    >Rate user</span>
                                                                </div>
                                                            )}
                                                            <span className="cds-ct-user-otherinfo text-muted">{user.email}</span>
                                                            <span className="cds-ct-user-otherinfo text-muted">{user.contact_number}</span>
                                                        </td>

                                                        <td>
                                                            {user.distance_traveled}
                                                        </td>

                                                        <td>
                                                            {user.completed == 1 ? (
                                                                <span className="text-success">Completed</span>
                                                            ) : (
                                                                <span className="text-danger">Not completed</span>
                                                            )}
                                                        </td>

                                                        <td>
                                                            {this.numberWithCommas(user.totalCost)}
                                                        </td>
                                                    </tr>
                                                ) : null   
                                            )
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    -- No user found --
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* pagination */}
                            <div className="p-3">
                                <Pagination aria-label="Page navigation example">
                                    <PaginationItem>
                                        <PaginationLink
                                            first
                                            href="javascript:void(0)"
                                            onClick={this.paginationNextPrev('first')}
                                        />
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationLink
                                            previous
                                            href="javascript:void(0)"
                                            onClick={this.paginationNextPrev('previous')}
                                        />
                                    </PaginationItem>

                                    {Array(this.state.paginationLength).fill(null).map((p, pIndex) =>
                                        ((pIndex - 1 == this.state.currentPage)
                                            || (pIndex == 2 && this.state.currentPage == 0)
                                            || (pIndex == (this.state.currentPage - 2) && this.state.currentPage == (this.state.paginationLength - 1))
                                            || (pIndex + 1 == this.state.currentPage)
                                            || (pIndex == this.state.currentPage)) ? (
                                            <PaginationItem active={this.state.currentPage == pIndex ? true : false} key={pIndex}>
                                                <PaginationLink href="javascript:void(0)" onClick={this.paginationClick(pIndex)}>{pIndex + 1}</PaginationLink>
                                            </PaginationItem>
                                        ) : null
                                    )}

                                    <PaginationItem>
                                        <PaginationLink
                                            next
                                            href="javascript:void(0)"
                                            onClick={this.paginationNextPrev('next')}
                                        />
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationLink
                                            last
                                            href="javascript:void(0)"
                                            onClick={this.paginationNextPrev('last')}
                                        />
                                    </PaginationItem>
                                </Pagination>
                            </div>
                        </ModalBody>
                    </Modal>

                    {/* rate user modal part */}
                    <Modal isOpen={this.state.userRateModal} toggle={(e) => this.userRateModalToggle(0)}>
                        <ModalHeader toggle={(e) => this.userRateModalToggle(0)}>
                            <div className="h3">Rate User</div>
                        </ModalHeader>

                        <ModalBody>
                            <div className="cds-ct-user-rating text-center">
                                {this.state.userData.filter(user => user.user_id == this.state.currentUserID).map((user, index) =>
                                    <div className="cds-ct-ur-border-bottom" key={user.id}>
                                        <Row className="align-items-center">
                                            <Col
                                                xl={5}
                                                className="text-center text-xl-center p-1"
                                            >
                                                <img
                                                    className="cds-ct-user-image"
                                                    src={`/images/avatar${(index + 1) % 6 == 0 ? 6 : (index + 1) % 6}.jpeg`}
                                                />
                                            </Col>
                                            
                                            <Col
                                                xl={7}
                                                className="text-center text-xl-left p-1"
                                            >
                                                <span className="cds-ct-user-name">{user.name}</span>
                                                <span className="cds-ct-user-otherinfo text-muted">{user.email}</span>
                                                <span className="cds-ct-user-otherinfo text-muted">{user.contact_number}</span>
                                            </Col>
                                        </Row>
                                    </div>
                                )}

                                <div className="mt-3">
                                    <FormGroup>
                                        <Row className="align-items-center">
                                            <Col
                                                xl={4}
                                                className="text-center text-xl-right pb-1"
                                            >
                                                <label className="text-muted mb-0">Rating</label>
                                            </Col>
                                            
                                            <Col
                                                xl={8}
                                                className="text-center text-xl-left pb-1"
                                            >
                                                <div>
                                                    {Array(5).fill('/images/icons/star.png').map((star, starIndex) =>
                                                        <img
                                                            key={starIndex}
                                                            className={"cds-ct-ur-star " + (this.state.starRating > starIndex ? 'bg-warning' : (this.state.ratingOnMouseOver > starIndex ? 'bg-warning' : 'bg-secondary'))}
                                                            src={star}
                                                            onClick={(e) => this.setState({starRating: starIndex + 1})}
                                                            onMouseOver={(e) => this.setState({ratingOnMouseOver: starIndex})}
                                                            onMouseOut={(e) => this.setState({ratingOnMouseOver: 0})}
                                                        />
                                                    )}
                                                </div>
                                            </Col>
                                        </Row>
                                    </FormGroup>

                                    <FormGroup>
                                        <Row>
                                            <Col
                                                xl={4}
                                                className="text-center text-xl-right pb-1"
                                            >
                                                <label className="text-muted mb-0 mt-1">Comment</label>
                                            </Col>
                                            
                                            <Col
                                                xl={7}
                                                className="text-center text-xl-left pb-1"
                                            >
                                                <Input
                                                    type="textarea"
                                                    className="cds-ct-user-textarea"
                                                    value={this.state.commentValue}
                                                    onChange={value => this.setState({commentValue: value.target.value})}
                                                />
                                            </Col>
                                        </Row>
                                    </FormGroup>

                                    <Row>
                                        <Col
                                            xl={{
                                                size: 8,
                                                order: 1,
                                                offset: 4
                                            }}
                                            className="text-center text-xl-left"
                                        >
                                            <Button
                                                size="sm"
                                                color="success"
                                                onClick={this.saveUserRating}
                                            >
                                                Submit
                                            </Button>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </ModalBody>
                    </Modal>

                    {/* campaign info */}
                    <Card>
                        <CardBody>
                            <Row className="pt-3 pr-3 pl-3">
                                <Col xl={6}>
                                    <div className="d-flex align-items-center">
                                        <img
                                            className="cds-campaign-image mr-3"
                                            src="/images/sample_campaign_img.png"
                                        />
                                        <div>
                                            <h2 className="cds-campaign-underline">
                                                {this.state.campaign.name}
                                            </h2>
                                            <small className="text-muted">{this.reconstructDate(this.state.campaign.created_at, false)}</small>
                                        </div>
                                    </div>

                                    <div className="mt-4 pr-2">
                                        <Card color="light">
                                            <CardBody>
                                                {this.state.campaign.description}
                                            </CardBody>
                                        </Card>
                                    </div>

                                    <hr />
                                </Col>

                                <Col
                                    xl={6}
                                >          
                                    {/* vehicle information */}
                                    <strong className="cds-card-header cds-campaign-underline">VEHICLE INFORMATION</strong>

                                    <Row className="mt-3">
                                        <Col
                                            xl={4}
                                        >
                                            <p className="text-muted">Type</p>
                                            <Card color="light" className="text-center">
                                                <CardBody>
                                                    <h4 className="mb-0">
                                                        {vehicleType[this.state.campaign.vehicle_type]}
                                                    </h4>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                        
                                        <Col
                                            xl={4}
                                        >
                                            <p className="text-muted">Classification</p>
                                            <Card color="light" className="text-center">
                                                <CardBody>
                                                    <img
                                                        style={{
                                                            height: 60,
                                                            width: 60
                                                        }}
                                                        src={this.state.vehicleClass[this.state.campaign.vehicle_classification]}
                                                    />
                                                </CardBody>
                                            </Card>
                                        </Col>
                                        
                                        <Col
                                            xl={4}
                                        >
                                            <p className="text-muted">Sticker Area</p>
                                            <Card color="light" className="text-center">
                                                <CardBody>
                                                    <h4 className="mb-0">
                                                        {stickerArea[this.state.campaign.vehicle_stickerArea]}
                                                    </h4>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>

                                    <hr />

                                    <Row className="mt-4">
                                        <Col xl={6}>
                                            <div className="cds-campaign-underline-blue">
                                                <strong className="cds-card-header">BASIC PAY</strong>
                                                <div className="h2 mt-3">
                                                    {'₱' + this.numberWithCommas(this.state.campaign.pay_basic)}
                                                </div>
                                                <small className="text-muted">in {this.state.campaign.pay_basic_km + 'km'}</small>
                                            </div>
                                        </Col>
                                        
                                        <Col xl={6}>
                                            <div className="cds-campaign-underline-blue">
                                                <strong className="cds-card-header">ADDITIONAL PAY</strong>
                                                <div className="h2 mt-3">
                                                    {'₱' + this.numberWithCommas(this.state.campaign.pay_additional)}
                                                </div>
                                                <small className="text-muted">per {this.state.campaign.pay_additional_km + 'km'}</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>

                    {/* costs and distance */}
                    <Card>
                        <CardBody>
                            <Button size="sm" className="float-right" onClick={this.userModalToggle}>
                                View
                            </Button>
                            <Row className="pt-3 pr-3 pl-3">
                                <Col
                                    xl={4}
                                >
                                    <div className="cds-campaign-underline-blue">
                                        <h5>
                                            Total Distance Travelled
                                        </h5>
                                        <div className="h2">
                                            {this.userTotalCost().km} km
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col
                                    xl={4}
                                >
                                    <div className="cds-campaign-underline-blue">
                                        <h5>
                                            Completed User Total Cost
                                        </h5>
                                        <div className="h2">
                                            ₱{this.numberWithCommas(this.userTotalCost().basicCost)}
                                        </div>
                                    </div>
                                </Col>
                                
                                <Col
                                    xl={4}
                                >
                                    <div className="cds-campaign-underline-blue">
                                        <h5>
                                            Additional Km Total Cost
                                        </h5>
                                        <div className="h2">
                                            ₱{this.numberWithCommas(this.userTotalCost().addCost)}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                    
                    {/* graph */}
                    <Row>
                        <Col md={8} sm={12}>
                            <Card>
                                <CardHeader>Traffic</CardHeader>
                                <CardBody>
                                    <div className="full-bleed">
                                        <Line
                                            data={line.data}
                                            width={2068}
                                            height={846}
                                            legend={{ display: false }}
                                            options={line.options}
                                        />
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>

                        <Col md={4} sm={12}>
                            <Card>
                                <CardHeader>Product Views</CardHeader>
                                <CardBody>
                                    <Doughnut
                                        data={donutData}
                                        width={908}
                                        height={768}
                                        legend={{ display: false }}
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>

                    {/* campaign overview */}
                    <Row>
                        <Col
                            xl={4}
                        >
                            <Card>
                                <CardBody>
                                    <h5>
                                        Interested Users
                                    </h5>
                                    <div className="h2 inline-block">
                                        {this.state.userData.length}
                                    </div>{' '}<small className="text-muted">out of {this.state.totalUser}</small>
                                    <Progress
                                        value={(this.state.userData.length / this.state.totalUser) * 100} color="success"
                                        color="info"
                                    />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col
                            xl={4}
                        >
                            <Card>
                                <CardBody>
                                    <h5>
                                        Slots Remaining
                                    </h5>
                                    <div className="h2 inline-block">
                                        {this.state.campaign.slots - this.state.userData.length}
                                    </div>{' '}<small className="text-muted">out of {this.state.campaign.slots}</small>
                                    <Progress
                                        value={(this.state.userData.length / this.state.campaign.slots) * 100}
                                        color={this.progressColor((this.state.userData.length / this.state.campaign.slots) * 100)}
                                    />
                                </CardBody>
                            </Card>
                        </Col>

                        <Col
                            xl={4}
                        >
                            <Card>
                                <CardBody>
                                    <h5>
                                        Completed Users
                                    </h5>
                                    <div className="h2 inline-block">
                                        {this.state.userData.filter(u => u.completed == 1).length}
                                    </div>{' '}<small className="text-muted">out of {this.state.userData.length}</small>
                                    <Progress
                                        value={(this.state.userData.filter(u => u.completed == 1).length / this.state.userData.length) * 100} color="success"
                                        color="primary"
                                    />
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </div>
            );
        }
    }
}