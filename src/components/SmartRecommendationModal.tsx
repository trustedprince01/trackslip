
import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  DollarSign, 
  BarChart3, 
  Target, 
  TrendingUp, 
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getAIRecommendation, AIRecommendation } from "@/services/RecommendationService";

interface SmartRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: {
    title: string;
    description: string;
    impact: string;
    priority: 'high' | 'medium' | 'low' | 'neutral';
    category?: string;
    amount?: number;
    percentage?: number;
  } | null;
  receipts?: any[];
}

const SmartRecommendationModal: React.FC<SmartRecommendationModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  receipts = []
}) => {
  // Return null if no recommendation is provided
  if (!recommendation) return null;
  const [aiRecommendation, setAiRecommendation] = useState<AIRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formatCurrency } = useCurrency();

  const fetchRecommendation = useCallback(async (forceRefresh = false) => {
    if (!isOpen || !recommendation?.category) return;
    
    const loadingState = forceRefresh ? setIsRefreshing : setIsLoading;
    loadingState(true);
    setError(null);
    
    try {
      // Filter receipts by the selected category
      const categoryReceipts = receipts.filter(receipt => 
        receipt.category === recommendation.category ||
        receipt.items?.some((item: any) => item.category === recommendation.category)
      );

      console.log('Filtered receipts for category:', {
        category: recommendation.category,
        receiptCount: categoryReceipts.length,
        totalReceipts: receipts.length,
        sampleReceipt: categoryReceipts[0] // Log first receipt for debugging
      });

      if (categoryReceipts.length === 0) {
        throw new Error(`No receipt data found for category: ${recommendation.category}`);
      }
      
      const result = await getAIRecommendation(
        categoryReceipts,
        recommendation.category,
        {
          amount: recommendation.amount || 0,
          percentage: recommendation.percentage || 0,
          transactionCount: categoryReceipts.length
        },
        formatCurrency,
        forceRefresh
      );
      
      if (!result) {
        throw new Error('No recommendations generated');
      }
      
      setAiRecommendation(result);
    } catch (err) {
      console.error('Error fetching AI recommendation:', err);
      setError(err instanceof Error ? err.message : 'Failed to load recommendations. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isOpen, recommendation, receipts, formatCurrency]);

  useEffect(() => {
    if (isOpen && recommendation?.category) {
      fetchRecommendation();
    }
  }, [isOpen, recommendation, fetchRecommendation]);



  const handleRefresh = async () => {
    if (recommendation?.category) {
      try {
        setIsRefreshing(true);
        setError(null);
        
        // Call fetchRecommendation with forceRefresh: true
        await fetchRecommendation(true);
        
      } catch (err) {
        console.error('Error refreshing recommendation:', err);
        setError(err instanceof Error ? err.message : 'Failed to refresh recommendation. Please try again.');
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleRetry = () => {
    if (recommendation?.category) {
      fetchRecommendation(true);
    }
    setError(null);
  };

  // Format the amount with currency
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Function to format the AI response with proper styling
  const formatAIContent = (content: string) => {
    if (!content) return null;
    
    // Process headers
    content = content.replace(/### (.+)/g, '<h3 class="text-lg font-semibold mt-6 mb-3 text-blue-600 dark:text-blue-400">$1</h3>');
    
    // Process bold text for stores and amounts
    content = content.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
      // Check if it's a currency value
      if (/[₦$€£]\s*\d+/.test(p1)) {
        return `<span class="font-bold text-green-600 dark:text-green-400">${p1}</span>`;
      }
      // Check if it's a store name
      if (p1.toLowerCase().includes('store') || p1.toLowerCase().includes('market') || p1 === p1.toUpperCase()) {
        return `<span class="font-bold text-purple-600 dark:text-purple-400">${p1}</span>`;
      }
      // Default bold
      return `<span class="font-bold text-foreground">${p1}</span>`;
    });
    
    // Process list items
    content = content.replace(/^\s*-\s*(.+)$/gm, '<li class="flex items-start gap-2 mb-1"><span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></span><span>$1</span></li>');
    content = content.replace(/<li/g, '<li class="pl-2"');
    
    // Wrap lists in ul
    content = content.replace(/(<li>.*<\/li>)/gs, (match) => {
      if (match.includes('<ul')) return match; // Skip if already wrapped
      return `<ul class="space-y-2 my-2 pl-4">${match}</ul>`;
    });
    
    return { __html: content };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-hidden p-0 bg-white dark:bg-gray-900">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                  {recommendation.title}
                </DialogTitle>
                {recommendation.amount && (
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatAmount(recommendation.amount)}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {recommendation.description}
              </p>
              {recommendation.impact && (
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  recommendation.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                  recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
                }`}>
                  {recommendation.impact}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
              <div className="text-center space-y-2">
                <h3 className="font-medium text-gray-900 dark:text-white">Analyzing Your Spending</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Our AI is reviewing your {recommendation.category?.toLowerCase() || 'spending'} patterns
                  to provide personalized recommendations...
                </p>
              </div>
            </div>
          )}
          {error && (
            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">Unable to Load Analysis</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="mr-2"
                >
                  <X className="mr-2 h-4 w-4" /> Close
                </Button>
                <Button 
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          {aiRecommendation && (
            <div className="space-y-6">
              {/* Analysis Section */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Analysis</h3>
                  </div>
                  <div 
                    className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300"
                    dangerouslySetInnerHTML={formatAIContent(aiRecommendation.analysis)}
                  />
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-5 w-5 text-green-500" />
                    <h3 className="font-medium">Recommended Actions</h3>
                  </div>
                  <div 
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: aiRecommendation.recommendations
                        ?.map(rec => 
                          rec.replace(/^\s*-\s*/, '')
                             .replace(/\*\*(.*?)\*\*/g, '<span class="font-medium text-foreground">$1</span>')
                        )
                        .map(rec => 
                          `<div class="flex items-start gap-3 mb-2">
                            <div class="h-2 w-2 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
                            <div>${rec}</div>
                          </div>`
                        )
                        .join('')
                    }}
                  />
                </CardContent>
              </Card>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Potential Savings</h3>
                    </div>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      <span className="text-foreground">Potential savings: </span>
                      <span className="text-2xl">
                        {aiRecommendation.potentialSavings?.match(/([₦$€£]\s*[\d,.]+)/)?.[0] || '$0'}
                      </span>
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <DollarSign className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Suggested Budget</h3>
                    </div>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      <span className="text-foreground">Suggested budget: </span>
                      <span className="text-2xl">
                        {aiRecommendation.suggestedBudget?.match(/([₦$€£]\s*[\d,.]+)/)?.[0] || '$0'}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                <div className="flex gap-3">
                  {/* <Button className="flex-1" size="lg">
                    Set Budget & Save Plan
                  </Button> */}
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex-1"
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Re-analyzing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" /> Re-apply
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-500">
                  Click "Re-apply" to get fresh AI analysis with your latest data
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
              Set Budget & Save Plan
            </Button>
            <Button variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Remind Me Later
            </Button>
            <Button variant="ghost" className="flex-1 text-gray-600 dark:text-gray-400">
              <AlertCircle className="h-4 w-4 mr-2" />
              Not Helpful
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartRecommendationModal;
