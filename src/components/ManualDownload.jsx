import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Video, HelpCircle, BookOpen, Users, Stethoscope } from 'lucide-react';

const ManualDownload = ({ userType = 'patient' }) => {
  const { t, i18n } = useTranslation();
  const [downloading, setDownloading] = useState(null);

  const manuals = {
    patient: [
      {
        id: 'getting-started',
        title: t('manuals.patientGuide'),
        description: 'Complete guide for new patients',
        type: 'pdf',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '2.5 MB',
        icon: BookOpen,
        hasImages: true
      },
      {
        id: 'quick-start',
        title: t('manuals.quickStart'),
        description: 'Quick start guide with visual instructions',
        type: 'pdf',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '1.8 MB',
        icon: FileText,
        hasImages: true
      },
      {
        id: 'video-tutorials',
        title: t('manuals.videoTutorials'),
        description: 'Video tutorials for common tasks',
        type: 'mp4',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '45 MB',
        icon: Video,
        hasImages: false
      },
      {
        id: 'faq',
        title: t('manuals.faq'),
        description: 'Frequently asked questions',
        type: 'pdf',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '1.2 MB',
        icon: HelpCircle,
        hasImages: true
      }
    ],
    doctor: [
      {
        id: 'doctor-getting-started',
        title: t('manuals.doctorGuide'),
        description: 'Complete guide for healthcare providers',
        type: 'pdf',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '3.2 MB',
        icon: Stethoscope,
        hasImages: true
      },
      {
        id: 'doctor-quick-start',
        title: t('manuals.quickStart'),
        description: 'Quick setup guide for doctors',
        type: 'pdf',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '2.1 MB',
        icon: FileText,
        hasImages: true
      },
      {
        id: 'doctor-video-tutorials',
        title: t('manuals.videoTutorials'),
        description: 'Video tutorials for doctor features',
        type: 'mp4',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '52 MB',
        icon: Video,
        hasImages: false
      },
      {
        id: 'doctor-faq',
        title: t('manuals.faq'),
        description: 'Frequently asked questions for doctors',
        type: 'pdf',
        languages: ['en', 'ha', 'yo', 'sw', 'ar', 'fr'],
        size: '1.5 MB',
        icon: HelpCircle,
        hasImages: true
      }
    ]
  };

  const handleDownload = async (manual) => {
    setDownloading(manual.id);

    try {
      // Simulate download - in real implementation, this would call an API
      const currentLang = i18n.language;
      const fileName = `${manual.id}_${currentLang}.${manual.type}`;

      // Create a blob with sample content (in real app, fetch from server)
      const content = `This is a sample ${manual.title} manual in ${currentLang} language.\n\nFeatures:\n- Step-by-step instructions\n- Visual guides\n- Troubleshooting tips\n- Contact information\n\nFor full manual, please contact support.`;

      const blob = new Blob([content], {
        type: manual.type === 'pdf' ? 'application/pdf' : 'video/mp4'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show success message
      console.log(`Downloaded ${fileName}`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(null);
    }
  };

  const getLanguageName = (code) => {
    const languages = {
      en: 'English',
      ha: 'Hausa',
      yo: 'Yoruba',
      sw: 'Swahili',
      ar: 'Arabic',
      fr: 'French'
    };
    return languages[code] || code;
  };

  const currentManuals = manuals[userType] || manuals.patient;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Download className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">{t('manuals.downloadManual')}</h2>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Manuals are available in multiple languages with visual guides and step-by-step instructions.
          Current language: <strong>{getLanguageName(i18n.language)}</strong>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {currentManuals.map((manual) => {
          const Icon = manual.icon;
          const isDownloading = downloading === manual.id;

          return (
            <div
              key={manual.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-3">
                <Icon className="w-8 h-8 text-blue-600 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">{manual.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{manual.description}</p>

                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span className="uppercase font-medium">{manual.type}</span>
                    <span>{manual.size}</span>
                    {manual.hasImages && (
                      <span className="flex items-center space-x-1">
                        <span>📷</span>
                        <span>Visual guides</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Available in:</span>
                      <div className="flex space-x-1">
                        {manual.languages.slice(0, 4).map(lang => (
                          <span
                            key={lang}
                            className={`px-2 py-1 text-xs rounded ${
                              lang === i18n.language
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {getLanguageName(lang)}
                          </span>
                        ))}
                        {manual.languages.length > 4 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            +{manual.languages.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(manual)}
                      disabled={isDownloading}
                      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isDownloading
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                      }`}
                      aria-label={`Download ${manual.title}`}
                    >
                      {isDownloading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">What's included in our manuals:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Step-by-step visual instructions</li>
          <li>• Troubleshooting guides</li>
          <li>• Accessibility features explanation</li>
          <li>• Emergency contact information</li>
          <li>• Video demonstrations (where applicable)</li>
          <li>• Multi-language support</li>
        </ul>
      </div>
    </div>
  );
};

export default ManualDownload;