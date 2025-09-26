import React from 'react';
import type { ApprovalRecord } from '../types';

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

interface ApprovalHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    approvalHistory: ApprovalRecord[];
}

const ApprovalHistoryModal: React.FC<ApprovalHistoryModalProps> = ({ isOpen, onClose, approvalHistory }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="w-full max-w-lg mx-auto bg-black/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border-2 border-purple-500/80 text-center relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 z-10" aria-label="Fechar">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h2 className="text-3xl font-bold text-white mb-6">Histórico de Aprovações</h2>

                {approvalHistory.length > 0 ? (
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2 text-left">
                        {[...approvalHistory].reverse().map((rec, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                                <div className="flex-1">
                                    <p className="font-bold text-white text-lg">{rec.userName}</p>
                                    <p className="text-sm text-gray-400">{rec.userEmail}</p>
                                    <p className="text-xs text-gray-500 mt-1">{new Date(rec.approvedAt).toLocaleString('pt-BR')}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2 self-start sm:self-center">
                                     <span className={`text-xs font-bold px-2 py-1 rounded-full border ${rec.approvalType === 'automatic' ? 'bg-blue-600/50 border-blue-500 text-blue-300' : 'bg-green-600/50 border-green-500 text-green-300'}`}>
                                        {rec.approvalType === 'automatic' ? 'Automática' : 'Manual'}
                                    </span>
                                    <p className="font-bold text-green-400 text-xl">R$ {rec.amount.toFixed(2).replace('.', ',')}</p>
                                    <a
                                        href={rec.paymentProofDataUrl}
                                        download={`comprovante_${rec.userEmail}_${new Date(rec.approvedAt).toISOString()}.png`}
                                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors"
                                    >
                                        <DownloadIcon className="w-4 h-4" />
                                        Comprovante
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-center py-8">Nenhum pagamento foi aprovado ainda.</p>
                )}
            </div>
        </div>
    );
};

export default ApprovalHistoryModal;
