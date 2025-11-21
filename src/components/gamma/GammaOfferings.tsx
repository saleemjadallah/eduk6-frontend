import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Assets
import aiFormFillerImg from '../../assets/offerings/ai_form_filler.png';
import documentValidatorImg from '../../assets/offerings/document_validator.png';
import photoComplianceImg from '../../assets/offerings/photo_compliance.png';
import travelItineraryImg from '../../assets/offerings/travel_itinerary.png';

interface OfferingCardProps {
    title: string;
    description: string;
    image: string;
    link: string;
    price?: string;
    color: 'blue' | 'green' | 'purple' | 'orange';
    delay?: number;
}

const OfferingCard = ({ title, description, image, link, price, color, delay = 0 }: OfferingCardProps) => {
    const colorMap = {
        blue: 'bg-blue-50 text-blue-900 hover:bg-blue-100',
        green: 'bg-green-50 text-green-900 hover:bg-green-100',
        purple: 'bg-purple-50 text-purple-900 hover:bg-purple-100',
        orange: 'bg-orange-50 text-orange-900 hover:bg-orange-100',
    };

    return (
        <Link to={link} className="block h-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay }}
                className="group relative h-full overflow-hidden rounded-3xl bg-white border border-neutral-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row"
            >
                {/* Image Section - Left (or Top on mobile) */}
                <div className="w-full md:w-2/5 h-48 md:h-auto relative overflow-hidden bg-neutral-50">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content Section - Right (or Bottom on mobile) */}
                <div className="flex-1 p-8 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold mb-3 text-neutral-900 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-neutral-600 mb-6 leading-relaxed">
                        {description}
                    </p>

                    <div className="mt-auto flex items-center justify-between">
                        {price && (
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-bold text-neutral-900">{price}</span>
                                <span className="text-sm text-neutral-500">/ doc</span>
                            </div>
                        )}

                        <div className={`rounded-full p-2 ${colorMap[color]} transition-colors`}>
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default function GammaOfferings() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
            <OfferingCard
                title="AI Form Filler"
                description="Upload your passport or CV. Our AI extracts data and auto-fills complex government forms with high accuracy."
                image={aiFormFillerImg}
                link="/register"
                price="AED 75"
                color="blue"
                delay={0}
            />

            <OfferingCard
                title="Document Validator"
                description="AI checks for required stamps, signatures, and formatting to ensure your documents meet all requirements."
                image={documentValidatorImg}
                link="/document-validator"
                price="AED 40"
                color="green"
                delay={0.1}
            />

            <OfferingCard
                title="AI Photo Compliance"
                description="Ensures your photos meet exact size, background, and facial requirements for any visa application."
                image={photoComplianceImg}
                link="/photo-compliance"
                price="AED 20"
                color="purple"
                delay={0.2}
            />

            <OfferingCard
                title="Travel Itinerary"
                description="Generates a compliant, detailed travel itinerary with verified flights and hotels for your visa application."
                image={travelItineraryImg}
                link="/travel-itinerary"
                price="AED 125"
                color="orange"
                delay={0.3}
            />
        </div>
    );
}
