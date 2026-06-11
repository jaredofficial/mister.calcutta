<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$admin_password = "ifte"; // Password for client edit authorization

// Helper to check Authorization header
function is_authorized($password) {
    // Get all HTTP headers
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    } else {
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
    }

    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    }
    
    if (empty($authHeader)) {
        return false;
    }
    
    $token = str_replace('Bearer ', '', $authHeader);
    return trim($token) === $password;
}

function require_auth($password) {
    if (!is_authorized($password)) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized: Invalid password"]);
        exit;
    }
}

// Simple Router based on REQUEST_URI
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Match sub-routes
$route = '';
if (preg_match('/api\/content/', $path)) {
    $route = 'content';
} elseif (preg_match('/api\/gallery\/upload/', $path)) {
    $route = 'upload';
} elseif (preg_match('/api\/gallery\/delete/', $path)) {
    $route = 'delete';
} elseif (preg_match('/api\/gallery/', $path)) {
    $route = 'gallery';
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($route) {
    case 'content':
        if ($method === 'GET') {
            $data = file_get_contents('content.json');
            if ($data === false) {
                http_response_code(500);
                echo json_encode(["error" => "Failed to read content file"]);
            } else {
                echo $data;
            }
        } elseif ($method === 'POST') {
            require_auth($admin_password);
            $input = file_get_contents('php://input');
            if (json_decode($input) === null) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid JSON payload"]);
                break;
            }
            if (file_put_contents('content.json', $input) === false) {
                http_response_code(500);
                echo json_encode(["error" => "Failed to write content file"]);
            } else {
                echo json_encode(["success" => true, "message" => "Content updated successfully"]);
            }
        }
        break;
        
    case 'gallery':
        if ($method === 'GET') {
            $dir = 'gallery images';
            if (!is_dir($dir)) {
                http_response_code(500);
                echo json_encode(["error" => "Gallery directory not found"]);
                break;
            }
            $files = scandir($dir);
            $images = [];
            foreach ($files as $file) {
                if ($file === '.' || $file === '..') continue;
                $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
                if (in_array($ext, ['webp', 'jpg', 'jpeg', 'png'])) {
                    $images[] = $file;
                }
            }
            // Sort images so they appear consistently
            sort($images);
            echo json_encode($images);
        }
        break;
        
    case 'upload':
        if ($method === 'POST') {
            require_auth($admin_password);
            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                http_response_code(400);
                echo json_encode(["error" => "No file uploaded or upload error"]);
                break;
            }
            
            $file = $_FILES['image'];
            // Sanitize filename
            $name = preg_replace('/[^a-zA-Z0-9.\-_~()]/', '_', $file['name']);
            $target = 'gallery images/' . $name;
            
            if (move_uploaded_file($file['tmp_name'], $target)) {
                echo json_encode(["success" => true, "filename" => $name]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to save uploaded file"]);
            }
        }
        break;
        
    case 'delete':
        if ($method === 'POST') {
            require_auth($admin_password);
            $input = json_decode(file_get_contents('php://input'), true);
            if (!isset($input['filename'])) {
                http_response_code(400);
                echo json_encode(["error" => "Filename is required"]);
                break;
            }
            
            $filename = basename($input['filename']);
            $path = 'gallery images/' . $filename;
            
            if (!file_exists($path)) {
                http_response_code(404);
                echo json_encode(["error" => "File not found"]);
                break;
            }
            
            if (unlink($path)) {
                echo json_encode(["success" => true, "message" => "Deleted $filename successfully"]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Failed to delete file"]);
            }
        }
        break;

    default:
        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
        break;
}
?>
