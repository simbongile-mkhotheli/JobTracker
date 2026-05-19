export function validateApplicationForm(formData) {
  const errors = {};

  const company = formData.company.trim();
  const role = formData.role.trim();
  const notes = formData.notes.trim();

  if (!company) {
    errors.company = "Company name is required.";
  } else if (company.length < 2) {
    errors.company =
      "Company name must be at least 2 characters.";
  } else if (company.length > 50) {
    errors.company =
      "Company name must be less than 50 characters.";
  }

  if (!role) {
    errors.role = "Role is required.";
  } else if (role.length < 2) {
    errors.role =
      "Role must be at least 2 characters.";
  } else if (role.length > 80) {
    errors.role =
      "Role must be less than 80 characters.";
  }

  if (
    formData.website &&
    !formData.normalizedDomain
  ) {
    errors.website =
      "Please enter a valid website domain.";
  }

  if (notes.length > 500) {
    errors.notes =
      "Notes must be less than 500 characters.";
  }

  if (!formData.dateApplied) {
    errors.dateApplied =
      "Application date is required.";
  }

  return errors;
}