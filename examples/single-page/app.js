import { createForm } from '../../dist/index.js';
import { enhanceExample } from '../shared/example.js';

const schema = {
  id: 'learning-profile',
  steps: [
    {
      id: 'profile',
      title: 'About you',
      description: 'Start with the details used to personalize the experience.',
      fields: [
        { name: 'fullName', type: 'text', label: 'Full name', required: true },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          description:
            'Optional. When provided, it must use a valid email format.'
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone',
          description: 'Optional. No format validation is applied.'
        },
        {
          name: 'age',
          type: 'number',
          label: 'Age',
          description: 'Optional. Enter a finite number.'
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Learning preferences',
      description: 'Choose a track and tell us what you want to achieve.',
      fields: [
        {
          name: 'track',
          type: 'select',
          label: 'Learning track',
          required: true,
          options: [
            { label: 'Web foundations', value: 'web' },
            { label: 'TypeScript', value: 'typescript' },
            { label: 'Accessibility', value: 'accessibility' }
          ]
        },
        {
          name: 'updates',
          type: 'checkbox',
          label: 'Send occasional learning updates'
        },
        {
          name: 'goals',
          type: 'textarea',
          label: 'Learning goals',
          description:
            'Optional. Share a little context for this demonstration.'
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
    if (result !== null) result.textContent = JSON.stringify(values, null, 2);
  }
});

form.mount();
enhanceExample({ schema });
