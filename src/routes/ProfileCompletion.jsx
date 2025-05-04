"use client"

import { useState, useRef, useEffect } from "react"
import { Link, useNavigate, Navigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Plus,
  X,
  Check,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Calendar,
  Globe,
  Phone,
  Mail,
  User,
} from "lucide-react"

const ProfileCompletion = ({ user }) => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [userType, setUserType] = useState(null)

  // Job seeker form data
  const [jobSeekerData, setJobSeekerData] = useState({
    // Personal Information
    title: "",
    phone: "",
    location: "",
    bio: "",

    // Skills
    skills: [],

    // Job Preferences
    jobTypes: [],
    locations: [],
    industries: [],
    minSalary: "",
    availability: "immediately",
    remotePreference: "hybrid",
  })

  // Employer form data
  const [employerData, setEmployerData] = useState({
    // Company Information
    companyName: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    companyWebsite: "",
    companyLocation: "",
    companyDescription: "",

    // Contact Information
    contactName: "",
    contactTitle: "",
    contactEmail: "",
    contactPhone: "",

    // Social Media
    linkedinUrl: "",
    twitterUrl: "",
    facebookUrl: "",
  })

  useEffect(() => {
    // First check localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setCurrentUser(userData)
      setUserType(userData.userType)
      setLoading(false)
      return
    }

    // If no stored user, check auth status
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/status", {
          credentials: "include",
        })
        const data = await response.json()

        if (response.ok && data.isAuthenticated) {
          setCurrentUser(data.user)
          setUserType(data.user.userType)
          localStorage.setItem('user', JSON.stringify(data.user))
        } else {
          navigate("/signin")
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        navigate("/signin")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [navigate])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!currentUser) {
    return <Navigate to="/signin" replace />
  }

  // Available options for selection
  const availableSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Flask",
    "SQL",
    "NoSQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "Machine Learning",
    "Data Analysis",
    "Project Management",
    "Agile",
    "Scrum",
    "UI/UX Design",
    "Graphic Design",
    "Content Writing",
    "Digital Marketing",
    "SEO",
    "Social Media Marketing",
    "Customer Service",
    "Sales",
    "Business Development",
    "Accounting",
  ]

  const jobTypeOptions = ["Full-time", "Part-time", "Contract", "Freelance", "Internship"]
  const locationOptions = ["Remote", "On-site", "Hybrid"]
  const industryOptions = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Retail",
    "Manufacturing",
    "Media",
    "Government",
    "Non-profit",
    "Consulting",
  ]
  const companySizeOptions = [
    "1-10 employees",
    "11-50 employees",
    "51-200 employees",
    "201-500 employees",
    "501-1000 employees",
    "1001+ employees",
  ]

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
    }
  }

  const handleSkillAdd = (skill) => {
    if (!jobSeekerData.skills.includes(skill)) {
      setJobSeekerData({
        ...jobSeekerData,
        skills: [...jobSeekerData.skills, skill],
      })
    }
  }

  const handleSkillRemove = (skill) => {
    setJobSeekerData({
      ...jobSeekerData,
      skills: jobSeekerData.skills.filter((s) => s !== skill),
    })
  }

  const toggleSelection = (field, value) => {
    const currentValues = jobSeekerData[field]
    if (currentValues.includes(value)) {
      setJobSeekerData({
        ...jobSeekerData,
        [field]: currentValues.filter((v) => v !== value),
      })
    } else {
      setJobSeekerData({
        ...jobSeekerData,
        [field]: [...currentValues, value],
      })
    }
  }

  const handleJobSeekerInputChange = (e) => {
    const { name, value } = e.target
    setJobSeekerData({
      ...jobSeekerData,
      [name]: value,
    })
  }

  const handleEmployerInputChange = (e) => {
    const { name, value } = e.target
    setEmployerData({
      ...employerData,
      [name]: value,
    })
  }

  // Update the handleSubmit function to use the full URL
  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Create form data for file upload and profile data
      const data = new FormData()

      // Add user type
      data.append("userType", userType)

      if (userType === "jobSeeker") {
        // Add resume file if selected
        if (resumeFile) {
          data.append("resume", resumeFile)
        }

        // Add personal information
        data.append("title", jobSeekerData.title)
        data.append("phone", jobSeekerData.phone)
        data.append("location", jobSeekerData.location)
        data.append("bio", jobSeekerData.bio)

        // Add skills as JSON string
        data.append("skills", JSON.stringify(jobSeekerData.skills))

        // Add job preferences
        data.append("jobTypes", JSON.stringify(jobSeekerData.jobTypes))
        data.append("locations", JSON.stringify(jobSeekerData.locations))
        data.append("industries", JSON.stringify(jobSeekerData.industries))
        data.append("minSalary", jobSeekerData.minSalary)
        data.append("availability", jobSeekerData.availability)
        data.append("remotePreference", jobSeekerData.remotePreference)
      } else if (userType === "employer") {
        // Add company logo if selected
        if (logoFile) {
          data.append("logo", logoFile)
        }

        // Add company information
        data.append("companyName", employerData.companyName)
        data.append("industry", employerData.industry)
        data.append("companySize", employerData.companySize)
        data.append("foundedYear", employerData.foundedYear)
        data.append("companyWebsite", employerData.companyWebsite)
        data.append("companyLocation", employerData.companyLocation)
        data.append("companyDescription", employerData.companyDescription)

        // Add contact information
        data.append("contactName", employerData.contactName)
        data.append("contactTitle", employerData.contactTitle)
        data.append("contactEmail", employerData.contactEmail)
        data.append("contactPhone", employerData.contactPhone)

        // Add social media
        data.append("linkedinUrl", employerData.linkedinUrl)
        data.append("twitterUrl", employerData.twitterUrl)
        data.append("facebookUrl", employerData.facebookUrl)

        // Log the data being sent
        console.log("Sending employer data:", Object.fromEntries(data.entries()))
      }

      // Send profile data to backend
      const response = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        body: data,
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }

      // Navigate to profile page on success
      navigate("/profile")
    } catch (error) {
      console.error("Error submitting profile data:", error)
      setError(error.message || "An error occurred while updating your profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    setStep(step + 1)
    window.scrollTo(0, 0)
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo(0, 0)
  }

  // Determine max steps based on user type
  const getMaxSteps = () => {
    if (userType === "jobSeeker") return 3
    if (userType === "employer") return 2
    return 1
  }

  // Render job seeker profile completion steps
  const renderJobSeekerSteps = () => {
    switch (step) {
      case 1:
        return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

              {/* Professional Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  value={jobSeekerData.title}
                  onChange={handleJobSeekerInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={jobSeekerData.phone}
                  onChange={handleJobSeekerInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={jobSeekerData.location}
                  onChange={handleJobSeekerInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. New York, NY"
                />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  required
                  value={jobSeekerData.bio}
                  onChange={handleJobSeekerInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your professional background and career goals"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume/CV <span className="text-red-500">*</span></label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleResumeFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  {resumeFile ? (
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm text-gray-700">{resumeFile.name}</span>
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          setResumeFile(null)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">
                        <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, or DOCX (max. 5MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
        )

      case 2:
        return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Skills & Expertise</h2>
              <p className="text-gray-600">
                Select skills that best represent your expertise. This helps us match you with the right opportunities.
              </p>

              {/* Selected Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Skills <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 mb-4">
                {jobSeekerData.skills.length > 0 ? (
                  jobSeekerData.skills.map((skill) => (
                      <div
                        key={skill}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button
                          onClick={() => handleSkillRemove(skill)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No skills selected yet</p>
                  )}
                </div>
              </div>

              {/* Available Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suggested Skills <span className="text-red-500">*</span></label>
                <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {availableSkills
                    .filter((skill) => !jobSeekerData.skills.includes(skill))
                      .map((skill) => (
                        <button
                          key={skill}
                          onClick={() => handleSkillAdd(skill)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {skill}
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Custom Skill Input */}
              <div>
                <label htmlFor="customSkill" className="block text-sm font-medium text-gray-700 mb-1">
                  Add Custom Skill <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    id="customSkill"
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a skill not listed above"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const customSkill = document.getElementById("customSkill").value.trim()
                    if (customSkill && !jobSeekerData.skills.includes(customSkill)) {
                        handleSkillAdd(customSkill)
                        document.getElementById("customSkill").value = ""
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  Next Step <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
        )

      case 3:
        return (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Job Preferences</h2>
              <p className="text-gray-600">Tell us about your ideal job so we can find the best matches for you.</p>

              {/* Job Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Types <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {jobTypeOptions.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleSelection("jobTypes", type)}
                      className={`px-4 py-2 rounded-md text-sm flex items-center ${
                      jobSeekerData.jobTypes.includes(type)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Location Preference <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {locationOptions.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => toggleSelection("locations", location)}
                      className={`px-4 py-2 rounded-md text-sm flex items-center ${
                      jobSeekerData.locations.includes(location)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Industries <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {industryOptions.map((industry) => (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => toggleSelection("industries", industry)}
                      className={`px-3 py-2 rounded-md text-sm flex items-center ${
                      jobSeekerData.industries.includes(industry)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Expectation */}
              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Salary Expectation (Annual) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="minSalary"
                    name="minSalary"
                    type="text"
                    required
                    value={jobSeekerData.minSalary}
                    onChange={handleJobSeekerInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. 75,000"
                  />
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div
                    className={`border rounded-md p-3 cursor-pointer ${
                    jobSeekerData.availability === "immediately"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  onClick={() => setJobSeekerData({ ...jobSeekerData, availability: "immediately" })}
                  >
                    <div className="flex items-center">
                      <Clock
                      className={`h-5 w-5 mr-2 ${jobSeekerData.availability === "immediately" ? "text-blue-500" : "text-gray-400"}`}
                      />
                      <span
                      className={`text-sm font-medium ${jobSeekerData.availability === "immediately" ? "text-blue-700" : "text-gray-700"}`}
                      >
                        Immediately
                      </span>
                    </div>
                  </div>
                  <div
                    className={`border rounded-md p-3 cursor-pointer ${
                    jobSeekerData.availability === "2weeks"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  onClick={() => setJobSeekerData({ ...jobSeekerData, availability: "2weeks" })}
                  >
                    <div className="flex items-center">
                      <Calendar
                      className={`h-5 w-5 mr-2 ${jobSeekerData.availability === "2weeks" ? "text-blue-500" : "text-gray-400"}`}
                      />
                      <span
                      className={`text-sm font-medium ${jobSeekerData.availability === "2weeks" ? "text-blue-700" : "text-gray-700"}`}
                      >
                        2 Weeks
                      </span>
                    </div>
                  </div>
                  <div
                    className={`border rounded-md p-3 cursor-pointer ${
                    jobSeekerData.availability === "1month"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-300"
                    }`}
                  onClick={() => setJobSeekerData({ ...jobSeekerData, availability: "1month" })}
                  >
                    <div className="flex items-center">
                      <Calendar
                      className={`h-5 w-5 mr-2 ${jobSeekerData.availability === "1month" ? "text-blue-500" : "text-gray-400"}`}
                      />
                      <span
                      className={`text-sm font-medium ${jobSeekerData.availability === "1month" ? "text-blue-700" : "text-gray-700"}`}
                      >
                        1 Month+
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Saving..." : "Complete Profile"}
                </button>
              </div>
            </div>
        )

      default:
        return null
    }
  }

  // Render employer profile completion steps
  const renderEmployerSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Company Information</h2>

            {/* Company Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo <span className="text-red-500">*</span></label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
                onClick={() => logoInputRef.current.click()}
              >
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileChange}
                  className="hidden"
                  accept="image/*"
                />
                {logoFile ? (
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-gray-700">{logoFile.name}</span>
                    <button
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        setLogoFile(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </>
          )}
        </div>
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={employerData.companyName}
                onChange={handleEmployerInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. Acme Corporation"
              />
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={employerData.industry}
                onChange={handleEmployerInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select an industry</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1">
                Company Size <span className="text-red-500">*</span>
              </label>
              <select
                id="companySize"
                name="companySize"
                required
                value={employerData.companySize}
                onChange={handleEmployerInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select company size</option>
                {companySizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Founded Year */}
            <div>
              <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700 mb-1">
                Founded Year <span className="text-red-500">*</span>
              </label>
              <input
                id="foundedYear"
                name="foundedYear"
                type="number"
                required
                value={employerData.foundedYear}
                onChange={handleEmployerInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. 2010"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            {/* Company Website */}
            <div>
              <label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-700 mb-1">
                Company Website <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyWebsite"
                  name="companyWebsite"
                  type="url"
                  required
                  value={employerData.companyWebsite}
                  onChange={handleEmployerInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. https://www.example.com"
                />
              </div>
            </div>

            {/* Company Location */}
            <div>
              <label htmlFor="companyLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Company Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="companyLocation"
                  name="companyLocation"
                  type="text"
                  required
                  value={employerData.companyLocation}
                  onChange={handleEmployerInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. New York, NY"
                />
              </div>
            </div>

            {/* Company Description */}
            <div>
              <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Company Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="companyDescription"
                name="companyDescription"
                rows={4}
                required
                value={employerData.companyDescription}
                onChange={handleEmployerInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about your company, mission, and culture"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
            <p className="text-gray-600">Provide contact details for job seekers to reach your company.</p>

            {/* Contact Name */}
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contactName"
                  name="contactName"
                  type="text"
                  required
                  value={employerData.contactName}
                  onChange={handleEmployerInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. John Smith"
                />
              </div>
            </div>

            {/* Contact Title */}
            <div>
              <label htmlFor="contactTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Person Title <span className="text-red-500">*</span>
              </label>
              <input
                id="contactTitle"
                name="contactTitle"
                type="text"
                required
                value={employerData.contactTitle}
                onChange={handleEmployerInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g. HR Manager"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  required
                  value={employerData.contactEmail}
                  onChange={handleEmployerInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. hr@example.com"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  required
                  value={employerData.contactPhone}
                  onChange={handleEmployerInputChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. +1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Company Social Media (Optional)</h3>

              {/* LinkedIn */}
              <div className="mb-3">
                <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn
                </label>
                <input
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url"
                  value={employerData.linkedinUrl}
                  onChange={handleEmployerInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. https://www.linkedin.com/company/example"
                />
              </div>

              {/* Twitter */}
              <div className="mb-3">
                <label htmlFor="twitterUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Twitter
                </label>
                <input
                  id="twitterUrl"
                  name="twitterUrl"
                  type="url"
                  value={employerData.twitterUrl}
                  onChange={handleEmployerInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. https://twitter.com/example"
                />
              </div>

              {/* Facebook */}
              <div>
                <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Facebook
                </label>
                <input
                  id="facebookUrl"
                  name="facebookUrl"
                  type="url"
                  value={employerData.facebookUrl}
                  onChange={handleEmployerInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. https://www.facebook.com/example"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Saving..." : "Complete Profile"}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with back button */}
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-3xl">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="text-blue-600 font-bold text-2xl mb-2">
              Career<span className="text-blue-900">Connect</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              {userType === "jobSeeker"
                ? "Help us personalize your job matching experience"
                : "Set up your company profile to start posting jobs"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
          )}

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className={`flex flex-col items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  1
                </div>
                <span className="text-xs mt-1">{userType === "jobSeeker" ? "Personal Info" : "Company Info"}</span>
              </div>

              <div className={`flex-1 h-1 mx-2 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}></div>

              <div className={`flex flex-col items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  2
                </div>
                <span className="text-xs mt-1">{userType === "jobSeeker" ? "Skills" : "Contact Info"}</span>
              </div>

              {userType === "jobSeeker" && (
                <>
                  <div className={`flex-1 h-1 mx-2 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}></div>
                  <div className={`flex flex-col items-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    >
                      3
                    </div>
                    <span className="text-xs mt-1">Preferences</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form steps based on user type */}
          {userType === "jobSeeker" ? renderJobSeekerSteps() : renderEmployerSteps()}
        </div>
      </div>
    </div>
  )
}

export default ProfileCompletion

