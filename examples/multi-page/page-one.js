import { createForm } from '../../dist/index.js';
import { persistence, schema } from './schema.js';

const form = createForm({
  schema,
  target: '#demetria-form',
  stepId: 'applicant',
  persistence,
  onStepChange(state) {
    if (state.currentStepId === 'course') {
      window.location.assign('./page-two.html');
    }
  }
});

form.mount();
