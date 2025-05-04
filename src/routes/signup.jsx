"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, Briefcase, Linkedin, Github, Check, Info } from "lucide-react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"; 

const SignUp = ({ setIsAuthenticated, setUser }) => {
  const navigate = useNavigate(); // ✅ Initialize navigation
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")


  const [formData, setFormData] = useState({
    fullName: "asdba",
    email: "",
    password: "@Polataxi69",
    confirmPassword: "@Polataxi69",
    userType: "jobSeeker", // Default to job seeker
    agreeToTerms: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    }

    return {
      isValid: Object.values(requirements).every(Boolean),
      requirements,
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    const { isValid } = validatePassword(formData.password)
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!isValid) {
      newErrors.password = "Password does not meet requirements"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})
    setError("")
    setMessage("")

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          userType: formData.userType,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Show success message
      setMessage("Registration successful! You can now sign in with your credentials.")
      
      // Clear form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        userType: "jobSeeker",
        agreeToTerms: false,
      })

    } catch (err) {
      setError(err.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const { requirements } = validatePassword(formData.password)

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
      <div className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="text-blue-600 font-bold text-2xl mb-2">
              Career<span className="text-blue-900">Connect</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-600 mt-2">Join CareerConnect to find your perfect job match</p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Sign up form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.fullName ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Enter your password"
                  onFocus={() => setShowPasswordRequirements(true)}
                  onBlur={() => setShowPasswordRequirements(false)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}

              {/* Password requirements */}
              {showPasswordRequirements && (
                <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Password requirements:
                  </p>
                  <ul className="space-y-1">
                    <li
                      className={`text-xs flex items-center ${requirements.length ? "text-green-600" : "text-gray-500"}`}
                    >
                      {requirements.length ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <span className="h-3 w-3 mr-1">•</span>
                      )}
                      At least 8 characters
                    </li>
                    <li
                      className={`text-xs flex items-center ${requirements.uppercase ? "text-green-600" : "text-gray-500"}`}
                    >
                      {requirements.uppercase ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <span className="h-3 w-3 mr-1">•</span>
                      )}
                      At least one uppercase letter
                    </li>
                    <li
                      className={`text-xs flex items-center ${requirements.lowercase ? "text-green-600" : "text-gray-500"}`}
                    >
                      {requirements.lowercase ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <span className="h-3 w-3 mr-1">•</span>
                      )}
                      At least one lowercase letter
                    </li>
                    <li
                      className={`text-xs flex items-center ${requirements.number ? "text-green-600" : "text-gray-500"}`}
                    >
                      {requirements.number ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <span className="h-3 w-3 mr-1">•</span>
                      )}
                      At least one number
                    </li>
                    <li
                      className={`text-xs flex items-center ${requirements.special ? "text-green-600" : "text-gray-500"}`}
                    >
                      {requirements.special ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <span className="h-3 w-3 mr-1">•</span>
                      )}
                      At least one special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* User Type selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`border rounded-md p-3 cursor-pointer ${
                    formData.userType === "jobSeeker"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() => setFormData({ ...formData, userType: "jobSeeker" })}
                >
                  <div className="flex items-center">
                    <User
                      className={`h-5 w-5 mr-2 ${formData.userType === "jobSeeker" ? "text-blue-500" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-medium ${formData.userType === "jobSeeker" ? "text-blue-700" : "text-gray-700"}`}
                    >
                      Job Seeker
                    </span>
                  </div>
                </div>
                <div
                  className={`border rounded-md p-3 cursor-pointer ${
                    formData.userType === "employer"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-300"
                  }`}
                  onClick={() => setFormData({ ...formData, userType: "employer" })}
                >
                  <div className="flex items-center">
                    <Briefcase
                      className={`h-5 w-5 mr-2 ${formData.userType === "employer" ? "text-blue-500" : "text-gray-400"}`}
                    />
                    <span
                      className={`text-sm font-medium ${formData.userType === "employer" ? "text-blue-700" : "text-gray-700"}`}
                    >
                      Employer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agree to Terms */}
            <div className="flex items-center">
              <input
                id="agreeToTerms"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                I agree to the <Link to="/terms" className="text-blue-600 hover:underline">terms and conditions</Link> <span className="text-red-500">*</span>
              </label>
            </div>

            {/* Sign up button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>
          </div>

          {/* Social signup buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span className="ml-2">LinkedIn</span>
            </button>
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Github className="h-5 w-5 text-gray-900" />
              <span className="ml-2">GitHub</span>
            </button>
          </div>

          {/* Sign in link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} CareerConnect. All rights reserved.</p>
      </div>
    </div>
  )
}

export default SignUp

