import React, { useState } from 'react';
import Header from './Header';

// === ICONS ===
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 3L9.27 9.27L3 12l6.27 2.73L12 21l2.73-6.27L21 12l-6.27-2.73L12 3z" />
    </svg>
);

const CpuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>
    </svg>
);

const ClipboardListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" />
    </svg>
);

const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
);

const ShieldIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);


// === LOCAL COMPONENTS ===
const InfoAccordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon: React.ReactNode }> = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-purple-500/30 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left" aria-expanded={isOpen}>
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
                    <div className="p-4 border-t border-purple-500/30 text-left text-gray-300 space-y-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoHighlight: React.FC<{title: string, children: React.ReactNode}> = ({ title, children }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
        <p className="font-bold text-white">{title}</p>
        <p className="text-sm text-gray-400">{children}</p>
    </div>
);

// === INFORMATION PAGE ===
const InformationPage: React.FC = () => {
    return (
        <div className="w-full max-w-md mx-auto animate-fade-in text-center">
            <Header />
            <p className="text-green-400/80 -mt-6 text-lg mb-10">Central de Informações</p>
            <div className="space-y-6">
                <InfoAccordion title="Bem-vindo à Revolução" icon={<SparklesIcon className="w-6 h-6 text-purple-300"/>} defaultOpen>
                    <p>A <b>BASE EX CASSINO</b> transcende as plataformas comuns. Somos uma equipe de especialistas munida de uma inteligência artificial com um entendimento profundo dos algoritmos de cassino. Nossa tecnologia de ponta não se limita a gerar sinais; ela disseca o comportamento dos jogos em tempo real, analisando milhares de variáveis para revelar as verdadeiras janelas de oportunidade.</p>
                    <p>Nossa missão é simples: decodificar os padrões complexos dos jogos de cassino e transformá-los em oportunidades claras e acionáveis para você. Chega de achismos e jogadas no escuro. Com nossa IA, você joga com base em dados, estratégia e a mais alta tecnologia.</p>
                </InfoAccordion>

                <InfoAccordion title="Como Nossa IA Opera?" icon={<CpuIcon className="w-6 h-6 text-purple-300"/>}>
                    <p>Nossa IA monitora constantemente o <b>'payout'</b> (a porcentagem de pagamento) de cada jogo. Identificamos 'fases de alta' (quando o jogo está mais propenso a pagar) e 'fases de baixa' (quando o risco é maior). O <b>'Índice de Confiança'</b> em cada sinal reflete exatamente essa análise.</p>
                    <div className="space-y-2 mt-4">
                        <InfoHighlight title="Black IA">
                            Nossa IA principal. Ela analisa a probabilidade interna do algoritmo do jogo, buscando o momento de maior chance de ganho, independentemente do Payout.
                        </InfoHighlight>
                         <InfoHighlight title="IA Preditiva">
                            Este modo é o nosso cérebro coletivo. Ele analisa os resultados de **toda a comunidade** para descobrir quais estratégias são verdadeiramente vencedoras em cada jogo, beneficiando a todos com uma inteligência compartilhada.
                        </InfoHighlight>
                         <InfoHighlight title="Diamond IA (Manual)">
                            Para os estrategistas. Aqui, você está no controle. A IA gera um sinal com base nas suas configurações de risco, ideal para quem tem uma tática específica em mente.
                        </InfoHighlight>
                    </div>
                </InfoAccordion>

                <InfoAccordion title="Decifrando um Sinal" icon={<ClipboardListIcon className="w-6 h-6 text-purple-300"/>}>
                    <p>Cada sinal é um plano de batalha detalhado. Veja como interpretar:</p>
                     <div className="space-y-2 mt-4">
                        <InfoHighlight title="Horário Pagante">
                           A janela de tempo crucial onde a estratégia tem a maior probabilidade de sucesso. Siga-o rigorosamente.
                        </InfoHighlight>
                         <InfoHighlight title="Sequência de Entrada">
                            A ordem e o número de rodadas (Turbo, Normal, etc.) não são aleatórios. É uma sequência calculada para 'aquecer' e explorar o algoritmo do jogo.
                        </InfoHighlight>
                         <InfoHighlight title="Estratégia de Execução">
                            O 'pulo do gato'. Aqui, a IA fornece dicas táticas profissionais para maximizar seus resultados durante a execução.
                        </InfoHighlight>
                    </div>
                </InfoAccordion>

                <InfoAccordion title="Seu Feedback Alimenta a IA" icon={<UsersIcon className="w-6 h-6 text-purple-300"/>}>
                     <p>A seção <b>'Validação do Sinal'</b> é o coração da nossa inteligência coletiva. Ao informar se você teve 'Lucro' ou 'Prejuízo', você não está apenas registrando seu resultado:</p>
                    <ul className="list-disc list-inside space-y-2 mt-2 text-sm">
                        <li><b>Você treina a IA Preditiva Global:</b> Sua experiência ensina nosso algoritmo a identificar quais estratégias funcionam melhor para **toda a comunidade**.</li>
                        <li><b>Você melhora a assertividade de todos:</b> Cada feedback torna a plataforma mais inteligente e precisa. Uma vitória sua, compartilhada anonimamente através dos dados, ajuda toda a comunidade a vencer junto.</li>
                        <li><b>Você nos ajuda a refinar:</b> Compreendemos quando uma estratégia falha e ajustamos os parâmetros para futuros sinais, garantindo uma melhoria contínua.</li>
                    </ul>
                </InfoAccordion>

                <InfoAccordion title="Jogo Responsável" icon={<ShieldIcon className="w-6 h-6 text-purple-300"/>}>
                    <p>Nosso objetivo é fornecer ferramentas para decisões mais inteligentes, não garantir ganhos. Lembre-se sempre dos pilares do Jogo Responsável:</p>
                     <ul className="list-disc list-inside space-y-2 mt-2 text-sm">
                        <li><b>Gerencie sua Banca:</b> Defina limites claros de ganhos e perdas para cada sessão e nunca os ultrapasse.</li>
                        <li><b>Não persiga perdas:</b> Se um sinal não der o resultado esperado, não tente 'recuperar' impulsivamente. Faça uma pausa.</li>
                        <li><b>Jogue por diversão:</b> Encare os jogos como entretenimento. Os lucros são uma consequência da estratégia.</li>
                        <li><b>Saiba a hora de parar:</b> Proteger o lucro é tão importante quanto obtê-lo. Após uma boa sequência, considere finalizar a sessão.</li>
                    </ul>
                </InfoAccordion>
            </div>
        </div>
    );
};

export default InformationPage;