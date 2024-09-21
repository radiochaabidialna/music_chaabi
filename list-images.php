<?php
  $folderUrl = 'http://localhost/img_comparer/';
  $ch = curl_init($folderUrl);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($ch);
  curl_close($ch);

  $imageFiles = array();
  $dom = new DOMDocument();
  @$dom->loadHTML($response);
  $xpath = new DOMXPath($dom);
  $nodes = $xpath->query('//a[@href]');
  foreach ($nodes as $node) {
    $href = $node->getAttribute('href');
    if (strpos($href, '.') !== false) { // filter out directories
      $imageFiles[] = $href;
    }
  }

  echo json_encode($imageFiles);
?>