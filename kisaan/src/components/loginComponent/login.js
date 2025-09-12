import React, { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import { Spinner } from "react-bootstrap";
import { baseUrl } from "../../baseUrl";
import { Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { emailValidator } from "../../utils/utils";

// Constants for better maintainability
const LOGIN_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

const ERROR_MESSAGES = {
  INVALID_EMAIL: 'Please enter a valid email address',
  EMPTY_PASSWORD: 'Password is required',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  GENERIC_ERROR: 'An error occurred. Please try again.',
  EMAIL_NOT_VERIFIED: 'Email not verified. Please verify your email first!'
};

// Custom hook for form validation
const useFormValidation = () => {
  const validateForm = useCallback((email, password) => {
    const errors = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailValidator(email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }
    
    if (!password.trim()) {
      errors.password = ERROR_MESSAGES.EMPTY_PASSWORD;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }, []);
  
  return { validateForm };
};

// Custom hook for login API call
const useLoginApi = () => {
  const [loginState, setLoginState] = useState(LOGIN_STATES.IDLE);
  const [apiError, setApiError] = useState('');
  
  const login = useCallback(async (credentials) => {
    setLoginState(LOGIN_STATES.LOADING);
    setApiError('');
    
    try {
      const response = await axios.post(`${baseUrl}/login`, {
        email: credentials.email,
        password: credentials.password
      });
      
      setLoginState(LOGIN_STATES.SUCCESS);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      setLoginState(LOGIN_STATES.ERROR);
      
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setApiError(ERROR_MESSAGES.NETWORK_ERROR);
      } else {
        setApiError(ERROR_MESSAGES.GENERIC_ERROR);
      }
      
      return {
        success: false,
        error: error.response?.data?.message || ERROR_MESSAGES.GENERIC_ERROR
      };
    }
  }, []);
  
  const resetLoginState = useCallback(() => {
    setLoginState(LOGIN_STATES.IDLE);
    setApiError('');
  }, []);
  
  return {
    loginState,
    apiError,
    login,
    resetLoginState,
    isLoading: loginState === LOGIN_STATES.LOADING
  };
};

export default function Login() {
  const history = useHistory();
  const { validateForm } = useFormValidation();
  const { loginState, apiError, login, resetLoginState, isLoading } = useLoginApi();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  
  // Refs for form elements
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  
  // Focus email input on component mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);
  
  // Clear API errors when form data changes
  useEffect(() => {
    if (apiError) {
      resetLoginState();
    }
  }, [formData, apiError, resetLoginState]);
  
  // Handle input changes
  const handleInputChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear general errors
    if (validationErrors.general) {
      setValidationErrors(prev => ({
        ...prev,
        general: ''
      }));
    }
  }, [validationErrors]);
  
  // Handle password visibility toggle
  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form only on submit
    const { isValid, errors } = validateForm(formData.email, formData.password);
    setValidationErrors(errors);
    
    if (!isValid) {
      // Focus first field with error
      if (errors.email) {
        emailRef.current?.focus();
      } else if (errors.password) {
        passwordRef.current?.focus();
      }
      return;
    }
    
    // Attempt login
    const result = await login(formData);
    
    if (result.success) {
      const { data } = result;
      
      if (data.status) {
        // Login successful
        localStorage.setItem("token", data.message);
        history.push("/home");
      } else if (data.message === "Otp not verified.") {
        // Email not verified
        alert(ERROR_MESSAGES.EMAIL_NOT_VERIFIED);
        sessionStorage.setItem("email", formData.email);
        history.push("/otpVerify");
      } else {
        // Login failed with specific message
        setValidationErrors({ general: data.message });
      }
    }
  }, [formData, validateForm, login, history]);
  
  // Handle Enter key press for better UX
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit(e);
    }
  }, [handleSubmit, isLoading]);
  
  // Get error message to display
  const displayError = apiError || validationErrors.general;
  
  // Icons for password visibility
  const eyeIcon = <FontAwesomeIcon icon={faEye} />;
  const eyeSlashIcon = <FontAwesomeIcon icon={faEyeSlash} />;
  
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-700 p-4">
      <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl animate-fade-in">
        <h2 className="text-center text-2xl sm:text-3xl font-semibold text-gray-800 mb-6 sm:mb-8">Welcome Kisaan!</h2>
        
        {displayError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center" role="alert" aria-live="polite">
            <span className="mr-2">⚠️</span>
            <span className="text-sm">{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email: <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <input
              ref={emailRef}
              type="email"
              className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-lg border-2 transition-all duration-300 bg-gray-50 focus:outline-none focus:bg-white text-base ${
                validationErrors.email 
                  ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100 animate-shake' 
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
              } focus:ring-4 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70`}
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange('email')}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              required
              aria-describedby={validationErrors.email ? "email-error" : undefined}
              aria-invalid={!!validationErrors.email}
            />
            {validationErrors.email && (
              <div id="email-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.email}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password: <span aria-hidden="true" className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                className={`w-full px-3 sm:px-4 py-3 sm:py-3.5 pr-12 rounded-lg border-2 transition-all duration-300 bg-gray-50 focus:outline-none focus:bg-white text-base ${
                  validationErrors.password 
                    ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100 animate-shake' 
                    : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                } focus:ring-4 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-70`}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                required
                aria-describedby={validationErrors.password ? "password-error" : undefined}
                aria-invalid={!!validationErrors.password}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 hover:text-indigo-500 focus:outline-none focus:text-indigo-500 transition-colors duration-200 rounded-r-lg"
                onClick={handleTogglePasswordVisibility}
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTogglePasswordVisibility();
                  }
                }}
              >
                <span className="text-lg">
                  {showPassword ? eyeSlashIcon : eyeIcon}
                </span>
              </button>
            </div>
            {validationErrors.password && (
              <div id="password-error" className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.password}
              </div>
            )}
          </div>

          <button 
            className={`w-full py-3 sm:py-3.5 px-4 sm:px-6 rounded-lg font-medium text-white text-base transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-green-300 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0'
            } mt-6 sm:mt-8`}
            type="submit" 
            disabled={isLoading}
            aria-describedby="login-button-status"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <span>Logging in</span>
                <Spinner 
                  animation="border" 
                  size="sm" 
                  role="status"
                  aria-label="Loading"
                  className="ml-2"
                />
              </div>
            ) : (
              "Login"
            )}
          </button>
          
          {isLoading && (
            <div id="login-button-status" className="sr-only" aria-live="polite">
              Logging in, please wait...
            </div>
          )}
        </form>

        <div className="text-center mt-6">
          <Link 
            to="/forgotPassword" 
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium hover:underline transition-colors duration-200"
            tabIndex={isLoading ? -1 : 0}
          >
            Forgot Password?
          </Link>
        </div>

        <div className="text-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm mb-3">
            Not registered yet?
          </p>
          <Link 
            to="/signUp" 
            className="inline-block bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300 w-full sm:w-auto"
            tabIndex={isLoading ? -1 : 0}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
