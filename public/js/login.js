/* eslint-disable */
import { apiRequest } from './api.js';
import { showAlert } from './alerts.js';

export const login = async (email, password) => {
  try {
    const res = await apiRequest('/api/v1/users/login', {
      method: 'POST',
      body: { email, password }
    });

    if (res.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await apiRequest('/api/v1/users/signup', {
      method: 'POST',
      body: { name, email, password, passwordConfirm }
    });

    const message = res.welcomeEmailSent
      ? 'Account created successfully!'
      : 'Account created, but the welcome email could not be sent. Check the email settings.';
    showAlert(res.welcomeEmailSent ? 'success' : 'error', message);
    window.setTimeout(() => location.assign('/'), 1800);
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const requestPasswordReset = async email => {
  try {
    await apiRequest('/api/v1/users/forgotPassword', {
      method: 'POST',
      body: { email }
    });
    showAlert('success', 'If the address is registered, a reset link has been sent.');
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const resetPassword = async (token, password, passwordConfirm) => {
  try {
    await apiRequest(`/api/v1/users/resetPassword/${encodeURIComponent(token)}`, {
      method: 'PATCH',
      body: { password, passwordConfirm }
    });
    showAlert('success', 'Password reset successfully. Redirecting to your account…');
    window.setTimeout(() => location.assign('/'), 1500);
  } catch (err) {
    showAlert('error', err.message);
  }
};

export const logout = async () => {
  try {
    const res = await apiRequest('/api/v1/users/logout');
    if (res.status === 'success') location.reload();
  } catch (err) {
    showAlert('error', err.message);
  }
};
