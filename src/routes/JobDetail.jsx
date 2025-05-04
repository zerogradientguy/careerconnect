"use client"

import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building,
  Calendar,
  CheckCircle,
  Star,
  Share2,
  Bookmark,
  Send,
  AlertCircle,
  FileText,
  Globe,
} from "lucide-react"
import { getBackendUrl } from '../utils/getBackendUrl'

// Helper function to safely parse JSON or return an empty array
const safeJSONParse = (jsonString) => {
  try {
    return jsonString ? JSON.parse(jsonString) : []
  } catch (error) {
    console.error('Error parsing JSON:', error)
    return []
  }
}

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    resumeFile: null,
  })
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    fetchJobDetails()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        }
      })

      if (!response.ok) {
        throw new Error("Failed to fetch job details")
      }

      const jobData = await response.json()
      setJob(jobData)
    } catch (err) {
      console.error("Error fetching job details:", err)
      setError(err.message || "An error occurred while fetching job details")
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (job && job.userType && job.userType !== 'jobSeeker') {
      alert('Only job seekers can apply for jobs.');
      return;
    }
    setIsApplying(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setApplicationData({
      ...applicationData,
      [name]: value,
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setApplicationData({
        ...applicationData,
        resumeFile: file,
      })
    }
  }

  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    setSubmitError(null)

    try {
      const formData = new FormData()
      if (applicationData.resumeFile) {
        formData.append('resume', applicationData.resumeFile)
      }
      if (applicationData.coverLetter) {
        formData.append('coverLetter', applicationData.coverLetter)
      }

      const response = await fetch(`http://localhost:5000/api/jobs/${id}/apply`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit application")
      }

      setSubmitSuccess(true)
      setApplicationData({
        coverLetter: "",
        resumeFile: null,
      })

      setTimeout(() => {
        setIsApplying(false)
      }, 3000)
    } catch (err) {
      console.error("Error submitting application:", err)
      setSubmitError(err.message || "An error occurred while submitting your application")
    } finally {
      setSubmitLoading(false)
    }
  }

  const toggleSaveJob = () => {
    setIsSaved(!isSaved)
    // In a real app, this would make an API call to save/unsave the job
  }

  const shareJob = () => {
    // In a real app, this would open a share dialog
    // For now, we'll just copy the URL to clipboard
    navigator.clipboard.writeText(window.location.href)
    alert("Job URL copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Job</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={fetchJobDetails}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/jobs"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link to="/jobs" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Browse Jobs
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/jobs" className="text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Job Details</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start">
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <img
                    src={getBackendUrl(job.companyLogo) || "/placeholder.svg?height=60&width=60"}
                    alt={`${job.company} logo`}
                    className="w-16 h-16 object-contain rounded-md border border-gray-200"
                  />
                </div>
                <div className="flex-grow">
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h2>
                  <div className="flex items-center text-gray-700 mb-4">
                    <Building className="h-5 w-5 mr-1 text-gray-500" />
                    <span className="font-medium">{job.company}</span>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-1 text-gray-500" />
                      <span>{job.location}</span>
                      {job.is_remote && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Remote
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="h-5 w-5 mr-1 text-gray-500" />
                      <span>{job.type}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-5 w-5 mr-1 text-gray-500" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-1 text-gray-500" />
                      <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                    {job.application_deadline && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-1 text-gray-500" />
                        <span>Deadline: {new Date(job.application_deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={handleApply}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Apply Now
                </button>
                <button
                  onClick={toggleSaveJob}
                  className={`px-4 py-3 border rounded-md transition-colors flex items-center ${
                    isSaved
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Bookmark className="h-5 w-5 mr-2" />
                  {isSaved ? "Saved" : "Save Job"}
                </button>
                <button
                  onClick={shareJob}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
              <p className="text-gray-700 mb-6">{job.description}</p>

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                  <ul className="list-disc pl-5 mb-6 space-y-2">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="text-gray-700">
                        {req}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h4>
                  <ul className="list-disc pl-5 mb-6 space-y-2">
                    {job.responsibilities.map((resp, index) => (
                      <li key={index} className="text-gray-700">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="text-gray-700">
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Application Form */}
            {isApplying && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Apply for this Position</h3>

                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4 mb-6">
                    <div className="flex">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      <div>
                        <p className="font-medium">Application Submitted Successfully!</p>
                        <p className="mt-1">We'll notify you when the employer responds to your application.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitApplication}>
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4 mb-6">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                          <p>{submitError}</p>
                        </div>
                      </div>
                    )}

                    {/* Resume Upload */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resume/CV <span className="text-red-500">*</span>
                      </label>
                      <div
                        className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 ${
                          applicationData.resumeFile ? "border-green-300 bg-green-50" : "border-gray-300"
                        }`}
                        onClick={() => document.getElementById("resumeFile").click()}
                      >
                        <input
                          id="resumeFile"
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          required
                        />
                        {applicationData.resumeFile ? (
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-gray-700">{applicationData.resumeFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <FileText className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">
                              <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, or DOCX (max. 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="mb-6">
                      <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter
                      </label>
                      <textarea
                        id="coverLetter"
                        name="coverLetter"
                        rows={6}
                        value={applicationData.coverLetter}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Introduce yourself and explain why you're a good fit for this position..."
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => setIsApplying(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className={`px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${
                          submitLoading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {submitLoading ? (
                          <>
                            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Submit Application
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            {submitSuccess && (
              <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-md p-4">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <div>
                    <p className="font-medium">Application Submitted Successfully!</p>
                    <p className="mt-1">
                      You can track the status of your application in{" "}
                      <Link to="/applications" className="underline">
                        My Applications
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Match Score */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Score</h3>
              <div className="flex items-center mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      job.matchScore >= 80 ? "bg-green-500" : job.matchScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                    style={{ width: `${job.matchScore}%` }}
                  ></div>
                </div>
                <span className="ml-3 text-lg font-semibold">{job.matchScore}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Skills Match</span>
                  <span
                    className={`text-sm font-medium ${
                      job.matchScore >= 80
                        ? "text-green-600"
                        : job.matchScore >= 60
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {job.matchScore >= 80 ? "Excellent" : job.matchScore >= 60 ? "Good" : "Fair"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {job.matchScore >= 80
                    ? "Your skills are highly aligned with this position. This job is an excellent match for your profile."
                    : job.matchScore >= 60
                      ? "Your skills match many of the requirements for this position, but there may be some gaps."
                      : "You have some relevant skills, but there are significant gaps compared to the requirements."}
                </p>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
              <p className="text-gray-700 mb-4">{job.companyDescription}</p>
              <div className="space-y-2">
                {job.companySize && (
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Company Size</p>
                      <p className="text-sm text-gray-600">{job.companySize}</p>
                    </div>
                  </div>
                )}
                {job.companyIndustry && (
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Industry</p>
                      <p className="text-sm text-gray-600">{job.companyIndustry}</p>
                    </div>
                  </div>
                )}
                {job.companyWebsite && (
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Website</p>
                      <a
                        href={job.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {job.companyWebsite.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Jobs</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Link
                    key={i}
                    to={`/jobs/${job.id + i}`}
                    className="block p-4 border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900">
                      {i === 1 ? "Frontend Developer" : i === 2 ? "React Developer" : "UI/UX Developer"}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {i === 1 ? "WebTech Solutions" : i === 2 ? "Digital Innovations" : "CreativeTech"}
                    </p>
                    <div className="flex items-center mt-2">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">
                        {i === 1 ? "Remote" : i === 2 ? "San Francisco, CA" : "Boston, MA"}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-500">{90 - i * 5}% Match</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default JobDetail

