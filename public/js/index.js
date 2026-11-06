/* eslint-disable */
import { displayMap } from './mapbox.js';
import {
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  signup
} from './login.js';
import { updateSettings } from './updateSettings.js';
import { bookTour } from './stripe.js';
import { showAlert } from './alerts.js';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');
const signupForm = document.querySelector('.form--signup');
const forgotPasswordForm = document.querySelector('.form--forgot-password');
const resetPasswordForm = document.querySelector('.form--reset-password');
const tourCards = [...document.querySelectorAll('[data-tour-card]')];
const tourFilterSummary = document.getElementById('tour-filter-summary');
const tourFilterEmpty = document.querySelector('.home-filter-empty');
const tourSearchInput = document.getElementById('tour-search');
const tourSortSelect = document.getElementById('tour-sort');

if (tourCards.length && tourFilterSummary) {
  const tourPageSize = 9;
  const tourPagination = document.querySelector('[data-tour-pagination]');
  const cardsByDefaultOrder = new Map(
    tourCards.map((card, index) => [card, index])
  );
  const tourCardContainer = tourCards[0].parentElement;
  let currentTourPage = 1;

  const updateTourListing = (resetPage = true) => {
    if (resetPage) currentTourPage = 1;
    const searchTerm = tourSearchInput?.value.trim().toLowerCase() || '';
    const sortBy = tourSortSelect?.value || 'recommended';

    const sortedCards = [...tourCards].sort((first, second) => {
      if (sortBy === 'price-asc') {
        return Number(first.dataset.tourPrice) - Number(second.dataset.tourPrice);
      }
      if (sortBy === 'price-desc') {
        return Number(second.dataset.tourPrice) - Number(first.dataset.tourPrice);
      }
      if (sortBy === 'rating') {
        return Number(second.dataset.tourRating) - Number(first.dataset.tourRating);
      }
      if (sortBy === 'duration') {
        return Number(first.dataset.tourDuration) - Number(second.dataset.tourDuration);
      }
      return cardsByDefaultOrder.get(first) - cardsByDefaultOrder.get(second);
    });

    const filteredCards = sortedCards.filter(card => {
      const matchesSearch = (card.dataset.tourSearch || '')
        .toLowerCase()
        .includes(searchTerm);
      return matchesSearch;
    });
    const pageCount = Math.max(1, Math.ceil(filteredCards.length / tourPageSize));
    currentTourPage = Math.min(currentTourPage, pageCount);
    const firstVisibleIndex = (currentTourPage - 1) * tourPageSize;
    const visibleCards = new Set(
      filteredCards.slice(firstVisibleIndex, firstVisibleIndex + tourPageSize)
    );

    sortedCards.forEach(card => {
      card.hidden = !visibleCards.has(card);
      tourCardContainer.append(card);
    });

    const firstResult = filteredCards.length ? firstVisibleIndex + 1 : 0;
    const lastResult = Math.min(firstVisibleIndex + tourPageSize, filteredCards.length);
    tourFilterSummary.textContent = filteredCards.length
      ? `Showing ${firstResult}–${lastResult} of ${filteredCards.length} journeys`
      : 'No journeys found';
    if (tourFilterEmpty) tourFilterEmpty.hidden = filteredCards.length > 0;

    if (tourPagination) {
      tourPagination.replaceChildren();
      tourPagination.hidden = pageCount <= 1;

      const addPageButton = (label, page, options = {}) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `home-tour-pagination__button${options.step ? ' is-step' : ''}`;
        button.textContent = label;
        button.disabled = Boolean(options.disabled);
        button.setAttribute('aria-label', options.ariaLabel || `Page ${page}`);
        if (page === currentTourPage) button.setAttribute('aria-current', 'page');
        button.addEventListener('click', () => {
          currentTourPage = page;
          updateTourListing(false);
          tourPagination?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        });
        tourPagination.append(button);
      };

      if (pageCount > 1) {
        addPageButton('Previous', Math.max(1, currentTourPage - 1), {
          step: true,
          disabled: currentTourPage === 1,
          ariaLabel: 'Previous page'
        });
        for (let page = 1; page <= pageCount; page += 1) {
          addPageButton(String(page), page);
        }
        addPageButton('Next', Math.min(pageCount, currentTourPage + 1), {
          step: true,
          disabled: currentTourPage === pageCount,
          ariaLabel: 'Next page'
        });
      }
    }
  };

  tourSearchInput?.addEventListener('input', updateTourListing);
  tourSortSelect?.addEventListener('change', updateTourListing);
  updateTourListing();
}

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (signupForm)
  signupForm.addEventListener('submit', e => {
    e.preventDefault();
    signup(
      document.getElementById('name').value,
      document.getElementById('email').value,
      document.getElementById('password').value,
      document.getElementById('password-confirm').value
    );
  });

if (forgotPasswordForm)
  forgotPasswordForm.addEventListener('submit', e => {
    e.preventDefault();
    requestPasswordReset(document.getElementById('email').value);
  });

if (resetPasswordForm)
  resetPasswordForm.addEventListener('submit', e => {
    e.preventDefault();
    resetPassword(
      resetPasswordForm.dataset.token,
      document.getElementById('password').value,
      document.getElementById('password-confirm').value
    );
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    const photo = document.getElementById('photo').files[0];
    if (photo) form.append('photo', photo);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    const button = document.querySelector('.btn--save-password');
    button.textContent = 'Updating...';
    button.disabled = true;

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    try {
      const updated = await updateSettings(
        { passwordCurrent, password, passwordConfirm },
        'password'
      );
      if (updated) {
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
      }
    } finally {
      button.textContent = 'Save password';
      button.disabled = false;
    }
  });

if (bookBtn)
  bookBtn.addEventListener('click', async e => {
    const button = e.currentTarget;
    button.textContent = 'Processing...';
    button.disabled = true;
    const { tourId } = button.dataset;
    const started = await bookTour(tourId);
    if (!started) {
      button.textContent = 'Book tour now!';
      button.disabled = false;
    }
  });

const alertMessage = document.body.dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);
