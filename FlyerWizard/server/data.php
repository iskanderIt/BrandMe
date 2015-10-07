<?php 
error_reporting(E_ERROR | E_WARNING | E_PARSE);

$request_body = file_get_contents('php://input');
$arraydata = json_decode($request_body,true);

$action = $arraydata["action"];
if(empty($action) == true) die(json_encode(["ret"=>"ko"]));

$retObj = array();
$retKey = "data";

$m = new MongoClient(); // connect

switch($action){
  case "brand.list":
    $retKey = "brands";  
    $brandList = $m->brandify->brands->find(array("deleted" => false)); 

    // iterate through the results
    foreach ($brandList as $brand) {
        $retObj[] = array(
        "id" => $brand["_id"]->{'$id'}, 
        "name" => $brand["name"], 
        "description" => $brand["description"], 
        "logoSrc" => $brand["logoSrc"]
        );
    } 
   
  break;
  
  case "brand.detail":
    $retKey = "brand";  
    $id = $arraydata["id"];
    $brand = $m->brandify->brands->findOne(array("_id" => new MongoId($id), "deleted"=>false));
    
    $retObj = (object) array(
      "id" => $brand["_id"]->{'$id'}, 
      "name" => $brand["name"], 
      "description" => $brand["description"], 
      "logoSrc" => $brand["logoSrc"]
    );  
  break;
  
  case "brand.delete":
    
    $persist = $arraydata["payload"];
    $id = $arraydata["payload"]["id"];

    
    $persist["deleted"] = true;
    unset($persist["id"]);
    
    $brandsDB = $m->brandify->brands;
       
    $brandsDB->update(array("_id" => new MongoId($id)), $persist, array("upsert" => true));
    
    $retKey = "";  
    $retObj = "ok";
    
  break;  
  
  case "brand.save":
   $retKey = "brand";
   $persist = $arraydata["payload"];
   $id = $arraydata["payload"]["id"];
   unset($persist["id"]);
   $brandsDB = $m->brandify->brands;
   
   $persist["deleted"] = false;
   
   if($id != ""){
    $brandsDB->update(array("_id" => new MongoId($id), "deleted" => false), $persist, array("upsert" => true));
    $retObj = $id;
   }else{
    $brandsDB->insert($persist);
    $retObj = $persist["_id"]->{'$id'};
   }
  break;
  
  case "artwork.list":
    $retKey = "artworks";  
    $pid = $arraydata["pid"];
    $artworks = $m->brandify->artworks->find(array("brandId" => new MongoId($pid), "deleted" => false)); 

    // iterate through the results
    foreach ($artworks as $doc) {
      
        $retObj[] = (object) array('id'=>$doc["_id"]->{'$id'}, 
          'author'=>$doc['author'], 
          'name'=>$doc['name'], 
          'type' => $doc['type'],
          'lastupdate' => $doc['timestamp']);
    } 
  break;

  case "artwork.detail":
    $retKey = "artwork";  
    $id = $arraydata["id"];
    $artwork = $m->brandify->artworks->findOne(array("_id" => new MongoId($id)));
    $artwork['id'] = $artwork["_id"]->{'$id'};
    unset($artwork['_id']);
    unset($artwork['brandId']);
    $retObj = $artwork;
  break;

  case "artwork.save":
    $retKey = "artwork";
    $payload = $arraydata["payload"];
    $id = $arraydata["id"];
    $pid = $arraydata["pid"];
    
    $artworks = $m->brandify->artworks;
    
    $payload["brandId"] = new MongoId($pid);
    $payload["deleted"] = false;
    
    unset($payload["_id"]);
    $artwork = $payload;
    
    if($id != ""){
     $artworks->update(array("_id" => new MongoId($id)), $artwork, array("upsert" => true));
     $retObj[] = $id;
    }else{
    
     if($artworks->insert($artwork))
     {
        $retObj = $artwork["_id"]->{'$id'};
     }
     
    }
  break;
  
  case "artwork.delete":
    $persist = $arraydata["payload"];
    $id = $arraydata["payload"]["id"];

    
    $persist["deleted"] = true;
    unset($persist["id"]);
    
    $artworkDB = $m->brandify->artworks;
       
    $artworkDB->update(array("_id" => new MongoId($id)), $persist, array("upsert" => true));
    
    $retKey = "";  
    $retObj = "ok";
  break;  

  case "user.register":
    $data = $arraydata["user"];
    $test = $m->brandify->users->findOne(array("username" => $data['username'], "password" => $data['password']));

    if($test){
      $retObj = [];
      break;
    }
    
    $data['role'] = "designer";
    
    if($m->brandify->users->insert($data)){
        session_start();
        session_regenerate_id(true);
        $retKey = "user";
        $retObj['sessId'] = session_id();
        $retObj['userId'] = $data["_id"]->{'$id'};
        $retObj['userRole'] = $data['role'];    
    };
  break;
    
  case "user.save":
    $data = $arraydata["user"];
    $test = $m->brandify->users->findOne(array("_id" => new MongoId($data['id']), "username" => $data['username']));

    if($test){
      $retKey = "user";
      $retObj['userId'] = $data["_id"]->{'$id'};  
    };
  break;  
  
  case "user.login":
    $credentials = $arraydata["credentials"];
    $user = $m->brandify->users->findOne(array(
        "username" => $credentials['username'], 
        "password" => $credentials['password']));
        
    session_start();
    session_regenerate_id(true);    
    $retObj['sessId'] = session_id();
    $retObj['user'] = $user;
    $retObj['user']['id'] = $user["_id"]->{'$id'};  
    
    $_SESSION["userId"] = $retObj['user']['id'];
    unset($retObj['user']['_id']);
    unset($retObj['user']['password']);
    $retKey = "";
  break;
  
  case "user.logout":
  session_start();
  session_destroy();
  $retKey = "";
  $retObj = "ok";
  break;
  
  case "user.session":
    $retKey = "user";
           
    session_start();
    $usid = $_SESSION["userId"];
    if($usid){
      $userSession = $m->brandify->users->findOne(array("_id" => new MongoId($usid)));
      $retObj['sessId'] = session_id();
      $retObj['user'] = $userSession;
      $retObj['user']['id'] = $userSession["_id"]->{'$id'};  
    
      unset($retObj['user']['_id']);
      unset($retObj['user']['password']);
             
    }else{
      $retObj['sessId'] = session_id(); 
    }
    
  $retKey = ""; 
  break;  
  
  case "user.detail":
    $retKey = "user";
    $id = $arraydata["id"];
    $retObj = $m->brandify->users->findOne(array("_id" => new MongoId($id)));
    unset($retObj["_id"]);
    $retObj["id"] = $id;
  break;  
    

  default:
  break;
  }
  
  
if($retKey == "")
  print(json_encode($retObj)); 
  else
  print(json_encode([$retKey => $retObj])); 
?>