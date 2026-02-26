import { useState, useMemo } from 'react';

interface UseAutocompleteProps {
  options: string[];
  placeholder?: string;
  minChars?: number;
}

interface UseAutocompleteReturn {
  value: string;
  suggestions: string[];
  isOpen: boolean;
  handleInputChange: (value: string) => void;
  handleSelectSuggestion: (suggestion: string) => void;
  handleBlur: () => void;
  handleFocus: () => void;
}

export function useAutocomplete({
  options,
  placeholder = '',
  minChars = 1
}: UseAutocompleteProps): UseAutocompleteReturn {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const suggestions = useMemo(() => {
    if (value.length < minChars) return [];
    return options.filter(option =>
      option.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, options, minChars]);

  const handleInputChange = (newValue: string) => {
    setValue(newValue);
    setIsOpen(newValue.length >= minChars);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setValue(suggestion);
    setIsOpen(false);
  };

  const handleBlur = () => {
    // Close after delay to allow click on suggestion
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleFocus = () => {
    if (value.length >= minChars) {
      setIsOpen(true);
    }
  };

  return {
    value,
    suggestions,
    isOpen,
    handleInputChange,
    handleSelectSuggestion,
    handleBlur,
    handleFocus
  };
}