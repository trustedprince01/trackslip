import { supabase } from "@/lib/supabase";
import { AIRecommendation } from "./RecommendationService";

export interface DBRecommendation {
  id: string;
  user_id: string;
  category: string;
  analysis: string;
  recommendations: string[];
  potential_savings: string;
  suggested_budget: string;
  confidence: string;
  category_insights: string[];
  created_at: string;
  updated_at: string;
}

export const saveRecommendation = async (
  category: string,
  recommendation: AIRecommendation
): Promise<DBRecommendation | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('recommendations')
    .upsert({
      user_id: user.id,
      category,
      analysis: recommendation.analysis,
      recommendations: recommendation.recommendations,
      potential_savings: recommendation.potentialSavings,
      suggested_budget: recommendation.suggestedBudget,
      confidence: recommendation.confidence || 'medium',
      category_insights: recommendation.categoryInsights || [],
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,category',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving recommendation:', error);
    return null;
  }

  return data;
};

export const getRecommendation = async (category: string): Promise<DBRecommendation | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('recommendations')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Not found error code
      console.error('Error fetching recommendation:', error);
    }
    return null;
  }

  return data;
};

export const convertToAIRecommendation = (dbRec: DBRecommendation): AIRecommendation => ({
  analysis: dbRec.analysis,
  recommendations: dbRec.recommendations,
  potentialSavings: dbRec.potential_savings,
  suggestedBudget: dbRec.suggested_budget,
  confidence: dbRec.confidence as 'high' | 'medium' | 'low',
  categoryInsights: dbRec.category_insights
});
