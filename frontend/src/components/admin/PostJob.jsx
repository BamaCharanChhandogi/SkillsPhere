// Frontend Component - PostJob.jsx
import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "", // Will be split into array on submit
        salary: "",
        experienceLevel: "", // Changed from experience to match schema
        location: "",
        jobType: "",
        position: 0,
        companyId: "",
        applicationFee: 10 // Default value as per schema
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);

    const changeEventHandler = (e) => {
        const value = e.target.type === 'number' ? 
            Number(e.target.value) : 
            e.target.value;
        
        setInput({ ...input, [e.target.name]: value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company) => 
            company.name.toLowerCase() === value
        );
        setInput({ ...input, companyId: selectedCompany._id });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Convert salary and experienceLevel to numbers
            const formData = {
                ...input,
                salary: Number(input.salary),
                experienceLevel: Number(input.experienceLevel),
                requirements: input.requirements.split(',').map(req => req.trim())
            };

            const res = await axios.post(`${JOB_API_END_POINT}/post`, formData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Navbar />
            <div className='flex items-center justify-center w-screen my-5'>
                <form onSubmit={submitHandler} className='p-8 max-w-4xl border border-gray-200 shadow-lg rounded-md'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='col-span-2'>
                            <Label>Job Title</Label>
                            <Input
                                type="text"
                                name="title"
                                value={input.title}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                required
                                placeholder="Enter job title"
                            />
                        </div>
                        
                        <div className='col-span-2'>
                            <Label>Job Description</Label>
                            <Input
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1 h-20"
                                required
                                placeholder="Enter detailed job description"
                            />
                        </div>
                        
                        <div className='col-span-2'>
                            <Label>Requirements (comma-separated)</Label>
                            <Input
                                type="text"
                                name="requirements"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                placeholder="React, Node.js, 3+ years experience..."
                                required
                            />
                        </div>
                        
                        <div>
                            <Label>Salary (per year)</Label>
                            <Input
                                type="number"
                                name="salary"
                                value={input.salary}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                required
                                min="0"
                            />
                        </div>
                        
                        <div>
                            <Label>Experience Level (years)</Label>
                            <Input
                                type="number"
                                name="experienceLevel"
                                value={input.experienceLevel}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                required
                                min="0"
                            />
                        </div>
                        
                        <div>
                            <Label>Location</Label>
                            <Input
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                required
                                placeholder="City, Country"
                            />
                        </div>
                        
                        <div>
                            <Label>Job Type</Label>
                            <Select onValueChange={(value) => setInput({ ...input, jobType: value })} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="full-time">Full Time</SelectItem>
                                        <SelectItem value="part-time">Part Time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div>
                            <Label>Number of Positions</Label>
                            <Input
                                type="number"
                                name="position"
                                value={input.position}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                min="1"
                                required
                            />
                        </div>
                        
                        <div>
                            <Label>Application Fee</Label>
                            <Input
                                type="number"
                                name="applicationFee"
                                value={input.applicationFee}
                                onChange={changeEventHandler}
                                className="focus-visible:ring-offset-0 focus-visible:ring-0 my-1"
                                min="0"
                            />
                        </div>
                        
                        {companies.length > 0 && (
                            <div>
                                <Label>Company</Label>
                                <Select onValueChange={selectChangeHandler} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a Company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {companies.map((company) => (
                                                <SelectItem 
                                                    key={company._id}
                                                    value={company.name.toLowerCase()}
                                                >
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    
                    {loading ? (
                        <Button disabled className="w-full my-4">
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please wait
                        </Button>
                    ) : (
                        <Button type="submit" className="w-full my-4">
                            Post New Job
                        </Button>
                    )}
                    
                    {companies.length === 0 && (
                        <p className='text-xs text-red-600 font-bold text-center my-3'>
                            *Please register a company first, before posting jobs
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PostJob;