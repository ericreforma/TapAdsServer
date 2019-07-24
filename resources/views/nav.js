export default {
  top: [
    {
      name: 'Dashboard',
      url: '/apps/analytics',
      icon: 'Home',
    },
    {
      name: 'Campaigns',
      //url: '/campaigns',
      icon: 'Bookmark',
      children:[
        {
          name:'Campaign List',
          url: '/campaigns/list',
          icon: 'List',
        },
        {
          name:'Create Campaign',
          url: '/campaigns/create',
          icon: 'PlusCircle',
        },
        {
          name:'User Requests',
          url: '/campaign/requests/',
          icon: 'Users',
        }
      ]
    },
    {
      name: 'Gallery',
      url: '/gallery',
      icon: 'Image'
    },
    {
      name: 'Settings',
      url: '/settings',
      icon: 'Settings'
    },
    {
      divider: true,
    }
  ],
  bottom: [
    {
      name: 'Theme Samples',
      icon: 'Package',
      children: [
        {
          name: 'Buttons',
          url: '/elements/buttons',
        },
        {
          name: 'Grid',
          url: '/elements/grid',
        },
        {
          name: 'Alerts',
          url: '/elements/alerts',
        },
        {
          name: 'Typography',
          url: '/elements/typography',
        },
        {
          name: 'Cards',
          url: '/elements/cards',
        },
        {
          name: 'Tabs',
          url: '/elements/tabs',
        },
        {
          name: 'Tables',
          url: '/elements/tables',
        },
        {
          name: 'Breadcrumbs',
          url: '/elements/breadcrumbs',
        },
        {
          name: 'Forms',
          url: '/elements/forms',
        },
        {
          name: 'Modals',
          url: '/elements/modals',
        },
        {
          name: 'Loaders',
          url: '/elements/loaders',
        },
        {
          name: 'Avatars',
          url: '/elements/avatars',
        },
        {
          name: 'Progress Bars',
          url: '/elements/progressbars',
        },
        {
          name: 'Pagination',
          url: '/elements/pagination',
        },
        {
          name: 'Blank',
          url: '/pages/blank',
        },
        {
          name: 'Sub Navigation',
          url: '/pages/subnav',
        },
        {
          name: '404',
          url: '/pages/404',
        },
        {
          name: 'Analytics',
          url: '/apps/analytics',
        },
        {
          name: 'Invoice',
          url: '/apps/invoice',
        },
        {
          name: 'Activity Feed',
          url: '/apps/feed',
        },
        {
          name: 'CMS',
          url: '/apps/cms',
        },
        {
          name: 'Widgets',
          url: '/widgets',
          badge: {
            text: 'NEW',
          },
        },
      ],
    },
    {
      name: 'Account',
      url: '/dashboard',
      icon: 'User',
      badge: {
        variant: 'success',
        text: '3',
      },
    },
  ],
};
