import React from "react";
import X from "lucide-react/dist/esm/icons/x";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";
import { useLanguage } from "@/context/LanguageContext";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string | null;
  templateName: string;
  loading: boolean;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  isOpen,
  onClose,
  htmlContent,
  templateName,
  loading,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-teal-900 font-lora">
              {t("admin_cc_preview_title").replace("{{name}}", templateName)}
            </h2>
            <p className="text-sm text-slate-500">
              {t("admin_cc_preview_subtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-auto min-h-[400px] flex flex-col">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
              <p className="text-slate-500 font-medium">
                {t("admin_cc_loading")}
              </p>
            </div>
          ) : htmlContent ? (
            <div className="bg-white shadow-sm rounded-xl flex-1 flex flex-col">
              <iframe
                title="Email Preview"
                srcDoc={htmlContent}
                className="w-full h-full min-h-[500px] rounded-xl border-0"
                sandbox="allow-popups allow-popups-to-escape-sandbox"
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-red-500">
              {t("admin_cc_preview_error")}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all active:scale-95"
          >
            {t("admin_cc_close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;
