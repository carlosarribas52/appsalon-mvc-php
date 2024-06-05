<?php

namespace Controllers;

use Classes\Email;
use Model\Usuario;
use MVC\Router;

class LoginController {
    public static function login(Router $router){
        $alertas = [];

        $auth = new Usuario;

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            $auth = new Usuario($_POST);

            $alertas = $auth->validarLogin();   
            
            if(empty($alertas)){
                // Comprobar que el usuario existe
                $usuario = Usuario::where('email', $auth->email);
                if($usuario) {
                    // Verificar el password
                    if($usuario->comprobarPasswordAndVerificado($auth->password)){
                        // Autenticar el usuario
                        session_start();

                        $_SESSION['id'] = $usuario->id;
                        $_SESSION['nombre'] = $usuario->nombre . " " . $usuario->apellido;
                        $_SESSION['email'] = $usuario->email;
                        $_SESSION['login'] = true;

                        // Redireccionamiento si es cliente o administrador
                        if($usuario->admin === "1") {
                            $_SESSION['admin'] = $usuario->admin ?? null;
                            header('Location: /admin');
                        } else {
                            header('Location: /cita');
                        }

                        debuguear($_SESSION);
                    }

                } else {
                    Usuario::setAlerta('error', 'Usuario no encontrado');
                }
            }
        }

        $alertas = Usuario::getAlertas();

        $router->render('auth/login', [
         'alertas' => $alertas,
         'auth' => $auth
        ]);
    }
    public static function logout(){
        
        // session_start();
        

        $_SESSION = [];

        header('Location: /');
    }

    public static function olvide(Router $router){
       $router->render('auth/olvide-password', [

       ]);
    }

    public static function recuperar(){
        echo "Desde Recuperar";
    }

    public static function crear(Router $router){

        $usuario = new Usuario;  
        
        // Alertas vacias
        $alertas = [];

        if($_SERVER['REQUEST_METHOD'] === 'POST'){
            
          $usuario->sincronizar($_POST);
          $alertas = $usuario->validarNuevaCuenta();

          // Revisar que alertas esté vacio
          if(empty($alertas)) {
            // verificar que el usuario no esté registrado
            $resultado = $usuario->existeUsuario();

            if($resultado->num_rows){
                $alertas = Usuario::getAlertas();
            } else {
                // Hashsear el password
                $usuario->hashPassword();
                //Generar token único
                $usuario->crearToken(); 
                //Enviar el email de confirmación al usuario
                $email = new Email( $usuario->email, $usuario->nombre, $usuario->token);
                $email->enviarConfirmacion();

                // Crear el usuario
                $resultado = $usuario->guardar();      
                if($resultado) {
                    header('Location: /mensaje');
                }         

                //debuguear($usuario);
                
                // No está registrado , se almacena en la base de datos

            }

          }

        }

        $router->render('auth/crear-cuenta', [
            'usuario' => $usuario,
            'alertas' => $alertas
        ]);
    }

    public static function mensaje(Router $router) {
        $router->render('auth/mensaje');
    }

    public static function confirmar(Router $router){
        
        $alertas = [];

        $token = s($_GET['token']);

        $usuario = Usuario::where('token', $token);

        if(empty($usuario)){
            // Mostrar mensaje de error
            Usuario::setAlerta('error', 'Token no válido');
        } else {
            // Modificar usuario confirmado a 1
            
            $usuario->confirmado = "1";
            $usuario->token = null;
            $usuario->guardar();
            Usuario::setAlerta('exito', 'Cuenta Comprobada correctamente');
        }

        // Obtener alertas
        $alertas = Usuario::getAlertas();

        // Renderizar la vista
        $router->render('auth/confirmar-cuenta', [
            'alertas' => $alertas
        ]);
    }
}