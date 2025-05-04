"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Download,
  Plus,
  Loader,
  Globe,
  Building,
  Users,
  Clock,
  DollarSign,
  Linkedin,
  Twitter,
  Facebook,
  Search,
  ArrowRight,
  FileText,
} from "lucide-react"
import { getBackendUrl } from '../utils/getBackendUrl'

const UserProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userType, setUserType] = useState(null)
  const [applicationCounts, setApplicationCounts] = useState({ pending: 0, reviewed: 0, interviewed: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch user profile from backend
    const fetchProfile = async () => {
      try {
        setLoading(true)

        // Check authentication first
        const authResponse = await fetch("http://localhost:5000/api/auth/status", {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        })

        // Check if response is JSON
        const contentType = authResponse.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await authResponse.text();
          console.error("Non-JSON auth response:", text);
          navigate("/signin");
          return;
        }

        if (!authResponse.ok) {
          console.error("Auth status check failed:", authResponse.status);
          navigate("/signin")
          return
        }

        const authData = await authResponse.json()
        if (!authData.isAuthenticated) {
          navigate("/signin")
          return
        }

        // Set user type
        setUserType(authData.user.userType)

        // Fetch profile data
        const profileResponse = await fetch("http://localhost:5000/api/profile", {
          credentials: "include",
          headers: {
            "Accept": "application/json"
          }
        })

        // Check if response is JSON
        const profileContentType = profileResponse.headers.get("content-type");
        if (!profileContentType || !profileContentType.includes("application/json")) {
          const text = await profileResponse.text();
          console.error("Non-JSON profile response:", text);
          throw new Error("Server returned an invalid response");
        }

        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            // Profile not found, redirect to profile completion
            navigate("/complete-profile")
            return
          }
          throw new Error("Failed to fetch profile")
        }

        const profileData = await profileResponse.json()
        console.log("Profile data received:", profileData) // Log the profile data to see its structure
        setProfile(profileData)
        // Fetch applications and count statuses
        const appRes = await fetch("http://localhost:5000/api/applications", { credentials: "include" })
        if (appRes.ok) {
          const applications = await appRes.json()
          const counts = { pending: 0, reviewed: 0, interviewed: 0 }
          applications.forEach(app => {
            if (counts[app.status] !== undefined) counts[app.status]++
          })
          setApplicationCounts(counts)
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError(err.message || "An error occurred while fetching your profile")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            <p>{error}</p>
          </div>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg mb-4">
            <p>Your profile is not complete. Please complete your profile to continue.</p>
          </div>
          <Link
            to="/complete-profile"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Complete Profile
          </Link>
        </div>
      </div>
    )
  }

  // Render job seeker profile
  const renderJobSeekerProfile = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl mb-4">
                  {profile.fullName?.charAt(0) || <User size={24} />}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile.fullName || "Your Name"}</h2>
                <p className="text-gray-600">{profile.title || "Professional Title"}</p>
                <p className="text-gray-600 flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location || "Location"}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{profile.email || "Email"}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-500 mr-3" />
                  <span>{profile.phone || "Phone Number"}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <Link
                  to="/profile/edit"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
                {profile.resumeUrl && (
                  <a
                    href={getBackendUrl(profile.resumeUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CV
                  </a>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
                <Link to="/profile/edit/skills" className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">No skills added yet</p>
                )}
              </div>
            </div>

            {/* Job Preferences */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Job Preferences</h3>
                <Link to="/profile/edit/preferences" className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Job Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.jobPreferences?.jobTypes && profile.jobPreferences.jobTypes.length > 0 ? (
                      profile.jobPreferences.jobTypes.map((type, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          <Briefcase className="h-3 w-3 mr-1" />
                          {type}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No job types specified</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Preferred Locations</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.jobPreferences?.locations && profile.jobPreferences.locations.length > 0 ? (
                      profile.jobPreferences.locations.map((location, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {location}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No locations specified</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Industries</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.jobPreferences?.industries && profile.jobPreferences.industries.length > 0 ? (
                      profile.jobPreferences.industries.map((industry, index) => (
                        <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                          {industry}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No industries specified</p>
                    )}
                  </div>
                </div>
                {profile.jobPreferences?.minSalary && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Minimum Salary</h4>
                    <p className="text-gray-800">${profile.jobPreferences.minSalary}</p>
                  </div>
                )}
                {profile.jobPreferences?.availability && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Availability</h4>
                    <p className="text-gray-800 capitalize">{profile.jobPreferences.availability}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

      {/* Right Column - About, Job Search, Applications */}
          <div className="lg:col-span-2">
            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">About</h3>
                <Link to="/profile/edit/about" className="text-blue-600 hover:text-blue-800">
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
              <p className="text-gray-700">{profile.bio || "No professional summary provided yet."}</p>
            </div>

        {/* Job Search Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Find Jobs</h3>
            <Link
              to="/jobs"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Search Jobs
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-600 mb-2">Recommended Jobs</h4>
              <p className="text-gray-600 text-sm">Jobs that match your skills and preferences</p>
              <Link
                to="/jobs?filter=recommended"
                className="mt-2 inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
              >
                View Recommendations
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-600 mb-2">Saved Jobs</h4>
              <p className="text-gray-600 text-sm">Jobs you've bookmarked for later</p>
              <Link
                to="/jobs?filter=saved"
                className="mt-2 inline-flex items-center text-green-600 hover:text-green-800 text-sm"
              >
                View Saved Jobs
                <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
            </div>
          </div>
        </div>

        {/* Applications Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">My Applications</h3>
            <Link
              to="/applications"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              View All Applications
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{applicationCounts.pending}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Reviewed</p>
              <p className="text-2xl font-bold text-gray-900">{applicationCounts.reviewed}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Interviewed</p>
              <p className="text-2xl font-bold text-gray-900">{applicationCounts.interviewed}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render employer profile
  const renderEmployerProfile = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Company Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col items-center">
            {profile.logoUrl ? (
              <img
                src={getBackendUrl(profile.logoUrl) || "/placeholder.svg"}
                alt={`${profile.companyName} logo`}
                className="w-24 h-24 object-contain mb-4 rounded-lg border border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 bg-blue-600 rounded-lg flex items-center justify-center text-white text-3xl mb-4">
                <Building size={36} />
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{profile.companyName || "Company Name"}</h2>
            <p className="text-gray-600">{profile.industry || "Industry"}</p>
            <p className="text-gray-600 flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {profile.companyLocation || "Location"}
                          </p>
                        </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center">
              <Globe className="h-5 w-5 text-gray-500 mr-3" />
              {profile.companyWebsite ? (
                <a
                  href={profile.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {profile.companyWebsite.replace(/^https?:\/\/(www\.)?/, "")}
                </a>
              ) : (
                <span className="text-gray-500">Website not provided</span>
              )}
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-gray-500 mr-3" />
              <span>{profile.companySize || "Company size not specified"}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-3" />
              <span>Founded: {profile.foundedYear || "Year not specified"}</span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to="/profile/edit"
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Company Profile
            </Link>
                        </div>
                      </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            <Link to="/profile/edit/contact" className="text-blue-600 hover:text-blue-800">
              <Edit className="h-4 w-4" />
            </Link>
                    </div>
          <div className="space-y-3">
            <div className="flex items-center">
              <User className="h-5 w-5 text-gray-500 mr-3" />
              <div>
                <p className="text-gray-800">{profile.contactName || "Contact name not provided"}</p>
                <p className="text-sm text-gray-600">{profile.contactTitle || "Title not provided"}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-500 mr-3" />
              <span>{profile.contactEmail || "Email not provided"}</span>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-500 mr-3" />
              <span>{profile.contactPhone || "Phone number not provided"}</span>
            </div>
              </div>
            </div>

        {/* Social Media */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Media</h3>
            <Link to="/profile/edit/social" className="text-blue-600 hover:text-blue-800">
                    <Edit className="h-4 w-4" />
                  </Link>
                </div>
          <div className="space-y-3">
            {profile.linkedinUrl ? (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <Linkedin className="h-5 w-5 text-blue-700 mr-3" />
                <span>LinkedIn</span>
              </a>
            ) : (
              <div className="flex items-center text-gray-500">
                <Linkedin className="h-5 w-5 text-gray-400 mr-3" />
                <span>LinkedIn not provided</span>
              </div>
            )}

            {profile.twitterUrl ? (
              <a
                href={profile.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <Twitter className="h-5 w-5 text-blue-400 mr-3" />
                <span>Twitter</span>
              </a>
            ) : (
              <div className="flex items-center text-gray-500">
                <Twitter className="h-5 w-5 text-gray-400 mr-3" />
                <span>Twitter not provided</span>
              </div>
            )}

            {profile.facebookUrl ? (
              <a
                href={profile.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-blue-600"
              >
                <Facebook className="h-5 w-5 text-blue-800 mr-3" />
                <span>Facebook</span>
              </a>
            ) : (
              <div className="flex items-center text-gray-500">
                <Facebook className="h-5 w-5 text-gray-400 mr-3" />
                <span>Facebook not provided</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column - Company Description, Job Postings */}
      <div className="lg:col-span-2">
        {/* Company Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">About Company</h3>
            <Link to="/profile/edit/about" className="text-blue-600 hover:text-blue-800">
              <Edit className="h-4 w-4" />
            </Link>
          </div>
          <p className="text-gray-700">{profile.companyDescription || "No company description provided yet."}</p>
        </div>

        {/* Job Postings */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Job Postings</h3>
            <Link
              to="/jobs/post"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post a Job
            </Link>
              </div>

          {profile.jobPostings && profile.jobPostings.length > 0 ? (
            <div className="space-y-4">
              {profile.jobPostings.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                      <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {job.type}
                        </div>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <MapPin className="h-3 w-3 mr-1" />
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {job.salary}
                          </div>
                        )}
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Posted {job.postedDate}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      <Link
                        to={`/jobs/${job.id}/edit`}
                        className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/jobs/${job.id}/applications`}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Applications
                      </Link>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-700">{job.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-900 mb-1">No Job Postings Yet</h4>
              <p className="text-gray-600 mb-4">Start attracting top talent by posting your first job.</p>
              <Link
                to="/jobs/post"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post a Job
              </Link>
            </div>
                )}
              </div>

        {/* Company Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Job Postings</p>
              <p className="text-2xl font-bold text-gray-900">{profile.jobPostings?.length || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile.jobPostings?.filter((job) => job.status === "active").length || 0}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{profile.totalApplications || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {userType === "employer" ? "Company Profile" : "My Profile"}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {userType === "employer" ? renderEmployerProfile() : renderJobSeekerProfile()}
      </main>
    </div>
  )
}

export default UserProfile

