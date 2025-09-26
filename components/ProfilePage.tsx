import React, { useState, useEffect, useMemo } from 'react';
import Header from './Header';
import type { Game, User } from '../types';

// === ICONS ===
const BellIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const SubscriptionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 2 l7 4.5v5c0 4-7 6.5-7 6.5s-7-2.5-7-6.5v-5L12 2z" /><path d="m10 12.5 2 2 4-4" />
    </svg>
);

const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
    </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);


// === LOCAL COMPONENTS ===
const AdminAccordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon: React.ReactNode }> = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-xl font-bold text-purple-300">{title}</h3>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <path d="m6 9 6 6 6-6"/>
                </svg>
            </button>
            <div className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 border-t border-purple-500/30">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const CheckboxRow: React.FC<{label: string, isChecked: boolean, onToggle: () => void}> = ({label, isChecked, onToggle}) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/60 transition-colors">
        <span className="font-semibold text-white">{label}</span>
        <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${isChecked ? 'bg-green-500 border-green-400' : 'bg-gray-700 border-gray-500'}`}>
            {isChecked && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
        </div>
    </button>
);

const NotificationSettings: React.FC<{
    tempUser: User;
    setTempUser: React.Dispatch<React.SetStateAction<User>>;
    allGames: Game[];
}> = ({ tempUser, setTempUser, allGames }) => {
    const [permission, setPermission] = useState(Notification.permission);

    const handleEnableNotifications = async () => {
        const currentPermission = await Notification.requestPermission();
        setPermission(currentPermission);

        setTempUser(prev => ({
            ...prev,
            notificationSettings: {
                ...prev.notificationSettings,
                enabled: currentPermission === 'granted',
            }
        }));

        if (currentPermission !== 'granted') {
            alert("Permissão para notificações negada. Você pode habilitá-la nas configurações do seu navegador.");
        }
    };

    const toggleMasterSwitch = () => {
        if (tempUser.notificationSettings.enabled) {
            setTempUser(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, enabled: false } }));
            return;
        }
        if (permission === 'granted') {
            setTempUser(prev => ({ ...prev, notificationSettings: { ...prev.notificationSettings, enabled: true } }));
        } else {
            handleEnableNotifications();
        }
    };
    
    const toggleNotificationType = (type: 'newSignal' | 'signalExpiration') => {
        setTempUser(prev => ({
            ...prev,
            notificationSettings: { ...prev.notificationSettings, [type]: !prev.notificationSettings[type] },
        }));
    };

    const toggleFavoriteGame = (gameName: string) => {
        setTempUser(prev => {
            const isFavorite = prev.favoriteGames.includes(gameName);
            const newFavorites = isFavorite
                ? prev.favoriteGames.filter(name => name !== gameName)
                : [...prev.favoriteGames, gameName];
            return { ...prev, favoriteGames: newFavorites };
        });
    };

    return (
        <AdminAccordion title="Gerenciador de Notificações" icon={<BellIcon className="w-6 h-6 text-purple-300"/>}>
            <div className="space-y-6">
                <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg">
                    <div>
                        <p className="font-bold text-white text-left">Ativar Notificações</p>
                        <p className="text-xs text-gray-400 text-left">Receba alertas sobre seus jogos.</p>
                    </div>
                    <label className="switch relative inline-block w-14 h-8">
                        <input type="checkbox" checked={tempUser.notificationSettings.enabled} onChange={toggleMasterSwitch} className="opacity-0 w-0 h-0 peer" />
                        <span className="slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-700 rounded-full transition-all peer-checked:bg-green-500 before:absolute before:h-6 before:w-6 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all peer-checked:before:translate-x-6"></span>
                    </label>
                </div>

                {tempUser.notificationSettings.enabled && (
                    <div className="animate-fade-in space-y-4">
                        <div>
                            <h4 className="font-bold text-white mb-2 text-left">Tipos de Alerta</h4>
                            <div className="space-y-2">
                                <CheckboxRow label="Oportunidade Detectada" isChecked={tempUser.notificationSettings.newSignal} onToggle={() => toggleNotificationType('newSignal')} />
                                <CheckboxRow label="Sinal Expirando" isChecked={tempUser.notificationSettings.signalExpiration} onToggle={() => toggleNotificationType('signalExpiration')} />
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-2 text-left">Favoritar Jogos para Alertas</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {allGames.map(game => (
                                    <CheckboxRow key={game.name} label={game.name} isChecked={tempUser.favoriteGames.includes(game.name)} onToggle={() => toggleFavoriteGame(game.name)} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminAccordion>
    );
};

const ConnectionModal: React.FC<{
    isConnecting: boolean;
    connectionSuccess: boolean;
    platformName: string;
    onClose: () => void;
}> = ({ isConnecting, connectionSuccess, platformName, onClose }) => {
    if (!isConnecting && !connectionSuccess) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="w-full max-w-md mx-auto bg-black/50 p-8 rounded-2xl shadow-2xl border-2 border-purple-500/80 text-center relative">
                {isConnecting && (
                    <>
                        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-400 mx-auto mb-4"></div>
                        <h3 className="text-2xl font-bold text-white mb-4">Conectando à Plataforma...</h3>
                        <p className="text-gray-300 text-base">Aguarde enquanto estabelecemos uma conexão segura com <b>{platformName}</b>...</p>
                    </>
                )}
                {connectionSuccess && (
                     <>
                        <CheckCircleIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-4">Conexão Bem-sucedida!</h3>
                        <p className="text-gray-300 text-base mb-6">Sua conta foi vinculada com sucesso à plataforma <b>{platformName}</b>. Nossas análises agora serão ainda mais precisas para você.</p>
                        <button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200"
                        >
                            Ótimo!
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};


// === PROFILE PAGE ===
interface ProfilePageProps { 
    user: User; 
    onSave: (user: User) => Promise<void>; 
    onLogout: () => void;
    allGames: Game[];
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onSave, onLogout, allGames }) => {
    const [tempUser, setTempUser] = useState(user);
    const [isSaved, setIsSaved] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionSuccess, setConnectionSuccess] = useState(false);
    const isUserRole = user.role === 'user';

    useEffect(() => {
        setTempUser(user);
    }, [user]);
    
    const hasChanges = useMemo(() => {
        return JSON.stringify(tempUser) !== JSON.stringify(user);
    }, [tempUser, user]);

    const handleSave = async () => {
        const platformInfoIsSet = tempUser.casinoPlatformName && tempUser.casinoPlatformLink;
        const platformInfoChanged = tempUser.casinoPlatformName !== user.casinoPlatformName || tempUser.casinoPlatformLink !== user.casinoPlatformLink;

        await onSave(tempUser);

        if (platformInfoIsSet && platformInfoChanged) {
            setIsConnecting(true);
            setTimeout(() => {
                setIsConnecting(false);
                setConnectionSuccess(true);
            }, 2500); // 2.5 second simulation
        } else {
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }
    };

    const renderSubscriptionStatus = () => {
        switch (user.subscription.status) {
            case 'active':
                return <p className="text-green-400 font-bold">VIP Ativa (Válido até: {user.subscription.expiryDate})</p>;
            case 'processing':
                return <p className="text-yellow-400 font-bold">Pagamento em Processamento...</p>;
            case 'rejected':
                return <p className="text-red-400 font-bold">Pagamento Reprovado</p>;
            case 'inactive':
            default:
                return <p className="text-gray-400">Plano Gratuito</p>;
        }
    };

    const getStatusIcon = () => {
        switch (user.subscription.status) {
            case 'active':
                return <SubscriptionIcon className="w-10 h-10 text-green-400 flex-shrink-0"/>;
            case 'processing':
                return <SubscriptionIcon className="w-10 h-10 text-yellow-400 flex-shrink-0"/>;
            case 'rejected':
                return <SubscriptionIcon className="w-10 h-10 text-red-400 flex-shrink-0"/>;
            case 'inactive':
            default:
                return <SubscriptionIcon className="w-10 h-10 text-gray-500 flex-shrink-0"/>;
        }
    }
    
    return (
        <>
            <ConnectionModal
                isConnecting={isConnecting}
                connectionSuccess={connectionSuccess}
                platformName={tempUser.casinoPlatformName || ''}
                onClose={() => setConnectionSuccess(false)}
            />
            <div className="w-full max-w-md mx-auto animate-fade-in text-center">
                <Header />
                <p className="text-green-400/80 -mt-6 text-lg mb-10">Meu Perfil</p>
                <div className="space-y-6">
                    <div className="bg-black/30 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-500/30 space-y-6">
                        <div>
                            <label htmlFor="name" className="text-left block text-white font-medium text-sm mb-2">Nome Completo</label>
                            <input 
                                id="name"
                                type="text"
                                value={tempUser.name}
                                onChange={(e) => setTempUser(prev => ({...prev, name: e.target.value}))}
                                readOnly={isUserRole}
                                className={`w-full p-3 rounded-lg border outline-none transition ${
                                    isUserRole
                                    ? 'bg-gray-800/80 border-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-800/50 border-purple-500/50 text-white focus:ring-2 focus:ring-green-400 focus:border-green-400'
                                }`}
                            />
                            {isUserRole && <p className="text-xs text-gray-500 text-left mt-2">O nome só pode ser alterado por um administrador.</p>}
                        </div>

                        <div>
                            <label htmlFor="email" className="text-left block text-white font-medium text-sm mb-2">Email (não editável)</label>
                            <input 
                                id="email"
                                type="email"
                                value={user.email}
                                readOnly
                                className="w-full bg-gray-800/80 border border-gray-700 text-gray-400 rounded-lg p-3 cursor-not-allowed"
                            />
                        </div>

                        <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            {getStatusIcon()}
                            <div className="text-left">
                                <p className="text-white font-semibold">Assinatura:</p>
                                {renderSubscriptionStatus()}
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold py-3 rounded-xl transition-all"
                            >
                            Sair da Conta
                        </button>
                    </div>

                    <AdminAccordion title="Plataforma de Jogo" icon={<LinkIcon className="w-6 h-6 text-purple-300"/>}>
                        <div className="space-y-6">
                            <p className="text-sm text-gray-400 text-left">
                                Conecte sua plataforma para otimizar as análises da IA. Insira o nome e o link da casa de apostas que você utiliza para uma experiência mais personalizada.
                            </p>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="platformName" className="text-left block text-white font-medium text-sm mb-2">Nome da Casa de Aposta</label>
                                    <input
                                        id="platformName"
                                        type="text"
                                        placeholder="Ex: EstrelaBet"
                                        value={tempUser.casinoPlatformName || ''}
                                        onChange={(e) => setTempUser(prev => ({...prev, casinoPlatformName: e.target.value}))}
                                        className="w-full bg-gray-800/50 border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="platformLink" className="text-left block text-white font-medium text-sm mb-2">Link da Plataforma</label>
                                    <input
                                        id="platformLink"
                                        type="url"
                                        placeholder="Ex: https://estrelabet.com"
                                        value={tempUser.casinoPlatformLink || ''}
                                        onChange={(e) => setTempUser(prev => ({...prev, casinoPlatformLink: e.target.value}))}
                                        className="w-full bg-gray-800/50 border-purple-500/50 text-white rounded-lg p-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition"
                                    />
                                </div>
                            </div>
                             <button
                                onClick={handleSave}
                                disabled={!hasChanges || isSaved || isConnecting || connectionSuccess}
                                className={`w-full text-black font-bold text-lg py-3 rounded-xl shadow-lg transition-all ${
                                    isSaved 
                                        ? 'bg-green-600 shadow-green-500/20' 
                                        : hasChanges 
                                            ? isConnecting || connectionSuccess
                                                ? 'bg-gray-600 cursor-wait'
                                                : 'bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 shadow-green-500/20' 
                                            : 'bg-gray-600 cursor-not-allowed opacity-50'
                                }`}
                            >
                                {isConnecting ? 'CONECTANDO...' : connectionSuccess ? 'CONECTADO!' : isSaved ? 'SALVO!' : 'Conectar Plataforma'}
                            </button>
                        </div>
                    </AdminAccordion>
                    
                    <NotificationSettings tempUser={tempUser} setTempUser={setTempUser} allGames={allGames} />

                    <div className="mt-6 pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaved || isConnecting || connectionSuccess}
                            className={`w-full text-black font-bold text-lg py-3 rounded-xl shadow-lg transition-all ${
                                isSaved 
                                    ? 'bg-green-600 shadow-green-500/20' 
                                    : hasChanges 
                                        ? isConnecting || connectionSuccess
                                            ? 'bg-gray-600 cursor-wait'
                                            : 'bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 shadow-green-500/20' 
                                        : 'bg-gray-600 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {isSaved ? 'SALVO COM SUCESSO!' : 'SALVAR ALTERAÇÕES'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;