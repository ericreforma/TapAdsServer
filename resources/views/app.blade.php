<!DOCTYPE html>
<html lang="en">
  <head>
    <title>Tap Ads</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no"
    />
    <link rel="manifest" href="manifest.json" />
    <link rel="shortcut icon" href="favicon.png" />
    <link rel="stylesheet" href="{{ asset('css/styles.css') }}">
    <link rel="stylesheet" href="{{ asset('css/vendor/fontawesome.min.css') }}">
    
  </head>
  <body>
    <div id="app"></div>


    <script src="{{ asset('js/index.js') }}"></script>
  </body>
</html>
