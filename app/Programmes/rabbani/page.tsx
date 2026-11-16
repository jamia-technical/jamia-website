"use client";

import React from 'react';
import Image from 'next/image';
import { FaChalkboardTeacher, FaUserGraduate, FaArrowRight } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { MdAssignmentInd } from 'react-icons/md';
import Link from 'next/link';

const Rabbani: React.FC = () => {
  const features = [
    { title: "Community Leadership", description: "Practical training for mosque, social, and grassroots service roles", icon: <MdAssignmentInd className="text-2xl text-blue-600" /> },
    { title: "Applied Learning", description: "Leadership labs, internships, and real-world community exposure", icon: <FaChalkboardTeacher className="text-2xl text-green-600" /> },
    { title: "Professional Readiness", description: "Focus on character refinement, teamwork, and service-oriented development", icon: <FaUserGraduate className="text-2xl text-purple-600" /> },
  ];

  return (
    <div className="bg-gray-50">
      <Navbar />
      <div className="relative h-64 md:h-96 bg-blue-900 pt-80 pb-10 lg:py-40">
        <Image src="/photos/65.jpg" alt="HS Programme Students" fill className="object-cover opacity-80" priority />
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">RABBANI FINISHING SCHOOL</h1>
            <p className="text-xl text-white">Post Graduate Diploma focused on leadership, management, and Islamic scholarship</p>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">RABBANI FINISHING SCHOOL</h2>
          <div className="prose prose-lg text-gray-600 mb-12">
            <p>The Rabbani Finishing School delivers a one-year Post Graduate Diploma focused on leadership, management, and Islamic scholarship. The programme emphasizes character refinement, community leadership, and professional readiness. Students undergo structured training that includes leadership labs, field exposure, internships, and industrial visits. Designed for graduates seeking to transition into religious, academic, or social leadership roles, the programme equips learners with the skills required for high-impact community service. Admission decisions are finalized by the Jamia Madeenathunnoor authority after evaluating candidate preparedness and potential.</p>
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

          <div className="bg-primary/5 rounded-xl p-8 mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Admission Process</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Requirements:</h4>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Passed Bachelor degree via any UGC recognized university</li>
                  <li>Passed Bachelor Program under Jamiathul Hind Al-Islamiyya or an equivalent syllabus</li>
                  <li>Non objection certificate (NOC) from previous campuses</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Important Dates:</h4>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex justify-between"><span>Application opens:</span><span className="font-medium">March</span></li>
                  <li className="flex justify-between"><span>Entrance exam:</span><span className="font-medium">April</span></li>
                  <li className="flex justify-between"><span>Classes begin:</span><span className="font-medium">May</span></li>
                </ul>
              </div>
            </div>
          </div>

          <Link href="/Programmes/ApplicationForm?level=Rabbani" className="text-center mt-16 bg-primary hover:bg-primary/70 text-white px-8 py-3 rounded-lg font-medium inline-flex items-center">
            Get Admission <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Rabbani;
