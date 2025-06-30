import React, { useState, useEffect } from 'react';
import { 
  getContacts, 
  getContactDetails, 
  getContactConversations,
  searchContacts,
  createContact,
  updateContact,
  formatContactStatus,
  getContactInitials,
  formatPhoneNumber,
  getTimeSinceLastActivity,
  type ChatwootContact,
  type ChatwootConversation
} from '../../services/chatwootProxyService';

interface ContactsPageProps {}

const ContactsPage: React.FC<ContactsPageProps> = () => {
  const [contatos, setContatos] = useState<ChatwootContact[]>([]);
  const [contatoAtivo, setContatoAtivo] = useState<ChatwootContact | null>(null);
  const [conversasDoContato, setConversasDoContato] = useState<ChatwootConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetalhes, setLoadingDetalhes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busca, setBusca] = useState('');
  const [meta, setMeta] = useState<any>(null);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ordenacao, setOrdenacao] = useState('-created_at');

  // Estado do formulário de novo contato
  const [novoContato, setNovoContato] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  // Função para carregar contatos
  const loadContatos = async (pagina: number = 1, query?: string) => {
    console.log(`🔄 Carregando contatos - Página ${pagina}${query ? ` - Busca: "${query}"` : ''} - Ordenação: ${ordenacao}`);
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (query && query.trim()) {
        result = await getContacts(pagina, 25, ordenacao, query.trim());
      } else {
        result = await getContacts(pagina, 25, ordenacao);
      }

      console.log('📋 Resultado contatos:', result);

      if (result.success && result.data) {
        console.log('✅ Contatos carregados:', result.data.contacts.length);
        setContatos(result.data.contacts);
        setMeta(result.data.meta);
        setPaginaAtual(pagina);
      } else {
        const errorMsg = result.error || 'Erro ao carregar contatos';
        console.error('❌ Erro nos contatos:', errorMsg);
        throw new Error(errorMsg);
      }

    } catch (error) {
      console.error('❌ Erro crítico ao carregar contatos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao carregar contatos';
      setError(errorMessage);
      setContatos([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  };

  // Função para buscar contatos
  const handleBusca = async (query: string) => {
    setBusca(query);
    setPaginaAtual(1); // Reset para primeira página
    await loadContatos(1, query.trim() || undefined);
  };

  // Selecionar contato e carregar detalhes
  const selectContato = async (contato: ChatwootContact) => {
    console.log('👤 Selecionando contato:', contato.id);
    setContatoAtivo(contato);
    setConversasDoContato([]);
    setLoadingDetalhes(true);
    
    try {
      // Busca detalhes completos do contato
      const detalhesResult = await getContactDetails(contato.id);
      if (detalhesResult.success && detalhesResult.data) {
        setContatoAtivo(detalhesResult.data);
      }

      // Busca conversas do contato
      const conversasResult = await getContactConversations(contato.id);
      if (conversasResult.success && conversasResult.data) {
        console.log('💬 Conversas do contato carregadas:', conversasResult.data.length);
        setConversasDoContato(conversasResult.data);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar detalhes do contato:', error);
    } finally {
      setLoadingDetalhes(false);
    }
  };

  // Criar novo contato
  const handleCriarContato = async () => {
    if (!novoContato.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    try {
      setLoading(true);
      const result = await createContact({
        name: novoContato.name.trim(),
        email: novoContato.email.trim() || undefined,
        phone_number: novoContato.phone_number.trim() || undefined,
      });

      if (result.success) {
        console.log('✅ Contato criado com sucesso');
        setMostrarFormulario(false);
        setNovoContato({ name: '', email: '', phone_number: '' });
        await loadContatos(1); // Recarrega a lista
      } else {
        alert('Erro ao criar contato: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao criar contato:', error);
      alert('Erro ao criar contato');
    } finally {
      setLoading(false);
    }
  };

  // Carregar contatos quando a página inicializar
  useEffect(() => {
    console.log('🚀 Inicializando página de contatos com ordenação:', ordenacao);
    loadContatos(1);
  }, []); // Só executa uma vez na inicialização

  if (loading && contatos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando contatos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button 
            onClick={() => loadContatos()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar de Contatos */}
      <aside className="w-80 border-r flex flex-col">
        {/* Header com busca e ações */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">
              Contatos ({meta?.total_count || contatos.length})
            </h2>
            <div className="flex space-x-2">
              <button 
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                title="Novo Contato"
              >
                + Novo
              </button>
              <button 
                onClick={() => loadContatos(paginaAtual, busca)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                title="Atualizar"
              >
                🔄
              </button>
              <button 
                onClick={async () => {
                  console.log('🧪 TESTE DEBUG - ENDPOINT CONTATOS');
                  try {
                    const directResponse = await fetch('https://fullweb.com.br/chathook/chatwoot-proxy.php?endpoint=contacts');
                    console.log('📡 Status direto:', directResponse.status);
                    const directData = await directResponse.json();
                    console.log('📊 Dados diretos do endpoint:', directData);
                    
                    const { getContacts } = await import('../../services/chatwootProxyService');
                    const serviceResult = await getContacts();
                    console.log('🔧 Resultado do serviço:', serviceResult);
                    
                    alert(`🧪 Debug Contatos\nStatus: ${directResponse.status}\nServiço: ${serviceResult.success ? 'OK' : 'ERRO'}\nOrdenação: ${ordenacao}\nContatos: ${serviceResult.data?.contacts?.length || 0}\n\nVerifique o console!`);
                  } catch (error) {
                    console.error('❌ Erro no debug:', error);
                    alert('❌ Erro: ' + error);
                  }
                }}
                className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                title="Debug API"
              >
                🧪
              </button>
            </div>
          </div>
          
          {/* Barra de busca */}
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Buscar contatos..."
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            
            {/* Filtro de ordenação */}
            <select
              value={ordenacao}
              onChange={async (e) => {
                const novaOrdenacao = e.target.value;
                setOrdenacao(novaOrdenacao);
                setPaginaAtual(1);
                console.log(`📊 Mudando ordenação para: ${novaOrdenacao}`);
                await loadContatos(1, busca);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="-created_at">📅 Mais recentes</option>
              <option value="created_at">📅 Mais antigos</option>
              <option value="-last_activity_at">⏰  ativÚltimaidade</option>
              <option value="name">🔤 Nome A-Z</option>
              <option value="-name">🔤 Nome Z-A</option>
            </select>
          </div>
          
          {/* Formulário de novo contato */}
          {mostrarFormulario && (
            <div className="mt-3 p-3 bg-white border rounded-lg space-y-2">
              <input
                type="text"
                placeholder="Nome *"
                value={novoContato.name}
                onChange={(e) => setNovoContato({...novoContato, name: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="email"
                placeholder="Email"
                value={novoContato.email}
                onChange={(e) => setNovoContato({...novoContato, email: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={novoContato.phone_number}
                onChange={(e) => setNovoContato({...novoContato, phone_number: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleCriarContato}
                  className="flex-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Criar
                </button>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Lista de contatos */}
        <div className="flex-1 overflow-y-auto">
          {loading && contatos.length === 0 ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Carregando contatos...</p>
            </div>
          ) : contatos.length === 0 ? (
            <div className="p-4 text-center">
              <div className="text-4xl mb-2">👥</div>
              <p className="text-gray-500">Nenhum contato encontrado</p>
            </div>
          ) : (
            contatos.filter(contato => contato && contato.id).map(contato => (
            <div
              key={contato.id}
              className={`p-4 flex items-center cursor-pointer hover:bg-gray-100 border-b ${
                contatoAtivo?.id === contato.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => selectContato(contato)}
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3 flex items-center justify-center relative">
                {contato.thumbnail ? (
                  <img src={contato.thumbnail} className="w-12 h-12 rounded-full object-cover" alt="" />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {getContactInitials(contato.name)}
                  </span>
                )}
                
                {/* Status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  contato.availability_status === 'online' ? 'bg-green-500' :
                  contato.availability_status === 'away' ? 'bg-yellow-500' :
                  contato.availability_status === 'busy' ? 'bg-red-500' :
                  'bg-gray-400'
                }`}></div>
              </div>

              {/* Informações do contato */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-sm truncate">{contato.name || 'Sem nome'}</h3>
                  <span className="text-xs text-gray-500 ml-2">
                    {getTimeSinceLastActivity(contato.last_activity_at)}
                  </span>
                </div>
                
                {/* Telefone */}
                {contato.phone_number && (
                  <div className="text-xs text-gray-600 truncate">
                    📞 {formatPhoneNumber(contato.phone_number)}
                  </div>
                )}
                
                {/* Email */}
                {contato.email && (
                  <div className="text-xs text-gray-600 truncate">
                    ✉️ {contato.email}
                  </div>
                )}
                
                {/* Status e conversas */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {formatContactStatus(contato.availability_status)}
                  </span>
                  {contato.conversations_count && contato.conversations_count > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      {contato.conversations_count} conv.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Paginação */}
        {meta && meta.total_pages > 1 && (
          <div className="p-3 border-t bg-gray-50 flex justify-between items-center">
            <button
              onClick={() => {
                const novaPagina = paginaAtual - 1;
                setPaginaAtual(novaPagina);
                loadContatos(novaPagina, busca);
              }}
              disabled={paginaAtual <= 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              ← Anterior
            </button>
            
            <span className="text-sm text-gray-600">
              Página {paginaAtual} de {meta.total_pages}
            </span>
            
            <button
              onClick={() => {
                const novaPagina = paginaAtual + 1;
                setPaginaAtual(novaPagina);
                loadContatos(novaPagina, busca);
              }}
              disabled={paginaAtual >= meta.total_pages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50"
            >
              Próxima →
            </button>
          </div>
        )}
      </aside>

      {/* Painel Central - Detalhes do Contato */}
      <main className="flex-1 flex flex-col">
        {contatoAtivo ? (
          <>
            {/* Header do contato */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-4 flex items-center justify-center">
                  {contatoAtivo.thumbnail ? (
                    <img src={contatoAtivo.thumbnail} className="w-16 h-16 rounded-full object-cover" alt="" />
                  ) : (
                    <span className="text-white font-bold text-xl">
                      {getContactInitials(contatoAtivo.name)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-bold">{contatoAtivo.name || 'Sem nome'}</h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    {contatoAtivo.phone_number && (
                      <div>📞 {formatPhoneNumber(contatoAtivo.phone_number)}</div>
                    )}
                    {contatoAtivo.email && (
                      <div>✉️ {contatoAtivo.email}</div>
                    )}
                    <div>{formatContactStatus(contatoAtivo.availability_status)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">ID: {contatoAtivo.id}</div>
                  <div className="text-sm text-gray-500">
                    Criado: {new Date(contatoAtivo.created_at * 1000).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            {/* Conversas do contato */}
            <div className="flex-1 overflow-y-auto p-4">
              {loadingDetalhes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando conversas...</p>
                </div>
              ) : conversasDoContato.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-4">Conversas ({conversasDoContato.length})</h3>
                  {conversasDoContato.map(conversa => (
                    <div key={conversa.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">#{conversa.id}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          conversa.status === 'open' ? 'bg-green-100 text-green-700' :
                          conversa.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {conversa.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Criada: {new Date(conversa.created_at * 1000).toLocaleString('pt-BR')}</div>
                        <div>Última atividade: {new Date(conversa.last_activity_at * 1000).toLocaleString('pt-BR')}</div>
                        {conversa.meta?.assignee && (
                          <div>Agente: {conversa.meta.assignee.name}</div>
                        )}
                        {conversa.unread_count > 0 && (
                          <div className="text-red-600">Mensagens não lidas: {conversa.unread_count}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p className="text-gray-500">Nenhuma conversa encontrada</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">👥</div>
              <p>Selecione um contato para ver os detalhes</p>
            </div>
          </div>
        )}
      </main>

      {/* Painel Direito - Ações e Informações Extras */}
      <aside className="w-80 border-l p-6 bg-gray-50">
        {contatoAtivo ? (
          <div className="space-y-6">
            {/* Informações do contato */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h4 className="font-semibold mb-3">Informações</h4>
              <div className="space-y-2 text-sm">
                <div><strong>ID:</strong> {contatoAtivo.id}</div>
                <div><strong>Identificador:</strong> {contatoAtivo.identifier || 'N/A'}</div>
                <div><strong>Conversas:</strong> {contatoAtivo.conversations_count || 0}</div>
                <div><strong>Última atividade:</strong> {getTimeSinceLastActivity(contatoAtivo.last_activity_at)}</div>
                <div><strong>Criado em:</strong> {new Date(contatoAtivo.created_at * 1000).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            {/* Atributos customizados */}
            {Object.keys(contatoAtivo.custom_attributes || {}).length > 0 && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-semibold mb-3">Atributos Customizados</h4>
                <div className="space-y-2 text-sm">
                  {Object.entries(contatoAtivo.custom_attributes || {}).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="space-y-2">
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                💬 Iniciar Conversa
              </button>
              <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                ✏️ Editar Contato
              </button>
              <button className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                🔄 Atualizar Dados
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">ℹ️</div>
            <p>Informações do contato aparecerão aqui</p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default ContactsPage;
