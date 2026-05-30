export const generateResumeSummary = (profile = {}) => {
  const name = profile.fullName || [profile.firstName, profile.lastName].filter(Boolean).join(' ')
  const skills = (profile.skills || []).join(', ')
  const interests = (profile.interests || []).join(', ')
  const projects = profile.projects || []
  const experience = profile.experience || []

  const projectLines = projects
    .slice(0, 3)
    .map((p) => `${p.title}: ${p.description || ''} (${(p.techStack || []).join(', ')})`)
    .join(' ')

  const expLines = experience
    .slice(0, 3)
    .map((e) => `${e.title} at ${e.company}`)
    .join('; ')

  let summary = skills
    ? `Student profile focused on ${skills}.`
    : 'Student profile ready for internship opportunities.'

  if (projectLines) summary += ` Projects: ${projectLines}.`
  if (expLines) summary += ` Experience: ${expLines}.`

  return {
    name: name || profile.email || 'Student',
    headline: interests ? `Aspiring ${interests.split(',')[0]} professional` : 'Aspiring intern',
    summary,
    skills: profile.skills || [],
    interests: profile.interests || [],
    projects,
    experience,
    education: {
      branch: profile.branch,
      year: profile.year,
      rollNumber: profile.rollNumber,
    },
  }
}
