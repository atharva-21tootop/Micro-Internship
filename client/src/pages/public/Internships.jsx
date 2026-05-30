import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Users,
  DollarSign,
  X,
  ChevronDown,
  ChevronUp,
  Target,
  AlertCircle,
  Sparkles,
  Loader,
} from "lucide-react";
import "./Internships.css";

import { subscribeToInternships } from "@/services/internshipService";
import { auth } from "@/services/firebase/client";
import { getUser } from "@/services/userService";
import {
  filterInternships,
  getInternshipFilterOptions,
  sortInternshipsByProfileMatch,
} from "@/services/ai/filteringService";
import { sortInternshipsByMatch } from "@/services/ai/recommendationService";
import { formatDate } from "@/utils/formatDate";
import { openInternshipView } from "@/utils/internshipNav";
import { toMatchPercent, isRecommendedMatch } from "@/utils/matchScore";
import { fetchStudentRecommendations } from "@/services/api/studentApi";
import { mergeRecommendationScores } from "@/utils/mergeRecommendations";
import PageContainer from "@/components/common/PageContainer";
import { PageShell } from "@/components/common/SaaSPrimitives";
import { ROUTES } from "@/config/routes";

const Internships = () => {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  // User profile data
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [showMatchNotice, setShowMatchNotice] = useState(false);
  const [aiRecommended, setAiRecommended] = useState(false);
  const [aiSortedInternships, setAiSortedInternships] = useState([]);
  const [aiSorting, setAiSorting] = useState(false);
  const [profileSortActive, setProfileSortActive] = useState(false);
  const [matchScores, setMatchScores] = useState([]);

  const categories = [
    "all",
    "Technology",
    "Marketing",
    "Analytics",
    "Design",
    "Writing",
    "Sales",
  ];

  const durations = ["all", "4 weeks", "6 weeks", "8 weeks", "12 weeks"];

  // Get unique organizations and skills from internships
  const { organizations, skills: allSkills } = getInternshipFilterOptions(internships);

  // --- Real-time Firestore subscription ---
  useEffect(() => {
    setLoading(true);
    const showUnapproved = userRole === "admin";
    const unsub = subscribeToInternships((list) => {
      if (list && list.length > 0) {
        setInternships(list);
        setIsUsingMockData(false);
      } else {
        setInternships([]);
        setIsUsingMockData(false);
      }
      setLoading(false);
    }, 100, showUnapproved);

    return () => unsub();
  }, [userRole]);

  // Load current user profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const profileData = await getUser(firebaseUser.uid);
        setUserProfile(profileData);
        setUserRole(profileData?.role === "org" ? "organization" : profileData?.role || null);
      } else {
        setUser(null);
        setUserProfile(null);
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('internshipFilters');
    if (savedFilters) {
      try {
        const filters = JSON.parse(savedFilters);
        setSelectedCategory(filters.category || "all");
        setSelectedDuration(filters.duration || "all");
        setSelectedOrganization(filters.organization || "all");
        setSelectedSkills(filters.skills || []);
      } catch (e) {
        console.error('Error loading saved filters:', e);
      }
    }
  }, []);

  // Save filters when they change
  useEffect(() => {
    const filters = {
      category: selectedCategory,
      duration: selectedDuration,
      organization: selectedOrganization,
      skills: selectedSkills
    };
    localStorage.setItem('internshipFilters', JSON.stringify(filters));
  }, [selectedCategory, selectedDuration, selectedOrganization, selectedSkills]);

  useEffect(() => {
    if (!userProfile?.skills?.length) {
      setMatchScores([]);
      return undefined;
    }

    let active = true;
    fetchStudentRecommendations(50)
      .then((data) => {
        if (active) setMatchScores(data.recommendations || []);
      })
      .catch(() => {
        if (active) setMatchScores([]);
      });

    return () => {
      active = false;
    };
  }, [userProfile?.skills?.join('|')]);

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    selectedCategory !== 'all' ||
    selectedDuration !== 'all' ||
    selectedOrganization !== 'all' ||
    selectedSkills.length > 0;

  const filteredInternships = useMemo(
    () =>
      filterInternships(internships, {
        searchTerm,
        selectedCategory,
        selectedDuration,
        selectedOrganization,
        selectedSkills,
      }),
    [
      internships,
      searchTerm,
      selectedCategory,
      selectedDuration,
      selectedOrganization,
      selectedSkills,
    ],
  );

  useEffect(() => {
    if (!aiRecommended || !userProfile?.skills?.length) {
      setAiSortedInternships([]);
      setAiSorting(false);
      return undefined;
    }

    let cancelled = false;
    setAiSorting(true);

    sortInternshipsByMatch(filteredInternships, userProfile, { limit: 50, aiBatchSize: 3 })
      .then((sorted) => {
        if (!cancelled) setAiSortedInternships(sorted);
      })
      .catch(() => {
        if (!cancelled) setAiSortedInternships(filteredInternships);
      })
      .finally(() => {
        if (!cancelled) setAiSorting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [aiRecommended, userProfile, filteredInternships]);

  const profileSortedInternships = useMemo(() => {
    if (!profileSortActive || !userProfile?.skills?.length) {
      return null;
    }
    const source =
      filteredInternships.length === 0 && hasActiveFilters
        ? internships
        : filteredInternships.length > 0
          ? filteredInternships
          : internships;
    return sortInternshipsByProfileMatch(source, userProfile);
  }, [filteredInternships, profileSortActive, userProfile, hasActiveFilters, internships]);

  const baseDisplayList = useMemo(() => {
    const list =
      filteredInternships.length === 0 && hasActiveFilters
        ? internships
        : filteredInternships;

    if (!userProfile?.skills?.length) return list;
    return mergeRecommendationScores(list, matchScores);
  }, [filteredInternships, hasActiveFilters, internships, matchScores, userProfile?.skills?.length]);

  const displayInternships = useMemo(() => {
    if (profileSortActive && profileSortedInternships) {
      return mergeRecommendationScores(profileSortedInternships, matchScores);
    }
    if (aiRecommended && userProfile?.skills?.length) {
      const sorted =
        aiSortedInternships.length > 0 ? aiSortedInternships : baseDisplayList;
      return mergeRecommendationScores(sorted, matchScores);
    }
    return baseDisplayList;
  }, [
    profileSortActive,
    profileSortedInternships,
    aiRecommended,
    userProfile,
    aiSortedInternships,
    baseDisplayList,
    matchScores,
  ]);

  const totalPages = Math.max(1, Math.ceil(displayInternships.length / pageSize));
  const pageInternships = displayInternships.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // Handle matching internships with student profile
  const handleMatchMyProfile = () => {
    if (!userProfile?.skills?.length) {
      alert("Please add skills to your profile first!");
      return;
    }

    setProfileSortActive(true);
    setAiRecommended(false);
    setShowMatchNotice(true);
    setCurrentPage(1);
    setTimeout(() => setShowMatchNotice(false), 5000);
  };

  return (
    <PageContainer className="internships-page">
      <PageShell
        eyebrow="Internships"
        title="Find Your Perfect Internship"
        description="Discover opportunities that match your skills and interests. Use filters to narrow results."
      />

      <div className="internships">
      <div className="container-wide">
        <div className="search-filters">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search internships, companies, or skills..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="search-input"
            />
          </div>

          {/* Match Profile Notice */}
          {showMatchNotice && (
            <div className="match-notice">
              <AlertCircle size={18} />
              <span>Sorted by best match to your profile (all internships shown)</span>
              <button
                className="notice-close"
                onClick={() => setShowMatchNotice(false)}
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="filters">
            {user && userProfile && (
              <button
                className="match-profile-btn"
                onClick={handleMatchMyProfile}
                title="Filter internships based on your skills and interests"
              >
                <Target size={18} />
                Match My Profile
              </button>
            )}

            <button
              type="button"
              className={`ai-recommended-toggle ${aiRecommended ? "active" : ""}`}
              onClick={() => {
                if (!userProfile?.skills?.length) {
                  alert("Add skills in your profile to unlock AI recommendations.");
                  return;
                }
                setAiRecommended((prev) => !prev);
                setCurrentPage(1);
              }}
              title="Sort by AI match score"
            >
              <Sparkles size={18} />
              AI Recommended
            </button>

            <div className="filter-group">
              <Filter size={18} />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "all" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <Clock size={18} />
              <select
                value={selectedDuration}
                onChange={(e) => {
                  setSelectedDuration(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                {durations.map((dur) => (
                  <option key={dur} value={dur}>
                    {dur === "all" ? "All Durations" : dur}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="advanced-filter-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter size={18} />
              Advanced Filters
              {showAdvancedFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="advanced-filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Organization</label>
                <select
                  value={selectedOrganization}
                  onChange={(e) => {
                    setSelectedOrganization(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="filter-select"
                >
                  {organizations.map((org) => (
                    <option key={org} value={org}>
                      {org === "all" ? "All Organizations" : org}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Skills</label>
                <div className="skills-filter">
                  {allSkills.slice(0, 20).map((skill) => (
                    <label key={skill} className="skill-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSkills([...selectedSkills, skill]);
                          } else {
                            setSelectedSkills(selectedSkills.filter(s => s !== skill));
                          }
                          setCurrentPage(1);
                        }}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <div className="selected-skills">
                    {selectedSkills.map((skill) => (
                      <span key={skill} className="skill-tag">
                        {skill}
                        <button
                          onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))}
                          className="remove-skill"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="filter-actions">
              <button
                className="clear-filters-btn"
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedDuration("all");
                  setSelectedOrganization("all");
                  setSelectedSkills([]);
                  setCurrentPage(1);
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading">
            <h3>Loading internships...</h3>
          </div>
        )}

        {/* Results Info */}
        {!loading && (
          <div className="results-info">
            <div className="results-header">
              <p>
                {displayInternships.length} internships found
                {aiRecommended && userProfile?.skills?.length && (
                  <span className="ai-sort-label"> · sorted by AI match</span>
                )}
              </p>
              {aiSorting && (
                <span className="ai-sorting">
                  <Loader size={14} className="spinner-inline" />
                  Ranking matches…
                </span>
              )}
              {isUsingMockData && (
                <span className="mock-data-badge">
                  <AlertCircle size={14} />
                  Sample Data
                </span>
              )}
            </div>
          </div>
        )}

        {/* Internship Cards */}
        <div className="internships-grid">
          {!loading &&
            pageInternships.map((job) => (
              <div key={job.id} className="internship-card card">
                <div className="card-header">
                  <div className="title-row">
                    <h3>{job.title}</h3>
                    {toMatchPercent(job.matchScore) > 0 && (
                      <span className={`match-score-pill ${isRecommendedMatch(job.matchScore) ? 'recommended' : ''}`}>
                        {toMatchPercent(job.matchScore)}% Match
                        {isRecommendedMatch(job.matchScore) && ' · Recommended'}
                      </span>
                    )}
                    {job.approved === false && (
                      <span className="approval-badge pending" title="Awaiting admin approval">⏳ Pending</span>
                    )}
                    {job.approved === true && (
                      <span className="approval-badge approved" title="Approved by admin">✓ Approved</span>
                    )}
                  </div>
                  <p className="company">{job.company}</p>
                </div>

                <div className="card-details">
                  <div className="detail-item">
                    <MapPin size={16} />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  <div className="detail-item">
                    <Clock size={16} />
                    <span>{job.duration || '3 months'}</span>
                  </div>
                  <div className="detail-item">
                    <Users size={16} />
                    <span>{job.type || 'Full-time'}</span>
                  </div>
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span>{job.stipend || job.salary || 'Not specified'}</span>
                  </div>
                </div>

                <p className="description">{job.description || 'No description available'}</p>

                {job.reason && (
                  <p className="match-reason-inline">{job.reason}</p>
                )}

                {(job.matchedSkills || []).length > 0 && (
                  <div className="matched-skills-row">
                    {job.matchedSkills.map((skill) => (
                      <span key={skill} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                )}

                <div className="skills">
                  {(job.skills || []).map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="card-footer">
                  <div className="meta-info">
                    <span className="posted">
                      {formatDate(job.createdAt) !== 'N/A' ? formatDate(job.createdAt) : 'Recently posted'}
                    </span>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => openInternshipView(job, navigate)}
                    >
                      View Details
                    </button>
                    {job.approved === true && (
                      <Link to={ROUTES.internships.detail(job.id)} className="btn btn-primary">
                        Apply
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {!loading && displayInternships.length > pageSize && (
          <div className="pagination-controls">
            <button
              className="btn btn-outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              className="btn btn-outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Next
            </button>
          </div>
        )}

        {/* No results */}
        {!loading && displayInternships.length === 0 && (
          <div className="no-results">
            <h3>No internships found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
      </div>
    </PageContainer>
  );
};

export default Internships;
