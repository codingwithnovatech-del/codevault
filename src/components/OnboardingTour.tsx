import { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Search, Code, Star } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Terminal,
    title: 'Welcome to CodeVault',
    description: 'Your workspace for code templates, UI components, and developer tools.',
  },
  {
    icon: Search,
    title: 'Discover Resources',
    description: 'Browse templates, components, and tools. Use Ctrl+K to search anything instantly.',
  },
  {
    icon: Code,
    title: 'Code Playground',
    description: 'Experiment with HTML, CSS, and JavaScript in the built-in playground with live preview.',
  },
  {
    icon: Star,
    title: 'Stay Organized',
    description: 'Star your favorite templates and save components for quick access later.',
  },
];

export default function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const { icon: Icon, title, description } = steps[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-surface-container border border-outline-variant/40 rounded-2xl shadow-2xl p-8 mx-4"
      >
        <div className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
            <Icon className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-semibold text-on-surface mb-2">{title}</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-sm">{description}</p>
        </div>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={onComplete}
            className="text-sm text-on-surface-variant/50 hover:text-on-surface-variant transition-colors"
          >
            Skip tour
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:brightness-110 transition-all"
          >
            {isLastStep ? 'Got it!' : 'Next'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-primary'
                  : 'w-1.5 bg-outline-variant/50'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
