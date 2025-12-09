import React from 'react';
import { X, Download, CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    documentUrl: string;
    documentType: 'PDF' | 'IMAGE';
    title: string;
    onApprove?: () => void;
    onReject?: () => void;
}

export const DocumentViewerModal: React.FC<Props> = ({ isOpen, onClose, documentUrl, documentType, title, onApprove, onReject }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up">
                {/* En-tête */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                            <p className="text-xs text-gray-500">Visualisation du document</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                            title="Ouvrir dans un nouvel onglet"
                        >
                            <ExternalLink size={20} />
                        </a>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 bg-gray-100 relative overflow-hidden flex items-center justify-center p-4">
                    {documentType === 'PDF' ? (
                        <iframe
                            src={`${documentUrl}#toolbar=0`}
                            className="w-full h-full rounded-lg shadow-sm bg-white"
                            title="Document Viewer"
                        />
                    ) : (
                        <img
                            src={documentUrl}
                            alt="Document"
                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                        />
                    )}
                </div>

                {/* Actions de Pied de Page */}
                <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                    <a
                        href={documentUrl}
                        download
                        className="flex items-center gap-2 text-gray-600 font-bold hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Download size={18} /> Télécharger
                    </a>

                    {(onApprove || onReject) && (
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {onReject && (
                                <button
                                    onClick={onReject}
                                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border-2 border-red-100 text-[#e8112d] font-bold hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <XCircle size={18} /> Rejeter
                                </button>
                            )}
                            {onApprove && (
                                <button
                                    onClick={onApprove}
                                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#008751] text-white font-bold hover:bg-[#006b40] shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle size={18} /> Valider
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
