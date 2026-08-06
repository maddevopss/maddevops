<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $payload): never
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function requiredEnv(string $name): string
{
    $value = getenv($name);
    if ($value === false || trim($value) === '') {
        respond(500, ['ok' => false, 'error' => 'Service de contact non configuré.']);
    }
    return trim($value);
}

function smtpRead($socket): string
{
    $response = '';
    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }
    if ($response === '') {
        throw new RuntimeException('Réponse SMTP absente.');
    }
    $code = (int) substr($response, 0, 3);
    if ($code < 200 || $code >= 400) {
        throw new RuntimeException('Réponse SMTP invalide.');
    }
    return $response;
}

function smtpCommand($socket, string $command): string
{
    fwrite($socket, $command . "\r\n");
    return smtpRead($socket);
}

function smtpSend(
    string $host,
    int $port,
    string $username,
    string $password,
    string $from,
    string $to,
    string $replyTo,
    string $subject,
    string $body
): void {
    $socket = @stream_socket_client(
        "tcp://{$host}:{$port}",
        $errorCode,
        $errorMessage,
        15,
        STREAM_CLIENT_CONNECT
    );

    if ($socket === false) {
        throw new RuntimeException('Connexion SMTP impossible.');
    }

    stream_set_timeout($socket, 15);

    try {
        smtpRead($socket);
        smtpCommand($socket, 'EHLO maddevops.com');
        smtpCommand($socket, 'STARTTLS');

        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('Chiffrement TLS impossible.');
        }

        smtpCommand($socket, 'EHLO maddevops.com');
        smtpCommand($socket, 'AUTH LOGIN');
        smtpCommand($socket, base64_encode($username));
        smtpCommand($socket, base64_encode($password));
        smtpCommand($socket, 'MAIL FROM:<' . $from . '>');
        smtpCommand($socket, 'RCPT TO:<' . $to . '>');
        smtpCommand($socket, 'DATA');

        $headers = [
            'From: MAD DevOps <' . $from . '>',
            'To: <' . $to . '>',
            'Reply-To: <' . $replyTo . '>',
            'Subject: ' . $subject,
            'Date: ' . gmdate('D, d M Y H:i:s') . ' +0000',
            'MIME-Version: 1.0',
            'Content-Type: text/plain; charset=UTF-8',
            'Content-Transfer-Encoding: 8bit',
        ];
        $message = implode("\r\n", $headers) . "\r\n\r\n" . $body;
        $message = preg_replace('/^\./m', '..', $message) ?? $message;
        fwrite($socket, $message . "\r\n.\r\n");
        smtpRead($socket);
        smtpCommand($socket, 'QUIT');
    } finally {
        fclose($socket);
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'Méthode non autorisée.']);
}

$rawInput = file_get_contents('php://input') ?: '';
$input = json_decode($rawInput, true);
if (!is_array($input)) {
    $input = $_POST;
}

if (trim((string) ($input['website'] ?? '')) !== '') {
    respond(202, ['ok' => true, 'message' => 'Demande reçue.']);
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateKey = hash('sha256', $ip);
$rateFile = sys_get_temp_dir() . '/maddevops-contact-' . $rateKey;
$lastRequest = is_file($rateFile) ? (int) file_get_contents($rateFile) : 0;
if ($lastRequest > time() - 60) {
    respond(429, ['ok' => false, 'error' => 'Veuillez attendre une minute avant de renvoyer une demande.']);
}
file_put_contents($rateFile, (string) time(), LOCK_EX);

$name = trim((string) ($input['name'] ?? ''));
$email = trim((string) ($input['email'] ?? ''));
$need = trim((string) ($input['need'] ?? ''));
$message = trim((string) ($input['message'] ?? ''));
$budget = trim((string) ($input['budget'] ?? ''));
$delay = trim((string) ($input['delay'] ?? ''));

if ($name === '' || mb_strlen($name) > 120 || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || $need === '' || mb_strlen($need) > 120 || $message === '' || mb_strlen($message) > 5000) {
    respond(422, ['ok' => false, 'error' => 'Veuillez vérifier les champs obligatoires.']);
}

$contactEmail = requiredEnv('CONTACT_EMAIL');
$fromEmail = requiredEnv('CONTACT_FROM_EMAIL');
$host = requiredEnv('SMTP_HOST');
$port = (int) requiredEnv('SMTP_PORT');
$username = requiredEnv('SMTP_USERNAME');
$password = requiredEnv('SMTP_PASSWORD');

$subject = 'Demande de consultation MAD DevOps - ' . preg_replace('/[^\p{L}\p{N} ._\/-]/u', '', $need);
$bodyParts = [
    'Nouvelle demande reçue depuis maddevops.com',
    '',
    'Nom : ' . $name,
    'Courriel : ' . $email,
    'Type de besoin : ' . $need,
    'Message : ' . $message,
];
if ($budget !== '') {
    $bodyParts[] = 'Budget approximatif : ' . mb_substr($budget, 0, 250);
}
if ($delay !== '') {
    $bodyParts[] = 'Délai souhaité : ' . mb_substr($delay, 0, 250);
}

try {
    smtpSend($host, $port, $username, $password, $fromEmail, $contactEmail, $email, $subject, implode("\n\n", $bodyParts));
} catch (Throwable $exception) {
    error_log('MAD DevOps contact SMTP: ' . $exception->getMessage());
    respond(502, ['ok' => false, 'error' => 'L'envoi est temporairement indisponible. Utilisez le courriel de secours.']);
}

respond(200, ['ok' => true, 'message' => 'Votre demande a été envoyée.']);
