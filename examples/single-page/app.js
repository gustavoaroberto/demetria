import { createForm } from '../../dist/index.js';

const schema = {
  id: 'workshop-registration',
  steps: [
    {
      id: 'contact',
      title: 'Contact details',
      fields: [
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'age', type: 'number', label: 'Age' },
        { name: 'notes', type: 'textarea', label: 'Accessibility requests' }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          name: 'session',
          type: 'select',
          label: 'Workshop session',
          required: true,
          options: [
            { label: 'Morning', value: 'morning' },
            { label: 'Afternoon', value: 'afternoon' }
          ]
        },
        {
          name: 'updates',
          type: 'checkbox',
          label: 'Send schedule updates',
          required: true
        }
      ]
    }
  ]
};

const result = document.querySelector('#result');
const form = createForm({
  schema,
  target: '#demetria-form',
  onComplete(values) {
    result.textContent = JSON.stringify(values, null, 2);
  }
});

form.mount();
