<?php

error_reporting(0);
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

function send_message($code, $message)
{
	http_response_code($code);
	echo json_encode(["message" => $message], JSON_UNESCAPED_SLASHES);
	exit();
}

$method = $_SERVER["REQUEST_METHOD"];

if ($method != "POST")
	send_message(400, "This endpoint does not support $method method");

if (!isset($_REQUEST["secret"]))
	send_message(400, "Required field 'secret' is missing");

if (!isset($_FILES["file"]))
	send_message(400, "Required field 'file' is missing");

if ($_REQUEST["secret"] != "EXAMPLE_SECRET") {
	send_message(400, "Provided secret is not vaild");
}

if ($_FILES["file"]["error"] > 0) {
	send_message(400, "Error during uploading");
}

$fileName = $_FILES["file"]["name"];
$fileExtention = strrchr($fileName, ".");

if (!$fileExtention) {
	send_message(400, "Uploading file without extention is not allowed");
}

$allowedExtentions = [".jpg", ".jpeg", ".png"];

if (!in_array($fileExtention, $allowedExtentions)) {
	send_message(400, "File with extention $fileExtention is not allowed");
}

$fileName = str_replace(" ", "_", $fileName);

$timestamp = floor(microtime(true) * 1000);
$path = "files/{$timestamp}_$fileName";

$result = move_uploaded_file($_FILES["file"]["tmp_name"], $path);

if (!$result) {
	send_message(500, "Error during moving file");
}

send_message(200, $path);
