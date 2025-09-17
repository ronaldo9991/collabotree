import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { LogIn, UserPlus, GraduationCap, ShoppingCart, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function SignIn() {
  const [, setLocation] = useLocation();
  const { login, register } = useAuth();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'student' | 'buyer',
    university: '',
    skills: [] as string[],
    companyName: '',
    industry: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(loginData.email, loginData.password);
      // Redirect based on user role
      if (user?.role === 'student') {
        setLocation('/dashboard/student');
      } else if (user?.role === 'buyer') {
        setLocation('/dashboard/buyer');
      } else if (user?.role === 'admin') {
        setLocation('/dashboard/admin');
      } else {
        setLocation('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (registerData.role === 'student' && !registerData.university) {
      setError('University is required for student registration');
      setLoading(false);
      return;
    }

    try {
      const user = await register({
        email: registerData.email,
        fullName: registerData.fullName,
        password: registerData.password,
        role: registerData.role,
        university: registerData.role === 'student' ? registerData.university : undefined,
        skills: registerData.role === 'student' ? registerData.skills : undefined,
        companyName: registerData.role === 'buyer' ? registerData.companyName : undefined,
        industry: registerData.role === 'buyer' ? registerData.industry : undefined,
      });
      // Redirect based on user role
      if (user?.role === 'student') {
        setLocation('/dashboard/student');
      } else if (user?.role === 'buyer') {
        setLocation('/dashboard/buyer');
      } else if (user?.role === 'admin') {
        setLocation('/dashboard/admin');
      } else {
        setLocation('/dashboard');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to CollaboTree
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with top university talent worldwide
          </p>
        </div>

        <Card className="glass-card bg-card/80 backdrop-blur-12 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-primary/10">
                <TabsTrigger 
                  value="login" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-primary/70"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:text-primary/70"
                >
                  <UserPlus className="h-5 w-5" />
                  Register
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-4">
                    <Label>I want to:</Label>
                    <Select 
                      value={registerData.role} 
                      onValueChange={(value: 'student' | 'buyer') => 
                        setRegisterData({ ...registerData, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer" className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Hire student talent
                          </div>
                        </SelectItem>
                        <SelectItem value="student" className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Offer my services
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-fullName">Full Name</Label>
                    <Input
                      id="register-fullName"
                      placeholder="John Doe"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">
                      Email {registerData.role === 'student' && <span className="text-sm text-muted-foreground">(.edu domain required)</span>}
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={registerData.role === 'student' ? 'john@university.edu' : 'john@example.com'}
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>

                  {registerData.role === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="register-university">University</Label>
                      <Input
                        id="register-university"
                        placeholder="Stanford University"
                        value={registerData.university}
                        onChange={(e) => setRegisterData({ ...registerData, university: e.target.value })}
                        required
                      />
                    </div>
                  )}

                  {registerData.role === 'buyer' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="register-companyName">Company Name</Label>
                        <Input
                          id="register-companyName"
                          placeholder="Acme Corp"
                          value={registerData.companyName}
                          onChange={(e) => setRegisterData({ ...registerData, companyName: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-industry">Industry</Label>
                        <Input
                          id="register-industry"
                          placeholder="Technology"
                          value={registerData.industry}
                          onChange={(e) => setRegisterData({ ...registerData, industry: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Create password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-confirmPassword">Confirm</Label>
                      <div className="relative">
                        <Input
                          id="register-confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : `Register as ${registerData.role === 'student' ? 'Student' : 'Buyer'}`}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
