<?php
require_once 'config.php';
require_once 'chatwoot_library.php';

ChatwootConfig::setCorsHeaders();

// Responder a requests OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuração de múltiplas empresas
class MultiCompanyConfig {
    // Configuração de empresas/contas (apenas account_id e nome, o token vem de config.php)
    private static $companies = [
        'empresa1' => [
            'account_id' => 1,
            'name' => 'Empresa 1 Ltda'
        ],
        'empresa2' => [
            'account_id' => 2,
            'name' => 'Empresa 2 S.A.'
        ],
        'empresa3' => [
            'account_id' => 5,
            'name' => 'Empresa 3 ME'
        ]
        // Adicione mais empresas conforme necessário
    ];
    
    /**
     * Obtém configuração de uma empresa pelo slug
     */
    public static function getCompany($slug) {
        return self::$companies[$slug] ?? null;
    }
    
    /**
     * Lista todas as empresas disponíveis
     */
    public static function getAllCompanies() {
        $result = [];
        foreach (self::$companies as $slug => $config) {
            $result[$slug] = [
                'account_id' => $config['account_id'],
                'name' => $config['name']
            ];
        }
        return $result;
    }
    
    /**
     * Valida se uma empresa existe
     */
    public static function companyExists($slug) {
        return isset(self::$companies[$slug]);
    }
}

// API Multi-Empresa
class MultiCompanyChatwootAPI {
    private $baseUrl;
    private $accountId;
    private $companySlug;
    
    public function __construct($companySlug) {
        $companyConfig = MultiCompanyConfig::getCompany($companySlug);
        
        if (!$companyConfig) {
            throw new Exception("Empresa não encontrada: $companySlug");
        }
        
        $this->companySlug = $companySlug;
        $this->accountId = $companyConfig['account_id'];
        $this->baseUrl = ChatwootConfig::getBaseUrl($this->accountId);
        
        ChatwootLogger::info("Initialized API for company: $companySlug (Account ID: {$this->accountId})");
    }
    
    /**
     * Faz requisição para a API do Chatwoot
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        ChatwootLogger::info("$method request to: $url for company: {$this->companySlug}");
        
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "api_access_token: " . ChatwootConfig::getApiToken()
            ],
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CONNECTTIMEOUT => 10
        ]);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'PUT') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        } elseif ($method === 'DELETE') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($response === false) {
            ChatwootLogger::error("cURL error for {$this->companySlug}: $error");
            throw new Exception("Erro de conexão: $error");
        }
        
        ChatwootLogger::info("Response HTTP code: $httpCode for company: {$this->companySlug}");
        
        return [
            'response' => $response,
            'http_code' => $httpCode,
            'error' => $error,
            'company' => $this->companySlug,
            'account_id' => $this->accountId
        ];
    }
    
    // Métodos idênticos à classe original, mas usando makeRequest atualizado
    public function getConversations($page = 1, $perPage = null, $status = 'all') {
        $perPage = $perPage ? ChatwootConfig::sanitizePerPage($perPage) : ChatwootConfig::DEFAULT_PER_PAGE;
        
        if (!ChatwootConfig::isValidStatus($status)) {
            throw new Exception("Status inválido: $status");
        }
        
        $params = [
            'sort' => 'desc',
            'page' => max(1, (int)$page),
            'per_page' => $perPage
        ];
        
        if ($status !== 'all') {
            $params['status'] = $status;
        }
        
        $queryString = http_build_query($params);
        $endpoint = "/conversations?$queryString";
        
        return $this->makeRequest($endpoint);
    }
    
    public function getConversation($conversationId) {
        if (!ChatwootUtils::isValidId($conversationId)) {
            throw new Exception("ID da conversa inválido: $conversationId");
        }
        
        $endpoint = "/conversations/$conversationId";
        return $this->makeRequest($endpoint);
    }
    
    public function getMessages($conversationId, $page = 1, $perPage = null) {
        if (!ChatwootUtils::isValidId($conversationId)) {
            throw new Exception("ID da conversa inválido: $conversationId");
        }
        
        $perPage = $perPage ? ChatwootConfig::sanitizePerPage($perPage) : ChatwootConfig::DEFAULT_PER_PAGE;
        
        $params = [
            'page' => max(1, (int)$page),
            'per_page' => $perPage
        ];
        
        $queryString = http_build_query($params);
        $endpoint = "/conversations/$conversationId/messages?$queryString";
        
        return $this->makeRequest($endpoint);
    }
    
    public function sendMessage($conversationId, $content, $messageType = 'outgoing') {
        if (!ChatwootUtils::isValidId($conversationId)) {
            throw new Exception("ID da conversa inválido: $conversationId");
        }
        
        if (empty(trim($content))) {
            throw new Exception("Conteúdo da mensagem não pode estar vazio");
        }
        
        if (!ChatwootConfig::isValidMessageType($messageType)) {
            throw new Exception("Tipo de mensagem inválido: $messageType");
        }
        
        $data = [
            'content' => trim($content),
            'message_type' => $messageType
        ];
        
        $endpoint = "/conversations/$conversationId/messages";
        return $this->makeRequest($endpoint, 'POST', $data);
    }
    
    public function updateConversationStatus($conversationId, $status) {
        if (!ChatwootUtils::isValidId($conversationId)) {
            throw new Exception("ID da conversa inválido: $conversationId");
        }
        
        if (!in_array($status, ['open', 'resolved', 'pending', 'snoozed'])) {
            throw new Exception("Status inválido: $status");
        }
        
        $data = ['status' => $status];
        $endpoint = "/conversations/$conversationId";
        
        return $this->makeRequest($endpoint, 'PUT', $data);
    }
}

// Router Multi-Empresa
class MultiCompanyRouter {
    private $api;
    private $companySlug;
    
    public function __construct() {
        $this->companySlug = $this->getCompanySlug();
        
        if (!$this->companySlug) {
            echo ChatwootError::badRequest("Slug da empresa é obrigatório.");
            exit();
        }
        
        if (!MultiCompanyConfig::companyExists($this->companySlug)) {
            echo ChatwootError::notFound("Empresa '{$this->companySlug}' não encontrada.");
            exit();
        }

        $this->api = new MultiCompanyChatwootAPI($this->companySlug);
    }
    
    /**
     * Obtém o slug da empresa de diferentes fontes
     */
    private function getCompanySlug() {
        // 1. Via query parameter ?company=empresa1
        if (isset($_GET['company'])) {
            return ChatwootUtils::sanitizeInput($_GET['company']);
        }
        
        // 2. Via header X-Company-Slug
        $headers = getallheaders();
        if (isset($headers['X-Company-Slug'])) {
            return ChatwootUtils::sanitizeInput($headers['X-Company-Slug']);
        }
        
        // 3. Via path /company/{slug}/endpoint
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        if (preg_match('/\/company\/([^\/]+)\//', $path, $matches)) {
            return ChatwootUtils::sanitizeInput($matches[1]);
        }
        
        return null;
    }
    
    public function handleRequest() {
        try {
            $method = $_SERVER['REQUEST_METHOD'];
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            
            // Endpoint especial para listar empresas
            if (preg_match('/\/companies$/', $path) && $method === 'GET') {
                echo json_encode([
                    'companies' => MultiCompanyConfig::getAllCompanies(),
                    'total' => count(MultiCompanyConfig::getAllCompanies())
                ]);
                return;
            }
            
            // Remove o prefixo /company/{slug} do path para roteamento normal
            $cleanPath = preg_replace('/^\/company\/[^\/]+/', '', $path);
            
            switch ($method) {
                case 'GET':
                    return $this->handleGetRequest($cleanPath);
                    
                case 'POST':
                    return $this->handlePostRequest($cleanPath);
                    
                case 'PUT':
                    return $this->handlePutRequest($cleanPath);
                    
                default:
                    echo ChatwootError::methodNotAllowed(['GET', 'POST', 'PUT']);
                    return;
            }
            
        } catch (Exception $e) {
            ChatwootLogger::error($e->getMessage());
            echo ChatwootError::internalError($e->getMessage());
        }
    }
    
    private function handleGetRequest($path) {
        // GET /conversations
        if (preg_match('/\/conversations$/', $path)) {
            $page = ChatwootUtils::sanitizeInput($_GET['page'] ?? 1, 'int');
            $perPage = ChatwootConfig::sanitizePerPage($_GET['per_page'] ?? ChatwootConfig::DEFAULT_PER_PAGE);
            $status = ChatwootUtils::sanitizeInput($_GET['status'] ?? 'all');
            
            if (!ChatwootConfig::isValidStatus($status)) {
                echo ChatwootError::badRequest("Status inválido.");
                exit();
            }

            $result = $this->api->getConversations($page, $perPage, $status);
            $this->sendResponse($result);
        }
        
        // GET /conversation/{id}
        elseif (preg_match('/\/conversation\/(\d+)$/', $path, $matches)) {
            $conversationId = ChatwootUtils::sanitizeInput($matches[1], 'int');
            
            if (!ChatwootUtils::isValidId($conversationId)) {
                echo ChatwootError::badRequest("ID da conversa inválido.");
                exit();
            }

            $result = $this->api->getConversation($conversationId);
            $this->sendResponse($result);
        }
        
        // GET /messages/{conversation_id}
        elseif (preg_match('/\/messages\/(\d+)$/', $path, $matches)) {
            $conversationId = ChatwootUtils::sanitizeInput($matches[1], 'int');
            
            if (!ChatwootUtils::isValidId($conversationId)) {
                echo ChatwootError::badRequest("ID da conversa inválido.");
                exit();
            }

            $page = ChatwootUtils::sanitizeInput($_GET['page'] ?? 1, 'int');
            $perPage = ChatwootConfig::sanitizePerPage($_GET['per_page'] ?? ChatwootConfig::DEFAULT_PER_PAGE);
            
            $result = $this->api->getMessages($conversationId, $page, $perPage);
            $this->sendResponse($result);
        }
        
        else {
            echo ChatwootError::notFound("Endpoint");
        }
    }
    
    private function handlePostRequest($path) {
        // POST /messages/{conversation_id}
        if (preg_match('/\/messages\/(\d+)$/', $path, $matches)) {
            $conversationId = ChatwootUtils::sanitizeInput($matches[1], 'int');
            
            if (!ChatwootUtils::isValidId($conversationId)) {
                echo ChatwootError::badRequest("ID da conversa inválido.");
                exit();
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['content'])) {
                echo ChatwootError::badRequest("Conteúdo da mensagem é obrigatório.");
                exit();
            }
            
            $content = ChatwootUtils::sanitizeInput($input['content']);
            $messageType = ChatwootUtils::sanitizeInput($input['message_type'] ?? 'outgoing');

            if (empty(trim($content))) {
                echo ChatwootError::badRequest("Conteúdo da mensagem não pode estar vazio.");
                exit();
            }
            if (!ChatwootConfig::isValidMessageType($messageType)) {
                echo ChatwootError::badRequest("Tipo de mensagem inválido.");
                exit();
            }
            
            $result = $this->api->sendMessage($conversationId, $content, $messageType);
            $this->sendResponse($result);
        }
        
        else {
            echo ChatwootError::notFound("Endpoint POST");
        }
    }
    
    private function handlePutRequest($path) {
        // PUT /conversation/{id}/status
        if (preg_match('/\/conversation\/(\d+)\/status$/', $path, $matches)) {
            $conversationId = ChatwootUtils::sanitizeInput($matches[1], 'int');
            
            if (!ChatwootUtils::isValidId($conversationId)) {
                echo ChatwootError::badRequest("ID da conversa inválido.");
                exit();
            }

            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['status'])) {
                echo ChatwootError::badRequest("Status é obrigatório.");
                return;
            }
            
            $status = ChatwootUtils::sanitizeInput($input['status']);
            if (!in_array($status, ['open', 'resolved', 'pending', 'snoozed'])) {
                echo ChatwootError::badRequest("Status inválido.");
                exit();
            }

            $result = $this->api->updateConversationStatus($conversationId, $status);
            $this->sendResponse($result);
        }
        
        else {
            echo ChatwootError::notFound("Endpoint PUT");
        }
    }
    
    private function sendResponse($result) {
        http_response_code($result['http_code']);
        
        if ($result['http_code'] >= 200 && $result['http_code'] < 300) {
            // Adiciona informações da empresa na resposta
            $responseData = json_decode($result['response'], true);
            if (is_array($responseData)) {
                $responseData['_meta'] = [
                    'company' => $result['company'],
                    'account_id' => $result['account_id']
                ];
                echo json_encode($responseData);
            } else {
                echo $result['response'];
            }
        } else {
            echo ChatwootError::response(
                "Erro na API do Chatwoot",
                $result['http_code'],
                [
                    'chatwoot_error' => $result['error'],
                    'company' => $result['company'],
                    'account_id' => $result['account_id'],
                    'raw_response' => $result['response']
                ]
            );
        }
    }
}

// Executar a aplicação
$router = new MultiCompanyRouter();
$router->handleRequest();
?>
