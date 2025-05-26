
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Mail, Lock, User, Loader2, Eye, EyeOff, X, ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Country data with name, dial code, and flag
const countries = [
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'China', code: 'CN', dialCode: '+86', flag: '🇨🇳' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flag: '🇯🇵' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
].sort((a, b) => a.name.localeCompare(b.name));

// Format phone number based on country
const formatPhoneNumber = (value: string, countryCode: string) => {
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  
  // Apply different formatting based on country
  switch(countryCode) {
    case 'US':
    case 'CA':
      // Format as (XXX) XXX-XXXX
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        return !match[2] 
          ? match[1] 
          : `(${match[1]}) ${match[2]}${match[3] ? `-${match[3]}` : ''}`;
      }
      break;
    case 'GB':
      // Format as XXXX XXX XXXX
      return cleaned.replace(/(\d{4})(\d{3})(\d{3,4})/, '$1 $2 $3');
    case 'NG':
    case 'GH':
    case 'KE':
      // Format as XXX XXX XXXX for African countries
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    default:
      // Default format: XXX XXX XXXX
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
  }
  
  return cleaned;
};

// Validate phone number based on country
const validatePhoneNumber = (phone: string, countryCode: string) => {
  const cleaned = phone.replace(/\D/g, '');
  
  // Define patterns for different countries
  const patterns: Record<string, RegExp> = {
    'US': /^[2-9]\d{9}$/,       // US/Canada: 10 digits, doesn't start with 1
    'CA': /^[2-9]\d{9}$/,       // Same as US for now
    'GB': /^7\d{9}$/,          // UK: 10 digits starting with 7
    'NG': /^[7-9]\d{9}$/,      // Nigeria: 10 digits starting with 7,8, or 9
    'GH': /^[2-9]\d{8}$/,      // Ghana: 9 digits starting with 2-9
    'KE': /^[17]\d{8}$/,       // Kenya: 9 digits starting with 1 or 7
    'ZA': /^[6-8]\d{8}$/,      // South Africa: 9 digits starting with 6-8
    'IN': /^[6-9]\d{9}$/,      // India: 10 digits starting with 6-9
    'FR': /^[6-7]\d{8}$/,      // France: 9 digits starting with 6 or 7
    'DE': /^[15]\d{9,10}$/,    // Germany: 10-11 digits starting with 15 or 1
    'CN': /^1[3-9]\d{9}$/,     // China: 11 digits starting with 13-9
    'JP': /^[7-9]0\d{8}$/,     // Japan: 10 digits starting with 70-90
    'AU': /^[4-5]\d{8}$/,      // Australia: 9 digits starting with 4 or 5
    'BR': /^[1-9]\d{9,10}$/    // Brazil: 10-11 digits, doesn't start with 0
  };
  
  const pattern = patterns[countryCode] || /^\d{6,15}$/; // Default: 6-15 digits
  return pattern.test(cleaned);
};

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [filteredCountries, setFilteredCountries] = useState(countries);
  const [isCountrySelectOpen, setIsCountrySelectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPhoneValid, setIsPhoneValid] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp } = useAuth();

  const from = location.state?.from?.pathname || "/dashboard";

  // Filter countries based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCountries(countries);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = countries.filter(
        country =>
          country.name.toLowerCase().includes(term) ||
          country.dialCode.includes(term) ||
          country.code.toLowerCase().includes(term)
      );
      setFilteredCountries(filtered);
    }
  }, [searchTerm]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Only allow digits and common formatting characters
    const cleaned = input.replace(/[^\d\s\-()]/g, '');
    const formatted = formatPhoneNumber(cleaned, selectedCountry.code);
    setPhone(formatted);
    
    // Validate phone number as user types
    if (formatted.trim() === '') {
      setIsPhoneValid(null);
    } else {
      const phoneNumber = formatted.replace(/\D/g, '');
      const isValid = validatePhoneNumber(phoneNumber, selectedCountry.code);
      setIsPhoneValid(isValid);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form fields
    if (!firstName.trim() || !lastName.trim() || !email || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone number
    const phoneNumber = phone.replace(/\D/g, '');
    const isPhoneValid = validatePhoneNumber(phoneNumber, selectedCountry.code);
    
    if (!isPhoneValid) {
      setError('Please enter a valid phone number for the selected country');
      setIsPhoneValid(false);
      return;
    }
    
    setIsPhoneValid(true);

    setIsLoading(true);

    try {
      // Format phone number with country code
      const formattedPhone = `${selectedCountry.dialCode}${phoneNumber}`;
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      
      const { error: signUpError } = await signUp(email, password, { 
        full_name: fullName,
        phone: formattedPhone,
        country_code: selectedCountry.code
      });
      
      if (signUpError) {
        throw signUpError;
      }
      
      toast.success("Account created successfully! Please check your email to verify your account.");
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Signup error:", err);
      let errorMessage = "Failed to create account. Please try again.";
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message);
      }
      
      // Handle common Supabase errors
      if (errorMessage.includes('User already registered')) {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address';
      } else if (errorMessage.includes('Password should be at least 6 characters')) {
        errorMessage = 'Password must be at least 6 characters long';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url('/images/background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#000'
      }}
    >
      {/* Background overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-purple-900/20 to-blue-900/30"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-purple-500/10 filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-500/10 filter blur-3xl animate-pulse delay-1000"></div>
      
      <div className="w-full max-w-md px-6 py-8 relative z-10">
        <Card className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
          <CardHeader className="pb-6 relative">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-white">Create an account</h1>
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </Link>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Join TrackSlip and start tracking expenses
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCountrySelectOpen(!isCountrySelectOpen);
                          setSearchTerm('');
                        }}
                        className="flex items-center justify-center h-12 w-24 bg-gray-800/50 border border-gray-700/50 rounded-l-md text-white hover:bg-gray-700/50 transition-colors"
                      >
                        <span className="text-lg mr-2">{selectedCountry.flag}</span>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </button>
                      
                      {isCountrySelectOpen && (
                        <div className="absolute z-20 mt-1 w-80 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-80 overflow-hidden">
                          <div className="sticky top-0 bg-gray-800 p-2 border-b border-gray-700">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search country..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                              />
                            </div>
                          </div>
                          <div className="py-1 overflow-y-auto max-h-64">
                            {filteredCountries.length > 0 ? (
                              filteredCountries.map((country) => (
                                <button
                                  key={country.code}
                                  type="button"
                                  className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-700/50 ${
                                    selectedCountry.code === country.code ? 'bg-blue-600/20' : ''
                                  }`}
                                  onClick={() => {
                                    setSelectedCountry(country);
                                    setIsCountrySelectOpen(false);
                                    setSearchTerm('');
                                  }}
                                >
                                  <span className="text-lg mr-3 w-6 text-center">{country.flag}</span>
                                  <span className="text-gray-300 flex-1">{country.name}</span>
                                  <span className="text-gray-400 text-xs">{country.dialCode}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-4 py-3 text-sm text-gray-400 text-center">
                                No countries found
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-400 text-sm">
                          {selectedCountry.dialCode}
                        </span>
                      </div>
                      <div className="relative flex-1">
                        <Input
                          type="tel"
                          placeholder="123 456 7890"
                          value={phone}
                          onChange={handlePhoneChange}
                          className={`h-12 pl-20 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 rounded-l-none ${
                            isPhoneValid === false ? 'border-red-500' : ''
                          } ${
                            isPhoneValid === true ? 'border-green-500' : ''
                          }`}
                          disabled={isLoading}
                          required
                        />
                        {isPhoneValid === true && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                            ✓
                          </span>
                        )}
                        {isPhoneValid === false && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                            ✕
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs text-gray-400">
                      Format: {selectedCountry.flag} {selectedCountry.name} {selectedCountry.dialCode}
                    </p>
                    {phone && (
                      <p className={`text-xs ${
                        isPhoneValid === false ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {isPhoneValid === false ? 'Invalid' : 'Valid'} number: {selectedCountry.dialCode} {phone}
                      </p>
                    )}
                    {isPhoneValid === false && (
                      <p className="text-xs text-red-400">
                        Please enter a valid {selectedCountry.name} phone number
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                    disabled={isLoading}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create an account'
                )}
              </Button>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Or sign in with</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>

              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12 bg-gray-800/50 border-gray-700/50 text-white hover:bg-gray-700/50 transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center pt-6 space-y-4">
            <p className="text-sm text-gray-400">
              Already have an account? 
              <Link to="/login" className="text-blue-400 hover:text-blue-300 ml-1 transition-colors">
                Sign in
              </Link>
            </p>
            
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">user agreement</a>{" "}
              and acknowledge our{" "}
              <a href="#" className="text-blue-400 hover:text-blue-300">privacy notice</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
