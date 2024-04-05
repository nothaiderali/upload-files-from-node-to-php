<?php

header("Access-Control-Allow-Origin: *");

function send_message($message, $code = 200)
{
	http_response_code($code);
	header("Content-Type: application/json");
	echo json_encode(["message" => $message], JSON_UNESCAPED_SLASHES);
	exit();
}

// https://gist.github.com/rmhaiderali/95e9bf00a3bb60fb832e64340b8e23c4
function flat_files_array($files)
{
	$flatten = [];

	foreach ($files as $field => $file) {

		if (!is_array($file["name"])) {
			$flatten[] = ["field" => $field] + $file;
			continue;
		}

		$keys = array_keys($file);

		for ($count = 0; $count < count($file["name"]); $count++) {
			$temp = ["field" => $field];

			foreach ($keys as $key) {
				$temp[$key] = $file[$key][$count];
			}

			$flatten[] = $temp;
		}
	}

	return $flatten;
}

function clean($string)
{
	$string = str_replace(" ", "_", $string);
	return preg_replace("/[^A-Za-z0-9_.]/", "", $string);
}

$method = $_SERVER["REQUEST_METHOD"];

if ($method != "POST") {
	send_message("This endpoint does not support $method method", 400);
}

if (!isset($_REQUEST["secret"])) {
	send_message("Required field 'secret' is missing", 400);
}

if ($_REQUEST["secret"] != "EXAMPLE_SECRET") {
	send_message("Provided secret is not vaild", 400);
}

if (empty($_FILES)) {
	send_message("No file is uploaded", 400);
}

$allowedExtentions = [".jpg", ".jpeg", ".png"];

$files = flat_files_array($_FILES);

foreach ($files as $file) {

	if ($file["error"] > 0) {
		send_message("Error during uploading", 400);
	}

	$fileExtention = strrchr($file["name"], ".");

	if (!$fileExtention) {
		send_message("Uploading file without extention is not allowed", 400);
	}

	if (!in_array($fileExtention, $allowedExtentions)) {
		send_message("File with extention $fileExtention is not allowed", 400);
	}
}

$paths = [];

foreach ($files as $file) {
	$fileName = clean($file["name"]);

	$timestamp = floor(microtime(true) * 1000);

	$path = "files/{$timestamp}_{$fileName}";

	$result = move_uploaded_file($file["tmp_name"], $path);

	if (!$result) {
		send_message("Error during moving file", 500);
	}

	$paths[] = $path;
}

send_message($paths);
