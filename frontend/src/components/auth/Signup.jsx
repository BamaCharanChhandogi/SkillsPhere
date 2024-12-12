import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { RadioGroup } from '../ui/radio-group'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading } from '@/redux/authSlice'
import { Loader2, AlertTriangle, MailCheck } from 'lucide-react'

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: ""
    });

    const [emailSent, setEmailSent] = useState(false);
    const {loading, user} = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        setInput({ ...input, file: e.target.files?.[0] });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!input.fullname || !input.email || !input.phoneNumber || !input.password || !input.role) {
            toast.error("Please fill all fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        // Password strength validation
        if (input.password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        const formData = new FormData();
        formData.append("fullname", input.fullname);
        formData.append("email", input.email);
        formData.append("phoneNumber", input.phoneNumber);
        formData.append("password", input.password);
        formData.append("role", input.role);
        
        if (input.file) {
            formData.append("file", input.file);
        }

        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                headers: { 'Content-Type': "multipart/form-data" },
                withCredentials: true,
            });

            if (res.data.success) {
                setEmailSent(true);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if(user){
            navigate("/");
        }
    }, [user, navigate]);

    // If email verification email has been sent
    if (emailSent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                    <MailCheck className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="text-2xl font-bold text-green-600">Verify Your Email</h2>
                    <p className="text-gray-600 mb-4">
                        We've sent a verification link to <strong>{input.email}</strong>. 
                        Please check your inbox and click the link to verify your account.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setEmailSent(false)}
                        >
                            Back to Signup
                        </Button>
                        <Button 
                            onClick={() => {
                                window.open('https://mail.google.com', '_blank');
                            }}
                        >
                            Open Email
                        </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">
                        Didn't receive the email? Check your spam folder or 
                        <button 
                            className="text-blue-500 ml-1"
                            onClick={() => {
                                // Implement resend email logic
                                toast.info("Resend email functionality to be implemented");
                            }}
                        >
                            resend email
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center max-w-7xl mx-auto'>
                <form onSubmit={submitHandler} className='w-1/2 border border-gray-200 rounded-md p-4 my-10'>
                    <h1 className='font-bold text-xl mb-5'>Sign Up</h1>
                    
                    {/* Form fields remain the same as in previous implementation */}
                    <div className='my-2'>
                        <Label>Full Name</Label>
                        <Input
                            type="text"
                            value={input.fullname}
                            name="fullname"
                            onChange={changeEventHandler}
                            placeholder="Enter your full name"
                        />
                    </div>
                    
                    <div className='my-2'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="your.email@example.com"
                        />
                    </div>
                    
                    <div className='my-2'>
                        <Label>Phone Number</Label>
                        <Input
                            type="tel"
                            value={input.phoneNumber}
                            name="phoneNumber"
                            onChange={changeEventHandler}
                            placeholder="Enter your phone number"
                        />
                    </div>
                    
                    <div className='my-2'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="Enter your password"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 8 characters long
                        </p>
                    </div>
                    
                    <div className='flex items-center justify-between'>
                        <RadioGroup className="flex items-center gap-4 my-5">
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label>Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label>Recruiter</Label>
                            </div>
                        </RadioGroup>
                        
                        <div className='flex items-center gap-2'>
                            <Label>Profile Picture</Label>
                            <Input
                                accept="image/*"
                                type="file"
                                onChange={changeFileHandler}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                    
                    {loading ? (
                        <Button className="w-full my-4" disabled>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' /> 
                            Please wait
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full my-4">
                            Signup
                        </Button>
                    )}
                    
                    <div className="text-center">
                        <span className='text-sm'>
                            Already have an account? 
                            <Link to="/login" className='text-blue-600 ml-1'>
                                Login
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup