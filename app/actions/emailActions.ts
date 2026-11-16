"use server";

import { Resend } from "resend";
import { render } from "@react-email/render";
import { AdmissionCompletedTemplate } from "@/components/emails/AdmissionCompletedTemplate";
import { OTPTemplate } from "@/components/emails/OTPTemplate";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY || "re_xxxxxxxxx");

/**
 * Sends an OTP verification email
 */
export async function sendOTPEmail(email: string, otp: string) {
  try {
    const html = await render(React.createElement(OTPTemplate, { otp }));
    
    const { data, error } = await resend.emails.send({
      from: "Jamia Manager <verification@jamiamadeenathunnoor.org>",
      to: [email],
      subject: "Verification Code - Jamia Manager",
      html,
    });

    if (error) {
      console.error("Resend OTP Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("OTP Email Sending Failed:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred",
    };
  }
}

/**
 * Sends a registration completion email with the hall ticket attachment
 */
export async function sendAdmissionEmail(email: string, name: string, applicationNo: string, pdfBase64: string, courseName: string) {
  try {
    const html = await render(React.createElement(AdmissionCompletedTemplate, { name, applicationNo ,courseName}));

    const { data, error } = await resend.emails.send({
      from: "Jamia Admissions <admission@jamiamadeenathunnoor.org>",
      to: [email],
      subject: "Admission Registration Completed - Jamia Madeenathunnoor",
      html,
      attachments: [
        {
          filename: `Hall-Ticket-${applicationNo}.pdf`,
          content: pdfBase64,
        },
      ],
    });

    if (error) {
      console.error("Resend Admission Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Admission Email Sending Failed:", err);
    return {
      success: false,
      error: err.message || "An unexpected error occurred",
    };
  }
}
