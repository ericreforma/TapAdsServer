export default {
  top: [
    {
      name: 'Dashboard',
      url: '/apps/analytics',
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
        },
        {
          name:'User Requests',
          url: '/campaign/requests/',
          icon: 'Users',
        }
      ]
    }, {
      name: 'Messages',
      url: '/messages/',
      icon: 'MessageSquare'
    }, {
      name: 'User Location',
      url: '/user/location',
      icon: 'MapPin'
    },
    // {
    //   name: 'Gallery',
    //   url: '/gallery',
    //   icon: 'Image'
    // },
    // {
    //   name: 'Settings',
    //   url: '/settings',
    //   icon: 'Settings'
    // },
    {
      divider: true,
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
