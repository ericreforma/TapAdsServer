import React, { Component } from 'react';
import {
    FormGroup,
    Table,
    Pagination,
    PaginationItem,
    PaginationLink
} from 'reactstrap';

export default class UserList extends Component {
    checkUserLength = () => {
        var { users,
            activeCampaign } = this.props;

        return users.filter(u => u.campaign_id == activeCampaign).length !== 0 ? true : false;
    }

    render() {
        var { pagination,
            mainSetState,
            actionChoice,
            users,
            activeCampaign,
            activeUserId } = this.props;

        return (
            <div className="ulc-user-list">
                <FormGroup className="p-2">
                    <div className="d-flex align-items-center justify-content-center">
                        <span
                            className="mr-3"
                            style={{
                                borderBottom: '3px solid #f0ae48'
                            }}
                        >All User</span>
                        <label className="switch">
                            <input
                                type="checkbox"
                                onChange={e => {
                                    mainSetState({actionChoice: e.target.checked});
                                    mainSetState({activeUserId: false});
                                }}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span
                            className="ml-3"
                            style={{
                                borderBottom: '3px solid #37abb4'
                            }}
                        >Individual User</span>
                    </div>
                </FormGroup>
            
                {actionChoice ? (
                    <FormGroup className="p-2">
                        <div className="ulc-ul-table">
                            <Table hover>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Distance (Km)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.checkUserLength() ? (
                                        users.filter(u => u.campaign_id == activeCampaign).map((u, uIdx) =>
                                            pagination.pageLength * pagination.currPage <= uIdx && pagination.pageLength * (pagination.currPage + 1) > uIdx ? (
                                                <tr
                                                    key={uIdx}
                                                    onClick={e => mainSetState({activeUserId: u.id})}
                                                    className={u.id == activeUserId ? 'tr-active' : ''}
                                                >
                                                    <td>{uIdx + 1}</td>
                                                    <td>{u.name}</td>
                                                    <td>{u.distance_traveled}</td>
                                                </tr>
                                            ) : null
                                        )
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center">
                                                <small className="text-muted">
                                                    <i>-- No users --</i>
                                                </small>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>
                        </div>

                        <div className="d-flex justify-content-center align-items-center uls-pagination">
                            <PaginationSection {...this.props} />
                        </div>
                    </FormGroup>
                ) : null}
            </div>
        )
    }
}

class PaginationSection extends Component {
    paginationClick = (action) => (e) => {
        e.preventDefault();

        var currPage = 0,
            { pagination,
            activeCampaign,
            users } = this.props,
            users = users.filter(u => u.campaign_id == activeCampaign),
            paginationLength = Math.ceil(users.length / pagination.pageLength),
            paginationLength = paginationLength == 0 ? 1 : paginationLength;

        switch(action) {
            case 'next':
                if(pagination.currPage != (paginationLength - 1)) {
                    currPage = pagination.currPage + 1;
                } else {
                    currPage = paginationLength - 1;
                }
                break;

            case 'prev':
                if(pagination.currPage != 0) {
                    currPage = pagination.currPage - 1;
                }
                break;

            case 'last':
                currPage = paginationLength - 1;
                break;

            case 'first':
                break;

            default:
                currPage = action;
                break;
        }

        pagination.currPage = currPage;
        this.props.mainSetState({pagination});
    }

    paginationPageLength = (index) => {
        var { pagination,
            activeCampaign,
            users } = this.props,
            users = users.filter(u => u.campaign_id == activeCampaign),
            paginationLength = Math.ceil(users.length / pagination.pageLength),
            paginationLength = paginationLength == 0 ? 1 : paginationLength;

        if(pagination.currPage == 0) {
            if(index <= 2) {
                return true;
            } else {
                return false;
            }
        } else if(pagination.currPage == (paginationLength - 1)) {
            if(index >= (paginationLength - 3)) {
                return true;
            } else {
                return false;
            }
        } else {
            if(index >= (pagination.currPage - 1) && index <= (pagination.currPage + 1)) {
                return true;
            } else {
                return false;
            }
        }
    }

    render() {
        var users = this.props.users.filter(u => u.campaign_id == this.props.activeCampaign),
            { pagination } = this.props,
            paginationLength = Math.ceil(users.length / pagination.pageLength),
            paginationLength = paginationLength == 0 ? 1 : paginationLength;

        return (
            <Pagination aria-label="Page navigation example">
                <PaginationItem>
                    <PaginationLink
                        first
                        href="javascript:void(0)"
                        onClick={this.paginationClick('first')}
                    />
                </PaginationItem>
                
                <PaginationItem>
                    <PaginationLink
                        previous
                        href="javascript:void(0)"
                        onClick={this.paginationClick('prev')}
                    />
                </PaginationItem>

                {Array(paginationLength).fill(null).map((p, pIdx) =>
                    this.paginationPageLength(pIdx) ? (
                        <PaginationItem key={pIdx} active={pagination.currPage == pIdx}>
                            <PaginationLink
                                href="javascript:void(0)"
                                onClick={this.paginationClick(pIdx)}
                            >{pIdx + 1}</PaginationLink>
                        </PaginationItem>
                    ) : null
                )}

                <PaginationItem>
                    <PaginationLink
                        next
                        href="javascript:void(0)"
                        onClick={this.paginationClick('next')}
                    />
                </PaginationItem>

                <PaginationItem>
                    <PaginationLink
                        last
                        href="javascript:void(0)"
                        onClick={this.paginationClick('last')}
                    />
                </PaginationItem>
            </Pagination>
        )
    }
}