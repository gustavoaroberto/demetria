import { createForm } from '../../dist/index.js';
import { enhanceExample } from '../shared/example.js';
import { persistence, schema } from './schema.js';

const result = document.querySelector('#result');
const form = createForm({
  schema,
  target: '#demetria-form',
  stepId: 'course',
  persistence,
  onStepChange(state) {
    if (state.currentStepId === 'applicant')
      window.location.assign('./page-one.html');
  },
  onComplete(values) {
    if (result !== null) result.textContent = JSON.stringify(values, null, 2);
    sessionStorage.removeItem(persistence.key);
  }
});

form.mount();
enhanceExample({ schema });
