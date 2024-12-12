import React, { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT, PAYMENT_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const isIntiallyApplied = singleJob?.applications?.some(application => application.applicant === user?._id) || false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);
    const [paymentRequired, setPaymentRequired] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const initiatePayment = async () => {
        try {
            setPaymentLoading(true);
            // Create Razorpay order
            const orderResponse = await axios.post(
                `${PAYMENT_API_END_POINT}/create-order`, 
                { jobId }, 
                { withCredentials: true }
            );
            
            const options = {
                key: 'rzp_test_jluIdQ5a5i841C',
                amount: orderResponse.data.order.amount,
                currency: 'INR',
                name: 'Job Porter',
                description: 'Job Application Fee',
                order_id: orderResponse.data.order.id,
                handler: async (response) => {
                    console.log(response);
                    
                    try {
                        // Verify payment
                        const verifyResponse = await axios.post(
                            `${PAYMENT_API_END_POINT}/verify`, 
                            {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                jobId
                            }, 
                            { withCredentials: true }
                        );

                        if (verifyResponse.data.success) {
                            // Proceed with job application
                            console.log("h");
                            
                            await applyJobHandler();
                        }
                    } catch (error) {
                        toast.error('Payment verification failed');
                    }
                },
                theme: {
                    color: '#7209b7'
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            toast.error('Payment initiation failed');
        } finally {
            setPaymentLoading(false);
        }
    };

    const applyJobHandler = async () => {
        try {
            const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {withCredentials:true});
            console.log(res);
            if(res.data.success){
                setIsApplied(true);
                const updatedSingleJob = {...singleJob, applications:[...singleJob.applications,{applicant:user?._id}]}
                dispatch(setSingleJob(updatedSingleJob));
                toast.success(res.data.message);
                setPaymentRequired(false);
            }
        } catch (error) {
            console.log(error);
            
            // Check if payment is required
            if (error.response?.status === 402) {
                setPaymentRequired(true);
                toast.info(error.response.data.message);
            } else {
                toast.error(error.response?.data?.message || 'Application failed');
            }
        }
    }

    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                    setIsApplied(res.data.job.applications.some(application=>application.applicant === user?._id))
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob(); 
    },[jobId,dispatch, user?._id]);

    // Render button based on application status and payment requirement
    const renderApplyButton = () => {
        if (isApplied) {
            return (
                <Button
                    disabled
                    className='rounded-lg bg-gray-600 cursor-not-allowed'>
                    Already Applied
                </Button>
            );
        }

        if (paymentRequired) {
            return (
                <Button
                    onClick={initiatePayment}
                    disabled={paymentLoading}
                    className='rounded-lg bg-[#7209b7] hover:bg-[#5f32ad]'>
                    {paymentLoading ? 'Processing...' : 'Pay and Apply'}
                </Button>
            );
        }

        return (
            <Button
                onClick={applyJobHandler}
                className='rounded-lg bg-[#7209b7] hover:bg-[#5f32ad]'>
                Apply Now
            </Button>
        );
    };

    return (
        <div className='max-w-7xl mx-auto my-10'>
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='font-bold text-xl'>{singleJob?.title}</h1>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{singleJob?.postion} Positions</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{singleJob?.jobType}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary}LPA</Badge>
                    </div>
                </div>
                {renderApplyButton()}
            </div>
            {paymentRequired && (
                <div className='mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <p className='text-yellow-800'>
                        This job requires an application fee of ₹{singleJob?.applicationFee}. 
                        Please proceed with payment to apply.
                    </p>
                </div>
            )}
            <h1 className='border-b-2 border-b-gray-300 font-medium py-4'>Job Description</h1>
            <div className='my-4'>
                <h1 className='font-bold my-1'>Role: <span className='pl-4 font-normal text-gray-800'>{singleJob?.title}</span></h1>
                <h1 className='font-bold my-1'>Location: <span className='pl-4 font-normal text-gray-800'>{singleJob?.location}</span></h1>
                <h1 className='font-bold my-1'>Description: <span className='pl-4 font-normal text-gray-800'>{singleJob?.description}</span></h1>
                <h1 className='font-bold my-1'>Experience: <span className='pl-4 font-normal text-gray-800'>{singleJob?.experience} yrs</span></h1>
                <h1 className='font-bold my-1'>Salary: <span className='pl-4 font-normal text-gray-800'>{singleJob?.salary}LPA</span></h1>
                <h1 className='font-bold my-1'>Total Applicants: <span className='pl-4 font-normal text-gray-800'>{singleJob?.applications?.length}</span></h1>
                <h1 className='font-bold my-1'>Posted Date: <span className='pl-4 font-normal text-gray-800'>{singleJob?.createdAt.split("T")[0]}</span></h1>
            </div>
        </div>
    )
}

export default JobDescription