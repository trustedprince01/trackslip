
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, Image, Info, Plus, FileText, Sparkles, ShieldCheck, Search, Download, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useDropzone } from "react-dropzone";
import { useReceipts } from "@/hooks/useReceipts";
import { Loader2 } from "lucide-react";

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
  const { user } = useAuth();
  const { addReceiptFromImage } = useReceipts();
  const [images, setImages] = useState<{url: string; file: File}[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Disable buttons when processing or uploading
  const isButtonDisabled = isProcessing || isUploading;

  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles.length || isButtonDisabled) return;
    
    try {
      const newImages = acceptedFiles.map(file => {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
          throw new Error(`Unsupported file type: ${file.type}. Please upload a JPG, PNG, or WEBP image.`);
        }
        
        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          throw new Error(`File is too large. Maximum size is 5MB.`);
        }
        
        return {
          url: URL.createObjectURL(file),
          file
        };
      });
      
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} ${newImages.length === 1 ? 'image' : 'images'} added`);
    } catch (error) {
      console.error('Error processing dropped files:', error);
      toast.error(error instanceof Error ? error.message : 'Error processing files');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 10,
    maxSize: 5 * 1024 * 1024, // 5MB
    noClick: isButtonDisabled,
    noKeyboard: isButtonDisabled,
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onDrop(files);
      // Clear the input value to allow selecting the same file again
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const removeImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(images[index].url);
    setImages(prev => prev.filter((_, i) => i !== index));
    
    if (currentImageIndex >= images.length - 1 && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }; 
  
  // Clean up object URLs when component unmounts
  React.useEffect(() => {
    return () => {
      images.forEach(image => URL.revokeObjectURL(image.url));
    };
  }, [images]);

  const processReceipt = async () => {
    if (!user || !images.length || isButtonDisabled) return;
    
    setIsUploading(true);
    setIsProcessing(true);
    setError(null);
    setCurrentStepIndex(0);
    setProgress(0);
    
    const totalSteps = processingSteps.length - 2; // Exclude complete and error states
    let successCount = 0;
    
    // Helper function to update progress with a small delay for better UX
    const updateStepWithDelay = async (stepIndex: number, delay = 500) => {
      setCurrentStepIndex(stepIndex);
      await new Promise(resolve => setTimeout(resolve, delay));
    };
    
    try {
      // Process each image
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        try {
          // Step 1: Validating
          await updateStepWithDelay(0);
          setProgress(10);
          // Simulate validation
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Step 2: Extracting
          await updateStepWithDelay(1);
          setProgress(30);
          // Simulate extraction
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Step 3: Analyzing
          await updateStepWithDelay(2);
          setProgress(60);
          
          // Process the receipt using our service
          console.log('Starting to process receipt...');
          const receipt = await addReceiptFromImage(image.file);
          console.log('Receipt processed successfully:', receipt);
          
          // Step 4: Saving
          await updateStepWithDelay(3);
          setProgress(90);
          // Simulate saving
          await new Promise(resolve => setTimeout(resolve, 500));
          
          successCount++;
          
          // Mark as complete for this image
          setProgress(100);
          
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          // Show error state
          setCurrentStepIndex(processingSteps.findIndex(step => step.id === 'error'));
          setError(error instanceof Error ? error.message : 'Failed to process receipt');
          // Continue with next image even if one fails
        }
      }
      
      // Mark as complete
      if (successCount > 0) {
        // Show success state briefly before completing
        setCurrentStepIndex(processingSteps.findIndex(step => step.id === 'complete'));
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success(`Successfully processed ${successCount} ${successCount === 1 ? 'receipt' : 'receipts'}`);
        // Clear the images after successful processing
        setImages([]);
      }
      
      if (successCount < images.length) {
        toast.error(`Failed to process ${images.length - successCount} ${images.length - successCount === 1 ? 'receipt' : 'receipts'}`);
      }
      
    } catch (error) {
      console.error('Error in processReceipt:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process receipt';
      setError(errorMessage);
      setCurrentStepIndex(processingSteps.findIndex(step => step.id === 'error'));
      toast.error(errorMessage);
    } finally {
      // Reset processing state
      if (successCount === 0) {
        // Only reset if no successful processing
        setCurrentStepIndex(0);
      }
      setIsUploading(false);
      setIsProcessing(false);
    }
  };

  const handleGoBack = () => {
    navigate("/dashboard");
  };

  const renderEmptyState = () => (
    <div 
      {...getRootProps()}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center border-2 border-dashed rounded-lg m-4 cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      <input {...getInputProps()} />
      <div className="h-16 w-16 mb-6 text-gray-400">
        {isDragActive ? <FileText size={64} /> : <FileText size={64} />}
      </div>
      <h2 className="text-xl font-semibold text-gray-100 mb-2">
        {isDragActive ? 'Drop your receipt here' : 'Select a Receipt Image'}
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Drag & drop your receipt here, or click to select
      </p>
      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleCameraCapture();
          }}
          disabled={isButtonDisabled}
        >
          <Camera className="mr-2 h-4 w-4" />
          Take Photo
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isButtonDisabled}
        >
          <Image className="mr-2 h-4 w-4" />
          Choose File
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Supported formats: JPG, PNG, WEBP (max 5MB)
      </p>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        onClick={(e) => {
          // Prevent the click from bubbling up to parent elements
          e.stopPropagation();
        }}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );

  const renderImageDisplay = () => (
    <div className="px-6 mb-6">
      <div className="relative rounded-xl overflow-hidden bg-gray-800 shadow-lg">
        {/* Image counter and close button */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {images.length > 1 && (
            <div className="bg-black/60 px-2 py-1 rounded-full">
              <span className="text-white text-xs font-medium">
                {currentImageIndex + 1}/{images.length}
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 text-white"
            onClick={() => removeImage(currentImageIndex)}
            disabled={isButtonDisabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Image carousel */}
        <div className="overflow-x-auto flex snap-x snap-mandatory scrollbar-none">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="flex-shrink-0 w-full snap-center relative"
            >
              <img 
                src={image.url} 
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
        <div className={`mb-6 p-4 rounded-full bg-gradient-to-br ${currentStep.color} shadow-lg`}>
          {currentStep.icon}
        </div>

        <h2 className="text-xl font-bold bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue bg-clip-text text-transparent mb-2">
          {currentStep.name}
        </h2>
        <p className="text-gray-400 text-sm">{currentStep.description}</p>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="p-4">
      <Button 
        className="w-full bg-gradient-to-r from-trackslip-blue to-trackslip-lightBlue hover:opacity-90 transition-opacity"
        onClick={processReceipt}
        disabled={isButtonDisabled || images.length === 0}
      >
        {isUploading || isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isUploading ? 'Uploading...' : 'Processing...'}
            <Sparkles className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            {images.length > 0 ? 'Process Receipts' : 'Add Receipts'}
          </>
        )}
      </Button>
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
