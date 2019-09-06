import React, { Component } from 'react';
import { 
    Label, 
    Input, 
    Card, 
    CardHeader, 
    CardBody, 
    Table,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Pagination,
    PaginationItem,
    PaginationLink 
} from 'reactstrap';
import { Loader } from '../../components';
import config from '../../config';
import PageAlertContext from '../../components/PageAlert/PageAlertContext';
import { Link } from 'react-router-dom';
import { IMAGES } from '../../config/variable';

import { HttpRequest } from '../../services/http';

export default class CampaignRequests extends Component {
    constructor(props){
        super(props);
        var cname = (this.props.state===undefined)?"All":(this.props.location.state.c_name === undefined || this.props.location.state.c_name === null)?"All":this.props.location.state.c_name;
        var rstatus = (this.props.state===undefined)?"All":(this.props.location.state.r_status  === undefined || this.props.location.state.r_status === null)?"All":this.props.location.state.r_status;
        this.state = {
            loader: false,
            dropdownOpen:[],
            campaigns:[],
            status:[],
            Requests:[],
            showRequests:[],
            c_name: cname,
            r_status: rstatus,
            tableRowLength:7,
            currentPage: 0,
            paginationLength: 0,
            sortBy:{column:'timestamp',order:'desc'}
        }
        this.toggle = this.toggle.bind(this); 
    }
    componentWillMount(){
        this.getMyCampaignRequests();
    }
    getMyCampaignRequests = () => {
        HttpRequest.get(config.api.userRequests).then( (res) => {
            var dropdownOpenarr=Array(res.data.length).fill(false);
            var {campaigns,status} = this.state;
            res.data.map(campaign =>{
                if (campaigns.indexOf(campaign.campaign_name) === -1) {
                    campaigns.push(campaign.campaign_name)
                }
                if (status.indexOf(campaign.status) === -1) {
                    status.push(campaign.status)
                }
            });
            this.setState({
                Requests:res.data,
                showRequests:res.data,
                loader: false,
                dropdownOpen:dropdownOpenarr,
                campaigns,
                status,
                paginationLength: Math.ceil(dropdownOpenarr.length / this.state.tableRowLength)
            },()=>{
                this.ChangeCampaignType(this.state.c_name);
                this.ChangeRequestType(this.state.r_status);
            });

        }).catch(error => {
			setTimeout(this.getMyCampaignRequests, 5000);
        });
    }
    formatDate = (dates, timeInclude, datestring) => {
        var d = dates.split(' ')[0],
            time = dates.split(' ')[1],
            year = d.split('-')[0],
            month = parseInt(d.split('-')[1]),
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
            return months[month-1] + '. ' + date + ', ' + year + ' - ' +time ;
        } else {
            return months[month-1] + '. ' + date + ', ' + year;
        }
    }
    toggle = (index) => () => {
        var {dropdownOpen} = this.state;
        var initialstate = dropdownOpen[index];
        dropdownOpen = Array(this.state.Requests.length).fill(false);
        dropdownOpen[index] = initialstate? false : true ;
        this.setState({dropdownOpen});
    }
    ChangeStatus = (cid,uid,status) => () => {
        var s = (status=='Pending')?'0':(status=='Approved')?'1':'2';
        var formdata={
            campaign_id:cid,
            user_id:uid,
            status:s
        }
        this.setState({loader:true});
        
        HttpRequest.post(config.api.userRequests,formdata).then( (res) => {
           console.log(res.data.status);
           this.getMyCampaignRequests();
           this.PageAlert(res.data.status,res.data.message,'');
           this.setState({loader:false});
           alert('Success');
        }).catch(error => {
            alert('Error Occured. Please try again later.');
            console.log(error);
            this.setState({loader:false});
            this.PageAlert('Server Error','','danger');
        });
       
    }
    ChangeCampaignType = (campaign) => {
        var {showRequests,Requests,r_status,sortBy} = this.state,
            CampaignName = campaign;

        sortBy.column = 'unset';
        sortBy.order = 'unset';
        showRequests = Requests;
        showRequests = (CampaignName!='All')?showRequests.filter(m => m.campaign_name.toLowerCase() == CampaignName.toLowerCase()):showRequests;
        showRequests = (r_status!='All')?showRequests.filter(m => m.status==r_status):showRequests;

        this.setState({
            showRequests,
            c_name:CampaignName,
            sortBy,
            currentPage: 0,
            paginationLength: Math.ceil(showRequests.length / this.state.tableRowLength)
        });

    }
    ChangeRequestType = (request) => {
        var {showRequests,Requests,c_name,sortBy} = this.state,
            RequestType = request;
            sortBy.column = 'unset';
            sortBy.order = 'unset';

        showRequests = Requests;
        showRequests = (c_name!='All')?showRequests.filter(m => m.campaign_name==c_name):showRequests;   
        showRequests = (RequestType!='All')?showRequests.filter(m => m.status==RequestType):showRequests;

        this.setState({
            showRequests,
            r_status: RequestType,
            sortBy,
            currentPage: 0,
            paginationLength: Math.ceil(showRequests.length / this.state.tableRowLength)
        });

    }
    PageAlert = (message,status,type) => {
        type = (status=='success')?'success':'error';
        return <PageAlertContext.Consumer>
            { context =>
                context.setAlert(
                    status+' '+message,
                    type,
                )
            }
        </PageAlertContext.Consumer>
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
    ChangeSortType = (sorttype) => {
        var {sortBy} = this.state;
        if(sortBy.column == sorttype){
            sortBy.order = (sortBy.order=='asc')?'desc':'asc';
        }else{
            sortBy.column = sorttype;
            sortBy.order = 'desc';
        }
        this.setState({
            sortBy
        },
        this.sortFunction()
        );
    }
    sortFunction = () =>{
        var {showRequests,sortBy} = this.state;
        var column = sortBy.column;
        var order = sortBy.order;
        if(column == 'user'){
            showRequests.sort((a,b) => {
                if(order=='asc'){
                    if (a.user_name < b.user_name) return -1;
                    if (a.user_name > b.user_name) return 1;
                }else{
                    if (a.user_name > b.user_name) return -1;
                    if (a.user_name < b.user_name) return 1;
                } 
            })
        }else  if(column == 'campaign'){
            showRequests.sort((a,b) => {
                if(order=='asc'){
                    if (a.campaign_name < b.campaign_name) return -1;
                    if (a.campaign_name > b.campaign_name) return 1;
                }else{
                    if (a.campaign_name > b.campaign_name) return -1;
                    if (a.campaign_name < b.campaign_name) return 1;
                } 
            })
        }else  if(column== 'request'){
            showRequests.sort((a,b) => {
                if(order=='asc'){
                    if (a.status < b.status) return -1;
                    if (a.status > b.status) return 1;
                }else{
                    if (a.status > b.status) return -1;
                    if (a.status < b.status) return 1;
                } 
            })
        }else{//timestamp
            showRequests.sort((a,b) => {
                a = Date.parse(a.timestamp);
                b = Date.parse(b.timestamp);
                if(order=='asc'){
                    return a - b;
                }else{
                    return b - a;
                } 
            })
        }
        this.setState({
            showRequests
        });
    }
    render(){
        if(this.state.loader) {
            return <Loader type="puff" />;
		}else{
            return (
                <Card className="campaign-requests_card">
                    <CardHeader>
                        <Label for="CampaignName">Select Campaign</Label>
                        <Input
                            type="select"
                            name="select"
                            id="CampaignName"
                            value={this.state.c_name}
                            onChange={ e => this.ChangeCampaignType(e.target.value)}
                        >
                        <option value="All">All Campaigns</option>
                        {this.state.campaigns.map((c,id) =>
                            <option key={id} value={c}>{c}</option>
                        )}
                        </Input>
                        <Label for="request">Request Type</Label>
                        <Input
                            type="select"
                            name="select"
                            id="request"
                            value={this.state.r_status}
                            onChange={ e => this.ChangeRequestType(e.target.value)}
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </Input>
                        </CardHeader>
                        <CardBody>
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th onClick={ e => this.ChangeSortType('user')}>
                                            User <i className={(this.state.sortBy.column=='user')?
                                            (this.state.sortBy.order=='asc')?"fa fa-chevron-up":"fa fa-chevron-down"
                                            :"fa fa-arrows-alt-v"}/>
                                        </th>
                                        <th  onClick={ e => this.ChangeSortType('campaign')}>Campaign <i className={(this.state.sortBy.column=='campaign')?
                                            (this.state.sortBy.order=='asc')?"fa fa-chevron-up":"fa fa-chevron-down"
                                            :"fa fa-arrows-alt-v"}/>
                                        </th>
                                        <th  onClick={e => this.ChangeSortType('request')}>Request Status <i className={(this.state.sortBy.column=='request')?
                                            (this.state.sortBy.order=='asc')?"fa fa-chevron-up":"fa fa-chevron-down"
                                            :"fa fa-arrows-alt-v"}/>
                                        </th>
                                        <th  onClick={e => this.ChangeSortType('timestamp')} >Timestamp <i className={(this.state.sortBy.column=='timestamp')?
                                            (this.state.sortBy.order=='asc')?"fa fa-chevron-up":"fa fa-chevron-down"
                                            :"fa fa-arrows-alt-v"}/>
                                        </th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { 
                                        this.state.showRequests.length!==0?(
                                            this.state.showRequests.map(
                                            (request,id) =>
                                                (   ((this.state.currentPage + 1) * this.state.tableRowLength) > id
                                                    && (this.state.currentPage * this.state.tableRowLength) <= id) ? (
                                                <tr key={id}>
                                                    <td title="View User">
                                                        <Link to={"/user/profile/"+request.user_id}>
                                                            <img className="img-round" src={request.user_image ? IMAGES.imgPath(request.user_image) : IMAGES.defaultAvatar} />
                                                            {request.user_name}
                                                        </Link>
                                                    </td>
                                                    <td title="View Campaign">
                                                        <Link to={"/campaign/dashboard/"+request.campaign_id}>
                                                            <img className="img-round" src={request.campaign_image ? IMAGES.imgPath(request.campaign_image) : IMAGES.galleryIcon} />
                                                            {request.campaign_name}
                                                        </Link>
                                                    </td>
                                                    <td>{request.status}</td>
                                                    <td>{this.formatDate(request.timestamp, false)}</td>
                                                    <td>
                                                        <div className="d-flex flex-column">
                                                            {/* <button className="btn btn-success" onClick={e => this.props.history.push(`/campaign/dashboard/${request.campaign_id}`)}>View Campaign</button>
                                                            <button className="btn btn-primary" onClick={e => this.props.history.push(`/user/profile/${request.user_id}`)}>View User</button> */}
                                                            <ButtonDropdown className="request-btns" isOpen={this.state.dropdownOpen[id]} toggle={this.toggle(id)}>
                                                                <DropdownToggle className="btn btn-warning" >
                                                                Change Status
                                                                </DropdownToggle>
                                                                <DropdownMenu>
                                                                    <DropdownItem disabled={request.status=="Pending"?true:false} onClick={this.ChangeStatus(request.campaign_id,request.user_id,'Pending')}>Pending</DropdownItem>
                                                                    <DropdownItem divider />
                                                                    <DropdownItem disabled={request.status=="Approved"?true:false} onClick={this.ChangeStatus(request.campaign_id,request.user_id,'Approved')}>Approved</DropdownItem>
                                                                    <DropdownItem divider />
                                                                    <DropdownItem disabled={request.status=="Rejected"?true:false} onClick={this.ChangeStatus(request.campaign_id,request.user_id,'Rejected')}>Rejected</DropdownItem>
                                                                </DropdownMenu>
                                                            </ButtonDropdown>
                                                        </div>
                                                    </td>
                                                </tr>
                                                ):null
                                            )
                                        )
                                        :
                                        (
                                            <tr>
                                                <td colSpan='5' className='text-center'>No Data Found.</td>
                                            </tr>
                                        )
                                    }
                                </tbody>
                            </Table>
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
                        </CardBody>
                </Card>
            );
        }
    }
}
