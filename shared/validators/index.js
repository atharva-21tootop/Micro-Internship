// shared/validators/index.js

/**
 * Email validation
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Password validation (minimum 6 characters)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Validate internship form data
 */
export const validateInternshipForm = (data) => {
  const errors = {};

  if (!data.title || data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (!data.company || data.company.trim().length < 2) {
    errors.company = "Company name is required";
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  if (!data.category) {
    errors.category = "Category is required";
  }

  if (!data.duration) {
    errors.duration = "Duration is required";
  }

  if (!data.location) {
    errors.location = "Location is required";
  }

  if (!Array.isArray(data.skills) || data.skills.length === 0) {
    errors.skills = "At least one skill is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate application form
 */
export const validateApplicationForm = (data) => {
  const errors = {};

  if (!data.studentName || data.studentName.trim().length < 2) {
    errors.studentName = "Name is required";
  }

  if (!data.studentEmail || !isValidEmail(data.studentEmail)) {
    errors.studentEmail = "Valid email is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user registration form
 */
export const validateRegisterForm = (data) => {
  const errors = {};

  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.firstName = "First name is required";
  }

  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.lastName = "Last name is required";
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.password || !isValidPassword(data.password)) {
    errors.password = "Password must be at least 6 characters";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!data.role || (data.role !== 'student' && data.role !== 'organization')) {
    errors.role = "Invalid role selected";
  }

  if (data.role === 'organization' && (!data.companyName || data.companyName.trim().length < 2)) {
    errors.companyName = "Company name is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (data) => {
  const errors = {};

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = "Valid email is required";
  }

  if (!data.password || data.password.length === 0) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return input.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file, maxSizeMB = 5, allowedTypes = ['pdf', 'doc', 'docx']) => {
  const errors = [];

  if (!file) {
    errors.push("File is required");
    return { isValid: false, errors };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File size must be less than ${maxSizeMB}MB`);
  }

  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    errors.push(`Only ${allowedTypes.join(', ')} files are allowed`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
