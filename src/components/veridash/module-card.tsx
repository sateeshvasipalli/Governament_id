
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { ArrowRight, Fingerprint, Landmark, FileText, Car, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';


const iconMap = {
    aadhar: (
        <Fingerprint className="w-6 h-6" />
    ),
    pan: (
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6zm4 4h-2v-2h2v2zm0-4h-2V7h2v6z" />
            <g>
                <path d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8 8-3.59 8-8-3.59-8-8-8zm-1 14H9v-2h2v2zm0-4H9V8h2v6zm4 4h-2v-2h2v2zm0-4h-2V8h2v6z" fill="none"/>
                <path d="M13.5 6.28l1.45 1.45c-1.22.69-2.2 1.68-2.92 2.92L10.58 9.2c.7-.42 1.48-.72 2.29-.92zM6.28 13.5l1.45 1.45c.69-1.22 1.68-2.2 2.92-2.92L9.2 10.58c-.42.7-.72 1.48-.92 2.29zM9.2 13.42l1.38 1.38c-1.18.66-2.15 1.64-2.77 2.89l-1.46-1.46C6.96 15.36 7.82 14.35 9.2 13.42zM14.72 14.55c.62-1.25 1.59-2.22 2.77-2.89l-1.46-1.46c-1.03.61-1.9 1.58-2.69 2.76l1.38 1.59z"/>
                <path d="M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0" />
                <path d="M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5,5-2.24,5-5S14.76,7,12,7z M12,15c-1.65,0-3-1.35-3-3s1.35-3,3-3s3,1.35,3,3 S13.65,15,12,15z" />
                <path d="M11 12l-2-1-1 2 1 1zM14 11l1-2-2-1-1 1zM12 13l1 2 2-1-1-1zM10 11l-1-1-1 2 2 1z" />
            </g>
       </svg>
    ),
    bank: (
        <Landmark className="w-6 h-6" />
    ),
    voter: (
        <FileText className="w-6 h-6" />
    ),
    driving: (
        <Car className="w-6 h-6" />
    ),
    results: (
        <ClipboardList className="w-6 h-6" />
    ),
};


const colorVariants = {
  'tricolor-dark': {
    bgGradient: 'bg-gradient-to-b from-orange-400 via-white to-green-500',
    iconBg: 'bg-blue-900/20',
    iconText: 'text-blue-900',
    footerBg: 'bg-green-500/20',
    hoverRing: 'hover:ring-blue-500',
  },
  'pan-pastel': {
    bgGradient: 'bg-gradient-to-br from-pink-300 via-blue-200 to-cyan-200',
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-700',
    footerBg: 'bg-cyan-200/50',
    hoverRing: 'hover:ring-blue-400',
  },
  'gold-card': {
    bgGradient: 'bg-gradient-to-br from-red-500 via-orange-400 to-yellow-300',
    iconBg: 'bg-yellow-500/20',
    iconText: 'text-yellow-800',
    footerBg: 'bg-yellow-300/30',
    hoverRing: 'hover:ring-red-500',
  },
  'pastel-swirl': {
    bgGradient: 'bg-gradient-to-tr from-pink-300 via-yellow-200 to-blue-200',
    iconBg: 'bg-pink-500/20',
    iconText: 'text-pink-700',
    footerBg: 'bg-blue-200/30',
    hoverRing: 'hover:ring-pink-400',
  },
  voter: {
    bgGradient: 'bg-gradient-to-br from-orange-200 via-pink-100 to-green-100',
    iconBg: 'bg-orange-500/20',
    iconText: 'text-orange-700',
    footerBg: 'bg-green-100/50',
    hoverRing: 'hover:ring-orange-500',
  },
  'driving-licence': {
    bgGradient: 'bg-gradient-to-br from-purple-400 via-blue-500 to-teal-300',
    iconBg: 'bg-blue-900/20',
    iconText: 'text-blue-900',
    footerBg: 'bg-teal-300/30',
    hoverRing: 'hover:ring-blue-500',
  },
  'results-dark': {
    bgGradient: 'bg-gradient-to-br from-blue-900 via-purple-700 to-pink-500',
    iconBg: 'bg-yellow-400/20',
    iconText: 'text-yellow-300',
    footerBg: 'bg-pink-500/10',
    hoverRing: 'hover:ring-pink-500',
  },
   'results-pastel-gradient': {
    bgGradient: 'bg-gradient-to-b from-purple-400 via-yellow-200 to-blue-400',
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-700',
    footerBg: 'bg-blue-400/20',
    hoverRing: 'hover:ring-purple-500',
  },
  gray: {
    bgGradient: 'bg-gray-500/10',
    iconBg: 'bg-gray-500/20',
    iconText: 'text-gray-700',
    footerBg: 'bg-gray-500/10',
    hoverRing: 'hover:ring-gray-500',
  },
};

interface ModuleCardProps {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
  href: string;
  color: keyof typeof colorVariants;
}

export function ModuleCard({ title, description, href, icon, color }: ModuleCardProps) {
  const variants = colorVariants[color] || colorVariants.gray;
  const IconComponent = iconMap[icon];

  return (
    <Card className={cn(
        "group transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 overflow-hidden", 
        variants.hoverRing, 
        'hover:ring-2',
        variants.bgGradient
    )}>
        <Link href={href} className="flex flex-col h-full">
            <div className="p-6">
                <div className={cn("p-3 rounded-lg w-min", variants.iconBg, variants.iconText)}>
                    {IconComponent}
                </div>
                <div className="pt-4">
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    <p className="pt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
                </div>
            </div>
            <div className={cn("mt-auto p-6 pt-0 flex justify-end", variants.footerBg)}>
                 <div className="flex items-center gap-1 text-sm font-semibold text-foreground/80 group-hover:text-foreground">
                    Start Validation <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    </Card>
  );
}
