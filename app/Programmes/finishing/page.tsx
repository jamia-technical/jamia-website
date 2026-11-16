"use client";

import React from 'react';
import Image from 'next/image';
import { FaChalkboardTeacher, FaUserGraduate, FaBook } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Finishing: React.FC = () => {
  const features = [
    { title: "Advanced Scholarship", description: "Deep training in classical and contemporary Islamic theology", icon: <FaBook className="text-2xl text-blue-600" /> },
    { title: "Research Excellence", description: "Structured dissertation work supported by field immersion and internships", icon: <FaChalkboardTeacher className="text-2xl text-green-600" /> },
    { title: "Scholarly Leadership", description: "Preparation for teaching, academic roles, and leadership", icon: <FaUserGraduate className="text-2xl text-purple-600" /> },
  ];

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="relative h-64 md:h-96 bg-blue-900 pt-80 pb-10 lg:py-40">
        <Image src="/photos/63.JPG" alt="HS Programme Students" fill className="object-cover opacity-80" priority />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">FINISHING SCHOOL</h1>
            <p className="text-xl text-white">Post Graduate Diploma in Islamic Theology</p>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">FINISHING SCHOOL</h2>
          <div className="prose prose-lg text-gray-600 mb-12">
            <p>The Graduate School offers a one-year Post Graduate Diploma in Islamic Theology. This programme provides advanced training in global Islamic leadership, academic research, community development, and professional upskilling. Students engage in intensive coursework supported by dissertation writing, internships, industrial visits, and field immersion. The curriculum is designed to nurture scholars, leaders, and researchers with a balanced grounding in traditional knowledge and contemporary applications. Admission is merit-based and subject to interview evaluation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary/60">
                <div className="text-primary mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Finishing;
