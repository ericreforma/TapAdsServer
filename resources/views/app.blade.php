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
    <link rel="stylesheet" type="text/css" href="{{ asset('css/vendor/fontawesome.min.css') }}" />
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.19/css/jquery.dataTables.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
    <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.js"></script>
  </head>
  <body>
    <div id="app"></div>

    <script src="{{ asset('js/index.js') }}"></script>

  </body>
</html>
