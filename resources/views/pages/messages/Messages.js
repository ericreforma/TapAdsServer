import React, { Component } from 'react';
import {
    Input
} from 'reactstrap';
import axios from 'axios';
import io from 'socket.io-client';
import { Send } from 'react-feather';

import { Loader } from '../../components';
import config from '../../config';
import { dateFormat } from '../../utils/dateForChat';

export default class Messages extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loader: true,
            token: '',

            users: [],
            conversation: [],
            activeUserId: null,
            activeChatIndex: null,
            loaderConversation: true,
            messageToSend: '',
            messageType: 0,
            shiftButton: false,
            searchValue: '',
            socket: []
        };
    }

    componentWillMount = () => {
        var token = localStorage.getItem('client_token');
        this.setState({token});
    }

    componentDidMount = () => {
        this.getUserChat();
    }

    getUserChat = () => {
        axios.get(config.api.getChat, {
            headers: {
                Authorization: `Bearer ${this.state.token}`
            }
        }).then(response => {
            if(response.data.status == 'success') {
                this.setState({
                    users: response.data.message.users,
                    loaderConversation: false,
                    userApiDone: true,
                });
                this.chatWebSocket(this.state.token);
            } else {
                setTimeout(() => this.getUserChat(), 1000);
            }
        }).catch(error => {
            console.log(error);
            setTimeout(() => this.getUserChat(), 1000);
        });
    }

    chatWebSocket = (token) => {
        var socket = io(`http://192.168.0.100:3000/chat/authentication?token=${token}&userType=1`);

        socket.on('connect', () => {
            // websocket connected
        });

        socket.on('online users', data => {
            var {users} = this.state,
                onlineIDs = data.map(d => d.id),
                loader = false;

            users = users.map(u => {
                u.online = onlineIDs.indexOf(u.id) !== -1 ? true : false;
                return u;
            });

            this.setState({
                loader,
                users
            });
        });

        socket.on('online user', data => {
            var {users} = this.state,
                {id} = data;

            users = users.map(u => {
                if(u.id == id) {
                    u.online = true;
                }
                return u;
            });

            this.setState({users});
        });

        socket.on('disconnected user', data => {
            var {users} = this.state,
                {id} = data;

            users = users.map(u => {
                if(u.id == id) {
                    u.online = false;
                }
                return u;
            });

            this.setState({users});
        });

        socket.on('new message', data => {
            var { chat } = data,
                { user_id,
                message,
                created_at } = chat,
                { users,
                conversation,
                activeUserId } = this.state,
                index = users.map(u => u.id).indexOf(user_id),
                newMessages = users.splice(index, 1);

            newMessages[0].message = message;
            newMessages[0].sender = 0;
            newMessages[0].created_at = created_at;
            
            if(activeUserId !== user_id) {
                newMessages[0].notif = newMessages[0].notif ? newMessages[0].notif + 1 : 1;
            } else {
                var lastConvo = conversation[conversation.length - 1];
                
                if(lastConvo.sender == 0) { //user
                    conversation[conversation.length - 1].messages.push(chat);
                } else { //client
                    conversation.push({
                        sender: 0,
                        messages: [chat]
                    });
                }
                this.updateNotif(user_id);
            }
            users.unshift(newMessages[0]);

            this.setState({users, conversation});
            this.scrollToBottom();
        });

        this.setState({socket});
    }
    
    chatOnClick = (activeUserId, activeChatIndex) => (e) => {
        if(activeUserId !== this.state.activeUserId) {
            var loaderConversation = true;
            this.setState({
                activeChatIndex,
                loaderConversation,
                activeUserId
            });

            this.conversationAlignment(activeUserId);
        }
    }

    conversationAlignment = (uid) => {
        axios.get(config.api.getConvo + uid, {
            headers: {
                Authorization: `Bearer ${this.state.token}`
            }
        }).then(response => {
            if(response.data.status == 'success') {
                var conversation = [],
                    uData = [],
                    users = this.state.users,
                    loaderConversation = false,
                    loader = false,
                    messageToSend = '',
                    convo = response.data.message.convo,
                    activeUserId = uid,
                    currSender;
                    
                convo.map((c, cIdx) => {
                    if(currSender !== c.sender) {
                        if(uData.length !== 0) {
                            conversation.push({
                                sender: currSender,
                                messages: uData
                            });
                        }
        
                        currSender = c.sender;
                        uData = [];
                    }
        
                    uData.push(c);
        
                    if((cIdx + 1) == convo.length) {
                        conversation.push({
                            sender: currSender,
                            messages: uData
                        });
                    }
                });

                users[this.state.activeChatIndex].notif = null;
        
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
            console.log(error);
        });
    }

    updateNotif = (uid) => {
        axios.get(`${config.api.updateNotif}/${uid}`, {
            headers: {
                Authorization: `Bearer ${this.state.token}`
            }
        }).catch(error => {
            console.log(error);
            setTimeout(() => this.updateNotif(uid), 2000);
        });
    }

    messageSent = () => {
        var {
            socket,
            activeUserId,
            messageType,
            messageToSend,
            token
        } = this.state;

        if(messageToSend !== '' && activeUserId) {
            socket.emit('message', {
                to_id: activeUserId,
                message: messageToSend,
                messageType: messageType,
                token: token
            }, chat => {
                var { conversation,
                    users,
                    activeUserId } = this.state,
                    { user_id,
                    message,
                    created_at } = chat,
                    lastConvo = conversation[conversation.length - 1],
                    index = users.map(u => u.id).indexOf(user_id),
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
                        sender: 1,
                        messages: [chat]
                    });
                } else { //client
                    conversation[conversation.length - 1].messages.push(chat);
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
        this.messagesEnd.scrollIntoView({ behavior: "auto" });
    }

    render() {
        if(this.state.loader) {
            return <Loader type="puff" />
        } else {
            return (
                <div className="chat-section">
                    <div className="cs-left-part">
                        <div className="cs-lp-nav">
                            <div className="cs-lp-n-searchbox">
                                <Input
                                    type="text"
                                    placeholder="Search User.."
                                    onChange={e => this.setState({searchValue: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        {this.state.users.map((u, uIdx) =>
                            u.name.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) !== -1 ? (
                                <div
                                    key={u.id}
                                    className={"cs-lp-chatbox " + (this.state.activeUserId == u.id? 'cs-lp-chatbox-dark' : 'cs-lp-chatbox-white')}
                                    onClick={this.chatOnClick(u.id, uIdx)}
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
                        )}
                    </div>

                    <div className="cs-right-part">
                        <div className="cs-rp-header-container">
                            <div className="text-center">
                                <h4 className="mb-0">{this.state.activeUserId ? this.state.users[this.state.activeChatIndex].name : (<span>&nbsp;</span>)}</h4>
                            </div>
                        </div>
                        
                        <div className="cs-rp-convo-container">
                            <div>
                                {this.state.loaderConversation ? (
                                    <div className="cs-rp-cc-loader">
                                        <Loader type="puff" />
                                    </div>
                                ) : (
                                    this.state.conversation.map((c, cIdx) =>
                                        <div className={c.sender == 0 ? "cs-rp-c-user" : "cs-rp-c-client"} key={cIdx}>
                                            {c.sender == 0 ? (
                                                <div className="cs-rp-cu-image-wrapper">
                                                    <img
                                                        src={this.state.users[this.state.activeChatIndex].url ? this.state.users[this.state.activeChatIndex].url : '/images/default_avatar.png'}
                                                    />
                                                </div>
                                            ) : null}

                                            <div className={c.sender == 0 ? "cs-rp-cu-message-container" : "cs-rp-cc-message-container"}>
                                                {c.messages.map(m =>
                                                    <div 
                                                        className={c.sender == 0 ? "cs-rp-cu-message" : "cs-rp-cc-message"}
                                                        key={m.id}
                                                    >
                                                        <p>{m.message}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                            
                            <div style={{ float:"left", clear: "both" }}
                                ref={(el) => { this.messagesEnd = el; }}>
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
