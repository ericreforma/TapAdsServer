export default {
  top: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'Home',
    },
    {
      name: 'Campaigns',
      icon: 'Bookmark',
      children:[
        {
          name:'Campaign List',
          url: '/campaign/list',
          icon: 'List',
        },
        {
          name:'Create Campaign',
          url: '/campaign/create',

          icon: 'PlusCircle',
        }
      ]
    }, {
      name: 'Messages',
      url: '/messages',
      icon: 'MessageSquare'
    }, {
      name:'User Requests',
      url: '/campaign/requests/',
      icon: 'Users'
    }, {
      name: 'Live Map',
      url: '/live/map',
      icon: 'MapPin'
    }, {
      divider: true,
    // }, {
    //   name: 'Notification',
    //   url: '/notification',
    //   icon: 'Globe'
    }
  ],
  bottom: [
    {
      name: 'Logout',
      url: '/logout',
      icon: 'Power'
    }
  ]
};
