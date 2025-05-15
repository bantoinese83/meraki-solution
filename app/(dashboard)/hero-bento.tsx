import React from 'react';
import { CreditCard, Database, Users, BarChart2, Mail, Settings } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";

const features = [
  {
    Icon: CreditCard,
    name: "Instant Invoicing",
    description: "Create and send professional invoices to your clients in seconds.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10 text-orange-500 text-[7rem]">
        <CreditCard className="w-24 h-24" />
      </div>
    ),
  },
  {
    Icon: Mail,
    name: "Automated Reminders",
    description: "Send automatic payment reminders to clients and reduce late payments.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10 text-blue-500 text-[7rem]">
        <Mail className="w-24 h-24" />
      </div>
    ),
  },
  {
    Icon: Database,
    name: "Real-Time Payment Tracking",
    description: "Monitor payment status and automate reminders for outstanding invoices.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10 text-green-500 text-[7rem]">
        <Database className="w-24 h-24" />
      </div>
    ),
  },
  {
    Icon: BarChart2,
    name: "Financial Reports",
    description: "Generate detailed reports to gain insights into your business performance.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10 text-purple-500 text-[7rem]">
        <BarChart2 className="w-24 h-24" />
      </div>
    ),
  },
  {
    Icon: Users,
    name: "Team Collaboration",
    description: "Invite your team, assign roles, and manage permissions with ease.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10 text-pink-500 text-[7rem]">
        <Users className="w-24 h-24" />
      </div>
    ),
  },
  {
    Icon: Settings,
    name: "Customizable Settings",
    description: "Personalize your invoicing experience to fit your business needs.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-10 text-gray-500 text-[7rem]">
        <Settings className="w-24 h-24" />
      </div>
    ),
  },
];

export default function FeaturesBentoGrid() {
  return (
    <BentoGrid className="max-w-4xl mx-auto my-12 grid-cols-3 auto-rows-[14rem] md:auto-rows-[18rem] lg:auto-rows-[22rem]">
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  );
}
