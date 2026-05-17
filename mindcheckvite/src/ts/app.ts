import { AppState } from "./types.js";

import "./auth.js";
import "./dashboard.js";
import "./survey.js";
import "./result.js";

export const state: AppState = {

  currentUser: null,

  surveyData: {
    emotion: '',
    emoji: '',
    intensity: 0,
    factors: []
  },

  history: []
};

function init(): void {

  console.log("MindCheck iniciado");

  const session =
    localStorage.getItem('sentir_session');

  if (session) {

    window.location.href = "dashboard.html";
  }
}

document.addEventListener(
  'DOMContentLoaded',
  init
);