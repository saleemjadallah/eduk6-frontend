import React from 'react';
import { DashboardGammaCard } from './DashboardGammaCard';

// Import images
import aiFormFillerImg from '../../assets/offerings/ai_form_filler.png';
import documentValidatorImg from '../../assets/offerings/document_validator.png';
import photoComplianceImg from '../../assets/offerings/photo_compliance.png';
import travelItineraryImg from '../../assets/offerings/travel_itinerary.png';

interface DashboardGammaGridProps {
    formProgress: number;
    totalForms: number;
    validatedDocs: number;
    totalDocs: number;
    photoProgress: number;
    requiredPhotos: number;
    travelProgress: number;
    handleNavigateToWorkflow: (workflow: string) => void;
}

export const DashboardGammaGrid: React.FC<DashboardGammaGridProps> = ({
    formProgress,
    totalForms,
    validatedDocs,
    totalDocs,
    photoProgress,
    requiredPhotos,
    travelProgress,
    handleNavigateToWorkflow,
}) => {
    const safePercentage = (value: number, total: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* 1. AI Form Filler */}
            <DashboardGammaCard
                title="AI Form Filler"
                description="Auto-fill visa application forms with AI"
                image={aiFormFillerImg}
                color="blue"
                stats={{
                    total: formProgress,
                    label: 'forms filled',
                    completeness: safePercentage(formProgress, totalForms),
                }}
                cta={{
                    label: formProgress < totalForms ? 'Continue Filling' : 'View Forms',
                    href: '/app/form-filler',
                }}
                onClick={() => handleNavigateToWorkflow('form-filler')}
                delay={0}
            />

            {/* 2. Document Validator */}
            <DashboardGammaCard
                title="Document Validator"
                description="AI-powered document verification & validation"
                image={documentValidatorImg}
                color="green"
                stats={{
                    total: validatedDocs,
                    label: 'docs validated',
                    completeness: safePercentage(validatedDocs, totalDocs),
                }}
                cta={{
                    label: validatedDocs < totalDocs ? 'Validate Documents' : 'Review Documents',
                    href: '/app/validator',
                }}
                onClick={() => handleNavigateToWorkflow('validator')}
                delay={0.1}
            />

            {/* 3. AI Photo Compliance */}
            <DashboardGammaCard
                title="AI Photo Compliance"
                description="Generate visa-compliant photos for any country"
                image={photoComplianceImg}
                color="purple"
                stats={{
                    total: photoProgress,
                    label: 'visa photos',
                    completeness: safePercentage(photoProgress, requiredPhotos),
                }}
                cta={{
                    label: photoProgress === 0 ? 'Generate Photos' : 'View Photos',
                    href: '/app/photo-compliance',
                }}
                onClick={() => handleNavigateToWorkflow('photo')}
                delay={0.2}
            />

            {/* 4. AI Travel Itinerary */}
            <DashboardGammaCard
                title="AI Travel Planner"
                description="Smart itinerary generation for visa applications"
                image={travelItineraryImg}
                color="orange"
                stats={{
                    total: travelProgress,
                    label: 'itinerary ready',
                    completeness: travelProgress * 100,
                }}
                cta={{
                    label: travelProgress === 0 ? 'Create Itinerary' : 'View Itinerary',
                    href: '/app/travel-planner',
                }}
                onClick={() => handleNavigateToWorkflow('travel')}
                delay={0.3}
            />
        </div>
    );
};
