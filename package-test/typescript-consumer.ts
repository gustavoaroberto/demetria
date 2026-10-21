import { createForm, type FormSchema, type FormState } from 'demetria';

const schema = {
  id: 'consumer-check',
  steps: [
    {
      id: 'only-step',
      title: 'Only step',
      fields: [
        {
          name: 'answer',
          type: 'text',
          label: 'Answer',
          required: true
        }
      ]
    }
  ]
} as const satisfies FormSchema;

const form = createForm({ schema, target: document.body });
const state: FormState = form.getState();
form.setValue('answer', 'Yes');

void state;
