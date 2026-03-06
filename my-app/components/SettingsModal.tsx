'use client';

import { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AI_PROVIDERS, type AIProvider } from '@/lib/ai-providers';

export const STORAGE_KEY = 'ai_provider_keys';

export type StoredKeys = Partial<Record<string, string>>;

export function getStoredKeys(): StoredKeys {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function getKeyForProvider(providerId: string): string {
  return getStoredKeys()[providerId] ?? '';
}

export default function SettingsModal() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<StoredKeys>({});
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  // Load from localStorage when modal opens
  useEffect(() => {
    if (open) {
      setKeys(getStoredKeys());
      setSaved(false);
    }
  }, [open]);

  const handleSave = () => {
    // Remove empty values
    const cleaned: StoredKeys = {};
    for (const [k, v] of Object.entries(keys)) {
      if (v && v.trim()) cleaned[k] = v.trim();
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    setSaved(true);
    setTimeout(() => {
      setOpen(false);
      setSaved(false);
    }, 800);
  };

  const toggleVisibility = (id: string) =>
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          title="API Key Settings"
        >
          <Settings className="w-4 h-4 mr-1.5" />
          API Keys
        </Button>
      </DialogTrigger>

        <DialogContent className="!bg-slate-800 border-slate-700 text-white sm:max-w-md" style={{ backgroundColor: '#1e293b' }}>
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            API Key Settings
          </DialogTitle>
        </DialogHeader>

        <p className="text-slate-400 text-sm -mt-2">
          Keys are stored in your browser only and never sent to our servers.
        </p>

        <div className="space-y-4 pt-1">
          {AI_PROVIDERS.map((provider: AIProvider) => (
            <div key={provider.id} className="space-y-1">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                {provider.name}
                <span className="text-xs text-slate-500 font-normal">
                  ({provider.envKey})
                </span>
              </label>
              <div className="relative">
                <input
                  type={visibility[provider.id] ? 'text' : 'password'}
                  value={keys[provider.id] ?? ''}
                  onChange={(e) =>
                    setKeys((prev) => ({ ...prev, [provider.id]: e.target.value }))
                  }
                  placeholder={`Paste your ${provider.name} API key…`}
                  className="w-full bg-slate-900 border border-slate-600 text-white text-sm rounded-md px-3 py-2 pr-10 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  spellCheck={false}
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(provider.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  tabIndex={-1}
                >
                  {visibility[provider.id] ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 min-w-[80px]"
          >
            {saved ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </span>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
