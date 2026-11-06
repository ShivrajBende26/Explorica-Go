/* eslint-disable */
import { apiRequest } from './api.js';
import { showAlert } from './alerts.js';

// type is either 'password' or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';

    const res = await apiRequest(url, {
      method: 'PATCH',
      body: data
    });

    if (res.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
      return true;
    }
    return false;
  } catch (err) {
    showAlert('error', err.message);
    return false;
  }
};
