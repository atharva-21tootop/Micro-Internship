// AI-powered profile insights and analysis

export const analyzeSkills = (skills, _interests) => {
  const commonTechSkills = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript', 'Firebase', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git']
  const commonBackendSkills = ['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'Docker', 'Firebase']
  const commonFrontendSkills = ['React', 'Vue', 'Angular', 'JavaScript', 'CSS', 'HTML']
  
  const userSkillsLower = (skills || []).map(s => s.toLowerCase())
  
  // Strong skills
  const strongSkills = skills?.filter(s => commonTechSkills.includes(s)) || []
  
  // Detect specialization
  const frontendCount = commonFrontendSkills.filter(s => userSkillsLower.includes(s.toLowerCase())).length
  const backendCount = commonBackendSkills.filter(s => userSkillsLower.includes(s.toLowerCase())).length
  
  let specialization = 'Full Stack'
  if (frontendCount > backendCount && frontendCount > 0) specialization = 'Frontend'
  else if (backendCount > frontendCount && backendCount > 0) specialization = 'Backend'
  
  // Weak areas
  const weakAreas = []
  if (backendCount === 0) weakAreas.push('Backend Development')
  if (frontendCount === 0) weakAreas.push('Frontend Development')
  if (!userSkillsLower.includes('dsa') && !userSkillsLower.includes('algorithms')) weakAreas.push('DSA & Algorithms')
  if (!userSkillsLower.includes('system design')) weakAreas.push('System Design')
  
  return {
    strongSkills,
    specialization,
    weakAreas: weakAreas.slice(0, 2), // Top 2 weak areas
  }
}

export const getCareerSuggestions = (skills, interests, specialization) => {
  const suggestionMap = {
    'Frontend': ['Frontend Developer', 'UI/UX Engineer', 'Full Stack Developer'],
    'Backend': ['Backend Developer', 'DevOps Engineer', 'Full Stack Developer'],
    'Full Stack': ['Full Stack Developer', 'Software Engineer', 'Tech Lead'],
  }
  
  const baseRoles = suggestionMap[specialization] || ['Software Developer']
  
  // Add interest-based suggestions
  const interestRoles = []
  const interestsLower = (interests || []).map(i => i.toLowerCase())
  
  if (interestsLower.includes('ai') || interestsLower.includes('machine learning')) {
    interestRoles.push('ML Engineer')
  }
  if (interestsLower.includes('cloud') || interestsLower.includes('devops')) {
    interestRoles.push('Cloud Architect')
  }
  if (interestsLower.includes('security')) {
    interestRoles.push('Security Engineer')
  }
  if (interestsLower.includes('mobile')) {
    interestRoles.push('Mobile Developer')
  }
  
  return [...baseRoles, ...interestRoles].slice(0, 4)
}

export const calculateProfileCompletion = (userData, formData, applications = [], achievementsCount = 0) => {
  const data = { ...userData, ...formData }
  
  const fields = {
    firstName: !!data.firstName,
    lastName: !!data.lastName,
    email: !!data.email,
    phone: !!data.phone,
    bio: !!data.bio && data.bio.length > 10,
    skills: (data.skills || []).length >= 3,
    interests: (data.interests || []).length >= 2,
    year: !!data.year,
    branch: !!data.branch,
    rollNumber: !!data.rollNumber,
    resumeUrl: !!data.resumeUrl,
    github: !!data.github,
    projects: (data.projects || []).length >= 1,
    experience: (data.experience || []).length >= 1 || applications.length >= 1,
    applications: applications.length >= 1,
    achievements: achievementsCount >= 1,
  }
  
  const completed = Object.values(fields).filter(Boolean).length
  const total = Object.keys(fields).length
  
  const percentage = Math.round((completed / total) * 100)
  
  return {
    percentage,
    completed,
    total,
    missing: Object.entries(fields)
      .filter(([_, value]) => !value)
      .map(([key]) => key)
  }
}

export const validateProfileForm = (data) => {
  const errors = {}

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Enter a valid email address'
  }

  if (data.phone && !/^[0-9+\-\s()]{7,20}$/.test(data.phone)) {
    errors.phone = 'Enter a valid phone number'
  }

  if (data.github && !/^https?:\/\/.+/i.test(data.github)) {
    errors.github = 'GitHub link must start with http:// or https://'
  }

  if (data.linkedin && !/^https?:\/\/.+/i.test(data.linkedin)) {
    errors.linkedin = 'LinkedIn link must start with http:// or https://'
  }

  if (data.portfolio && !/^https?:\/\/.+/i.test(data.portfolio)) {
    errors.portfolio = 'Portfolio link must start with http:// or https://'
  }

  const skills = data.skills || []
  if (skills.some((skill) => String(skill).length > 40)) {
    errors.skills = 'Each skill must be under 40 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const getProfileCompletionSuggestions = (missing) => {
  const suggestions = {
    firstName: 'Add your first name',
    lastName: 'Add your last name',
    email: 'Verify your email address',
    phone: 'Add your phone number',
    bio: 'Write a compelling bio (min 10 characters)',
    skills: 'Add at least 3 skills',
    interests: 'Add at least 2 career interests',
    year: 'Select your academic year',
    branch: 'Select your branch',
    rollNumber: 'Add your roll number',
    resumeUrl: 'Upload your resume',
    github: 'Add your GitHub profile',
    projects: 'Add at least one project',
    experience: 'Add internship experience or apply to an internship',
    applications: 'Apply to at least one internship',
    achievements: 'Earn your first achievement badge',
  }
  
  return missing.map(field => suggestions[field] || 'Complete this field')
}
