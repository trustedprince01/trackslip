
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  type: 'switch' | 'select' | 'button';
  value?: boolean | string;
  options?: { value: string; label: string }[];
  onChange?: (value: any) => void;
  onClick?: () => void;
}

interface SettingsSectionProps {
  title: string;
  items: SettingItem[];
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, items }) => {
  return (
    <div>
      <h2 className="text-gray-600 dark:text-gray-400 text-xs uppercase font-semibold mb-3 px-1">
        {title}
      </h2>
      <Card className="bg-white/60 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-lg">
        <CardContent className="p-0">
          {items.map((item, index) => (
            <div key={item.title}>
              {item.type === 'button' ? (
                <button 
                  className="w-full p-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  onClick={item.onClick}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {item.icon}
                      </div>
                      <div className="text-left">
                        <span className="text-gray-900 dark:text-white font-medium">{item.title}</span>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 dark:text-gray-500" />
                  </div>
                </button>
              ) : (
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center">
                    <div className="mr-3">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-gray-900 dark:text-white font-medium">{item.title}</span>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                  {item.type === 'switch' && (
                    <Switch 
                      checked={item.value as boolean}
                      onCheckedChange={item.onChange}
                      className={`data-[state=checked]:bg-${item.title.toLowerCase().includes('dark') ? 'blue' : item.title.toLowerCase().includes('notification') ? 'green' : 'orange'}-500`}
                    />
                  )}
                  {item.type === 'select' && (
                    <select 
                      value={item.value as string} 
                      onChange={(e) => item.onChange?.(e.target.value)}
                      className="bg-white/80 dark:bg-gray-700/50 border border-gray-200/50 dark:border-gray-600/50 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 backdrop-blur-sm"
                    >
                      {item.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {index < items.length - 1 && (
                <div className="border-b border-gray-200/30 dark:border-gray-700/30" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
