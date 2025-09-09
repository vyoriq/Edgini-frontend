import React, { useState, useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

/**
 * HindiKeyboard component provides virtual Hindi Devanagari keyboard functionality
 * Integrates with react-simple-keyboard for secure Hindi text input
 * @param {Object} props - Component props
 * @param {string} props.input - Current input value
 * @param {Function} props.onInputChange - Callback when input changes
 * @param {boolean} props.isVisible - Whether keyboard should be visible
 * @param {Function} props.onClose - Callback when keyboard is closed
 */
/**
 * Hindi Devanagari keyboard layout for INSCRIPT standard
 * Maps QWERTY keys to Devanagari characters
 */
const hindiLayout = {
  default: [
    "ॐ १ २ ३ ४ ५ ६ ७ ८ ९ ० - ृ {bksp}",
    "{tab} औ ै ा ी ू ब ह ग द ज ड {enter}",
    "ो े ् ि ु प र क त च ट",
    "{shift} ऑ ं म न व ल स य {shift}",
    "{space}"
  ],
  shift: [
    "ॐ ऍ ॅ ् र्‍ ज्ञ त्र क्ष श्र ( ) ० ः ऋ {bksp}",
    "{tab} औ ै ा ी ू भ ङ घ ध झ ढ {enter}",
    "ओ ए अ इ उ फ ऱ ख थ छ ठ",
    "{shift} ऑ ँ ण न्‌ ळ ल्‌ श ष {shift}",
    "{space}"
  ]
};

export default function HindiKeyboard({ input, onInputChange, isVisible, onClose }) {
  const [layoutName, setLayoutName] = useState('default');
  const keyboard = useRef();

  useEffect(() => {
    if (keyboard.current && input !== keyboard.current.getInput()) {
      keyboard.current.setInput(input);
    }
  }, [input]);

  /**
   * Handles key press events from virtual keyboard
   * Manages layout switching between default and shift
   * @param {string} button - The pressed button/key
   */
  const onKeyPress = (button) => {
    console.log('Hindi keyboard button pressed:', button);

    if (button === '{shift}' || button === '{lock}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
    }

    if (button === '{close}') {
      onClose && onClose();
    }
  };

  /**
   * Handles input change from virtual keyboard
   * Updates parent component with new input value
   * @param {string} input - New input value from keyboard
   */
  const onChange = (input) => {
    console.log('Hindi keyboard input changed:', input);
    onInputChange && onInputChange(input);
  };

  /**
   * Handles keyboard close functionality
   */
  const handleClose = () => {
    onClose && onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-lg shadow-xl w-full max-w-4xl">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            हिन्दी कीबोर्ड (Hindi Keyboard)
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
            aria-label="Close Hindi keyboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Keyboard container */}
        <div className="p-4">
          <Keyboard
            keyboardRef={(r) => (keyboard.current = r)}
            layoutName={layoutName}
            layout={hindiLayout}
            onChange={onChange}
            onKeyPress={onKeyPress}
            theme="hg-theme-default hg-layout-default"
            buttonTheme={[
              {
                class: "hg-red",
                buttons: "{close}"
              }
            ]}
            display={{
              '{bksp}': '⌫',
              '{enter}': '↵',
              '{shift}': '⇧',
              '{s}': '⇧',
              '{tab}': '⇥',
              '{lock}': '⇪',
              '{accept}': '✓',
              '{space}': ' ',
              '{close}': '✕'
            }}
            mergeDisplay={true}
            newLineOnEnter={true}
            disableCaretPositioning={false}
          />
        </div>

        {/* Footer with instructions */}
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-600 text-center">
            Use this keyboard to type in Hindi (Devanagari script). Press ⇧ for shift characters.
          </p>
        </div>
      </div>
    </div>
  );
}