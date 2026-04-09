"use client";

import { useState } from "react";
import { registerForEventAction, verifyPaymentAction } from "@/lib/actions/registration";

interface RegisterButtonProps {
  eventId: string;
  studentId: string;
  isPaid: boolean;
  price: number | null;
  eventTitle: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

import Script from "next/script";

export function RegisterButton({ eventId, studentId, isPaid, price, eventTitle }: RegisterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    setIsLoading(true);
    const res = await registerForEventAction(eventId, studentId);
    
    if (!res.success) {
      alert("Error: " + res.error);
      setIsLoading(false);
      return;
    }

    if (res.requiresPayment) {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: res.amount! * 100,
        currency: "INR",
        name: "HITAM EMS",
        description: `Registration for ${eventTitle}`,
        order_id: res.orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyPaymentAction(
            res.registrationId!,
            response.razorpay_payment_id,
            response.razorpay_order_id
          );
          if (verifyRes.success) {
            alert("Payment successful! You are registered.");
            window.location.reload();
          }
        },
        prefill: {
          name: "Student Name",
          email: "student@hitam.org",
        },
        theme: {
          color: "#2E7D32",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert("Success! You are now registered.");
      window.location.reload();
    }
    setIsLoading(false);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <button 
        onClick={handleRegister}
        disabled={isLoading}
        className="w-full bg-primary hover:bg-[#225c23] text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group disabled:opacity-50"
      >
        {isLoading ? "Processing..." : "Register Now"}
        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
    </>
  );
}
