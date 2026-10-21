import { createForm } from '../../dist/index.js';
import { persistence, schema } from './schema.js';

const result = document.querySelector('#result');
const form = createForm({
  schema,
  target: '#demetria-form',
  stepId: 'course',
  persistence,
  onStepChange(state) {
    if (state.currentStepId === 'applicant') {
      window.location.assign('./page-one.html');
    }
  },
  onComplete(values) {
    result.textContent = JSON.stringify(values, null, 2);
  }
});

form.mount();
