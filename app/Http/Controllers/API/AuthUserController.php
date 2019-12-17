<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;

use App\User;
use App\Vehicle;
use App\UserVehicle;
use App\UserVehiclePhoto;
use App\Media;

use Hash;
use Storage;

use Carbon\Carbon;

class AuthUserController extends Controller
{
    public function __construct(){
      auth()->setDefaultDriver('api_auth');
    }

    public function login(Request $request){
      $credentials = [
          'email' => $request->email,
          'password' => $request->password
      ];

      if (auth()->attempt($credentials)) {
        if (auth()->user()->deleted !== 1) {
          $token = auth()->user()->createToken('tapads')->accessToken;
          return response()->json([
            'status' => true,
            'token'  => $token
          ]);
        } else {
          return response()->json([
            "status"  => false,
            "message" => "Entered account doesn't exist",
          ]);
        }
      } else {
          return response()->json([
            "status"  => false,
            "message" => "Entered account doesn't exist",
          ]);
      }

    }

    public function register (Request $request){

      $data = json_decode($request->userData, true);
      $data['email_verified_at'] = Carbon::now()->format('Y-m-d H:i:s');
      $data['password'] = Hash::make($data['password']);
      $user = User::create($data);

      $profilePhoto = $request->profileImage;
      list($fileType, $fileExt) = explode('/', $profilePhoto['type']);
      $filename = md5(strftime(time())) . '.' . $fileExt;
      $image = Storage::disk('user')->put($filename, base64_decode($profilePhoto['data']));
      $url = 'images/user_picture/'.$filename;
      $mediaProfile = $this->save_media($filename, $user->id, 1, $url);

      $licensePhoto = $request->licenseImage;
      list($fileType, $fileExt) = explode('/', $licensePhoto['type']);
      $filename = md5(strftime(time())) . '.' . $fileExt;
      $image = Storage::disk('license')->put($filename, base64_decode($licensePhoto['data']));
      $url = 'images/license/'.$filename;
      $mediaLicense = $this->save_media($filename, $user->id, 1, $url);

      $vehicleData = $request->vehicleData;
      if($vehicleData['newVehicle']) {
        $newVehicle = $vehicleData['newVehicle'];
        $vehicle = new Vehicle;
        $vehicle->manufacturer = $newVehicle['manufacturer'];
        $vehicle->model = $newVehicle['model'];
        $vehicle->year = $newVehicle['year'];
        $vehicle->classification = $newVehicle['class'];
        $vehicle->save();
      }

      $user_vehicle = new UserVehicle;
      $user_vehicle->user_id = $user->id;
      $user_vehicle->vehicle_id = isset($vehicleData['vehicleId']) ? $vehicleData['vehicleId'] : $vehicle->id;
      $user_vehicle->color = $vehicleData['uploadColor'];
      $user_vehicle->plate_number = $vehicleData['plateNumber'];
      $user_vehicle->type = $vehicleData['activeTypeVehicle'];
      $user_vehicle->save();

      foreach($vehicleData['vehicleToUpload'] as $key=>$v) {
        list($fileType, $fileExt) = explode('/', $v['type']);
        $filename = md5(strftime(time())) . $key . '.' . $fileExt;
        $image = Storage::disk('cars')->put($filename, base64_decode($v['data']));
        $url = 'images/cars/'.$filename;
        $media = $this->save_media($filename, $user->id, 1, $url);
        $user_vehicle_photo = new UserVehiclePhoto;
        $user_vehicle_photo->user_vehicle_id = $user_vehicle->id;
        $user_vehicle_photo->media_id = $media->id;
        $user_vehicle_photo->save();
      }

      $token = $user->createToken('tapads')->accessToken;
      $user = User::where('id', '=', $user->id)
            ->update([
              'media_id' => $mediaProfile->id,
              'license_media_id' => $mediaLicense->id
            ]);

      return response()->json(['token' => $token], 200);
    }

    public function register_validation(Request $request) {
      $data = json_decode($request->userData, true);
      $messages = [
        'required' => ':attribute',
      ];

      $validator = Validator::make($data,[
        'name' => 'required|string|max:255',
        'username' => 'required|string|unique:users,username|max:100',
        'birthdate' => 'required|date',
        'location' => 'required',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
        'contact_number' => 'required'
      ], $messages);

      if($validator->fails()){
        return response()->json($validator->errors()->all(), 400);
      }
      return response()->json(true);
    }

    private function save_media($filename, $id, $owner, $url) {
      list($fName, $ext) = explode('.', $filename);
      $media = new Media;
      $media->owner_id = $id;
      $media->owner = $owner;
      $media->filename = $fName;
      $media->extension = $ext;
      $media->type = 0;
      $media->url = $url;
      $media->save();
      return $media;
    }
}
