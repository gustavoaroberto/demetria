export const schema = {
  id: 'course-application',
  steps: [
    {
      id: 'applicant',
      title: 'Applicant details',
      description: 'Tell us how this fictional application should address you.',
      fields: [
        {
          name: 'displayName',
          type: 'text',
          label: 'Display name',
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
    },
    {
      id: 'course',
      title: 'Course choice',
      description: 'Choose one learning path and add any optional context.',
      fields: [
        {
          name: 'course',
          type: 'select',
          label: 'Course',
          required: true,
          options: [
            { label: 'Web foundations', value: 'web' },
            { label: 'TypeScript fundamentals', value: 'typescript' },
            { label: 'Accessible interfaces', value: 'accessibility' }
          ]
        },
        {
          name: 'notes',
          type: 'textarea',
          label: 'Application notes',
          description: 'Optional. Use fictional details only.'
        },
        {
          name: 'reminders',
          type: 'checkbox',
          label: 'Send a fictional reminder'
        }
      ]
    }
  ]
};

export const persistence = {
  type: 'sessionStorage',
  key: 'demetria-course-application'
};
