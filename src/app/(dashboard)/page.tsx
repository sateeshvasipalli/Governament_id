
'use client';

import { ModuleCard } from '@/components/veridash/module-card';
import { Fingerprint, Landmark, FileText, Car, ClipboardList } from 'lucide-react';

export default function DashboardHomePage() {
  const modules = [
    {
      title: 'Aadhar Card Validation',
      description: 'Validate Aadhar cards using Our AI checks for tampering and extracts data.',
      href: '/aadhaar',
      color: 'tricolor-dark' as const,
      icon: 'aadhar' as const,
    },
    {
      title: 'PAN Card Validation',
      description: 'Verify PAN cards to confirm identity and tax information. Our AI checks for tampering and extracts data with high accuracy.',
      href: '/pan',
      color: 'pan-pastel' as const,
      icon: 'pan' as const,
    },
    {
      title: 'Bank Account Validation',
      description: 'Confirm bank account details by verifying passbooks or statements. A crucial step for financial transactions and KYC processes.',
      href: '/bank',
      color: 'pastel-swirl' as const,
      icon: 'bank' as const,
    },
    {
        title: 'Voter ID Card Validation',
        description: 'Validate Voter ID cards for identity verification. Our AI system ensures document authenticity and extracts key details with precision.',
        href: '/voter-id',
        color: 'voter' as const,
        icon: 'voter' as const,
    },
    {
        title: 'Driving Licence Validation',
        description: 'Validate Driving Licence details for identity and permit verification. Our AI system ensures authenticity and extracts key information.',
        href: '/driving-licence',
        color: 'driving-licence' as const,
        icon: 'driving' as const,
    },
    {
        title: 'Validation Results',
        description: 'Review and manage all historical validation results from a centralized hub.',
        href: '/validation-results',
        color: 'results-pastel-gradient' as const,
        icon: 'results' as const,
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          AI-Powered Identity Verification
        </h1>
        <p className="text-muted-foreground mt-1">
          Your centralized hub for secure and reliable identity verification.
          Choose a module below to get started.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.title} {...module} />
        ))}
      </div>
    </div>
  );
}
