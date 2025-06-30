import { useState } from 'react';
import ChatwootConversations from '../../components/chatwoot/ChatwootConversations';
import { testConnection, testCorsConnectivity } from '../../services/chatwootProxyService';

export default function ChatwootPage() {
  const [testing, setTesting] = useState(false);
  const [testingCors, setTestingCors] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [corsStatus, setCorsStatus] = useState<'unknown' | 'success' | 'error'>('unknown');
  const [testResult, setTestResult] = useState<string>('');

  const handleTestCors = async () => {
    setTestingCors(true);
    setCorsStatus('unknown');

    try {
      console.log('🧪 Iniciando teste CORS...');
      const result = await testCorsConnectivity();
      
      if (result.success) {
        setCorsStatus('success');
        setTestResult(`✅ CORS funcionando!
        
Teste realizado com sucesso em: ${new Date().toLocaleString('pt-BR')}
Servidor: ${result.data?.server_info?.server_software || 'Não informado'}
PHP: ${result.data?.server_info?.php_version || 'Não informado'}

Agora você pode testar a conexão completa com o Chatwoot.`);
        
        console.log('✅ Teste CORS bem-sucedido:', result);
      } else {
        setCorsStatus('error');
        setTestResult(`❌ Falha no CORS: ${result.error || 'Erro desconhecido'}

Possíveis soluções:
1. Verifique se o servidor está online
2. Confirme se os headers CORS estão configurados
3. Tente acessar diretamente: https://fullweb.com.br/chathook/test-cors.php`);
        console.error('❌ Teste CORS falhou:', result.error);
      }
    } catch (error) {
      setCorsStatus('error');
      setTestResult(`❌ Erro inesperado no CORS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.error('❌ Erro no teste CORS:', error);
    } finally {
      setTestingCors(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionStatus('unknown');
    setTestResult('');

    try {
      console.log('🔧 Iniciando teste de conexão...');
      const result = await testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setTestResult(`✅ Conexão bem-sucedida!
        
Endpoint: https://fullweb.com.br/chathook/chatwoot-proxy.php
Timestamp: ${new Date().toLocaleString('pt-BR')}
Metadados: ${JSON.stringify(result.meta, null, 2)}`);
        
        console.log('✅ Teste de conexão bem-sucedido:', result);
      } else {
        setConnectionStatus('error');
        setTestResult(`❌ Falha na conexão: ${result.error || 'Erro desconhecido'}`);
        console.error('❌ Teste de conexão falhou:', result.error);
      }
    } catch (error) {
      setConnectionStatus('error');
      setTestResult(`❌ Erro inesperado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      console.error('❌ Erro no teste:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🔗 Integração Chatwoot
              </h1>
              <p className="mt-2 text-gray-600">
                Sistema integrado com endpoint real do Chatwoot via proxy PHP
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Status CORS */}
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    corsStatus === 'success' 
                      ? 'bg-green-500 animate-pulse' 
                      : corsStatus === 'error' 
                        ? 'bg-red-500' 
                        : 'bg-gray-400'
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  CORS: {corsStatus === 'success' 
                    ? 'OK' 
                    : corsStatus === 'error' 
                      ? 'Erro' 
                      : 'Não testado'
                  }
                </span>
              </div>

              {/* Status da conexão */}
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-3 h-3 rounded-full ${
                    connectionStatus === 'success' 
                      ? 'bg-green-500 animate-pulse' 
                      : connectionStatus === 'error' 
                        ? 'bg-red-500' 
                        : 'bg-gray-400'
                  }`}
                ></div>
                <span className="text-sm font-medium text-gray-700">
                  API: {connectionStatus === 'success' 
                    ? 'Conectado' 
                    : connectionStatus === 'error' 
                      ? 'Desconectado' 
                      : 'Não testado'
                  }
                </span>
              </div>

              {/* Botões de teste */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTestCors}
                  disabled={testingCors}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                    testingCors
                      ? 'bg-gray-400 cursor-not-allowed'
                      : corsStatus === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  {testingCors ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🧪</span>
                      Testar CORS
                    </>
                  )}
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={testing || corsStatus !== 'success'}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white transition-colors ${
                    testing || corsStatus !== 'success'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : connectionStatus === 'success'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {testing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Testando...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🔧</span>
                      Testar API
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Resultado do teste */}
          {testResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              connectionStatus === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <pre className={`text-sm whitespace-pre-wrap ${
                connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card do Endpoint */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">🔗</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Endpoint Principal
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Proxy PHP
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                    https://fullweb.com.br/chathook/chatwoot-proxy.php
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Card das Funcionalidades */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-lg">⚡</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Funcionalidades
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Ativas
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">
                  Conversas • Mensagens • Agentes • Envio
                </div>
              </div>
            </div>
          </div>

          {/* Card do Status */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    connectionStatus === 'success' 
                      ? 'bg-green-500' 
                      : connectionStatus === 'error' 
                        ? 'bg-red-500' 
                        : 'bg-gray-500'
                  }`}>
                    <span className="text-white text-lg">
                      {connectionStatus === 'success' 
                        ? '✅' 
                        : connectionStatus === 'error' 
                          ? '❌' 
                          : '❓'
                      }
                    </span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Status da Conexão
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {connectionStatus === 'success' 
                        ? 'Operacional' 
                        : connectionStatus === 'error' 
                          ? 'Com problemas' 
                          : 'Não testado'
                      }
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <div className="text-sm text-gray-500">
                  Última verificação: {connectionStatus !== 'unknown' ? new Date().toLocaleTimeString('pt-BR') : 'Nunca'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instruções de Uso */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-4">📋 Como usar (Fluxo de teste):</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">1. 🧪 Teste CORS Primeiro</h4>
              <p className="text-sm text-blue-700">
                Clique em "Testar CORS" para verificar se conseguimos acessar o servidor e se os headers CORS estão funcionando.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">2. 🔧 Teste a API Chatwoot</h4>
              <p className="text-sm text-blue-700">
                Após CORS OK, clique em "Testar API" para verificar a conectividade completa com o Chatwoot.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">3. 👁️ Visualize as Conversas</h4>
              <p className="text-sm text-blue-700">
                Com ambos os testes bem-sucedidos, as conversas aparecerão automaticamente na seção abaixo.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">4. 💬 Interaja com Mensagens</h4>
              <p className="text-sm text-blue-700">
                Clique em qualquer conversa para ver mensagens detalhadas e responder em tempo real.
              </p>
            </div>
          </div>
          
          {/* Status visual do fluxo */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                corsStatus === 'success' ? 'bg-green-100 border-green-300' : 
                corsStatus === 'error' ? 'bg-red-100 border-red-300' : 
                'bg-gray-100 border-gray-300'
              } border`}>
                <span className="text-sm font-medium">
                  {corsStatus === 'success' ? '✅' : corsStatus === 'error' ? '❌' : '⏳'} CORS
                </span>
              </div>
              <div className="text-gray-400">→</div>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                connectionStatus === 'success' ? 'bg-green-100 border-green-300' : 
                connectionStatus === 'error' ? 'bg-red-100 border-red-300' : 
                'bg-gray-100 border-gray-300'
              } border`}>
                <span className="text-sm font-medium">
                  {connectionStatus === 'success' ? '✅' : connectionStatus === 'error' ? '❌' : '⏳'} API
                </span>
              </div>
              <div className="text-gray-400">→</div>
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                connectionStatus === 'success' ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'
              } border`}>
                <span className="text-sm font-medium">
                  {connectionStatus === 'success' ? '✅' : '⏳'} Conversas
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Componente de Conversas */}
        <div className="bg-white shadow rounded-lg">
          <ChatwootConversations />
        </div>

        {/* Rodapé com informações técnicas */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🔧 Informações Técnicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Stack Tecnológica:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Frontend:</strong> React + TypeScript + Tailwind CSS</li>
                <li>• <strong>Proxy:</strong> PHP com CORS habilitado</li>
                <li>• <strong>API:</strong> Chatwoot v3.x REST API</li>
                <li>• <strong>Autenticação:</strong> Token Bearer fixo</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Recursos Implementados:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ✅ Listagem de conversas em tempo real</li>
                <li>• ✅ Visualização de mensagens com anexos</li>
                <li>• ✅ Envio de mensagens</li>
                <li>• ✅ Metadados e estatísticas da API</li>
                <li>• ✅ Interface responsiva e moderna</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 