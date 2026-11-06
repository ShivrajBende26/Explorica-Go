/* eslint-disable */
import { apiRequest } from './api.js';
import { showAlert } from './alerts.js';

export const bookTour = async tourId => {
  try {
    const response = await apiRequest(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    if (!response.session.url) {
      throw new Error('Stripe did not return a checkout URL.');
    }
    window.location.assign(response.session.url);
    return true;
  } catch (err) {
    showAlert('error', err.message);
    return false;
  }
};
