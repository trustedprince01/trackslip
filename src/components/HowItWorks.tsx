import React from 'react';
import { cn } from '@/lib/utils';

const steps = [
	{
		title: 'Upload a Receipt photo',
		description: 'Upload any receipt from your device.',
		icon: (
			<img
				src="/camera.svg"
				alt="Upload photo"
				className="h-8 w-8"
				style={{ width: '2rem', height: '2rem' }}
			/>
		),
	},
	{
		title: 'AI instantly extracts all details',
		description:
			'Our advanced AI recognizes and extracts store name, items, prices, and dates automatically.',
		icon: (
			<img
				src="/chip.svg"
				alt="AI chip"
				className="h-8 w-8"
				style={{ width: '2rem', height: '2rem' }}
			/>
		),
	},
	{
		title: 'organized spending data',
		description:
			'Access insights about your spending patterns and identify saving opportunities.',
		icon: (
			<img
				src="/chart.svg"
				alt="Chart"
				className="h-8 w-8"
				style={{ width: '2rem', height: '2rem' }}
			/>
		),
	},
];

interface StepCardProps {
	step: {
		icon: React.ReactNode;
		title: string;
		description: string;
	};
	index: number;
}

const StepCard = ({ step, index }: StepCardProps) => (
	<div
		className={cn(
			// Make square and fit for mobile, keep normal for md+
			'bg-trackslip-darker rounded-xl border border-gray-800 flex flex-col items-center text-center transform transition-all duration-300 hover:-translate-y-2',
			'p-4 aspect-square w-full max-w-[180px] mx-auto sm:max-w-full sm:p-8', // square and compact on mobile
			'md:p-8 md:aspect-auto md:max-w-full'
		)}
	>
		<div className="w-12 h-12 mb-4 rounded-full gradient-blue bg-opacity-20 flex items-center justify-center text-white md:w-16 md:h-16 md:mb-6">
			{step.icon}
		</div>
		<div className="mb-1 gradient-blue-text font-bold text-xs md:text-base">
			Step {index + 1}
		</div>
		<h3 className="text-base md:text-xl font-bold mb-2 md:mb-4">
			{step.title}
		</h3>
		<p className="text-gray-400 text-xs md:text-base hidden md:block">
			{step.description}
		</p>
	</div>
);

const HowItWorks = () => {
	return (
		<section
			id="how-it-works"
			className="py-20"
			style={{ backgroundColor: 'rgb(2,2,7)' }}
		>
			<div className="container mx-auto px-4 md:px-6">
				<div className="text-center mb-16">
					<h2 className="text-3xl md:text-4xl font-bold mb-4">
						How It Works
					</h2>
					<div className="w-20 h-1 gradient-blue mx-auto"></div>
					<p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
						TrackSlip simplifies expense tracking in three easy steps
					</p>
				</div>

				<div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8">
					{steps.map((step, index) => (
						<StepCard key={index} step={step} index={index} />
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
