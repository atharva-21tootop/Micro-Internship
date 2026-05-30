export const buildResumeSummary = (profile = {}) => ({
  name: profile.fullName || profile.email || 'Student',
  skills: profile.skills || [],
  summary:
    profile.skills?.length > 0
      ? `Focused on ${profile.skills.join(', ')}.`
      : 'Ready for internship opportunities.',
})
