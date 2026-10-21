import type { FormSchema } from '../src/index.js';

export const schema = {
  id: 'registration',
  steps: [
    {
      id: 'personal',
      title: 'Personal information',
      description: 'Tell us who you are.',
      fields: [
        {
          name: 'fullName',
          type: 'text',
          label: 'Full name',
          description: 'Use your preferred name.',
          required: true
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email',
          required: true
        },
        {
          name: 'age',
          type: 'number',
          label: 'Age'
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Notes'
        }
      ]
    },
    {
      id: 'preferences',
      title: 'Preferences',
      fields: [
        {
          name: 'newsletter',
          type: 'checkbox',
          label: 'Receive updates',
          required: true
        },
        {
          name: 'contactMethod',
          type: 'select',
          label: 'Preferred contact method',
          required: true,
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'phone' }
          ]
        }
      ]
    }
  ]
} as const satisfies FormSchema;
