function currentFields(schema) {
  return new Map(
    schema.steps.flatMap((step) =>
      step.fields.map((field) => [field.name, field])
    )
  );
}

function decorateLabels(target, fields) {
  for (const control of target.querySelectorAll('[name]')) {
    const field = fields.get(control.getAttribute('name'));
    const label = target.querySelector(`label[for="${control.id}"]`);
    if (
      field === undefined ||
      label === null ||
      label.querySelector('.demetria__field-status') !== null
    )
      continue;
    label.textContent = field.label;
    const status = document.createElement('span');
    status.className = 'demetria__field-status';
    status.textContent = field.required === true ? 'Required' : 'Optional';
    label.append(' ', status);
  }
}

export function enhanceExample({ schema, target = '#demetria-form' }) {
  const root = document.querySelector(target);
  const toggle = document.querySelector('#presentation-toggle');
  const fields = currentFields(schema);
  if (root !== null) {
    decorateLabels(root, fields);
    new MutationObserver(() => decorateLabels(root, fields)).observe(root, {
      childList: true,
      subtree: true
    });
  }
  if (toggle !== null) {
    toggle.addEventListener('click', () => {
      const native = document.body.classList.toggle('example--native');
      toggle.setAttribute('aria-pressed', String(native));
      toggle.textContent = native
        ? 'Use styled controls'
        : 'Use native controls';
    });
  }
}
