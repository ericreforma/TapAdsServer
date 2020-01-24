import { HttpRequest } from '../services/http';

export const PaymentController = {
  data: cid => {
    return HttpRequest.get(`/client/payment/${cid}`);
  },
  getPayment: params => {
    return HttpRequest.get(`/client/payment/user/data${params}`);
  },
  sendPayment: form => {
    return HttpRequest.post('/client/payment/user/update', form);
  }
}