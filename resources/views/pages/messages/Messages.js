import React, { 
  Component,
  useState,
  useEffect,
  useRef,
  useLayoutEffect
} from 'react';
import FA from 'react-fontawesome';
import {
  Label,
  Input,
  FormGroup
} from 'reactstrap';
import * as firebase from 'firebase/app';
import '@firebase/messaging';

import { MessageController, FirebaseController } from '../../controllers';
import { URL, getChatTimestamp } from '../../config';

import PageLoader from '../../layout/PageLoader';

export default class Messages extends Component {
  constructor(props) {
    super(props);

    this.state = {
      users: [],
      loading: true,
      messages: [],
      activeUserData: {},
      activeLoading: true
    };
  }

  componentDidMount = () => {
    this.getUserList();
    this.notificationListener = firebase.messaging().onMessage(payload => {
      console.log(payload);
    });

    this.onTokenRefresh = firebase.messaging().onTokenRefresh(fcmToken => {
      FirebaseController.updateToken(fcmToken);
    });
  }

  componentWillUnmount = () => {
    console.log('leave message page');
  }

  getUserList = () => {
    MessageController.userList()
    .then(res => {
      this.setState({
        users: res.data,
        loading: false,
        activeLoading: false
      });
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
    });
  }

  getActiveConvo = user => {
    this.setState({ activeLoading: true });

    MessageController.getMessages(user.id)
    .then(res => {
      const { status, message } = res.data;
      if(status === 'success') {
        const { users } = this.state;
        const idx = users.findIndex(u => u.id === user.id);
        if(idx !== -1) {
          if(!users[idx].seen) {
            users[idx].seen = 1;
            this.setState({users});
          }
        }
        
        this.setState({
          messages: message.convo,
          activeUserData: user
        });
      } else {
        alert(`${status}: ${message}`);
      }
      this.setState({ activeLoading: false });
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
      this.setState({ activeLoading: false });
    });
  }

  sendMessage = dataToSend => {
    if(dataToSend.message !== '') {
      MessageController.sendMessage(dataToSend)
      .then(res => {
        const { messages, users, activeUserData } = this.state;
        const chat = res.data;
        const dataToPush = {
          message: chat.message,
          sender: chat.sender,
          seen: 1,
          created_at: chat.created_at,
          client_id: chat.client_id
        };

        const userIndex = users.findIndex(u => u.id === activeUserData.id);
        const user = userIndex !== -1
          ? Object.assign(users[userIndex], dataToPush)
          : { ...activeUserData, ...dataToPush };

        if(userIndex !== -1)
          users.splice(userIndex, 1);

        messages.push(chat);
        users.unshift(user);
        
        this.setState({messages});
      })
      .catch(err => {
        console.log(err);
        console.log(err.response);
        alert('Server Error! Please try again later');
      })
    }
  }

  render() {
    return (
      <PageLoader loading={this.state.loading}>
        <MessageContainer>
          <MessageListContainer
            users={this.state.users}
            getActiveConvo={this.getActiveConvo}
          />

          <MessageConvoContainer
            messages={this.state.messages}
            activeUserData={this.state.activeUserData}
            activeLoading={this.state.activeLoading}
            sendMessage={this.sendMessage}
          />
        </MessageContainer>
      </PageLoader>
    );
  }
}

const MessageContainer = ({children}) => {
  return (
    <div
      className="message-section"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start'
      }}
    >{children}</div>
  )
}

const MessageListContainer = ({users, getActiveConvo}) => {
  const [searchText, setSearchText] = useState('');

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 350,
        maxHeight: '80vh'
      }}
    >
      <FormGroup>
        <Input
          placeholder="Search..."
          onChange={({currentTarget}) => setSearchText(currentTarget.value)}
          value={searchText}
        />
      </FormGroup>

      <MessageList
        users={users}
        searchText={searchText}
        getActiveConvo={getActiveConvo}
        resetSearch={() => setSearchText('')}
      />
    </div>
  )
}

const MessageList = props => {
  const {
    users,
    searchText,
    resetSearch,
    getActiveConvo
  } = props;

  const [list, setList] = useState(users);
  const [activeConvo, setActiveConvo] = useState(false);

  useEffect(() => {
    const newConvoUsers = !searchText
      ? users
      : users.filter(u =>
        (new RegExp(searchText.toLowerCase())).test(u.name.toLowerCase())
      );

    setList(newConvoUsers);
  }, [searchText]);

  const setActive = user => {
    setActiveConvo(user.id);
    getActiveConvo(user);
    resetSearch();
  }

  return (
    <div>
      {searchText
        ? <MessageWithSearch
          list={list}
          setActive={setActive}
          search={searchText}
        />
        : <MessageWithoutSearch
          list={list}
          active={activeConvo}
          setActive={setActive}
        />
      }
    </div>
  )
}

const MessageWithSearch = ({list, setActive, search}) => {
  const [users, setUsers] = useState(list);
  const [nonConvoUsers, setNonConvoUsers] = useState([]);
  const [timeoutHandle, setTimeoutHandle] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setUsers(list);
  }, [list]);
  
  useEffect(() => {
    setLoading(true);
    window.clearTimeout(timeoutHandle);

    setTimeoutHandle(
      setTimeout(() => {
        getNonConvoUsers();
      }, 1000)
    );
  }, [search]);

  const getNonConvoUsers = () => {
    MessageController.getNonConvoUsers(search)
    .then(res => {
      setNonConvoUsers(res.data);
      setLoading(false);
    })
    .catch(err => {
      console.log(err);
      console.log(err.response);
      setLoading(false);
    });
  }

  return (
    <PageLoader loading={loading} small>
      {users.length < 1 ? (
        <div className="text-center pt-2">
          <MessageText.Label text={`-- No '${search}' found --`} />
        </div>
      ) : (
        <div>
          <Label>MESSAGES</Label>
          <div>
            {users.map(l =>
              <MessageWithSearchContainer
                key={l.id}
                l={l}
                setActive={setActive}
              />
            )}
          </div>
        </div>
      )}

      {nonConvoUsers.length > 0 ? (
        <div className="pt-4">
          <Label>OTHER USERS</Label>
          <div>
            {nonConvoUsers.map(l =>
              <MessageWithSearchContainer
                key={l.id}
                l={l}
                setActive={setActive}
              />  
            )}
          </div>
        </div>
      ) : null}
    </PageLoader>
  );
}

const MessageWithSearchContainer = ({l, setActive}) => {
  const imgDim = 30;
  const [hover, setHover] = useState(false);
  
  return (
    <div
      key={l.id}
      className={`ms-search-result${hover? ' ms-search-result-hover' : ''}`}
      onClick={e => setActive(l)}
      onMouseEnter={e => setHover(true)}
      onMouseLeave={e => setHover(false)}
    >
      <div
        style={{
          width: imgDim,
          height: imgDim,
          borderRadius: '50%',
          backgroundColor: l.url ? null : '#37abb4',
          overflow: 'hidden'
        }}
      >
        <img
          src={`${URL.STORAGE_URL}/${l.url}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            overflow: 'hidden'
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          paddingLeft: 10
        }}
      >
        <MessageText.Search text={l.name} />
      </div>
    </div>
  );
}

const MessageWithoutSearch = ({list, active, setActive}) => {
  const imgDim = 50;
  const textWidth = result => 330 - imgDim - (!result ? 0 : 12);

  const [hover, setHover] = useState(false);

  return list.map(l =>
    <div
      key={l.id}
      className={`ms-list${active === l.id ? ' ms-list-active' : ''}${hover === l.id ? (active === l.id ? '' : ' ms-list-hover') : ''}`}
      onClick={e => setActive(l)}
      onMouseEnter={e => setHover(l.id)}
      onMouseLeave={e => setHover(false)}
    >
      <div
        style={{
          width: imgDim,
          height: imgDim,
          borderRadius: '50%',
          backgroundColor: l.url ? null : '#37abb4',
          overflow: 'hidden'
        }}
      >
        <img
          src={`${URL.STORAGE_URL}/${l.url}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            overflow: 'hidden'
          }}
        />
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: textWidth(!l.seen && !l.sender),
          display: 'flex',
          flexDirection: 'column',
          paddingLeft: 15,
          paddingRight: !l.seen && !l.sender ? 15 : 10
        }}
      >
        <div
          style={{
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: '19px',
          }}
        >
          <MessageText.List.Label
            text={l.name}
            seen={l.sender ? true : l.seen}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'row',
            lineHeight: '17px',
          }}
        >
          <div
            style={{
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingRight: '5px',
            }}
          >
            <MessageText.List.Common
              text={`${l.sender ? 'You: ': ''}${l.message}`}
              seen={l.sender ? true : l.seen}
            />
          </div>

          <div
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            <MessageText.List.Common
              text={getChatTimestamp(l.created_at)}
              seen={l.sender ? true : l.seen}
              dot
            />
          </div>
        </div>
      </div>

      {!l.seen && !l.sender ?
        <div
          style={{
            width: 12,
            height: 12,
            backgroundColor: '#33c8d4',
            borderRadius: '50%'
          }}
        ></div>
      : null}
    </div>
  )
}

const MessageConvoContainer = props => {
  const {
    activeLoading
  } = props;

  return (
    <div
      className="ms-convo-container"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        height: '80vh',
        margin: '0px 15px',
        borderRadius: 4,
        overflow: 'hidden',
        backgroundColor: '#fff'
      }}
    >
      <PageLoader loading={activeLoading}>
        <MessageConvoContainerHeader {...props} />
        <MessageConvoContainerBody {...props} />
        <MessageConvoContainerFooter {...props} />
      </PageLoader>
    </div>
  )
}

const MessageConvoContainerHeader = ({activeUserData}) => {
  const [userData, setUserData] = useState(false);

  useEffect(() => {
    setUserData(activeUserData);
  }, [activeUserData]);

  return (
    <div
      className="ms-cc-header"
      style={{
        backgroundColor: '#fff',
        textAlign: 'center',
        padding: 15
      }}
    >
      {userData.name
        ? <h4 className="mb-0">{userData.name}</h4>
        : <h4 className="mb-0">&nbsp;</h4>
      }
    </div>
  )
}

const MessageConvoContainerBody = props => {
  const {
    messages,
    activeUserData,
    activeLoading
  } = props;
  const [messageList, setMessageList] = useState(messages);
  const [userData, setUserData] = useState(false);
  const endMessage = useRef(null);

  useEffect(() => {
    setUserData(activeUserData);
  }, [activeUserData]);

  useEffect(() => {
    setMessageList(messages);
  }, [messages]);
  
  useLayoutEffect(() => {
    if(messageList.length > 0) {
      endMessage.current.scrollIntoView();
    }
  }, [messageList]);

  return (
    <div
      className="ms-cc-body"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '0px 20px',
        overflowY: 'auto'
      }}
    >
      {messageList.map((m, mIdx) =>
        m.sender
        ? <MessageConvoContainerBodyClient
          key={m.id}
          message={m}
          nextMessage={messageList[mIdx + 1]}
          prevMessage={messageList[mIdx - 1]}
        /> : <MessageConvoContainerBodyUser
          key={m.id}
          message={m}
          nextMessage={messageList[mIdx + 1]}
          prevMessage={messageList[mIdx - 1]}
        />
      )}
      <div className="pt-2 pb-2" ref={endMessage} />
    </div>
  )
}

const MessageConvoContainerBodyUser = ({message, nextMessage, prevMessage}) => {
  const asIsSenderNext = nextMessage ? (
      nextMessage.sender === message.sender ? true : false
    ) : false;
  const asIsSenderPrev = prevMessage ? (
      prevMessage.sender === message.sender ? true : false
    ) : false;

  const marginTop = asIsSenderPrev ? '2px' : '4px';
  const marginBottom = asIsSenderNext ? '2px' : '4px';

  const borderRadiusTopLeft = asIsSenderPrev ? '5px' : '20px';
  const borderRadiusBottomLeft = asIsSenderNext ? '5px' : '20px';
  
  return (
    <div
      className="ms-cc-b-bubble"
      style={{
        backgroundColor: '#227d84',
        padding: '7px 15px',
        margin: `${marginTop} 0px ${marginBottom} 0px`,
        borderRadius: `${borderRadiusTopLeft} 20px 20px ${borderRadiusBottomLeft}`,
        alignSelf: 'flex-start',
        maxWidth: 450
      }}
    >
      <MessageText.Convo.User
        textAlign="left"
        text={message.message}
      />
    </div>
  )
}

const MessageConvoContainerBodyClient = ({message, nextMessage, prevMessage}) => {
  const asIsSenderNext = nextMessage ? (
      nextMessage.sender === message.sender ? true : false
    ) : false;
  const asIsSenderPrev = prevMessage ? (
      prevMessage.sender === message.sender ? true : false
    ) : false;

  const marginTop = asIsSenderPrev ? '2px' : '4px';
  const marginBottom = asIsSenderNext ? '2px' : '4px';

  const borderRadiusTopRight = asIsSenderPrev ? '5px' : '20px';
  const borderRadiusBottomRight = asIsSenderNext ? '5px' : '20px';

  return (
    <div
      className="ms-cc-b-bubble"
      style={{
        backgroundColor: '#d2d2d2',
        padding: '7px 15px',
        margin: `${marginTop} 0px ${marginBottom} 0px`,
        borderRadius: `20px ${borderRadiusTopRight} ${borderRadiusBottomRight} 20px`,
        alignSelf: 'flex-end',
        maxWidth: 450
      }}
    >
      <MessageText.Convo.Client
        textAlign="right"
        text={message.message}
      />
    </div>
  )
}

const MessageConvoContainerFooter = props => {
  const { activeUserData, sendMessage } = props;
  const [message, setMessage] = useState('');
  const [shiftKey, setShiftKey] = useState(false);

  const sendMessageFunction = () => {
    sendMessage({
      message,
      uid: activeUserData.id,
      type: 0,
    });
    setMessage('');
  }

  const messageOnChange = e => {
    const m = e.currentTarget.value;
    setMessage(m);
  }

  const messageOnKeyDown = e => {
    if(Object.keys(activeUserData).length > 0) {
      if(e.key === 'Enter') {
        if(!shiftKey) {
          e.preventDefault();
          sendMessageFunction();
        }
      }
      
      if(e.key === 'Shift') {
        setShiftKey(true);
      }
    } else {
      e.preventDefault();
    }
  }

  const messageOnKeyUp = e => {
    if(e.key === 'Shift')
      setShiftKey(false);
  }

  const sendButtonOnClick = e => {
    if(Object.keys(activeUserData).length > 0) {
      sendMessageFunction();
    } else {
      e.preventDefault();
    }
  }

  return (
    <div
      className="ms-cc-footer"
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#a1a1a1',
        borderTopWidth: 1,
        borderTopColor: '#ececec'
      }}
    >
      <div
        style={{
          flex: 1,
        }}
      >
        <Input
          type="textarea"
          rows={4}
          style={{
            lineHeight: '1.2rem'
          }}
          value={message}
          onChange={messageOnChange}
          onKeyDown={messageOnKeyDown}
          onKeyUp={messageOnKeyUp}
          disabled={Object.keys(activeUserData).length > 0 ? false : true}
        />
      </div>

      <button
        style={{
          padding: '10px 20px',
          backgroundColor: '#fff',
          marginLeft: 15,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: '#d5dce6',
          borderStyle: 'solid',
          boxShadow: 'inset 0 2px 0 0 #f2f5f8'
        }}
        onClick={sendButtonOnClick}
        disabled={Object.keys(activeUserData).length > 0 ? false : true}
      >      
        <FA name="paper-plane" />
      </button>
    </div>
  )
}

const MessageText = {
  List: {
    Label: ({text, seen}) => (
      <span
        style={{
          color: '#000',
          fontSize: '15px',
          lineHeight: '19px',
          fontWeight: seen ? 400 : 700,
        }}
      >{text}</span>
    ),
    Common: ({text, seen, dot}) => (
      <span
        style={{
          color: seen ? '#787878' : '#000',
          fontSize: '13px',
          lineHeight: '17px',
          fontWeight: seen ? 400 : 700,
        }}
      >{dot ? <span>&#8226;&nbsp;</span> : null}{text}</span>
    )
  },
  Label: ({text}) => (
    <span
      style={{
        color: '#7f8fa4',
      }}
    >
      <i>{text}</i>
    </span>
  ),
  Search: ({text}) => (
    <span
      style={{
        color: '#000',
      }}
    >{text}</span>
  ),
  Convo: {
    User: ({text, textAlign}) => (
      <p
        style={{
          color: '#fff',
          marginBottom: 0,
          textAlign
        }}
      >{text}</p>
    ),
    Client: ({text, textAlign}) => (
      <p
        style={{
          color: '#000',
          marginBottom: 0
        }}
      >{text}</p>
    )
  }
}