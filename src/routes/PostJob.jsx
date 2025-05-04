"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Briefcase, MapPin, DollarSign, Calendar, Save, Plus, Trash2, AlertCircle } from "lucide-react"

const PostJob = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userType, setUserType] = useState(null)

  const [jobData, setJobData] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time", // Default value
    salary: "",
    description: "",
    requirements: [""],
    responsibilities: [""],
    benefits: [""],
    applicationDeadline: "",
    applicationEmail: "",
    applicationUrl: "",
    isRemote: false,
    experienceLevel: "Entry-level", // Default value
  })

  useEffect(() => {
    // Check user type when component mounts
    const checkUserType = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/status", {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
          }
        })

        if (!response.ok) {
          throw new Error("Failed to check user status")
        }

        const data = await response.json()
        setUserType(data.user?.userType)
      } catch (err) {
        console.error("Error checking user type:", err)
        setError("Failed to verify user type")
      }
    }

    checkUserType()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setJobData({
      ...jobData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleArrayItemChange = (field, index, value) => {
    const newArray = [...jobData[field]]
    newArray[index] = value
    setJobData({
      ...jobData,
      [field]: newArray,
    })
  }

  const addArrayItem = (field) => {
    setJobData({
      ...jobData,
      [field]: [...jobData[field], ""],
    })
  }

  const removeArrayItem = (field, index) => {
    const newArray = [...jobData[field]]
    newArray.splice(index, 1)
    setJobData({
      ...jobData,
      [field]: newArray,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      // Basic validation
      if (!jobData.title || !jobData.description) {
        throw new Error("Job title and description are required")
      }

      // Send job data to backend
      const response = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(jobData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to post job")
      }

      const data = await response.json()
      setSuccess("Job posted successfully!")

      // Redirect to job management page after a short delay
      setTimeout(() => {
        navigate("/jobs/manage")
      }, 2000)
    } catch (err) {
      console.error("Error posting job:", err)
      setError(err.message || "An error occurred while posting the job")
    } finally {
      setIsLoading(false)
    }
  }

  // If user is not an employer, show access denied message
  if (userType && userType !== 'employer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Only employers can post jobs. Please log in as an employer to continue.
          </p>
          <Link
            to="/signin"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In as Employer
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
            <Link to="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">{error}</div>}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md">{success}</div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {/* Basic Job Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Job Title */}
                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Briefcase className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        value={jobData.title}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. Senior Frontend Developer"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required
                      value={jobData.company}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your company name"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        required
                        value={jobData.location}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. New York, NY"
                      />
                    </div>
                  </div>

                  {/* Job Type */}
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      value={jobData.type}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  {/* Experience Level */}
                  <div>
                    <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                      Experience Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="experienceLevel"
                      name="experienceLevel"
                      required
                      value={jobData.experienceLevel}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Entry-level">Entry-level</option>
                      <option value="Mid-level">Mid-level</option>
                      <option value="Senior-level">Senior-level</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>

                  {/* Salary */}
                  <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                      Salary (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="salary"
                        name="salary"
                        type="text"
                        value={jobData.salary}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. $80,000 - $100,000"
                      />
                    </div>
                  </div>

                  {/* Application Deadline */}
                  <div>
                    <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                      Application Deadline (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="applicationDeadline"
                        name="applicationDeadline"
                        type="date"
                        value={jobData.applicationDeadline}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Remote Option */}
                  <div className="md:col-span-2">
                    <div className="flex items-center">
                      <input
                        id="isRemote"
                        name="isRemote"
                        type="checkbox"
                        checked={jobData.isRemote}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isRemote" className="ml-2 block text-sm text-gray-700">
                        This is a remote position
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Job Description</h2>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={6}
                    required
                    value={jobData.description}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Provide a detailed description of the job..."
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Requirements</h2>
                  <button
                    type="button"
                    onClick={() => addArrayItem("requirements")}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Requirement
                  </button>
                </div>
                <div className="space-y-3">
                  {jobData.requirements.map((req, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleArrayItemChange("requirements", index, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Requirement ${index + 1}`}
                      />
                      {jobData.requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("requirements", index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Responsibilities</h2>
                  <button
                    type="button"
                    onClick={() => addArrayItem("responsibilities")}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Responsibility
                  </button>
                </div>
                <div className="space-y-3">
                  {jobData.responsibilities.map((resp, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={resp}
                        onChange={(e) => handleArrayItemChange("responsibilities", index, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Responsibility ${index + 1}`}
                      />
                      {jobData.responsibilities.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("responsibilities", index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Benefits</h2>
                  <button
                    type="button"
                    onClick={() => addArrayItem("benefits")}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Benefit
                  </button>
                </div>
                <div className="space-y-3">
                  {jobData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleArrayItemChange("benefits", index, e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Benefit ${index + 1}`}
                      />
                      {jobData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem("benefits", index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="applicationEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Application Email (Optional)
                    </label>
                    <input
                      id="applicationEmail"
                      name="applicationEmail"
                      type="email"
                      value={jobData.applicationEmail}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. careers@example.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="applicationUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      External Application URL (Optional)
                    </label>
                    <input
                      id="applicationUrl"
                      name="applicationUrl"
                      type="url"
                      value={jobData.applicationUrl}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. https://example.com/careers"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  <Save className="h-5 w-5 mr-2" />
                  {isLoading ? "Posting..." : "Post Job"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default PostJob

