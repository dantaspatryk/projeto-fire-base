import { GoogleGenAI, Type } from "@google/genai";
import type { GeneratedSignal, VolatilityAnalysis, CustomStrategyConfig, PayoutState, PayoutSettings, StrategyProfile, HistorySignal } from '../types';

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    attempts: {
        type: Type.ARRAY,
        description: 'Uma lista de 2 a 5 tipos de tentativas de jogo com o número de rodadas para cada. Os tipos podem ser "Turbo", "Normal", "Lenta", "Automática", etc.',
        items: {
            type: Type.OBJECT,
            properties: {
                type: {
                    type: Type.STRING,
                    description: "O tipo de rodada (ex: 'Turbo')."
                },
                rounds: {
                    type: Type.INTEGER,
                    description: 'O número de rodadas para este tipo (entre 3 e 10).'
                }
            },
            required: ['type', 'rounds']
        }
    },
    signalReason: {
        type: Type.STRING,
        description: 'A razão pela qual este sinal é bom (ex: "Identificamos um padrão..."). Seja criativo e convincente.'
    },
    executionStrategy: {
        type: Type.STRING,
        description: 'Uma estratégia de execução EXCEPCIONALMENTE detalhada, tática e profissional. Deve ser um guia passo a passo com insights de especialista (ex: "Comece com as rodadas normais para aquecer o algoritmo...").'
    },
    bankrollManagementTip: {
        type: Type.STRING,
        description: 'Uma dica persuasiva sobre gerenciamento de banca e jogo responsável (ex: "Lembre-se de definir um limite...").'
    },
  },
  required: ['attempts', 'signalReason', 'executionStrategy', 'bankrollManagementTip'],
};

const volatilityAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'Um título de alerta curto e impactante (ex: "Atenção: Momento Desfavorável!").'
        },
        explanation: {
            type: Type.STRING,
            description: 'Uma explicação detalhada e persuasiva (2-3 frases) do porquê o jogo não está em um bom momento para pagar. Mencione conceitos como "baixa probabilidade de ganho", "ciclo de retenção de prêmios" e "padrões de baixa assertividade", em vez de "volatilidade" ou "instabilidade".'
        },
        recommendation: {
            type: Type.STRING,
            description: 'Uma recomendação clara e útil para o usuário (ex: "Sugerimos uma pausa de alguns minutos neste jogo ou tente a sorte em outro para melhores resultados.").'
        }
    },
    required: ['title', 'explanation', 'recommendation']
};

const badSignalResponseSchema = {
  type: Type.OBJECT,
  properties: {
    analysisTitle: {
      type: Type.STRING,
      description: 'Um título de alerta impactante. Ex: "Entrada Não Recomendada: Risco Elevado Detectado".'
    },
    detailedReason: {
      type: Type.STRING,
      description: 'Explicação detalhada e persuasiva confirmando que o jogo não está em um momento pagador. Use argumentos como "análise de padrões recentes indica um ciclo de baixa probabilidade de ganhos" e "o algoritmo não está alinhado para liberar prêmios significativos agora".'
    },
    nextAction: {
      type: Type.STRING,
      description: 'Recomendação clara sobre o que fazer agora. Ex: "É crucial fazer uma pausa neste jogo por alguns minutos. Forçar uma entrada agora resultará em perdas. Tente novamente mais tarde ou explore outro jogo com melhores condições."'
    }
  },
  required: ['analysisTitle', 'detailedReason', 'nextAction']
};

// FIX: Added and exported the missing `generateVolatilityAnalysis` function to resolve the import error in SignalGeneratorPage.tsx.
export const generateVolatilityAnalysis = async (gameName: string): Promise<VolatilityAnalysis> => {
    try {
        const prompt = `
            Aja como um analista de risco de um cassino online.
            Um usuário tentou gerar um sinal para o jogo "${gameName}" várias vezes em um curto período, indicando comportamento de risco ou instabilidade no jogo.
            Sua tarefa é criar uma análise de risco persuasiva e clara para o usuário.
            
            REGRAS:
            1.  **Título (title):** Crie um título de alerta que seja direto e impactante. Ex: "Atenção: Momento Desfavorável!".
            2.  **Explicação (explanation):** Explique de forma convincente que o jogo não está em um bom momento para pagar. Use conceitos como "baixa probabilidade de ganho", "ciclo de retenção de prêmios" e "padrões de baixa assertividade". NÃO use as palavras "volatilidade" ou "instabilidade".
            3.  **Recomendação (recommendation):** Dê uma recomendação clara e útil. Sugira uma pausa de alguns minutos neste jogo ou que ele tente a sorte em outro para obter melhores resultados.

            A resposta deve ser APENAS um JSON válido que adere ao schema fornecido.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: volatilityAnalysisSchema,
            },
        });
        
        const jsonString = result.text;
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error generating volatility analysis:", error);
        // Fallback
        return {
            title: "Momento Desfavorável Detectado",
            explanation: "Nossa análise indica que o jogo está passando por um ciclo de baixa probabilidade de ganhos. Forçar entradas agora pode aumentar o risco de perdas.",
            recommendation: "Recomendamos fazer uma breve pausa neste jogo. Tente novamente em alguns minutos ou explore outras oportunidades para melhores resultados."
        };
    }
};

export const generateReWarningAnalysis = async (gameName: string, durationMinutes: number): Promise<VolatilityAnalysis> => {
    try {
        const prompt = `
            Aja como um analista de risco sênior de um cassino online.
            Um usuário foi avisado que o jogo "${gameName}" estava prestes a entrar em um ciclo de baixa probabilidade de pagamentos. Ele ignorou o aviso e tentou gerar um novo sinal para o mesmo jogo imediatamente.
            Sua tarefa é criar uma análise de risco REFORÇADA e final.
            
            REGRAS:
            1.  **Título (title):** Crie um título de alerta que seja direto e sério. Ex: "Tentativa Bloqueada: Risco Confirmado".
            2.  **Explicação (explanation):** Confirme que a análise prévia estava correta e que o jogo JÁ ENTROU no ciclo de baixa previsto. Explique que forçar uma jogada agora é extremamente desaconselhável e resultará em perdas. Use uma linguagem firme, mas profissional.
            3.  **Recomendação (recommendation):** Dê uma instrução clara para o usuário. Diga a ele para fazer uma pausa neste jogo e informe o tempo exato que a nossa análise prevê para este ciclo de baixa, que é de aproximadamente **${durationMinutes} minutos**.

            A resposta deve ser APENAS um JSON válido que adere ao schema fornecido.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: volatilityAnalysisSchema,
            },
        });
        
        const jsonString = result.text;
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error generating re-warning analysis:", error);
        return {
            title: "Análise de Risco Confirmada",
            explanation: "Nossa análise anterior foi confirmada. O jogo entrou em um período de baixa probabilidade de pagamentos, tornando novas entradas extremamente arriscadas no momento.",
            recommendation: `Para sua segurança, recomendamos fortemente uma pausa neste jogo por aproximadamente ${durationMinutes} minutos. Tentar jogar agora pode resultar em perdas desnecessárias.`
        };
    }
};

const strategyDescriptions: Record<StrategyProfile, string> = {
    Cauteloso: "O payout está baixo mas com sinais de melhora. Gere um sinal de MUITO BAIXO RISCO, com 1-2 tentativas e poucas rodadas (3-5). O tom deve ser de 'teste de padrão', sugerindo cautela e apostas mínimas para validar a subida.",
    Observador: "O jogo está prestes a entrar em um período de alta. Crie um sinal de BAIXO RISCO, com 2 tentativas e rodadas moderadas (4-6). A estratégia deve ser de 'aquecimento', preparando o jogador para a janela de oportunidade que se aproxima.",
    Conservador: "O payout está alto mas prestes a cair. A janela de oportunidade está se fechando! Crie um sinal CONSERVADOR para garantir os últimos ganhos. A estratégia deve ser rápida, segura, com 2-3 tentativas e poucas rodadas (3-6), priorizando a proteção do lucro já obtido.",
    Moderado: "O período de alta está no fim e o tempo é curto. Gere um sinal MODERADO, com um equilíbrio entre risco e recompensa para uma saída estratégica. Use 2-3 tentativas e uma mistura de rodadas. O tom deve ser de 'aproveitar a reta final da oportunidade'.",
    Estrategista: "O payout está em um ponto de equilíbrio tático (78-81%). Crie um sinal de MÉDIO RISCO, focado em uma janela de oportunidade curta de 4 minutos. Use de 1 a 3 tentativas. As rodadas devem ser 'boas' (uma mistura de Turbo e Normal, com contagem moderada, por exemplo, 5 a 8) e a estratégia deve ser precisa e rápida para capitalizar este período específico.",
    Agressivo: "O payout está em um pico estável. Crie um sinal AGRESSIVO para maximizar os ganhos. Use de 4 a 5 tentativas, inclua rodadas Turbo com mais jogadas (5-10). A razão do sinal deve ser otimista e confiante.",
    Arrojado: "Oportunidade máxima de ganho! Crie um sinal ARROJADO e ousado com 5 tentativas. Foque em rodadas Turbo e Rápidas com um número elevado de jogadas (8-13). A estratégia deve ser de alto impacto, buscando prêmios grandes.",
    Defensivo: "O payout está baixo e estável. O risco é MUITO ALTO. Gere um sinal DEFENSIVO, focado em testar o algoritmo com o menor risco possível. Use apenas 1-2 tentativas com pouquíssimas rodadas (2-4). A razão do sinal e todas as dicas DEVEM enfatizar o alto risco, a baixa probabilidade de ganho e a importância de usar apostas mínimas apenas para 'testar a água'. A estratégia deve ser de 'validação de padrão de baixíssimo custo'.",
    BaixaProbabilidade: "O payout está em um período de baixa estável. Sua tarefa é gerar uma ANÁLISE PERSUASIVA explicando por que NÃO é um bom momento para jogar, focando em 'baixa probabilidade de ganhos' e 'ciclo de retenção do algoritmo'. NÃO GERE TENTATIVAS JOGÁVEIS.",
};

const generateLowPayoutAnalysis = async (gameName: string, payout: number): Promise<GeneratedSignal> => {
    try {
         const prompt = `
            Aja como um especialista em análise de algoritmos de jogos de cassino.
            O jogo "${gameName}" está com um payout baixo de ${payout}%, indicando um período de baixa probabilidade de ganhos.
            Sua tarefa é gerar uma análise persuasiva e clara para o usuário, explicando por que ele NÃO DEVE JOGAR AGORA.
            A resposta deve ser detalhada, usando termos como "ciclo de retenção de prêmios" e "padrões de baixa assertividade" para desaconselhar a entrada.
            
            A resposta deve ser APENAS um JSON válido que adere ao schema 'badSignalResponseSchema'.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: badSignalResponseSchema,
            },
        });
        
        const jsonString = result.text;
        const parsedBadResult = JSON.parse(jsonString);
        
        return {
            attempts: [{ type: 'ENTRADA NÃO RECOMENDADA', rounds: 0 }],
            confidenceIndex: payout,
            signalReason: `${parsedBadResult.analysisTitle}: ${parsedBadResult.detailedReason}`,
            executionStrategy: "NENHUMA ESTRATÉGIA APLICÁVEL. O JOGO ESTÁ EM UM CICLO DE BAIXA PROBABILIDADE.",
            bankrollManagementTip: parsedBadResult.nextAction,
            payingTimeSuggestion: "N/A",
            isLowPayoutSignal: true,
        };

    } catch (error) {
        console.error("Error generating low payout analysis:", error);
        // Fallback
         return {
            attempts: [{ type: 'ENTRADA NÃO RECOMENDADA', rounds: 0 }],
            confidenceIndex: payout,
            signalReason: "Análise Indisponível: O jogo está com baixa probabilidade de pagamento. É um mau momento para jogar.",
            executionStrategy: "NENHUMA ESTRATÉGIA APLICÁVEL.",
            bankrollManagementTip: "Recomendamos uma pausa neste jogo. Tente novamente mais tarde.",
            payingTimeSuggestion: "N/A",
            isLowPayoutSignal: true,
        };
    }
};

// Protocolo de Segurança: Sinais de fallback ativados quando a API do Gemini falha,
// fornecendo uma alternativa segura e contextualmente apropriada para o usuário.
const fallbackSignals: Record<Exclude<StrategyProfile, 'BaixaProbabilidade'>, Omit<GeneratedSignal, 'confidenceIndex' | 'payingTimeSuggestion' | 'strategyProfile'>> = {
    Defensivo: {
        attempts: [{ type: 'Normal', rounds: 3 }],
        signalReason: "PROTOCOLO DE SEGURANÇA: Sinal defensivo padrão ativado devido a instabilidade na comunicação com a IA.",
        executionStrategy: "Use apostas mínimas. O objetivo é testar o padrão do jogo com o menor risco possível enquanto a análise principal está indisponível.",
        bankrollManagementTip: "Risco elevado. Não aumente suas apostas.",
    },
    Cauteloso: {
        attempts: [{ type: 'Normal', rounds: 4 }, { type: 'Turbo', rounds: 3 }],
        signalReason: "PROTOCOLO DE SEGURANÇA: Sinal cauteloso padrão ativado. A IA principal está temporariamente indisponível.",
        executionStrategy: "Comece com as rodadas normais para sentir o jogo. Use as rodadas turbo com cautela e apostas baixas.",
        bankrollManagementTip: "Jogue com moderação. O cenário indica uma possível melhora, mas a confirmação não pôde ser obtida.",
    },
    Observador: {
        attempts: [{ type: 'Normal', rounds: 5 }, { type: 'Turbo', rounds: 4 }],
        signalReason: "PROTOCOLO DE SEGURANÇA: Sinal de aquecimento padrão ativado. Detectamos uma melhora iminente, mas a IA não pôde gerar uma estratégia personalizada.",
        executionStrategy: "Estas rodadas servem para preparar sua entrada no ciclo de alta. Mantenha as apostas controladas e observe os resultados.",
        bankrollManagementTip: "Prepare-se para a janela de oportunidade, mas não se arrisque desnecessariamente até ter um sinal completo.",
    },
    Estrategista: {
        attempts: [{ type: 'Turbo', rounds: 6 }, { type: 'Normal', rounds: 5 }],
        signalReason: "PROTOCOLO DE SEGURANÇA: Estratégia tática padrão ativada. A comunicação com a IA foi interrompida.",
        executionStrategy: "Execute as rodadas Turbo para aproveitar a janela de tempo. Use as rodadas Normais para estabilizar.",
        bankrollManagementTip: "O momento é bom, mas requer precisão. Gerencie sua banca para se manter na jogada durante todo o período.",
    },
    Moderado: {
         attempts: [{ type: 'Turbo', rounds: 7 }, { type: 'Normal', rounds: 5 }, {type: 'Turbo', rounds: 5}],
        signalReason: "PROTOCOLO DE SEGURANÇA: Estratégia moderada padrão ativada devido a uma falha de comunicação com a IA.",
        executionStrategy: "Siga a sequência para um equilíbrio entre risco e recompensa. Alterne entre os modos para manter o algoritmo engajado.",
        bankrollManagementTip: "Aproveite o momento, mas esteja pronto para parar se os resultados não forem os esperados. Proteger o lucro é a chave.",
    },
    Conservador: {
        attempts: [{ type: 'Normal', rounds: 6 }, { type: 'Turbo', rounds: 4 }],
        signalReason: "PROTOCOLO DE SEGURANÇA: Estratégia conservadora padrão ativada. A janela de oportunidade está terminando e a IA não pôde confirmar a melhor saída.",
        executionStrategy: "Foco em garantir os ganhos. Use as rodadas Normais para segurança e as Turbo para uma última tentativa rápida.",
        bankrollManagementTip: "Priorize a proteção do seu lucro. Não tente forçar grandes ganhos no final do ciclo.",
    },
    Agressivo: {
        attempts: [{ type: 'Turbo', rounds: 8 }, { type: 'Normal', rounds: 6 }, { type: 'Turbo', rounds: 7 }],
        signalReason: "PROTOCOLO DE SEGURANÇA: Estratégia agressiva padrão ativada. O payout está alto, mas a IA não conseguiu otimizar a estratégia.",
        executionStrategy: "Capitalize no bom momento com as rodadas Turbo. Use as rodadas Normais para dar uma pausa tática ao algoritmo antes de atacar novamente.",
        bankrollManagementTip: "O potencial de ganho é alto, mas o risco também. Monitore seus resultados de perto e saiba a hora de parar.",
    },
    Arrojado: {
        attempts: [{ type: 'Turbo', rounds: 10 }, { type: 'Turbo', rounds: 8 }, { type: 'Normal', rounds: 6 }, { type: 'Turbo', rounds: 5 }],
        signalReason: "PROTOCOLO DE SEGURANÇA: Estratégia arrojada padrão ativada. Oportunidade máxima detectada, mas a IA não conseguiu detalhar a estratégia.",
        executionStrategy: "Execute as sequências Turbo para maximizar o potencial de ganho no pico do payout. A rodada Normal serve para reavaliar e continuar.",
        bankrollManagementTip: "Estratégia de alto risco para ganhos altos. Defina um limite de perda claro antes de começar.",
    },
};

export const generateSignal = async (
    gameName: string,
    payoutState?: PayoutState,
    payoutSettings?: PayoutSettings,
    forceBadSignal = false,
    customStrategy?: CustomStrategyConfig,
    signalHistory?: HistorySignal[]
): Promise<GeneratedSignal> => {
  // Define variables used across try/catch scope for fallback mechanism
  let payingTimeSuggestion: string | undefined = undefined;
  const payout = payoutState?.payout;
  let strategyProfile: StrategyProfile | undefined = undefined;
  
  try {
    const nowForTime = new Date();
    const startTime = new Date(nowForTime.getTime() + 1 * 60000); // 1 minute from now
    
    // Default signal duration, may be overridden by logic below.
    let signalDurationMinutes = payoutState?.phase === 'high' ? 12 : 9.5;
    let endTime = new Date(startTime.getTime() + signalDurationMinutes * 60000);

    const formatTime = (date: Date) => date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    payingTimeSuggestion = `${formatTime(startTime)} - ${formatTime(endTime)}`;
    
    const isLowPayout = payout !== undefined && payoutSettings !== undefined && payout < payoutSettings.highPhaseMin;

    // --- NEW LOGIC ORDER #1: Prioritize Custom Strategy ---
    if (customStrategy) {
        const riskInstruction = {
            cautious: 'Estratégia CONSERVADORA, foco em baixo risco, poucas rodadas (3-5), e gerenciamento de banca rigoroso. A razão do sinal deve refletir cautela e preservação de capital.',
            observer: 'Estratégia de OBSERVAÇÃO, para testar padrões com apostas mínimas. Use poucas tentativas (1-2) com pouquíssimas rodadas (2-4). O tom deve ser de "análise de terreno", não de busca por lucro imediato.',
            balanced: 'Estratégia MODERADA/EQUILIBRADA, com um equilíbrio entre risco e recompensa, usando uma mistura de tipos de rodadas e contagens médias (4-7).',
            opportunist: 'Estratégia OPORTUNISTA, focada em capitalizar picos rápidos de pagamento. Use rodadas Turbo, mas em sessões curtas e impactantes (2-3 tentativas, 5-8 rodadas). A estratégia deve ser ágil.',
            aggressive: 'Estratégia AGRESSIVA, buscando maiores ganhos com mais rodadas (5-10), especialmente Turbo, e aceitando um risco maior. A razão do sinal deve ser otimista.',
            explorer: 'Estratégia EXPLORADORA, para descobrir novos padrões. Use uma variedade incomum de tipos de rodada (ex: alternar Lenta e Turbo). A estratégia deve ser criativa e justificar a abordagem experimental.',
            maximizer: 'Estratégia MAXIMIZADORA, de altíssimo risco, visando prêmios máximos (jackpots). Use muitas rodadas Turbo/Rápidas (8-15) e um número maior de tentativas. O tom deve ser de "tudo ou nada", buscando a grande vitória.',
            strategist: 'Estratégia ESTRATEGISTA, com uma abordagem tática calculada. A execução deve descrever um plano claro, como "começar com rodadas normais para aquecer e depois aplicar rodadas Turbo em momentos específicos". A lógica por trás da sequência é crucial.'
        }[customStrategy.riskLevel];

        const sessionGoalInstruction = {
            quick_wins: 'O objetivo da sessão é obter ganhos rápidos. A estratégia deve focar em jogadas de alto impacto em um curto período, com táticas mais diretas.',
            long_session: 'O objetivo é uma sessão de jogo prolongada. A estratégia deve ser mais cadenciada, visando a consistência, o controle de banca e a durabilidade ao longo de mais jogadas.'
        }[customStrategy.sessionGoal];

        const roundTypesInstruction = customStrategy.preferredRoundTypes.length > 0
            ? `As tentativas devem usar PREFERENCIALMENTE os seguintes tipos de rodada: ${customStrategy.preferredRoundTypes.join(', ')}.`
            : 'Seja criativo com os tipos de rodada (ex: Turbo, Normal, Lenta, Automática, Rápida).';

        const prompt = `
            Aja como um especialista de elite em estratégias de cassino, criando um sinal para o jogo "${gameName}". O usuário definiu uma estratégia personalizada.
            
            REGRAS DE GERAÇÃO:
            1.  **Perfil de Risco:** ${riskInstruction}
            2.  **Objetivo da Sessão:** ${sessionGoalInstruction}
            3.  **Tentativas:** Crie exatamente ${customStrategy.numberOfAttempts} tentativas de jogo.
            4.  **Tipos de Rodada:** ${roundTypesInstruction}
            5.  **Quantidade de Rodadas:** O número de rodadas em cada tentativa deve ser entre 3 e 15.
            6.  **Criatividade e Detalhe:** Seja EXTREMAMENTE criativo, detalhado e profissional nas descrições da razão e da estratégia. Use uma linguagem que inspire confiança e demonstre expertise.
            7.  **Não Mencione Payout:** A estratégia é manual. NÃO mencione o Payout, porcentagens ou volatilidade. O foco é na estratégia definida pelo usuário.

            A resposta deve ser APENAS um JSON válido que adere ao schema fornecido.
        `;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonString = result.text;
        const parsedResult = JSON.parse(jsonString);

        return {
            ...parsedResult,
            confidenceIndex: 95, // Manual mode has a fixed high confidence display
            payingTimeSuggestion,
        };
    }

    if (forceBadSignal) {
        return generateLowPayoutAnalysis(gameName, payout ?? 50);
    }
    
    if (isLowPayout) {
        return generateLowPayoutAnalysis(gameName, payout ?? 50);
    }

    if (payoutState) {
        const isEndOfCycle = payoutState.isChangingSoon && payoutState.nextPhase === 'low';

        if (payoutState.phase === 'low') {
            const isStartOfCycle = payoutState.isChangingSoon && payoutState.nextPhase === 'high';
            if (isStartOfCycle) {
                strategyProfile = 'Observador';
            } else if (payout >= 68) {
                strategyProfile = 'Cauteloso';
            } else {
                strategyProfile = 'Defensivo';
            }
        } else { // phase === 'high'
            if (isEndOfCycle) { // isEndOfCycle is true for payout 77
                strategyProfile = Math.random() < 0.5 ? 'Conservador' : 'Moderado';
            } else if (payout >= 86) {
                strategyProfile = 'Arrojado';
            } else if (payout >= 82) { // 82-85
                strategyProfile = 'Agressivo';
            } else if (payout >= 78 && payout <= 81) {
                strategyProfile = 'Estrategista';
            } else if (payout >= 75) { // This now covers the 75-76 range, as 77 is handled by isEndOfCycle.
                strategyProfile = 'Moderado';
            } else {
                // Fallback for any unexpected case where payout is high but doesn't fit above.
                strategyProfile = 'Conservador';
            }
        }
    } else {
        return generateLowPayoutAnalysis(gameName, 50);
    }

    // --- NEW DURATION LOGIC ---
    if (payoutState) {
        let newSignalDurationMinutes = signalDurationMinutes; // Start with default
        if (payoutState.phase === 'high') {
            if (strategyProfile === 'Estrategista') {
                newSignalDurationMinutes = 4;
            } else if (strategyProfile === 'Moderado' || strategyProfile === 'Conservador') {
                // Short duration for end-of-cycle or stable mid-high scenarios
                newSignalDurationMinutes = 4.5;
            } else if (strategyProfile === 'Agressivo' || strategyProfile === 'Arrojado') {
                if (payout && payout > 85) {
                    newSignalDurationMinutes = 12; // Longer duration for sustained peak
                } else { // This covers payout === 85
                    newSignalDurationMinutes = 6; // Shorter, intense duration for aggressive peak entry
                }
            }
            // 'Observador' at the start of a high phase keeps the default 12 mins.
        }
        // Low phase profiles keep the default 9.5 mins.

        if (newSignalDurationMinutes !== signalDurationMinutes) {
            signalDurationMinutes = newSignalDurationMinutes;
            endTime = new Date(startTime.getTime() + signalDurationMinutes * 60000);
            payingTimeSuggestion = `${formatTime(startTime)} - ${formatTime(endTime)}`;
        }
    }


    const description = strategyDescriptions[strategyProfile];
    const prompt = `
        Aja como um especialista de elite em estratégias de cassino para o jogo "${gameName}".
        O Payout atual é ${payout}%.

        CONTEXTO DA ESTRATÉGIA: ${description}

        REGRAS DE GERAÇÃO:
        1.  **Coerência:** A estratégia, as tentativas, o número de rodadas e o tom geral DEVEM ser 100% coerentes com o CONTEXTO fornecido.
        2.  **Criatividade e Detalhe:** Seja EXTREMAMENTE criativo, detalhado e profissional nas descrições. Use uma linguagem que inspire confiança e demonstre expertise.
        3.  **Não seja repetitivo:** Evite usar as mesmas frases ou estratégias em sinais diferentes. Cada sinal deve parecer único e feito sob medida.

        A resposta deve ser APENAS um JSON válido que adere ao schema fornecido.
    `;

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const jsonString = result.text;
    const parsedResult = JSON.parse(jsonString);

    return {
      ...parsedResult,
      confidenceIndex: payout,
      payingTimeSuggestion,
      strategyProfile,
      ...payoutState, // Carry over context for potential display
    };

  } catch (error) {
    console.error("Error generating signal:", error);
    
    // Protocolo de Segurança: Fallback inteligente em caso de falha da API
    if (strategyProfile && strategyProfile !== 'BaixaProbabilidade' && fallbackSignals[strategyProfile]) {
        const fallback = fallbackSignals[strategyProfile];
        return {
            ...fallback,
            confidenceIndex: payout ?? 80, // Usa o payout calculado se disponível
            payingTimeSuggestion: payingTimeSuggestion ?? "AGORA - 8 min",
            strategyProfile,
            ...payoutState,
        };
    }

    // Fallback genérico caso o strategyProfile não tenha sido determinado (ex: falha na API da estratégia customizada)
    return {
        attempts: [{ type: 'Normal', rounds: 5 }, { type: 'Turbo', rounds: 4 }],
        confidenceIndex: 78,
        signalReason: "PROTOCOLO DE SEGURANÇA ATIVADO: Ocorreu uma falha na comunicação com a IA. Este é um sinal de segurança padrão.",
        executionStrategy: "Jogue com extrema cautela e apostas mínimas. Monitore os resultados de perto, pois a análise principal não pôde ser concluída.",
        bankrollManagementTip: "Devido à indisponibilidade da análise principal, o risco é maior. Recomendamos não arriscar valores altos.",
        payingTimeSuggestion: payingTimeSuggestion ?? "AGORA - 7 min",
    };
  }
};