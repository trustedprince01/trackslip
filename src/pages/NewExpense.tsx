
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Image, Info, Plus, FileText, Sparkles, ShieldCheck, Search, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type ProcessingStep = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
};

const processingSteps: ProcessingStep[] = [
  {
    id: "validating",
    name: "Validating Receipt",
    description: "Checking image quality and format...",
    icon: <ShieldCheck className="h-12 w-12" />,
    color: "from-cyan-400 to-cyan-600",
  },
  {
    id: "extracting",
    name: "Extracting Text",
    description: "Reading receipt content...",
    icon: <Search className="h-12 w-12" />,
    color: "from-blue-400 to-blue-600",
  },
  {
    id: "analyzing",
    name: "Analyzing Receipt",
    description: "Identifying products and prices...",
    icon: <FileText className="h-12 w-12" />,
    color: "from-purple-400 to-purple-600",
  },
  {
    id: "saving",
    name: "Saving to Database",
    description: "Adding to your expense history...",
    icon: <Download className="h-12 w-12" />,
    color: "from-green-400 to-green-600",
  },
  {
    id: "complete",
    name: "Complete!",
    description: "Your receipt has been processed",
    icon: <CheckCircle2 className="h-12 w-12" />,
    color: "from-green-400 to-green-600",
  },
  {
    id: "error",
    name: "Error Processing Receipt",
    description: "Please try again",
    icon: <AlertTriangle className="h-12 w-12" />,
    color: "from-red-400 to-red-600",
  },
];

const NewExpense = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
      toast.success(`${files.length} ${files.length === 1 ? 'image' : 'images'} added`);
    }
  };

  const handleCameraCapture = () => {
    // In a real app, this would trigger the device camera
    // For now, we'll simulate adding a sample image
    const sampleImage = "https://placehold.co/300x500/333/white?text=Receipt+Photo";
    setImages([...images, sampleImage]);
    toast.success("Photo captured");
  };

  const simulateProcessing = () => {
    setIsProcessing(true);
    setCurrentStepIndex(0);
    setProgress(0);

    const totalSteps = processingSteps.length - 2; // Exclude complete and error states
    let step = 0;

    const processInterval = setInterval(() => {
      if (step < totalSteps) {
        setCurrentStepIndex(step);
        const progressIncrement = 100 / totalSteps;
        setProgress((step + 1) * progressIncrement);
        step++;
      } else {
        clearInterval(processInterval);
        setCurrentStepIndex(4); // Complete state
        setProgress(100);
        
        // After completion, redirect to dashboard with a delay
        setTimeout(() => {
          navigate("/dashboard");
          toast.success("Receipt processed successfully!");
        }, 1500);
      }
    }, 1200);
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-16 w-16 mb-6 text-gray-400">
        <FileText size={64} />
      </div>
      <h2 className="text-xl font-semibold text-gray-100 mb-2">Select a Receipt Image</h2>
      <p className="text-gray-400 text-sm">
        Take a photo of your receipt or select one from your gallery
      </p>
    </div>
  );

  const renderImageDisplay = () => (
    <div className="px-6 mb-6">
      <div className="relative rounded-xl overflow-hidden bg-gray-800 shadow-lg">
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-full z-10">
            <span className="text-white text-xs font-medium">
              {currentImageIndex + 1}/{images.length}
            </span>
          </div>
        )}
        
        <div className="overflow-x-auto flex snap-x snap-mandatory scrollbar-none">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-full snap-center"
            >
              <img 
                src={image} 
                alt={`Receipt ${index + 1}`} 
                className="w-full object-contain h-[300px]" 
              />
            </div>
          ))}
        </div>
        
        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {images.map((_, index) => (
              <div 
                key={index}
                className={`h-1.5 w-1.5 rounded-full ${
                  currentImageIndex === index ? "bg-white" : "bg-white/30"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProcessingState = () => {
    const currentStep = processingSteps[currentStepIndex];
    
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="relative mb-8">
          <div className="w-[180px] h-[180px] rounded-full border-4 border-gray-700 flex items-center justify-center">
            <svg className="absolute top-0 left-0 w-full h-full">
              <circle
                cx="90"
                cy="90"
                r="86"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className={`text-gradient-to-r ${currentStep.color} opacity-70`}
                strokeDasharray={2 * Math.PI * 86}
                strokeDashoffset={(2 * Math.PI * 86) * (1 - progress / 100)}
                transform="rotate(-90, 90, 90)"
              />
            </svg>
            
            <div className={`p-3 rounded-full bg-gradient-to-br ${currentStep.color} text-white`}>
              {currentStep.icon}
            </div>
            
            <div className="absolute w-full h-full rounded-full border-t-4 border-blue-500 animate-spin opacity-10" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue bg-clip-text text-transparent mb-2">
          {currentStep.name}
        </h2>
        <p className="text-gray-400 text-sm">{currentStep.description}</p>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="px-6 pb-24">
      <div className="flex gap-3 mb-4">
        <Button
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90"
          onClick={handleCameraCapture}
        >
          <Camera className="mr-2 h-4 w-4" />
          Camera
        </Button>
        
        <Button
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90"
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <Image className="mr-2 h-4 w-4" />
          Gallery
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 justify-center mb-6 text-blue-400">
        <Info size={16} />
        <span className="text-xs text-gray-400">Take multiple photos for long receipts</span>
      </div>
      
      {images.length > 0 && (
        <Button
          className="w-full py-6 bg-gradient-to-r from-purple-500 to-purple-700 hover:opacity-90 shadow-lg shadow-purple-900/20 transform transition-all active:scale-95"
          onClick={simulateProcessing}
        >
          {images.length > 1 ? (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Process Receipt
              <Sparkles className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex justify-center bg-trackslip-deepdark text-white overflow-hidden">
      <div className="w-full max-w-[430px] flex flex-col h-screen relative">
        {/* Header Section */}
        <header className="flex justify-between items-center p-6">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full h-9 w-9 p-0"
              onClick={handleGoBack}
            >
              <ArrowLeft size={18} />
            </Button>
            <h1 className="text-xl font-semibold bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue bg-clip-text text-transparent">
              New Expense
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto scrollbar-none">
          {isProcessing ? (
            renderProcessingState()
          ) : (
            <>
              {images.length === 0 ? renderEmptyState() : renderImageDisplay()}
              {renderActionButtons()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewExpense;
