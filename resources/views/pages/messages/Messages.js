import React, { Component } from 'react';
import {
    Input,
    Button
} from 'reactstrap';
import { Send, MessageCircle } from 'react-feather';
import FA from 'react-fontawesome';

import { HttpRequest } from '../../services/http';
import { Loader } from '../../components';
import config from '../../config';
import { dateFormat, conversationBreak } from '../../utils/dateForChat';
import { TOKEN } from '../../config/variable';

export default class Messages extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loader: true,

            styleLeftPart: {},
            leftPartToggle: false,
            userNotFound: false,
            totalNotifCount: 0,
            totalUsers: [],
            users: [],
            nonConvoUsers: [],
            conversation: [],
            activeUserId: null,
            loaderConversation: true,
            messageToSend: '',
            messageType: 0,
            shiftButton: false,
            searchValue: ''
        };
    }

    componentDidMount = () => {
        this.getUserChat();
    }

    getUserChat = () => {
        HttpRequest.get(config.api.getChat).then(response => {
            if(response.data.status == 'success') {
                var { users,
                    nonConvoUsers } = response.data.message,
                    loaderConversation = false,
                    totalUsers = [],
                    totalNotifCount = users.filter(u => u.notif).map(u => u.notif).reduce((a, b) => a + b, 0);

                users.map(u => {
                    totalUsers.push({
                        id: u.id,
                        name: u.name,
                        url: u.url
                    });
                });

                nonConvoUsers.map(nu => {
                    var arrayIDs = users.map(u => u.id);

                    if(arrayIDs.indexOf(nu.id) === -1) {
                        totalUsers.push({
                            id: nu.id,
                            name: nu.name,
                            url: nu.url
                        });
                    }
                });

                this.setState({
                    users,
                    loaderConversation,
                    totalNotifCount,
                    nonConvoUsers,
                    totalUsers,
                });
                this.chatWebSocket();
                this.checkIDParams();
            } else {
                setTimeout(() => this.getUserChat(), 1000);
            }
        }).catch(error => {
            console.log(error);
            setTimeout(() => this.getUserChat(), 1000);
        });
    }

    checkIDParams = () => {
        const {state} = this.props.location;
        if(state) {
            var activeUserId = state.id,
                loaderConversation = true;

            this.setState({activeUserId, loaderConversation});
            this.conversationAlignment(activeUserId);
        }
    }

    chatWebSocket = () => {
        var { users } = this.props.websocket.messages;
        this.webSocket.onlineUsers(users);
    }

    componentWillReceiveProps  = () => {
        var { socketFunctions,
            messages } = this.props.websocket,
            { newMessage,
            updatedFunction } = socketFunctions,
            { users } = messages;

        if(!this.state.loader && updatedFunction !== '') {
            if(updatedFunction == 'online user' || updatedFunction == 'disconnected user') {
                this.webSocket.setUser(users);
            } else if(updatedFunction == 'new message') {
                this.webSocket.newMessage(newMessage);
            }
        }
    }

    webSocket = {
        onlineUsers: (users) => {
            var loader = false;
            this.setState({loader, users});
        },
        setUser: (users) => {
            this.setState({users});
        },
        newMessage: (data) => {
            var { chat } = data,
                { user_id,
                message,
                created_at } = chat,
                { users,
                conversation,
                activeUserId,
                totalNotifCount } = this.state,
                index = users.map(u => u.id).indexOf(user_id),
                newMessages = users.splice(index, 1);

            newMessages[0].message = message;
            newMessages[0].sender = 0;
            newMessages[0].created_at = created_at;
            
            if(activeUserId !== user_id) {
                newMessages[0].notif = newMessages[0].notif ? newMessages[0].notif + 1 : 1;
                totalNotifCount += 1;
            } else {
                var lastConvo = conversation[conversation.length - 1],
                    cBreak = conversationBreak(created_at, lastConvo.messages[lastConvo.messages.length - 1].created_at);
                if(lastConvo.sender == 0) { //user
                    if(cBreak) {
                        conversation.push({
                            date: dateFormat(created_at),
                            break: cBreak,
                            sender: 0,
                            messages: [chat]
                        });
                    } else {
                        conversation[conversation.length - 1].messages.push(chat);
                    }
                } else { //client
                    conversation.push({
                        date: dateFormat(created_at),
                        break: cBreak,
                        sender: 0,
                        messages: [chat]
                    });
                }
                this.updateNotif(user_id);
            }
            users.unshift(newMessages[0]);

            this.setState({
                users,
                conversation,
                totalNotifCount
            });
            this.scrollToBottom();
            this.props.changeMessageNotifCount(totalNotifCount);
        }
    }
    
    chatOnClick = (activeUserId) => (e) => {
        if(activeUserId !== this.state.activeUserId) {
            var loaderConversation = true,
                { totalNotifCount,
                users } = this.state,
                searchValue = '';

            totalNotifCount -= users.filter(u => u.id == activeUserId)[0].notif ? users.filter(u => u.id == activeUserId)[0].notif : 0;
            this.props.changeMessageNotifCount(totalNotifCount);

            this.setState({
                loaderConversation,
                activeUserId,
                totalNotifCount,
                searchValue
            });

            this.conversationAlignment(activeUserId);
        }
    }

    newMessageOnClick = (activeUserId) => (e) => {
        var conversation = [],
            searchValue = '';

        this.setState({
            activeUserId,
            conversation,
            searchValue
        })
    }

    conversationAlignment = (uid) => {
        HttpRequest.get(config.api.getConvo + uid).then(response => {
            if(response.data.status == 'success') {
                var conversation = [],
                    uData = [],
                    { users } = this.state,
                    loaderConversation = false,
                    loader = false,
                    messageToSend = '',
                    { convo } = response.data.message,
                    activeUserId = uid,
                    previousDate = null,
                    pushDate = null,
                    pushCBreak = null,
                    currSender;
                    
                convo.map((c, cIdx) => {
                    var cBreak = conversationBreak(c.created_at, previousDate);
                    if(currSender !== c.sender || cBreak) {
                        if(cIdx !== 0) {
                            conversation.push({
                                date: dateFormat(pushDate),
                                break: pushCBreak,
                                sender: currSender,
                                messages: (cIdx + 1) == convo.length ? uData.concat([c]) : uData
                            });
                        }

                        currSender = c.sender;
                        pushDate = c.created_at;
                        pushCBreak = cBreak;
                        uData = [];
                    }

                    uData.push(c);

                    if((cIdx + 1) == convo.length) {
                        if(currSender === c.sender) {
                            conversation.push({
                                date: dateFormat(pushDate),
                                break: pushCBreak,
                                sender: currSender,
                                messages: uData
                            });
                        }
                    }

                    previousDate = c.created_at;
                });

                var userIndex = users.map(u => u.id).indexOf(activeUserId);
                if(userIndex !== -1) {
                    users[userIndex].notif = null;
                }
        
                this.setState({
                    conversation,
                    loaderConversation,
                    loader,
                    messageToSend,
                    activeUserId,
                    users
                });
                this.updateNotif(uid);
                this.scrollToBottom();
            }
        }).catch(error => {
            setTimeout(() => this.conversationAlignment(uid), 1000);
            console.log(error);
        });
    }

    updateNotif = (uid) => {
        HttpRequest.get(`${config.api.updateNotif}/${uid}`).catch(error => {
            console.log(error);
            setTimeout(() => this.updateNotif(uid), 2000);
        });
    }

    messageSent = () => {
        var { activeUserId,
            messageType,
            messageToSend } = this.state,
            { socket } = this.props.websocket.socketFunctions;

        if(messageToSend !== '' && activeUserId) {
            socket.emit('message', {
                to_id: activeUserId,
                message: messageToSend,
                messageType: messageType,
                token: TOKEN
            }, chat => {
                var { conversation,
                    users,
                    totalUsers,
                    activeUserId } = this.state,
                    { user_id,
                    message,
                    created_at,
                    client_id } = chat,
                    lastConvo = conversation[conversation.length - 1],
                    index = users.map(u => u.id).indexOf(user_id),
                    cBreak, newMessages;
                
                if(index !== -1) {
                    cBreak = conversationBreak(created_at, lastConvo.messages[lastConvo.messages.length - 1].created_at);
                    newMessages = users.splice(index, 1);
                    newMessages[0].message = message;
                    newMessages[0].sender = 1;
                    newMessages[0].created_at = created_at;
                    
                    if(activeUserId !== user_id) {
                        newMessages[0].notif = newMessages[0].notif ? newMessages[0].notif + 1 : 1;
                    }
                    users.unshift(newMessages[0]);
                    
                    if(lastConvo.sender == 0) { //user
                        conversation.push({
                            date: dateFormat(created_at),
                            break: cBreak,
                            sender: 1,
                            messages: [chat]
                        });
                    } else { //client
                        if(cBreak) {
                            conversation.push({
                                date: dateFormat(created_at),
                                break: cBreak,
                                sender: 1,
                                messages: [chat]
                            });
                        } else {
                            conversation[conversation.length - 1].messages.push(chat);
                        }
                    }
                } else {
                    var tuIndex = totalUsers.map(tu => tu.id).indexOf(user_id),
                        url = totalUsers[tuIndex].url,
                        name = totalUsers[tuIndex].name,
                        id = user_id,
                        notif = null,
                        sender = 1;

                    users.unshift({
                        id,
                        message,
                        client_id,
                        url,
                        created_at,
                        name,
                        notif,
                        sender
                    });

                    conversation.push({
                        date: dateFormat(created_at),
                        break: false,
                        sender: 1,
                        messages: [chat]
                    });
                }
    
                this.setState({conversation, users});
                this.scrollToBottom();
            });

            this.setState({
                messageToSend: ''
            });
        }
    }

    messageEnterCheck = (e) => {
        if(e.key === 'Enter' && !this.state.shiftButton) {
            e.preventDefault();
            this.messageSent();
        } else if(e.key == 'Shift') {
            this.setState({shiftButton: true});
        }
    }

    messageKeyUp = (e) => {
        if(e.key == 'Shift') {
            this.setState({shiftButton: false});
        }
    }

    scrollToBottom = () => {
        if(this.state.activeUserId) {
            this._messagesEnd.scrollIntoView({ behavior: "auto" });
        }
    }

    onSearchValueOnChange = (e) => {
        var {users} = this.state,
            searchValue = e.target.value,
            userNotFound = searchValue === '' ? false : (
                users.filter(u =>
                    u.name.toLowerCase().indexOf(searchValue.toLowerCase()) !== -1
                ).length !== 0 ? false : true
            );

        this.setState({
            searchValue,
            userNotFound
        });
    }

    toggleUserList = () => {
        this.setState({
            leftPartToggle: !this.state.leftPartToggle
        });
    }

    getRightPanelData = {
        name: () => {
            var { totalUsers,
                activeUserId } = this.state,
                user = totalUsers.filter(u => u.id == activeUserId);

            return activeUserId ? user[0].name : <span>&nbsp;</span>;
        },
        url: () => {
            var { totalUsers,
                activeUserId } = this.state,
                user = totalUsers.filter(u => u.id == activeUserId)[0];
    
            return user.url ? user.url : '/images/default_avatar.png';
        }
    }

    render() {
        if(this.state.loader) {
            return <Loader type="puff" />
        } else {
            return (
                <div className="chat-section">
                    <div
                        className="cs-left-part"
                        style={
                            this.state.leftPartToggle ? {
                                width: '0px',
                                minWidth: '0px',
                                paddingLeft: '0px',
                                paddingRight: '0px',
                                overflowY: 'hidden'
                            } : {}
                        }
                    >
                        <div className="cs-lp-nav">
                            <div className="cs-lp-n-searchbox">
                                <Input
                                    type="text"
                                    placeholder="Search User.."
                                    onChange={this.onSearchValueOnChange}
                                    value={this.state.searchValue}
                                />
                            </div>
                        </div>
                        
                        <div className="cs-lp-users">
                            {this.state.users.length === 0 || this.state.userNotFound ? (
                                <div className="text-center pt-3 pb-2">
                                    <span className="text-muted">No {this.state.users.length === 0 ? 'user' : 'conversation'}/s found ..</span>
                                </div>
                            ) : this.state.users.map((u, uIdx) =>
                                    u.name.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) !== -1 ? (
                                        <div
                                            key={u.id}
                                            className={"cs-lp-chatbox " + (this.state.activeUserId == u.id? 'cs-lp-chatbox-dark' : 'cs-lp-chatbox-white')}
                                            onClick={this.chatOnClick(u.id)}
                                        >
                                            <div className="cs-lp-cb-image-container">
                                                <div className="cs-lp-cb-image-wrapper">
                                                    <img
                                                        src={u.url ? u.url : '/images/default_avatar.png'}
                                                    />
                                                </div>

                                                {u.online ? (
                                                    <div className="cs-lp-cb-online"></div>
                                                ) : null}
                                            </div>

                                            <div className="cs-lp-cb-chat-info">
                                                <div className="cs-lp-cb-row">
                                                    <h5 className="mb-0">{u.name}</h5>
                                                    <small className="text-muted">{dateFormat(u.created_at)}</small>
                                                </div>

                                                <div className="cs-lp-cb-row">
                                                    <div className="text-muted cp-lp-cb-message">
                                                        {(u.sender == 1 ? 'You: ' : '') + u.message}
                                                    </div>
                                                    <div className="cs-lp-cb-notification-wrapper">
                                                        {u.notif != 0 && u.notif ? (
                                                            <div className="cs-lp-cb-notification">
                                                                <small>{u.notif > 9 ? '9+' : u.notif}</small>
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                )
                            }

                            {this.state.searchValue !== '' ? (
                                <div className="cs-lp-nonconvouser-container">
                                    <hr />

                                    {this.state.nonConvoUsers.map(nu =>
                                        this.state.users.map(u => u.id).indexOf(nu.id) === -1 &&
                                        nu.name.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) !== -1  ? (
                                            <div
                                                className="cs-lp-nc-wrapper"
                                                key={nu.id}
                                                onClick={this.newMessageOnClick(nu.id)}
                                            >
                                                <div className="cs-lp-nc-w-img-wrapper">
                                                    <img
                                                        src={nu.url ? nu.url : '/images/default_avatar.png'}
                                                    />
                                                </div>

                                                <h5 className="mb-0">{nu.name}</h5>

                                                <div className="pr-2"><MessageCircle /></div>
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="cs-right-part">
                        <div className="cs-rp-header-container">
                            <Button className="float-left" onClick={this.toggleUserList}>
                                {this.state.leftPartToggle ? (
                                    <FA name={'chevron-right'} />
                                ) : (
                                    <FA name={'chevron-left'} />
                                )}
                            </Button>
                            <h4 className="mb-0">{this.getRightPanelData.name()}</h4>
                        </div>
                        
                        <div className="cs-rp-convo-container">
                            <div>
                                {this.state.loaderConversation ? (
                                    <div className="cs-rp-cc-loader">
                                        <Loader type="puff" />
                                    </div>
                                ) : (
                                    this.state.conversation.length === 0 ? (
                                        <div className="text-center">
                                            <small className="text-muted">
                                                <i>-- No messages --</i>
                                            </small>
                                        </div>
                                    ) : (
                                        this.state.conversation.map((c, cIdx) =>
                                            <div key={cIdx}>
                                                {c.break ? (
                                                    <div className="text-center mb-2">
                                                        <small style={{fontSize: '0.7rem'}} className="text-muted">{c.date}</small>
                                                    </div>
                                                ) : null}

                                                <div className={c.sender == 0 ? "cs-rp-c-user" : "cs-rp-c-client"}>
                                                    {c.sender == 0 ? (
                                                        <div className="cs-rp-cu-image-wrapper">
                                                            <img src={this.getRightPanelData.url()} />
                                                        </div>
                                                    ) : null}

                                                    <div className={c.sender == 0 ? "cs-rp-cu-message-container" : "cs-rp-cc-message-container"}>
                                                        {c.messages.map((m, mIdx) =>
                                                            <div 
                                                                className={c.sender == 0 ? "cs-rp-cu-message" : "cs-rp-cc-message"}
                                                                key={m.id}
                                                            >
                                                                <p>{m.message}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )
                                )}
                            </div>
                            
                            <div style={{ float:"left", clear: "both" }}
                                ref={(el) => { this._messagesEnd = el; }}>
                            </div>
                        </div>
                    
                        <div className="cs-rp-message-container">
                            <div className="d-flex align-items-center pr-3">
                                <div className="flex-grow-1 p-3">
                                    <Input
                                        type="textarea"
                                        className="cs-rp-mc-textarea"
                                        value={this.state.messageToSend}
                                        onChange={e => this.setState({messageToSend: e.target.value})}
                                        onKeyDown={this.messageEnterCheck}
                                        onKeyUp={this.messageKeyUp}
                                    />
                                </div>
                                
                                <div
                                    className="cs-rp-mc-send-icon pr-2 pt-3 pb-3"
                                    onClick={this.messageSent}
                                >
                                    <Send />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}
