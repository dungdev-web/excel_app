'use client';
import { Plus } from 'lucide-react';
import { useAutocomplete } from '../hooks/useAutocomplete';
import { useRef, useEffect } from 'react';
import { ReactNode } from 'react';

interface AutocompleteInputEnhancedProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onCustomAdd?: (value: string) => void;
  placeholder?: string;
  allowCustom?: boolean;
  className?: string;
  icon?: ReactNode;
}

export default function AutocompleteInputEnhanced({
  label,
  value,
  options,
  onChange,
  onCustomAdd,
  placeholder = 'Nhập để tìm kiếm hoặc thêm mới...',
  allowCustom = true,
  className = '',
  icon = '🏢'
}: AutocompleteInputEnhancedProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    suggestions,
    isOpen,
    handleInputChange,
    handleSelectSuggestion,
    handleBlur,
    handleFocus
  } = useAutocomplete({ options });

  const handleChange = (newValue: string) => {
    handleInputChange(newValue);
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSelectSuggestion(suggestion);
    onChange(suggestion);
    // Reset input sau khi chọn
    handleInputChange('');
  };

  const handleAddCustom = () => {
    if (value.trim() && allowCustom && onCustomAdd) {
      onCustomAdd(value);
      handleSelectSuggestion(value);
      onChange(value);
      handleInputChange(''); // Reset sau khi thêm
    }
  };

  // Xử lý click ngoài dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        handleBlur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleBlur]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSuggestionClick(suggestions[0]);
      } else if (allowCustom && value.trim()) {
        handleAddCustom();
      }
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <span className="px-3 text-xl">{icon}</span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 p-3 outline-none"
          />
          {value && (
            <button
              onClick={() => handleChange('')}
              className="px-3 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
          >
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                  Gợi ý
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Ngăn blur event
                      handleSuggestionClick(suggestion);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-100 flex items-center gap-2"
                  >
                    <span>✓</span>
                    {suggestion}
                  </button>
                ))}
              </>
            )}

            {/* Custom Option */}
            {allowCustom && value.trim() && !options.includes(value) && (
              <>
                <div className="border-t border-gray-200"></div>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleAddCustom();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 text-green-700 font-medium flex items-center gap-2"
                >
                  <span><Plus/></span>
                  Thêm "{value}" mới
                </button>
              </>
            )}

            {/* No Results */}
            {suggestions.length === 0 && (
              <div className="px-4 py-3 text-center text-gray-500 text-sm">
                {value.length === 0
                  ? 'Nhập để tìm kiếm'
                  : allowCustom
                  ? 'Không tìm thấy. Nhấn nút dưới để thêm mới.'
                  : 'Không tìm thấy kết quả'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {allowCustom && (
        <p className="mt-1 text-xs text-gray-500">
          💡 Bạn có thể nhập ngành nghề mới
        </p>
      )}
    </div>
  );
}