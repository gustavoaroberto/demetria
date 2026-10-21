export const schema = {
  id: 'course-application',
  steps: [
    {
      id: 'applicant',
      title: 'Applicant',
      fields: [
        {
          name: 'displayName',
          type: 'text',
          label: 'Display name',
          required: true
        },
        { name: 'email', type: 'email', label: 'Email', required: true }
      ]
    },
    {
      id: 'course',
      title: 'Course choice',
      fields: [
        {
          name: 'course',
          type: 'select',
          label: 'Course',
          required: true,
          options: [
            { label: 'Web fundamentals', value: 'web' },
            { label: 'TypeScript fundamentals', value: 'typescript' }
          ]
        }
      ]
    }
  ]
};

export const persistence = {
  type: 'sessionStorage',
  key: 'demetria-course-application'
};
