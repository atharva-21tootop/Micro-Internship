export const scoreMatch = ({ internshipSkills = [], profileSkills = [] }) => {
  const profileSkillSet = new Set(profileSkills.map((skill) => skill.toLowerCase()))

  if (profileSkillSet.size === 0 || internshipSkills.length === 0) {
    return 0
  }

  const matched = internshipSkills.filter((skill) => profileSkillSet.has(skill.toLowerCase()))
  return Math.round((matched.length / internshipSkills.length) * 100)
}
