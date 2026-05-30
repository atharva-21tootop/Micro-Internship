import { scoreInternshipMatch } from '@/services/ai/recommendationService'

export const getInternshipFilterOptions = (internships) => ({
  organizations: [
    'all',
    ...new Set(internships.map((internship) => internship.company).filter(Boolean)),
  ],
  skills: [
    ...new Set(internships.flatMap((internship) => internship.skills || []).filter(Boolean)),
  ],
})

export const filterInternships = (internships, filters) => {
  const term = (filters.searchTerm || '').trim().toLowerCase()

  return internships.filter((internship) => {
    const matchesSearch =
      !term ||
      internship.title?.toLowerCase().includes(term) ||
      internship.company?.toLowerCase().includes(term) ||
      internship.description?.toLowerCase().includes(term)

    const matchesCategory =
      !filters.selectedCategory ||
      filters.selectedCategory === 'all' ||
      internship.category?.toLowerCase() === filters.selectedCategory.toLowerCase()

    const matchesDuration =
      !filters.selectedDuration ||
      filters.selectedDuration === 'all' ||
      internship.duration === filters.selectedDuration

    const matchesOrganization =
      !filters.selectedOrganization ||
      filters.selectedOrganization === 'all' ||
      internship.company === filters.selectedOrganization

    const matchesSkills =
      !filters.selectedSkills?.length ||
      (internship.skills || []).some((skill) => filters.selectedSkills.includes(skill))

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDuration &&
      matchesOrganization &&
      matchesSkills
    )
  })
}

export const sortInternshipsByProfileMatch = (internships, profile) => {
  if (!profile?.skills?.length) return internships

  return [...internships]
    .map((internship) => ({
      ...internship,
      ...scoreInternshipMatch(internship, profile),
    }))
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
}
