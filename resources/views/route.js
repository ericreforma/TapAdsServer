import Dashboard from './pages/Dashboard';
import {
  CampaignCreate,
  CampaignList,
  CampaignDashboard,
  CampaignRequests,
  ViewProfile,
  UserLocation,
  Messages,
  LiveMap,
  Payment,
  Notification
} from './pages';

const pageList = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    component: Dashboard
  }, {
    name: 'Create Campaign',
    path:'/campaign/create',
    component: CampaignCreate
  }, {
    name: 'Campaign List',
    path:'/campaign/list',
    component: CampaignList
  }, {
    name: 'Campaign Dashboard',
    path:'/campaign/dashboard/:id',
    component: CampaignDashboard
  }, {
    name: 'User Requests',
    path:'/campaign/requests/',
    component: CampaignRequests
  }, {
    name: 'User Profile',
    path:'/user/profile/:id',
    component: ViewProfile
  }, {
    name: 'Messages',
    path:'/messages',
    component: Messages
  }, {
    name: 'Live Map',
    path:'/live/map',
    component: LiveMap
  }, {
    name: 'Payment',
    path: '/campaign/payment/:id',
    component: Payment
  }, {
    name: 'Notifications',
    path: '/notification',
    component: Notification
  }
];

export default pageList;
