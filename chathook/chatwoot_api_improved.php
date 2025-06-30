
<?php
// LIBERA CORS PARA QUALQUER DOMÍNIO (ideal para desenvolvimento, troque para seu domínio na produção)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: *');


// chatwoot-api.php - Endpoint principal melhorado
require_once 'config.php';

// Configurar headers CORS
ChatwootConfig::setCorsHeaders();

// Responder a requests OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Classe principal da API
class ChatwootAPI {
    private $baseUrl;
    private $token;
    private $accountId;
    
    public function __construct($accountId = null) {
        $this->accountId = $accountId ?? ChatwootConfig::DEFAULT_ACCOUNT_ID;
        
        if (!ChatwootConfig::isValidAccountId($this->accountId)) {
            throw new Exception("Account ID inválido: {$this->accountId}");
        }
        
        $this->baseUrl = ChatwootConfig::getBaseUrl($this->accountId);
        $this->token = ChatwootConfig::API_TOKEN;
    }
    
    /**
     * Faz requisição para a API do Chatwoot
     */
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $url = $this->baseUrl . $endpoint;
        
        ChatwootLogger::info("$method request to: $url");
        
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Content-Type: application/json",
                "api_access_token: {$this->token}"
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
            ChatwootLogger::error("cURL error: $error");
            throw new Exception("Erro de conexão: $error");
        }
        
        ChatwootLogger::info("Response HTTP code: $httpCode");
        
        return [
            'response' => $response,
            'http_code' => $httpCode,
            'error' => $error
        ];
    }
    
    /**
     * Lista conversas
     */
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
    
    /**
     * Obtém detalhes de uma conversa
     */
    public function getConversation($conversationId) {
        if (!ChatwootUtils::isValidId($conversationId)) {
            throw new Exception("ID da conversa inválido: $conversationId");
        }
        
        $endpoint = "/conversations/$conversationId";
        return $this->makeRequest($endpoint);
    }
    
    /**
     * Obtém mensagens de uma conversa
     */
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
    
    /**
     * Envia mensagem para uma conversa
     */
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
    
    /**
     * Atualiza status de uma conversa
     */
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

// Router simples
class Router {
    private $api;
    
    public function __construct() {
        // Obtém account_id via parâmetro, header ou usa o padrão
        $accountId = $this->getAccountId();
        $this->api = new ChatwootAPI($accountId);
    }
    
    /**
     * Obtém o account_id de diferentes fontes
     */
    private function getAccountId() {
        // 1. Via query parameter ?account_id=X
        if (isset($_GET['account_id'])) {
            return (int) $_GET['account_id'];
        }
        
        // 2. Via header X-Account-ID
        $headers = getallheaders();
        if (isset($headers['X-Account-ID'])) {
            return (int) $headers['X-Account-ID'];
        }
        
        // 3. Via path /account/{id}/endpoint
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        if (preg_match('/\/account\/(\d+)\//', $path, $matches)) {
            return (int) $matches[1];
        }
        
        // 4. Usar padrão
        return ChatwootConfig::DEFAULT_ACCOUNT_ID;
    }
    
    public function handleRequest() {
        try {
            $method = $_SERVER['REQUEST_METHOD'];
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            
            switch ($method) {
                case 'GET':
                    return $this->handleGetRequest($path);
                    
                case 'POST':
                    return $this->handlePostRequest($path);
                    
                case 'PUT':
                    return $this->handlePutRequest($path);
                    
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
            $page = $_GET['page'] ?? 1;
            $perPage = $_GET['per_page'] ?? null;
            $status = $_GET['status'] ?? 'all';
            
            $result = $this->api->getConversations($page, $perPage, $status);
            $this->sendResponse($result);
        }
        
        // GET /conversation/{id}
        elseif (preg_match('/\/conversation\/(\d+)$/', $path, $matches)) {
            $conversationId = $matches[1];
            $result = $this->api->getConversation($conversationId);
            $this->sendResponse($result);
        }
        
        // GET /messages/{conversation_id}
        elseif (preg_match('/\/messages\/(\d+)$/', $path, $matches)) {
            $conversationId = $matches[1];
            $page = $_GET['page'] ?? 1;
            $perPage = $_GET['per_page'] ?? null;
            
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
            $conversationId = $matches[1];
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['content'])) {
                echo ChatwootError::badRequest("Conteúdo da mensagem é obrigatório");
                return;
            }
            
            $content = $input['content'];
            $messageType = $input['message_type'] ?? 'outgoing';
            
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
            $conversationId = $matches[1];
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['status'])) {
                echo ChatwootError::badRequest("Status é obrigatório");
                return;
            }
            
            $status = $input['status'];
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
            echo $result['response'];
        } else {
            echo ChatwootError::response(
                "Erro na API do Chatwoot",
                $result['http_code'],
                ['chatwoot_error' => $result['error']]
            );
        }
    }
}

// Executar a aplicação
$router = new Router();
$router->handleRequest();
?>