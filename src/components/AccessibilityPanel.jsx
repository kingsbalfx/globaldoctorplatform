import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Type,
  MousePointer,
  Mic,
  MicOff,
  Phone,
  MessageSquare,
  Zap
} from 'lucide-react';

const AccessibilityPanel = ({ isOpen, onClose, userType = 'patient' }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    voiceCommands: false,
    screenReader: false,
    highContrast: false,
    largeText: false,
    audioDescription: false,
    visualGuide: false,
    hearingImpaired: false,
    mobilitySupport: false,
    emergencyAccess: true
  });

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Load saved accessibility settings
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Initialize speech recognition for voice commands
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Apply accessibility settings to document
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    document.documentElement.classList.toggle('large-text', settings.largeText);
    document.documentElement.classList.toggle('screen-reader', settings.screenReader);

    // Save settings
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }, [settings]);

  const handleVoiceCommand = (command) => {
    console.log('Voice command:', command);

    // Basic voice commands
    if (command.includes('book appointment') || command.includes('schedule')) {
      // Trigger appointment booking
      announce('Opening appointment scheduler');
    } else if (command.includes('call doctor') || command.includes('emergency')) {
      // Trigger emergency call
      announce('Initiating emergency call');
    } else if (command.includes('messages') || command.includes('chat')) {
      // Open chat
      announce('Opening messages');
    } else if (command.includes('help') || command.includes('support')) {
      // Open help
      announce('Opening help and support');
    }
  };

  const announce = (message) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleVoiceCommands = () => {
    if (!settings.voiceCommands) {
      if (recognitionRef.current) {
        setIsListening(true);
        recognitionRef.current.start();
        announce('Voice commands activated. Say "book appointment", "call doctor", "messages", or "help"');
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      announce('Voice commands deactivated');
    }
    setSettings(prev => ({ ...prev, voiceCommands: !prev.voiceCommands }));
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    announce(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${settings[key] ? 'disabled' : 'enabled'}`);
  };

  const getAccessibilityOptions = () => {
    const commonOptions = [
      {
        key: 'voiceCommands',
        icon: settings.voiceCommands ? Mic : MicOff,
        label: t('accessibility.voiceCommands'),
        description: 'Control the app using voice commands',
        available: !!recognitionRef.current
      },
      {
        key: 'screenReader',
        icon: Volume2,
        label: t('accessibility.screenReader'),
        description: 'Enhanced support for screen readers'
      },
      {
        key: 'highContrast',
        icon: Eye,
        label: t('accessibility.highContrast'),
        description: 'High contrast mode for better visibility'
      },
      {
        key: 'largeText',
        icon: Type,
        label: t('accessibility.largeText'),
        description: 'Increase text size throughout the app'
      },
      {
        key: 'audioDescription',
        icon: Volume2,
        label: t('accessibility.audioDescription'),
        description: 'Audio descriptions for visual content'
      },
      {
        key: 'visualGuide',
        icon: Eye,
        label: t('accessibility.visualGuide'),
        description: 'Visual guides and demonstrations'
      }
    ];

    const patientOptions = [
      {
        key: 'hearingImpaired',
        icon: VolumeX,
        label: t('accessibility.hearingImpaired'),
        description: 'Support for hearing impaired users'
      },
      {
        key: 'mobilitySupport',
        icon: MousePointer,
        label: t('accessibility.mobilitySupport'),
        description: 'Enhanced mobility and navigation support'
      },
      {
        key: 'emergencyAccess',
        icon: Zap,
        label: t('accessibility.emergencyAccess'),
        description: 'Quick access to emergency services'
      }
    ];

    return userType === 'patient' ? [...commonOptions, ...patientOptions] : commonOptions;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Accessibility Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close accessibility panel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {getAccessibilityOptions().map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.key}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    settings[option.key] ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${settings[option.key] ? 'text-blue-600' : 'text-gray-600'}`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{option.label}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => option.key === 'voiceCommands' ? toggleVoiceCommands() : toggleSetting(option.key)}
                    disabled={option.key === 'voiceCommands' && !option.available}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings[option.key] ? 'bg-blue-600' : 'bg-gray-200'
                    } ${option.key === 'voiceCommands' && !option.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-pressed={settings[option.key]}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings[option.key] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {settings.voiceCommands && isListening && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-700">Listening for voice commands...</span>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Accessibility settings are saved automatically and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;