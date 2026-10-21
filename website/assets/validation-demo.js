import { createForm } from '../dist/index.js';

const target = document.querySelector('#validation-demo');

if (target !== null) {
  const result = document.querySelector('#validation-result');
  const form = createForm({
    target,
    schema: {
      id: 'validation-example',
      steps: [
        {
          id: 'contact',
          title: 'Contact details',
          description:
            'Try leaving the name empty or entering an invalid email.',
          fields: [
            {
              name: 'fullName',
              type: 'text',
              label: 'Full name',
              required: true
            },
            {
              name: 'email',
              type: 'email',
              label: 'Email',
              description:
                'Optional. When provided, it must use a valid email format.'
            }
          ]
        }
      ]
    },
    onComplete(values) {
      if (result !== null) {
        result.textContent = `Completed: ${JSON.stringify(values, null, 2)}`;
      }
    }
  });

  form.mount();
}
