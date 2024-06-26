# Demetria

[![npm version](https://badge.fury.io/js/demetria.svg)](https://badge.fury.io/js/demetria)

Demetria is a library written in TypeScript aimed at creating dynamic multi-step forms easily and efficiently.

## Installation

You can install the library via npm:

```bash
npm install demetria
```

## Basic Usage

Here is an example of how to use Demetria to create a multi-step form:

```typescript
import { MultiStepForm } from 'demetria';

const form = new MultiStepForm({
    steps: [
        {
            name: 'Personal Information',
            fields: [
                { type: 'text', label: 'Name', name: 'name', required: true },
                { type: 'email', label: 'Email', name: 'email', required: true },
            ]
        },
        {
            name: 'Address',
            fields: [
                { type: 'text', label: 'Street', name: 'street', required: true },
                { type: 'text', label: 'City', name: 'city', required: true },
                { type: 'text', label: 'State', name: 'state', required: true },
                { type: 'text', label: 'Zip Code', name: 'zip', required: true },
            ]
        },
        // Add more steps as needed
    ]
});

form.render('#form-container');
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your changes.

## License

This project is licensed under the MIT License.