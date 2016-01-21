'use strict';

import receiver from './chrome/receiver';
import renderer from './renderer';

// for dev purpose
const inExtension = chrome.runtime.onMessage;

const loadChromeEventHandlers = () => {
  chrome.runtime.onMessage.addListener(receiver);
};

if (inExtension)
  loadChromeEventHandlers();

// popup opens
document.addEventListener('DOMContentLoaded', () => renderer.renderApp(null, null, true));
